const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const ES_URL    = 'http://127.0.0.1:9200';
const SIEM_API  = 'http://127.0.0.1:8000';

// Attack type -> MITRE mapping for richer alerts
const ATTACK_MITRE = {
    'ATTACK_BRUTE_FORCE':          { tactic: 'Credential Access', technique: 'T1110 - Brute Force' },
    'ATTACK_DDOS':                 { tactic: 'Impact',            technique: 'T1498 - Network DoS' },
    'ATTACK_DOS':                  { tactic: 'Impact',            technique: 'T1499 - Endpoint DoS' },
    'ATTACK_SQL_INJECTION':        { tactic: 'Initial Access',    technique: 'T1190 - Exploit Public App' },
    'ATTACK_PORT_SCAN':            { tactic: 'Discovery',         technique: 'T1046 - Network Service Scan' },
    'ATTACK_PHISHING':             { tactic: 'Initial Access',    technique: 'T1566 - Phishing' },
    'ATTACK_PRIVILEGE_ESCALATION': { tactic: 'Privilege Esc.',   technique: 'T1548 - Abuse Elevation Control' },
    'ATTACK_RANSOMWARE':           { tactic: 'Impact',            technique: 'T1486 - Data Encrypted for Impact' },
    'ATTACK_INSIDER_THREAT':       { tactic: 'Exfiltration',     technique: 'T1052 - Exfiltration Over Physical Medium' },
    'ATTACK_MITM':                 { tactic: 'Collection',        technique: 'T1557 - Adversary-in-the-Middle' },
};

async function pushToElasticsearch(payload) {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const indexName = `siem-logs-api-${today}`;
    try {
        const resp = await fetch(`${ES_URL}/${indexName}/_doc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (resp.ok) {
            console.log(`[ES] Inserted ${payload.event_type} -> ${indexName}`);
        } else {
            console.error(`[ES] Failed: ${resp.status} ${await resp.text()}`);
        }
    } catch (e) {
        console.error(`[ES] Error: ${e.message}`);
    }
}

async function pushAlertToBackend(logData, payload) {
    // Only push attacks as direct alerts (not background INFO noise)
    const severity = (logData.severity || '').toUpperCase();
    if (severity !== 'CRITICAL' && severity !== 'HIGH') return;

    const rawEventType = (logData.eventType || '');
    const eventKey = rawEventType.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
    const mitre = ATTACK_MITRE[eventKey] || {
        tactic: 'Unknown',
        technique: `Sandbox - ${rawEventType}`
    };

    const alertDoc = {
        alert_id:           `SANDBOX-${randomBytes(4).toString('hex').toUpperCase()}`,
        rule_id:            `SANDBOX-${eventKey}`,
        rule_name:          `[Sandbox] ${rawEventType} Detected`,
        mitre_tactic:       mitre.tactic,
        mitre_technique:    mitre.technique,
        severity:           severity.toLowerCase(),
        entity:             logData.srcIp || '10.0.0.1',
        status:             'new',
        timestamp:          new Date().toISOString(),
        raw_event:          payload,
        recommended_action: 'alert_only'
    };

    try {
        const resp = await fetch(`${SIEM_API}/api/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertDoc)
        });
        if (resp.ok) {
            console.log(`[ALERT] Pushed ${alertDoc.alert_id} (${severity}) to SecureWatch dashboard`);
        } else {
            console.error(`[ALERT] Failed: ${resp.status} ${await resp.text()}`);
        }
    } catch (e) {
        console.error(`[ALERT] Error: ${e.message}`);
    }
}

// Main endpoint
app.post('/api/logs', async (req, res) => {
    const logData = req.body;
    const now = new Date().toISOString();

    const payload = {
        ...logData,
        timestamp:           now,
        '@timestamp':        now,
        source:              'sandbox-simulation',
        siem_detected_event: true,
        tags:                ['siem_detected_event'],
        type:                'api_audit_logs',
        event_type:          logData.eventType,
        source_ip:           logData.srcIp   || '10.0.0.1',
        destination_ip:      logData.dstIp   || '',
        severity:            (logData.severity || 'info').toLowerCase(),
        message:             logData.message  || logData.eventType
    };

    // Run both in parallel - don't block the UI response
    await Promise.all([
        pushToElasticsearch(payload),
        pushAlertToBackend(logData, payload)
    ]);

    res.status(200).json({ status: 'forwarded' });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sandbox-relay' }));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`[Relay] Sandbox Relay Server listening on http://localhost:${PORT}`);
    console.log(`[Relay] ES target : ${ES_URL}`);
    console.log(`[Relay] SIEM API  : ${SIEM_API}`);
});
