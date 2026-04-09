import time
import json
import os
import logging
import httpx
from rule_loader import RuleLoader
from state_manager import StateManager
from alert_generator import AlertGenerator
from threat_intel import ThreatIntel
from risk_scorer import RiskScorer

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

class CorrelationEngine:
    def __init__(self):
        self.rules = RuleLoader("rules").get_rules()
        self.state_manager = StateManager()
        self.alert_generator = AlertGenerator()
        self.threat_intel = ThreatIntel()
        self.risk_scorer = RiskScorer()
        
        # ES config
        self.es_host = os.getenv("ELASTICSEARCH_HOSTS", "http://localhost:9200")
        self.es_user = os.getenv("ELASTICSEARCH_USERNAME", "elastic")
        self.es_pass = os.getenv("ELASTICSEARCH_PASSWORD", "")
        self.last_poll = time.time() - 30 # Start looking 30s in the past

    def query_elasticsearch(self):
        """Poll ES for new events marked as siem_detected_event by Logstash"""
        now = time.time()
        
        # Strict mapping to ensure we don't drop events. 
        # In production this would use ES strictly formatted ISO8601 strings.
        query = {
            "query": {
                "bool": {
                    "must": [
                        {"match": {"tags": "siem_detected_event"}},
                        {"range": {
                            "@timestamp": {
                                "gte": f"now-30s"
                            }
                        }}
                    ]
                }
            },
            "size": 1000
        }

        try:
            resp = httpx.post(
                f"{self.es_host}/siem-logs-*/_search",
                auth=(self.es_user, self.es_pass),
                json=query,
                timeout=10.0
            )
            if resp.status_code == 200:
                hits = resp.json().get("hits", {}).get("hits", [])
                self.last_poll = now
                return [h["_source"] for h in hits]
            else:
                logger.error(f"ES search failed: {resp.status_code} {resp.text}")
        except Exception as e:
            logger.error(f"Failed to connect to Elasticsearch: {e}")
            
        return []

    def evaluate_rules(self, event):
        """Matches the single event against loaded YAML rules"""
        for rule in self.rules:
            logic = rule.get("logic", {})
            field = logic.get("field")
            condition = logic.get("condition")
            value = logic.get("value")
            
            # Simple attribute extraction based on dot-notation
            def get_nested(data, key_path):
                keys = key_path.split('.')
                for k in keys:
                    data = data.get(k, {})
                    if not isinstance(data, dict):
                        return data
                return None

            event_val = get_nested(event, field) if field else None
            is_match = False

            if condition == "equals" and event_val == value:
                is_match = True
            elif condition == "exists" and event_val is not None:
                is_match = True
            elif condition == "contains" and event_val and value in str(event_val):
                is_match = True
            elif condition == "threshold":
                # Handle threshold state
                entity_field = get_nested(event, logic.get("group_by", "source_ip"))
                if not entity_field:
                    continue
                    
                threshold = logic.get("threshold", 5)
                window = logic.get("window", 120) # seconds
                count = self.state_manager.track_event(
                    threshold_key=f"{rule['rule_id']}:{entity_field}",
                    event_id=str(event.get("@timestamp", time.time())),
                    window_seconds=window
                )
                if count >= threshold:
                    is_match = True

            if is_match:
                logger.info(f"Event matched rule {rule['rule_id']}")
                alert = self.alert_generator.create_alert(rule, event, self.state_manager)
                if alert:
                    self.risk_scorer.update_asset_score(alert)

    def run(self):
        logger.info("Correlation Engine started. Polling every 30 seconds.")
        while True:
            try:
                events = self.query_elasticsearch()
                if events:
                    logger.info(f"Fetched {len(events)} siem-tagged events for evaluation.")
                    for event in events:
                        self.evaluate_rules(event)
            except Exception as e:
                logger.error(f"Crash in main loop: {e}")
                
            time.sleep(30)

if __name__ == "__main__":
    time.sleep(10) # Wait for other services to settle
    engine = CorrelationEngine()
    engine.run()
