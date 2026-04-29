#!/bin/bash
# =============================================================================
# SecureWatch Home Network Setup Script
# Run this ONCE on your Mac (the SIEM server) after docker compose is up
# Usage: chmod +x setup_home_network.sh && sudo ./setup_home_network.sh
# =============================================================================

set -e

SIEM_IP="192.168.1.8"
SIEM_SUBNET="192.168.1.0/24"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║         SecureWatch Home Network Setup               ║"
echo "║         SIEM Host: $SIEM_IP                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Step 1: Open required firewall ports on macOS host ──────────────────────
echo "[1/4] Configuring macOS firewall rules..."
echo "      Note: macOS Application Firewall handles this automatically."
echo "      Make sure 'Block all incoming connections' is OFF in:"
echo "      System Settings > Privacy & Security > Firewall > Firewall Options"
echo ""

# ── Step 2: Verify all containers are healthy ────────────────────────────────
echo "[2/4] Verifying containers..."
export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
cd "$(dirname "$0")"

BACKEND_STATUS=$(docker compose ps --format "{{.Name}} {{.Status}}" | grep backend | awk '{print $2}')
LOGSTASH_STATUS=$(docker compose ps --format "{{.Name}} {{.Status}}" | grep logstash | awk '{print $2}')

if [[ "$BACKEND_STATUS" == "Up" ]]; then
    echo "      ✅ Backend API    → http://$SIEM_IP:8000"
else
    echo "      ❌ Backend is DOWN — run: docker compose up -d backend"
    exit 1
fi

if [[ "$LOGSTASH_STATUS" == "Up" ]]; then
    echo "      ✅ Logstash       → $SIEM_IP:5140 (Syslog)"
    echo "      ✅ Logstash       → $SIEM_IP:5044 (Beats)"
    echo "      ✅ Logstash       → $SIEM_IP:1514 (Agent)"
else
    echo "      ❌ Logstash is DOWN — run: docker compose up -d logstash"
    exit 1
fi

# ── Step 3: Test login endpoint ──────────────────────────────────────────────
echo ""
echo "[3/4] Testing backend login API..."
RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://$SIEM_IP:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=SecureWatch123!")

if [[ "$RESP" == "200" ]]; then
    echo "      ✅ Login API is healthy (HTTP 200)"
else
    echo "      ❌ Login API returned HTTP $RESP"
    exit 1
fi

# ── Step 4: Print connection guide ───────────────────────────────────────────
echo ""
echo "[4/4] Setup complete! Your SecureWatch network map:"
echo ""
echo "  📊 Dashboard:        http://$SIEM_IP:3000"
echo "  🔌 Backend API:      http://$SIEM_IP:8000"
echo "  📈 Kibana:           http://$SIEM_IP:5601"
echo ""
echo "  ─── Log Ingestion Endpoints ───────────────────────"
echo "  🔴 Syslog (UDP/TCP): $SIEM_IP:5140"
echo "  🔴 Syslog (UDP):     $SIEM_IP:5514   (Windows Events)"
echo "  🔴 Beats Input:      $SIEM_IP:5044   (Filebeat, Metricbeat)"
echo "  🔴 Agent Port:       $SIEM_IP:1514   (SecureWatch Agent)"
echo "  🔴 Auth Logs:        $SIEM_IP:5055"
echo ""
echo "  ─── Credentials ───────────────────────────────────"
echo "  Username: admin"
echo "  Password: SecureWatch123!"
echo ""
echo "  ─── To deploy agent on a Linux device ─────────────"
echo "  1. Copy the agent/ folder to the target device"
echo "  2. Run: sudo bash install_agent.sh $SIEM_IP home-network"
echo ""
echo "  ─── Router Syslog (optional) ───────────────────────"
echo "  Point your router's syslog server to: $SIEM_IP:5140 (UDP)"
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  👉 Open your browser: http://$SIEM_IP:3000      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
