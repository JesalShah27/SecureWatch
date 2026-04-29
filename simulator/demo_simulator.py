#!/usr/bin/env python3
"""
=============================================================================
SecureWatch SIEM — Full Demo Simulator
=============================================================================
Registers 5 named devices, injects realistic events, and populates every
dashboard page so the project can be demonstrated end-to-end.

Devices:
  macOS  : Jesal-Shah-MacBook, Samruddhi-MacBook
  Windows: Harsh-PC, Arjuna-PC, Nikhiti-PC

Usage:
  python3 demo_simulator.py
=============================================================================
"""

import requests
import json
import socket
import time
import random
import datetime
import uuid

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
SIEM_HOST   = "192.168.1.8"
API_BASE    = f"http://{SIEM_HOST}:8000/api"
SYSLOG_PORT = 5140   # linux syslog
AUTH_PORT   = 5055   # auth logs
API_PORT    = 5060   # json audit logs
WIN_PORT    = 5514   # windows syslog

ADMIN_USER = "admin"
ADMIN_PASS = "SecureWatch123!"

# ─────────────────────────────────────────────
# DEVICE DEFINITIONS
# ─────────────────────────────────────────────
DEVICES = [
    {
        "id":       "agent-jesal-001",
        "hostname": "Jesal-Shah-MacBook",
        "owner":    "Jesal Shah",
        "ip":       "192.168.1.8",
        "os":       "macOS 14.4",
        "group":    "home-admins",
        "platform": "mac",
        "status":   "active",
        "version":  "1.2.0",
    },
    {
        "id":       "agent-samruddhi-002",
        "hostname": "Samruddhi-MacBook",
        "owner":    "Samruddhi",
        "ip":       "192.168.1.11",
        "os":       "macOS 13.6",
        "group":    "home-users",
        "platform": "mac",
        "status":   "active",
        "version":  "1.2.0",
    },
    {
        "id":       "agent-harsh-003",
        "hostname": "Harsh-PC",
        "owner":    "Harsh",
        "ip":       "192.168.1.20",
        "os":       "Windows 11 Pro",
        "group":    "home-users",
        "platform": "windows",
        "status":   "active",
        "version":  "1.2.0",
    },
    {
        "id":       "agent-arjuna-004",
        "hostname": "Arjuna-PC",
        "owner":    "Arjuna",
        "ip":       "192.168.1.21",
        "os":       "Windows 10 Pro",
        "group":    "home-users",
        "platform": "windows",
        "status":   "active",
        "version":  "1.2.0",
    },
    {
        "id":       "agent-nikhiti-005",
        "hostname": "Nikhiti-PC",
        "owner":    "Nikhiti",
        "ip":       "192.168.1.22",
        "os":       "Windows 11 Home",
        "group":    "home-users",
        "platform": "windows",
        "status":   "active",
        "version":  "1.1.9",
    },
]

# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
session = requests.Session()

def ts():
    return datetime.datetime.utcnow().isoformat() + "Z"

def syslog_ts():
    return datetime.datetime.now().strftime("%b %d %H:%M:%S")

def send_tcp(port, msg):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(3)
            s.connect((SIEM_HOST, port))
            if not msg.endswith('\n'):
                msg += '\n'
            s.sendall(msg.encode())
    except Exception as e:
        print(f"    ⚠️  TCP {port}: {e}")

def send_udp(port, msg):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.sendto(msg.encode(), (SIEM_HOST, port))
    except Exception as e:
        print(f"    ⚠️  UDP {port}: {e}")

def api_post(path, data, auth=True):
    headers = {}
    if auth:
        headers["Authorization"] = f"Bearer {session.token}"
    try:
        r = session.post(f"{API_BASE}{path}", json=data, headers=headers, timeout=5)
        return r
    except Exception as e:
        print(f"    ⚠️  POST {path}: {e}")
        return None

def api_get(path):
    headers = {"Authorization": f"Bearer {session.token}"}
    try:
        r = session.get(f"{API_BASE}{path}", headers=headers, timeout=5)
        return r
    except Exception as e:
        print(f"    ⚠️  GET {path}: {e}")
        return None

# ─────────────────────────────────────────────
# STEP 1 — AUTHENTICATE
# ─────────────────────────────────────────────
def authenticate():
    print("\n[1/6] 🔐 Authenticating with SecureWatch API...")
    r = session.post(f"{API_BASE}/auth/login",
                     data={"username": ADMIN_USER, "password": ADMIN_PASS},
                     headers={"Content-Type": "application/x-www-form-urlencoded"})
    if r.status_code == 200:
        session.token = r.json()["access_token"]
        print("       ✅ Admin token acquired")
    else:
        print(f"       ❌ Login failed ({r.status_code}): {r.text}")
        exit(1)

# ─────────────────────────────────────────────
# STEP 2 — REGISTER DEVICES (direct DB insert)
# ─────────────────────────────────────────────
def register_devices():
    print("\n[2/6] 🖥️  Registering home network devices via database...")
    import subprocess, os

    for dev in DEVICES:
        # Use docker compose exec to run psql INSERT inside the postgres container
        sql = (
            f"INSERT INTO agents (agent_id, hostname, ip_address, os_type, os_version, "
            f"agent_version, status, group_name, last_seen, registered_at, labels, token) "
            f"VALUES ("
            f"'{dev['id']}', '{dev['hostname']}', '{dev['ip']}', "
            f"'{dev['platform']}', '{dev['os']}', '{dev['version']}', "
            f"'active', '{dev['group']}', NOW(), NOW(), '{{}}', '{str(uuid.uuid4())}') "
            f"ON CONFLICT (agent_id) DO UPDATE SET status='active', last_seen=NOW();"
        )

        cmd = [
            "docker", "compose", "exec", "-T", "postgres",
            "psql", "-U", "siemuser", "-d", "siemdb", "-c", sql
        ]

        result = subprocess.run(cmd, capture_output=True, text=True,
                                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

        if result.returncode == 0:
            print(f"       ✅ {dev['hostname']:25s} ({dev['os']}) — {dev['ip']}")
        else:
            print(f"       ⚠️  {dev['hostname']:25s} — {result.stderr.strip()[:60]}")
        time.sleep(0.2)


# ─────────────────────────────────────────────
# STEP 3 — INJECT ALERTS DIRECTLY
# ─────────────────────────────────────────────
ALERT_SCENARIOS = [
    # Brute force on Harsh-PC
    {
        "title":      "SSH Brute Force Detected",
        "description":"22 failed SSH login attempts from 185.15.20.47 within 30 seconds",
        "severity":   "critical",
        "source_ip":  "185.15.20.47",
        "dest_ip":    "192.168.1.20",
        "hostname":   "Harsh-PC",
        "agent_id":   "agent-harsh-003",
        "rule_id":    "SIEM-001",
        "mitre_tactic":      "Credential Access",
        "mitre_technique_id":"T1110",
    },
    # Malware on Nikhiti-PC
    {
        "title":      "Crypto Miner Execution Detected",
        "description":"Process xmrig.exe running at 98% CPU — matches known coinminer signature",
        "severity":   "critical",
        "source_ip":  "192.168.1.22",
        "dest_ip":    "pool.minexmr.com",
        "hostname":   "Nikhiti-PC",
        "agent_id":   "agent-nikhiti-005",
        "rule_id":    "SIEM-068",
        "mitre_tactic":      "Impact",
        "mitre_technique_id":"T1496",
    },
    # Persistence on Arjuna-PC
    {
        "title":      "Suspicious Scheduled Task Created",
        "description":"New scheduled task 'WindowsUpdate_Helper' pointing to %TEMP%\\svc.exe",
        "severity":   "high",
        "source_ip":  "192.168.1.21",
        "dest_ip":    "192.168.1.21",
        "hostname":   "Arjuna-PC",
        "agent_id":   "agent-arjuna-004",
        "rule_id":    "SIEM-071",
        "mitre_tactic":      "Persistence",
        "mitre_technique_id":"T1053.005",
    },
    # Privilege escalation on Harsh-PC
    {
        "title":      "Privilege Escalation — Sudo to Root",
        "description":"User 'harsh' executed /bin/bash as root via sudo without password prompt",
        "severity":   "high",
        "source_ip":  "192.168.1.20",
        "dest_ip":    "192.168.1.20",
        "hostname":   "Harsh-PC",
        "agent_id":   "agent-harsh-003",
        "rule_id":    "SIEM-066",
        "mitre_tactic":      "Privilege Escalation",
        "mitre_technique_id":"T1548",
    },
    # Data exfiltration on Nikhiti-PC
    {
        "title":      "Large Outbound Data Transfer",
        "description":"792 MB uploaded to 91.213.50.14:443 (RU) in under 4 minutes",
        "severity":   "critical",
        "source_ip":  "192.168.1.22",
        "dest_ip":    "91.213.50.14",
        "hostname":   "Nikhiti-PC",
        "agent_id":   "agent-nikhiti-005",
        "rule_id":    "SIEM-055",
        "mitre_tactic":      "Exfiltration",
        "mitre_technique_id":"T1048",
    },
    # Lateral movement — Samruddhi
    {
        "title":      "Lateral Movement — SMB Port Scan",
        "description":"Device scanned 47 internal IPs on port 445 (SMB) within 60 seconds",
        "severity":   "high",
        "source_ip":  "192.168.1.11",
        "dest_ip":    "192.168.1.0/24",
        "hostname":   "Samruddhi-MacBook",
        "agent_id":   "agent-samruddhi-002",
        "rule_id":    "SIEM-040",
        "mitre_tactic":      "Lateral Movement",
        "mitre_technique_id":"T1021.002",
    },
    # Normal login — Jesal
    {
        "title":      "New Device Login Observed",
        "description":"Successful SSH login to Jesal-Shah-MacBook from 192.168.1.1 (router)",
        "severity":   "low",
        "source_ip":  "192.168.1.1",
        "dest_ip":    "192.168.1.8",
        "hostname":   "Jesal-Shah-MacBook",
        "agent_id":   "agent-jesal-001",
        "rule_id":    "SIEM-010",
        "mitre_tactic":      "Initial Access",
        "mitre_technique_id":"T1078",
    },
    # Ransomware on Arjuna
    {
        "title":      "Ransomware Behavior — Mass File Encryption",
        "description":"5,241 files renamed to *.locked within 45 seconds on Arjuna-PC",
        "severity":   "critical",
        "source_ip":  "192.168.1.21",
        "dest_ip":    "192.168.1.21",
        "hostname":   "Arjuna-PC",
        "agent_id":   "agent-arjuna-004",
        "rule_id":    "SIEM-070",
        "mitre_tactic":      "Impact",
        "mitre_technique_id":"T1486",
    },
    # Recon on Samruddhi
    {
        "title":      "Network Reconnaissance Detected",
        "description":"nmap scan of subnet 192.168.1.0/24 initiated from Samruddhi-MacBook",
        "severity":   "medium",
        "source_ip":  "192.168.1.11",
        "dest_ip":    "192.168.1.0/24",
        "hostname":   "Samruddhi-MacBook",
        "agent_id":   "agent-samruddhi-002",
        "rule_id":    "SIEM-030",
        "mitre_tactic":      "Discovery",
        "mitre_technique_id":"T1046",
    },
    # Anomalous PowerShell on Harsh
    {
        "title":      "Encoded PowerShell Command Executed",
        "description":"powershell.exe launched with -EncodedCommand flag — common obfuscation technique",
        "severity":   "high",
        "source_ip":  "192.168.1.20",
        "dest_ip":    "192.168.1.20",
        "hostname":   "Harsh-PC",
        "agent_id":   "agent-harsh-003",
        "rule_id":    "SIEM-075",
        "mitre_tactic":      "Defense Evasion",
        "mitre_technique_id":"T1059.001",
    },
]

def inject_alerts():
    print("\n[3/6] 🚨 Injecting security alert scenarios...")
    for i, alert in enumerate(ALERT_SCENARIOS):
        payload = {
            "alert_id":      str(uuid.uuid4()),
            "title":         alert["title"],
            "description":   alert["description"],
            "severity":      alert["severity"],
            "source_ip":     alert["source_ip"],
            "dest_ip":       alert["dest_ip"],
            "hostname":      alert["hostname"],
            "agent_id":      alert["agent_id"],
            "rule_id":       alert["rule_id"],
            "status":        "open",
            "timestamp":     ts(),
            "mitre_tactic":       alert["mitre_tactic"],
            "mitre_technique_id": alert["mitre_technique_id"],
        }
        r = api_post("/alerts", payload)
        sev = alert['severity'].upper()
        host = alert['hostname']
        title = alert['title'][:45]
        print(f"       [{sev:8s}] {host:25s} → {title}")
        time.sleep(0.4)

# ─────────────────────────────────────────────
# STEP 4 — INJECT SYSLOG LOGS (Logstash)
# ─────────────────────────────────────────────
def inject_syslog_events():
    print("\n[4/6] 📡 Sending syslog events to Logstash...")

    events = [
        # macOS events — Jesal
        (AUTH_PORT, f"{syslog_ts()} Jesal-Shah-MacBook sshd[2201]: Accepted publickey for jesal from 192.168.1.1 port 55021 ssh2"),
        (AUTH_PORT, f"{syslog_ts()} Jesal-Shah-MacBook sudo: jesal : TTY=ttys001 ; PWD=/Users/jesal ; USER=root ; COMMAND=/usr/bin/brew update"),
        (SYSLOG_PORT, f"{syslog_ts()} Jesal-Shah-MacBook kernel[0]: Firewall: Allow TCP 192.168.1.8:50443 -> 8.8.8.8:443"),

        # macOS events — Samruddhi (SMB scan)
        (SYSLOG_PORT, f"{syslog_ts()} Samruddhi-MacBook nmap[9012]: Nmap scan initiated on 192.168.1.0/24"),
        (AUTH_PORT,  f"{syslog_ts()} Samruddhi-MacBook sshd[3341]: Failed password for root from 192.168.1.20 port 44211 ssh2"),
        (AUTH_PORT,  f"{syslog_ts()} Samruddhi-MacBook sshd[3341]: Failed password for admin from 192.168.1.20 port 44212 ssh2"),

        # Windows — Harsh (brute force source)
        (AUTH_PORT, f"{syslog_ts()} Harsh-PC sshd[841]: Failed password for root from 185.15.20.47 port 33412 ssh2"),
        (AUTH_PORT, f"{syslog_ts()} Harsh-PC sshd[841]: Failed password for root from 185.15.20.47 port 33413 ssh2"),
        (AUTH_PORT, f"{syslog_ts()} Harsh-PC sshd[841]: Failed password for root from 185.15.20.47 port 33414 ssh2"),
        (AUTH_PORT, f"{syslog_ts()} Harsh-PC sshd[841]: Failed password for root from 185.15.20.47 port 33415 ssh2"),
        (AUTH_PORT, f"{syslog_ts()} Harsh-PC sshd[841]: Accepted password for root from 185.15.20.47 port 33416 ssh2"),
        (AUTH_PORT, f"{syslog_ts()} Harsh-PC sudo: harsh : TTY=pts/0 ; PWD=/home/harsh ; USER=root ; COMMAND=/bin/bash"),

        # Windows — Arjuna (ransomware)
        (API_PORT, json.dumps({"type":"api_audit_logs","timestamp":ts(),"event_type":"mass_file_deletion","hostname":"Arjuna-PC","deleted_count":5241,"message":"Rapid file encryption — .locked extension appended to 5241 files"})),
        (SYSLOG_PORT, f"{syslog_ts()} Arjuna-PC Task Scheduler[1348]: Task registered: WindowsUpdate_Helper, action: C:\\Users\\arjuna\\AppData\\Local\\Temp\\svc.exe"),

        # Windows — Nikhiti (miner + exfil)
        (API_PORT, json.dumps({"type":"api_audit_logs","timestamp":ts(),"event_type":"process_execution","hostname":"Nikhiti-PC","process_name":"xmrig.exe","cpu_utilization":98.4,"message":"Crypto miner executing — high CPU usage matching xmrig signature"})),
        (SYSLOG_PORT, f"{syslog_ts()} Nikhiti-PC firewall: BLOCK OUT TCP 192.168.1.22:55421 -> 91.213.50.14:443 — threat intel match"),
    ]

    for port, msg in events:
        send_tcp(port, msg)
        time.sleep(0.1)

    print(f"       ✅ {len(events)} syslog/JSON events sent to Logstash")

# ─────────────────────────────────────────────
# STEP 5 — POPULATE ASSET RISK SCORES
# ─────────────────────────────────────────────
def populate_assets():
    print("\n[5/6] 📊 Updating asset risk scores...")
    assets = [
        {"entity_id": "Jesal-Shah-MacBook",  "ip": "192.168.1.8",  "risk_score": 12, "tactics_hit": [], "latest_alert": "New Device Login Observed"},
        {"entity_id": "Samruddhi-MacBook",   "ip": "192.168.1.11", "risk_score": 55, "tactics_hit": ["Discovery", "Lateral Movement"], "latest_alert": "Network Reconnaissance Detected"},
        {"entity_id": "Harsh-PC",            "ip": "192.168.1.20", "risk_score": 88, "tactics_hit": ["Credential Access", "Privilege Escalation", "Defense Evasion"], "latest_alert": "SSH Brute Force Detected"},
        {"entity_id": "Arjuna-PC",           "ip": "192.168.1.21", "risk_score": 97, "tactics_hit": ["Persistence", "Impact"], "latest_alert": "Ransomware Behavior — Mass File Encryption"},
        {"entity_id": "Nikhiti-PC",          "ip": "192.168.1.22", "risk_score": 94, "tactics_hit": ["Impact", "Exfiltration"], "latest_alert": "Crypto Miner Execution Detected"},
    ]
    for asset in assets:
        r = api_post("/assets/risk-update", asset)
        score = asset['risk_score']
        icon = "🔴" if score > 70 else ("🟡" if score > 40 else "🟢")
        print(f"       {icon} {asset['entity_id']:25s}  Risk: {score}/100  Tactics: {', '.join(asset['tactics_hit']) or 'None'}")
        time.sleep(0.2)

# ─────────────────────────────────────────────
# STEP 6 — TRIGGER IP BLOCK (Active Response)
# ─────────────────────────────────────────────
def trigger_active_response():
    print("\n[6/6] 🛡️  Triggering Active Response — blocking attacker IPs...")
    blocks = [
        {"ip_address": "185.15.20.47",  "reason": "SSH Brute Force — 22 failed attempts on Harsh-PC"},
        {"ip_address": "91.213.50.14",  "reason": "Threat Intel Match — Nikhiti-PC exfiltration target"},
    ]
    for b in blocks:
        r = api_post("/response/block-ip", b)
        print(f"       🚫 Blocked {b['ip_address']:18s} — {b['reason']}")
        time.sleep(0.3)

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print("=" * 62)
    print("  SecureWatch SIEM — Home Network Demo Simulator")
    print("  Devices: Jesal Shah · Samruddhi · Harsh · Arjuna · Nikhiti")
    print("=" * 62)

    authenticate()
    register_devices()
    inject_alerts()
    inject_syslog_events()
    populate_assets()
    trigger_active_response()

    print("\n" + "=" * 62)
    print("  ✅ Demo dataset fully loaded!")
    print(f"  📊 Dashboard: http://{SIEM_HOST}:3000")
    print("     Login: admin / SecureWatch123!")
    print("=" * 62)
    print("\n  What to show in the demo video:")
    print("  1. Dashboard   → Alert counts, MITRE matrix, agent count (5)")
    print("  2. Alert Console → 10 alerts across all 5 devices")
    print("  3. Agent Mgmt  → 5 registered devices (mac + windows)")
    print("  4. Asset Risk  → Arjuna-PC 97/100, Nikhiti-PC 94/100 (RED)")
    print("  5. Active Resp → 2 blocked IPs (attacker + C2 server)")
    print("  6. Threat Intel → Lookup 91.213.50.14 (Nikhiti exfil target)")
    print("  7. Reporting   → Download PDF executive summary")
    print("")

if __name__ == "__main__":
    main()
