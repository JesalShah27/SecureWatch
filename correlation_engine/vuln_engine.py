import os
import json
import logging
import time
import requests
from elasticsearch import Elasticsearch

# Use a mock CVE feed for now, as downloading the entire NVD feed (~100MB+) 
# on startup is not ideal for the scope of this project. 
# We'll use a local mock dictionary to simulate matching.
# A full enterprise implementation would pull from NVD and store in ES.

MOCK_CVE_DB = {
    # Debian/Ubuntu mocking
    "openssl": {
        "1.1.1f-1ubuntu2": [
            {"cve_id": "CVE-2022-0778", "cvss": 7.5, "severity": "High", "description": "Infinite loop in BN_mod_sqrt() reachable when parsing certificates", "patch_available": True, "fix_version": "1.1.1f-1ubuntu2.13"}
        ]
    },
    "bash": {
        "4.3-7ubuntu1.1": [
            {"cve_id": "CVE-2014-6271", "cvss": 10.0, "severity": "Critical", "description": "Shellshock vulnerability", "patch_available": True, "fix_version": "4.3-7ubuntu1.5"}
        ]
    },
    
    # Python mocking
    "requests": {
        "2.31.0": [
            {"cve_id": "CVE-2024-35195", "cvss": 6.5, "severity": "Medium", "description": "Unintended TLS downgrades when using Requests under certain configurations", "patch_available": False, "fix_version": "Unknown"}
        ]
    },
    
    # Windows mocking
    "Google Chrome": {
        "114.0.5735.199": [
            {"cve_id": "CVE-2023-3079", "cvss": 8.8, "severity": "High", "description": "Type Confusion in V8", "patch_available": True, "fix_version": "115.0.5790.98"}
        ]
    }
}

class VulnerabilityEngine:
    def __init__(self):
        self.logger = logging.getLogger("VulnEngine")
        # In a real setup, we would connect to ES
        # self.es = Elasticsearch(["http://localhost:9200"])
        self.cve_db = MOCK_CVE_DB
        self.logger.info("Vulnerability Engine initialized. Using local Mock CVE DB.")

    def process_inventory(self, agent_id, inventory):
        """
        Process a software inventory payload from an agent.
        """
        self.logger.info(f"Processing vulnerability scan for agent {agent_id}. Total packages: {len(inventory)}")
        
        findings = []
        for pkg in inventory:
            pkg_name = pkg.get("package")
            pkg_version = pkg.get("version")
            
            # Simple exact match for demo purposes
            if pkg_name in self.cve_db:
                # Check versions (mocked: we just see if the exact version exists in our mock DB)
                if pkg_version in self.cve_db[pkg_name]:
                    vulnerabilities = self.cve_db[pkg_name][pkg_version]
                    for vuln in vulnerabilities:
                        finding = {
                            "agent_id": agent_id,
                            "package": pkg_name,
                            "installed_version": pkg_version,
                            "cve_id": vuln["cve_id"],
                            "cvss_score": vuln["cvss"],
                            "severity": vuln["severity"],
                            "description": vuln["description"],
                            "patch_available": vuln["patch_available"],
                            "fix_version": vuln["fix_version"],
                            "timestamp": time.time()
                        }
                        findings.append(finding)
                        self.logger.warning(f"[VULN DETECTED] {agent_id} - {pkg_name} ({pkg_version}) is vulnerable to {vuln['cve_id']}")
                        
        # In a real environment, we would save findings to ES: siem-vulnerabilities-*
        # For this prototype, we'll hit the FastAPI ingest endpoint if needed, or rely on the agent heartbeat handling.
        return findings

    def run_correlation(self):
        """
        Periodic task called by the main correlation engine. 
        In a full implementation, this might clean up old CVEs or pull new NVD updates.
        """
        pass
