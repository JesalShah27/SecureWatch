const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// ─── In-memory log store (ring buffer, max 2000) ─────────────────────────────
const MAX_LOGS = 2000;
const logStore = [];
let logCursor = 0; // monotonic counter for SSE clients to track where they are

// MITRE mapping
const ATTACK_MITRE = {
  'ATTACK_BRUTE_FORCE':          { tactic: 'Credential Access',  technique: 'T1110',  name: 'Brute Force' },
  'ATTACK_BRUTE-FORCE':          { tactic: 'Credential Access',  technique: 'T1110',  name: 'Brute Force' },
  'ATTACK_DDOS':                 { tactic: 'Impact',             technique: 'T1498',  name: 'Network DoS' },
  'ATTACK_DOS':                  { tactic: 'Impact',             technique: 'T1499',  name: 'Endpoint DoS' },
  'ATTACK_SQL_INJECTION':        { tactic: 'Initial Access',     technique: 'T1190',  name: 'Exploit Public App' },
  'ATTACK_SQL-INJECTION':        { tactic: 'Initial Access',     technique: 'T1190',  name: 'Exploit Public App' },
  'ATTACK_PORT_SCAN':            { tactic: 'Discovery',          technique: 'T1046',  name: 'Network Service Scan' },
  'ATTACK_PORT-SCAN':            { tactic: 'Discovery',          technique: 'T1046',  name: 'Network Service Scan' },
  'ATTACK_PHISHING':             { tactic: 'Initial Access',     technique: 'T1566',  name: 'Phishing' },
  'ATTACK_PRIVILEGE_ESCALATION': { tactic: 'Privilege Esc.',     technique: 'T1548',  name: 'Abuse Elevation Control' },
  'ATTACK_PRIVILEGE-ESCALATION': { tactic: 'Privilege Esc.',     technique: 'T1548',  name: 'Abuse Elevation Control' },
  'ATTACK_RANSOMWARE':           { tactic: 'Impact',             technique: 'T1486',  name: 'Data Encrypted for Impact' },
  'ATTACK_INSIDER_THREAT':       { tactic: 'Exfiltration',       technique: 'T1052',  name: 'Exfiltration Over Physical Medium' },
  'ATTACK_INSIDER-THREAT':       { tactic: 'Exfiltration',       technique: 'T1052',  name: 'Exfiltration Over Physical Medium' },
  'ATTACK_MITM':                 { tactic: 'Collection',         technique: 'T1557',  name: 'Adversary-in-the-Middle' },
};

// SSE clients waiting for new events
const sseClients = new Set();

function broadcast(logEntry) {
  const data = `data: ${JSON.stringify(logEntry)}\n\n`;
  for (const res of sseClients) {
    try { res.write(data); } catch (_) { sseClients.delete(res); }
  }
}

// ─── POST /api/logs  (sandbox → relay) ───────────────────────────────────────
app.post('/api/logs', (req, res) => {
  const logData = req.body;
  const now = new Date().toISOString();

  const rawEventType = (logData.eventType || 'UNKNOWN');
  const eventKey = rawEventType.toUpperCase().replace(/-/g, '_').replace(/ /g, '_');
  const mitre = ATTACK_MITRE[`ATTACK_${eventKey}`] || ATTACK_MITRE[eventKey] || null;

  const severity = (logData.severity || 'info').toLowerCase();

  const entry = {
    id:          `LOG-${Date.now()}-${randomBytes(2).toString('hex')}`,
    timestamp:   now,
    severity:    severity,
    sourceHost:  logData.srcHostname  || logData.srcIp    || 'sandbox',
    sourceIp:    logData.srcIp        || '10.0.0.1',
    destIp:      logData.dstIp        || '',
    eventType:   rawEventType,
    category:    mitre ? mitre.name : (severity === 'info' ? 'Network' : 'Attack'),
    message:     logData.message      || `${rawEventType} from ${logData.srcIp}`,
    mitre:       mitre ? mitre.technique : null,
    mitreTactic: mitre ? mitre.tactic    : null,
    action:      mitre ? 'Blocked'       : 'Logged',
    source:      'sandbox',
    cursor:      ++logCursor,
  };

  // Store
  if (logStore.length >= MAX_LOGS) logStore.shift();
  logStore.push(entry);

  // Push to all SSE clients immediately
  broadcast(entry);

  console.log(`[${severity.toUpperCase()}] ${entry.id} | ${rawEventType} | ${entry.sourceIp} → ${entry.destIp}`);
  res.status(200).json({ status: 'ok', id: entry.id });
});

// ─── GET /api/logs/stream  (SIEM dashboard SSE) ───────────────────────────────
app.get('/api/logs/stream', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send all existing logs the client hasn't seen yet
  const since = parseInt(req.query.since || '0', 10);
  const missed = logStore.filter(l => l.cursor > since);
  for (const l of missed) {
    res.write(`data: ${JSON.stringify(l)}\n\n`);
  }

  // Keep alive ping every 15s
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); } catch (_) { clearInterval(ping); sseClients.delete(res); }
  }, 15000);

  sseClients.add(res);
  console.log(`[SSE] Client connected (${sseClients.size} total)`);

  req.on('close', () => {
    clearInterval(ping);
    sseClients.delete(res);
    console.log(`[SSE] Client disconnected (${sseClients.size} total)`);
  });
});

// ─── GET /api/logs  (REST fallback) ──────────────────────────────────────────
app.get('/api/logs', (req, res) => {
  const since  = parseInt(req.query.since || '0',  10);
  const limit  = parseInt(req.query.limit || '200', 10);
  const result = logStore.filter(l => l.cursor > since).slice(-limit);
  res.json({ logs: result, cursor: logCursor });
});

// ─── GET /api/stats ───────────────────────────────────────────────────────────
app.get('/api/stats', (_req, res) => {
  const total    = logStore.length;
  const critical = logStore.filter(l => l.severity === 'critical').length;
  const high     = logStore.filter(l => l.severity === 'high').length;
  const blocked  = logStore.filter(l => l.action === 'Blocked').length;
  const attacks  = logStore.filter(l => l.source === 'sandbox' && l.severity !== 'info').length;
  res.json({ total, critical, high, blocked, attacks, cursor: logCursor });
});

// ─── DELETE /api/logs  (clear the store) ─────────────────────────────────────
app.delete('/api/logs', (_req, res) => {
  logStore.length = 0;
  logCursor = 0;
  broadcast({ __clear: true });
  console.log('[Relay] Log store cleared');
  res.json({ status: 'cleared' });
});

app.get('/health', (_req, res) => res.json({ status: 'ok', logs: logStore.length, sseClients: sseClients.size }));

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`[Relay] Sandbox Relay Server  →  http://localhost:${PORT}`);
  console.log(`[Relay] POST logs  : http://localhost:${PORT}/api/logs`);
  console.log(`[Relay] SSE stream : http://localhost:${PORT}/api/logs/stream`);
  console.log(`[Relay] Stats      : http://localhost:${PORT}/api/stats`);
});
