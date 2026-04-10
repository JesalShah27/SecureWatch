import socket
import json
import time
import random
import datetime

# Target Logstash Endpoints
SYSLOG_PORT = 5140
AUTH_PORT = 5055
API_PORT = 5060
HOST = "localhost"

def send_tcp(port, message):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((HOST, port))
            # Ensures newline termination for Logstash TCP input
            if not message.endswith('\n'):
                message += '\n'
            s.sendall(message.encode())
    except Exception as e:
        print(f"Failed to send to {HOST}:{port} -> {e}")

def get_current_syslog_time():
    return datetime.datetime.now().strftime("%b %d %H:%M:%S")

def get_current_iso_time():
    return datetime.datetime.utcnow().isoformat() + "Z"

# --- SCENARIOS ---

def simulate_brute_force():
    """Generates 20 rapid SSH auth failures followed by a success."""
    print("[*] Launching: SSH Brute Force Attack (SIEM-001 / PLAYBOOK-001)")
    attacker_ip = f"185.15.20.{random.randint(1, 200)}"
    target_user = "root"
    
    for _ in range(20):
        msg = f"{get_current_syslog_time()} auth-server sshd[1234]: Failed password for {target_user} from {attacker_ip} port 33412 ssh2"
        send_tcp(AUTH_PORT, msg)
        time.sleep(0.05)
    
    # Success on 21st attempt
    msg = f"{get_current_syslog_time()} auth-server sshd[1234]: Accepted password for {target_user} from {attacker_ip} port 33412 ssh2"
    send_tcp(AUTH_PORT, msg)
    print("    -> Brute force sequence completed.")

def simulate_web_shell():
    """Generates a syslog payload for a suspicious web shell access."""
    print("[*] Launching: Web Shell Interaction (SIEM-060 / PLAYBOOK-006)")
    attacker_ip = "45.10.2.19"
    msg = f"{get_current_syslog_time()} web-server apache2: 127.0.0.1 - - \"GET /uploads/shell.php?cmd=cat+/etc/passwd HTTP/1.1\" 200 452 \"-\" \"curl/7.68.0\""
    send_tcp(SYSLOG_PORT, msg)
    print("    -> Web shell access generated.")

def simulate_privilege_escalation():
    """Simulates unauthorized sudo command leading to escalation."""
    print("[*] Launching: Privilege Escalation (SIEM-066 / PLAYBOOK-007)")
    msg = f"{get_current_syslog_time()} prod-db01 sudo:  analyst1 : TTY=pts/0 ; PWD=/home/analyst1 ; USER=root ; COMMAND=/bin/bash"
    send_tcp(AUTH_PORT, msg)
    print("    -> Privilege escalation generated.")

def simulate_crypto_mining():
    """Simulates a process monitor event reporting xmrig."""
    print("[*] Launching: Crypto Mining binary execution (SIEM-068 / PLAYBOOK-008)")
    # Simulating a JSON payload generated directly to the SIEM via API/Logstash JSON ingest
    payload = {
        "type": "api_audit_logs",
        "timestamp": get_current_iso_time(),
        "event_type": "process_execution",
        "hostname": "workstation-ny-14",
        "process_name": "xmrig",
        "cpu_utilization": 98.4,
        "message": "Suspicious high-CPU binary execution matching coin miner signature detected."
    }
    send_tcp(API_PORT, json.dumps(payload))
    print("    -> Crypto mining alert generated.")

def simulate_data_destruction():
    """Simulates mass file deletion or ransomware wiping behavior."""
    print("[*] Launching: Data Destruction Activity (SIEM-070 / PLAYBOOK-009)")
    payload = {
        "type": "api_audit_logs",
        "timestamp": get_current_iso_time(),
        "event_type": "mass_file_deletion",
        "hostname": "fs-server-01",
        "deleted_count": 5042,
        "message": "Rapid deletion of over 5000 files in under 30 seconds."
    }
    send_tcp(API_PORT, json.dumps(payload))
    print("    -> Data destruction alert generated.")

def main():
    print("=======================================")
    print(" SecureWatch SIEM - Attack Simulator   ")
    print("=======================================\n")
    print("Injecting real CEF/Syslog/JSON logs to Logstash on localhost...")
    
    attacks = [
        simulate_brute_force,
        simulate_web_shell,
        simulate_privilege_escalation,
        simulate_crypto_mining,
        simulate_data_destruction
    ]
    
    try:
        while True:
            attack = random.choice(attacks)
            attack()
            delay = random.randint(3, 8)
            print(f"Waiting {delay}s before next attack wave...\n")
            time.sleep(delay)
    except KeyboardInterrupt:
        print("\nSimulation aborted by user.")

if __name__ == "__main__":
    main()
