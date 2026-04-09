import logging
import json
import os

class ComplianceMapper:
    """
    Given an alert or SCA finding and a list of its mapped compliance frameworks,
    this module updates the corresponding internal compliance scorecards.
    """
    def __init__(self):
        self.logger = logging.getLogger("ComplianceMapper")
        # In memory compliance score state. 
        # In a real environment, this aggregates from Elasticsearch over time windows. 
        self.frameworks = {
            "pci_dss": {
                "name": "PCI DSS 4.0",
                "total_violations": 0,
                "controls_failed": set()
            },
            "nist_800_53": {
                "name": "NIST SP 800-53",
                "total_violations": 0,
                "controls_failed": set()
            },
            "hipaa": {
                "name": "HIPAA",
                "total_violations": 0,
                "controls_failed": set()
            },
            "gdpr": {
                "name": "GDPR",
                "total_violations": 0,
                "controls_failed": set()
            },
            "cis": {
                "name": "CIS Controls v8",
                "total_violations": 0,
                "controls_failed": set()
            }
        }
        
    def process_alert(self, alert_data):
        """Map SIEM rule detections into compliance hits"""
        rule_mappings = alert_data.get("compliance_mappings", {})
        
        self._map_to_state(rule_mappings, alert_data.get("rule_id", "unknown"))
            
    def process_sca_finding(self, sca_result):
        """Map SCA policy failures into compliance hits"""
        # E.g., failed check CIS-1.1.2 mapping directly to a CIS framework failure
        if sca_result.get("status") == "failed":
            check_id = sca_result.get("check_id")
            # Usually we'd map via a dictionary, we will simulate matching directly to the CIS framework
            if "CIS" in check_id:
                self.frameworks["cis"]["total_violations"] += 1
                self.frameworks["cis"]["controls_failed"].add(check_id)
                self.frameworks["pci_dss"]["total_violations"] += 1
                self.frameworks["pci_dss"]["controls_failed"].add("11.5") # Hard mock
                
    def _map_to_state(self, mappings, entity_id):
        for framework, controls in mappings.items():
            norm_fw = framework.lower().replace("-", "_").replace(".", "_")
            if norm_fw in self.frameworks:
                self.frameworks[norm_fw]["total_violations"] += 1
                if isinstance(controls, list):
                    for c in controls:
                        self.frameworks[norm_fw]["controls_failed"].add(c)
                else:
                    self.frameworks[norm_fw]["controls_failed"].add(controls)
                    
    def get_summary(self):
        """Return the current compliance posture."""
        report = {}
        for k, v in self.frameworks.items():
            report[k] = {
                "name": v["name"],
                "total_violations": v["total_violations"],
                # Convert set to list for JSON serialization
                "controls_failed": list(v["controls_failed"]) 
            }
        return report
