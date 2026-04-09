import socket
import time
import random
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class AttackSimulator:
    def __init__(self, logstash_ip="127.0.0.1", syslog_port=5140):
        self.logstash_ip = logstash_ip
        self.syslog_port = syslog_port
        
    def send_syslog(self, message):
        """Send raw string to Logstash UDP Syslog port natively"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            message = f"<34>1 {time.strftime('%Y-%m-%dT%H:%M:%S.000Z')} targethost sshd - - - {message}"
            sock.sendto(bytes(message, "utf-8"), (self.logstash_ip, self.syslog_port))
            sock.close()
            return True
        except Exception as e:
            logging.error(f"Failed to send syslog: {e}")
            return False

    def simulate_brute_force(self, target_ip, username, attempts=6):
        """Simulate SSH Brute Force (Triggers SIEM-001)"""
        logging.info(f"==> Simulating SSH Brute Force on user '{username}' from {target_ip}...")
        for i in range(attempts):
            port = random.randint(30000, 60000)
            msg = f"Failed password for {username} from {target_ip} port {port} ssh2"
            self.send_syslog(msg)
            time.sleep(1) # Send fast to trigger time window threshold
        logging.info("Brute force simulation complete.")

    def simulate_sudo_abuse(self, target_ip, username="www-data"):
        """Simulate unprivileged user running sudo (Triggers SIEM-018)"""
        logging.info(f"==> Simulating Sudo Abuse by user '{username}' from {target_ip}...")
        # Since our grok rule checks for "sudo" in program/process
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            msg = f"<34>1 {time.strftime('%Y-%m-%dT%H:%M:%S.000Z')} targethost sudo - - - pam_unix(sudo:session): session opened for user root by {username}(uid=0)"
            sock.sendto(bytes(msg, "utf-8"), (self.logstash_ip, self.syslog_port))
            sock.close()
        except:
            pass
        logging.info("Sudo simulation complete.")

    def run_full_killchain(self):
        attacker_ip = "185.15.20.100"
        
        print("\n" + "="*50)
        print("REALSIEM ATTACK SIMULATOR - INIT")
        print("="*50 + "\n")
        
        print("[Step 1] Initial Access - Brute Forcing SSH...")
        self.simulate_brute_force(attacker_ip, "root", attempts=8)
        time.sleep(3)
        
        print("\n[Step 2] Privilege Escalation - Sudo Abuse...")
        self.simulate_sudo_abuse(attacker_ip, "www-data")
        
        print("\n" + "="*50)
        print("Simulation complete! Check the React Dashboard for realtime alerts.")
        print("="*50 + "\n")

if __name__ == '__main__':
    # Default to localhost for local testing
    sim = AttackSimulator()
    sim.run_full_killchain()
