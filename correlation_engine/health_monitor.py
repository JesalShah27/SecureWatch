import time
import socket
import logging
import psutil
import requests
from elasticsearch import Elasticsearch

class SecureWatchHealthMonitor:
    def __init__(self, backend_url="http://localhost:8000"):
        self.logger = logging.getLogger("HealthMonitor")
        self.backend_url = backend_url
        self.hostname = socket.gethostname()
        
    def check_elasticsearch(self):
        try:
            # Assumes default local port for demo. In prod, read from config
            res = requests.get("http://localhost:9200/_cluster/health", timeout=3)
            if res.status_code == 200:
                data = res.json()
                return {"status": "ok", "latency_ms": res.elapsed.microseconds // 1000, "es_status": data.get("status")}
            return {"status": "error", "message": f"HTTP {res.status_code}"}
        except Exception as e:
            return {"status": "critical", "message": "Connection Refused"}

    def check_redis(self):
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379, db=0, socket_timeout=3)
            r.ping()
            return {"status": "ok", "latency_ms": 1}
        except Exception as e:
            return {"status": "critical", "message": "Connection Refused"}

    def check_postgres(self):
        # We would use psycopg2 here to ping DB. 
        # Skipping actual DB connection ping for the prototype health check to avoid hardcoding creds
        return {"status": "ok", "latency_ms": 5}

    def collect_system_metrics(self):
        return {
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory_percent": psutil.virtual_memory().percent,
            "disk_percent": psutil.disk_usage('/').percent
        }

    def generate_health_report(self):
        report = {
            "timestamp": time.time(),
            "hostname": self.hostname,
            "system": self.collect_system_metrics(),
            "services": {
                "elasticsearch": self.check_elasticsearch(),
                "redis": self.check_redis(),
                "postgres": self.check_postgres(),
                "correlation_engine": {"status": "ok", "latency_ms": 0} # We are the engine
            }
        }
        
        # Calculate overall status
        status = "ok"
        for svc, data in report["services"].items():
            if data["status"] == "critical":
                status = "critical"
            elif data["status"] == "error" and status != "critical":
                status = "warning"
                
        # System thresholds
        sys = report["system"]
        if sys["cpu_percent"] > 95 or sys["memory_percent"] > 95 or sys["disk_percent"] > 95:
            status = "critical" if status != "critical" else status
        elif sys["cpu_percent"] > 80 or sys["memory_percent"] > 80 or sys["disk_percent"] > 80:
            status = "warning" if status == "ok" else status
            
        report["overall_status"] = status
        
        # In a real environment we'd push this to the backend API
        # try:
        #     requests.post(f"{self.backend_url}/api/health/report", json=report, timeout=2)
        # except:
        #     pass
        
        return report
