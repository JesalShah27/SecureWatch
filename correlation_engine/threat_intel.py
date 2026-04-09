import os
import requests
import logging

logger = logging.getLogger(__name__)

class ThreatIntel:
    def __init__(self):
        self.vt_key = os.getenv("VIRUSTOTAL_API_KEY")
        self.abuse_key = os.getenv("ABUSEIPDB_API_KEY")

    def check_ip(self, ip_address):
        """Check IP against AbuseIPDB and fallback logic"""
        # Exclude internal/private space
        if ip_address.startswith("10.") or \
           ip_address.startswith("192.168.") or \
           len(ip_address) < 7:
            return {"malicious": False, "score": 0, "source": "internal"}

        # If API key exists, check AbuseIPDB
        if self.abuse_key:
            try:
                url = "https://api.abuseipdb.com/api/v2/check"
                headers = {"Key": self.abuse_key, "Accept": "application/json"}
                params = {"ipAddress": ip_address, "maxAgeInDays": "30"}
                
                resp = requests.get(url, headers=headers, params=params, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    score = data["data"]["abuseConfidenceScore"]
                    return {
                        "malicious": score > 50,
                        "score": score,
                        "source": "AbuseIPDB"
                    }
            except Exception as e:
                logger.error(f"Threat intel lookup failed: {e}")

        # Fallback if no keys or failure
        return {"malicious": False, "score": 0, "source": "bypass"}

    def check_hash(self, file_hash):
        """Check hash against VirusTotal"""
        if self.vt_key:
            try:
                url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
                headers = {"x-apikey": self.vt_key}
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    stats = resp.json()["data"]["attributes"]["last_analysis_stats"]
                    malicious_count = stats.get("malicious", 0)
                    return {
                        "malicious": malicious_count > 3,
                        "score": malicious_count,
                        "source": "VirusTotal"
                    }
            except Exception as e:
                logger.error(f"VT Hash lookup failed: {e}")
                
        return {"malicious": False, "score": 0, "source": "bypass"}
