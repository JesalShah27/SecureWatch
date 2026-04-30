// Mock SIEM data store + helpers
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type IncidentStatus = "New" | "Investigating" | "Contained" | "Resolved";
export type AlertStatus = "New" | "Investigating" | "Resolved";

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "hsl(var(--sev-critical))",
  high: "hsl(var(--sev-high))",
  medium: "hsl(var(--sev-medium))",
  low: "hsl(var(--sev-low))",
  info: "hsl(var(--sev-info))",
};

export const ASSETS = [
  { id: "a1",  hostname: "Jesal's MacBook Pro",   ip: "192.168.1.21", os: "macOS 14.4",  type: "laptop", status: "online",       alerts: 0 },
  { id: "a2",  hostname: "Samruddhi's MacBook Air",ip: "192.168.1.22", os: "macOS 14.2",  type: "laptop", status: "online",       alerts: 1 },
  { id: "a3",  hostname: "Harsh Windows",          ip: "192.168.1.23", os: "Windows 11",  type: "desktop",status: "compromised",  alerts: 6 },
  { id: "a4",  hostname: "Nikhita Windows",        ip: "192.168.1.24", os: "Windows 11",  type: "desktop",status: "online",       alerts: 0 },
  { id: "a5",  hostname: "Arjuna Windows",         ip: "192.168.1.25", os: "Windows 10",  type: "desktop",status: "online",       alerts: 2 },
  { id: "a6",  hostname: "Rohan Windows",          ip: "192.168.1.26", os: "Windows 11",  type: "desktop",status: "quarantined",  alerts: 4 },
  { id: "a7",  hostname: "Priya Linux",            ip: "192.168.1.27", os: "Ubuntu 22.04",type: "desktop",status: "online",       alerts: 0 },
  { id: "a8",  hostname: "Karan Windows",          ip: "192.168.1.28", os: "Windows 11",  type: "desktop",status: "offline",      alerts: 0 },
  { id: "a9",  hostname: "EDR Server 1",           ip: "192.168.1.10", os: "Ubuntu 22.04",type: "server", status: "online",       alerts: 0 },
  { id: "a10", hostname: "EDR Server 2",           ip: "192.168.1.11", os: "Ubuntu 22.04",type: "server", status: "online",       alerts: 1 },
  { id: "a11", hostname: "Firewall Server 1",      ip: "192.168.1.1",  os: "pfSense 2.7", type: "firewall",status: "online",      alerts: 3 },
  { id: "a12", hostname: "Firewall Server 2",      ip: "192.168.1.2",  os: "pfSense 2.7", type: "firewall",status: "online",      alerts: 0 },
  { id: "a13", hostname: "Web Server",             ip: "192.168.1.50", os: "Ubuntu 22.04",type: "server", status: "online",       alerts: 2 },
  { id: "a14", hostname: "Domain Controller",      ip: "192.168.1.5",  os: "Win Server 22",type: "server",status: "online",       alerts: 1 },
  { id: "a15", hostname: "SIEM Server",            ip: "192.168.1.9",  os: "Ubuntu 22.04",type: "server", status: "online",       alerts: 0 },
];

export const COUNTRIES = [
  { code: "RU", name: "Russia",       lat: 60, lng: 90,  flag: "🇷🇺" },
  { code: "CN", name: "China",        lat: 35, lng: 105, flag: "🇨🇳" },
  { code: "KP", name: "North Korea",  lat: 40, lng: 127, flag: "🇰🇵" },
  { code: "RO", name: "Romania",      lat: 46, lng: 25,  flag: "🇷🇴" },
  { code: "BR", name: "Brazil",       lat: -10, lng: -55, flag: "🇧🇷" },
  { code: "NG", name: "Nigeria",      lat: 9,  lng: 8,   flag: "🇳🇬" },
  { code: "US", name: "United States",lat: 39, lng: -98, flag: "🇺🇸" },
  { code: "DE", name: "Germany",      lat: 51, lng: 10,  flag: "🇩🇪" },
];

export const TARGET = { name: "India", lat: 22, lng: 78 };

const ATTACK_TYPES = ["Brute Force", "SQL Injection", "Port Scan", "DDoS", "Lateral Movement", "C2 Beacon", "Phishing", "Malware Drop", "Credential Stuffing"];
const EVENT_TYPES = ["auth.login.failed", "auth.login.success", "net.conn.blocked", "net.scan.detected", "edr.process.suspicious", "edr.file.encrypted", "dns.query.suspicious", "ids.alert", "fw.deny", "ad.priv.escalation"];

export function randomIp(external = false) {
  if (external) {
    const ranges = [[192,0,2],[198,51,100],[203,0,113]];
    const r = ranges[Math.floor(Math.random()*ranges.length)];
    return `${r[0]}.${r[1]}.${r[2]}.${Math.floor(Math.random()*254)+1}`;
  }
  return `192.168.1.${Math.floor(Math.random()*254)+1}`;
}

export function randomSeverity(): Severity {
  const r = Math.random();
  if (r < 0.08) return "critical";
  if (r < 0.25) return "high";
  if (r < 0.55) return "medium";
  if (r < 0.85) return "low";
  return "info";
}

export function pickAsset() {
  return ASSETS[Math.floor(Math.random() * ASSETS.length)];
}

export function pickCountry() {
  return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
}

export function pickAttackType() {
  return ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
}

export function pickEventType() {
  return EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
}

export interface LogEntry {
  id: string;
  ts: number;
  severity: Severity;
  host: string;
  eventId: string;
  message: string;
  srcIp: string;
  dstIp: string;
  format: "syslog" | "json" | "cef" | "winevt";
  raw: string;
}

let _logId = 0;
export function makeLog(): LogEntry {
  _logId++;
  const sev = randomSeverity();
  const asset = pickAsset();
  const src = Math.random() < 0.6 ? randomIp(true) : randomIp();
  const dst = asset.ip;
  const evt = pickEventType();
  const eventId = `EVT-${4000 + Math.floor(Math.random() * 5999)}`;
  const ts = Date.now();
  const formats: LogEntry["format"][] = ["syslog", "json", "cef", "winevt"];
  const fmt = formats[Math.floor(Math.random() * formats.length)];
  const msg = `${evt} on ${asset.hostname} from ${src}`;
  let raw = "";
  if (fmt === "syslog") {
    raw = `<${130 + Math.floor(Math.random()*20)}>${new Date(ts).toISOString()} ${asset.hostname.replace(/\s+/g,"-")} sentry[${1000+_logId}]: ${evt} src=${src} dst=${dst} severity=${sev} eventid=${eventId}`;
  } else if (fmt === "json") {
    raw = JSON.stringify({ ts: new Date(ts).toISOString(), host: asset.hostname, event: evt, src_ip: src, dst_ip: dst, severity: sev, event_id: eventId, message: msg });
  } else if (fmt === "cef") {
    raw = `CEF:0|Sentry|SIEM|2.1|${eventId}|${evt}|${sev === "critical" ? 10 : sev === "high" ? 8 : sev === "medium" ? 5 : 3}|src=${src} dst=${dst} dhost=${asset.hostname} act=${Math.random()<0.5?"blocked":"detected"}`;
  } else {
    raw = `EventID=${eventId} Channel=Security TimeCreated=${new Date(ts).toISOString()} Computer=${asset.hostname} SourceIP=${src} DestIP=${dst} Severity=${sev} Message="${msg}"`;
  }
  return { id: `L${_logId}`, ts, severity: sev, host: asset.hostname, eventId, message: msg, srcIp: src, dstIp: dst, format: fmt, raw };
}

export interface AlertEntry {
  id: string;
  ts: number;
  title: string;
  severity: Severity;
  src: string;
  dst: string;
  status: AlertStatus;
  rule: string;
  rawLog: string;
  recommendation: string;
}

const RULES = [
  "Brute Force SSH Detected", "Impossible Travel Login", "C2 Beacon Pattern",
  "Data Exfiltration Volume Threshold", "Ransomware File Rename Pattern",
  "PowerShell Encoded Command", "DNS Tunneling Detection", "Lateral Movement SMB",
  "Credential Dump LSASS", "Privilege Escalation UAC Bypass"
];

let _alertId = 0;
export function makeAlert(): AlertEntry {
  _alertId++;
  const asset = pickAsset();
  const src = randomIp(true);
  const sev = randomSeverity();
  const rule = RULES[Math.floor(Math.random()*RULES.length)];
  return {
    id: `INC-${10240 + _alertId}`,
    ts: Date.now(),
    title: rule,
    severity: sev,
    src,
    dst: asset.hostname,
    status: "New",
    rule,
    rawLog: makeLog().raw,
    recommendation: sev === "critical" || sev === "high"
      ? `Isolate ${asset.hostname} immediately and block source ${src}.`
      : `Investigate logs around this event and verify with the user.`,
  };
}

export const SEED_ALERTS: AlertEntry[] = Array.from({ length: 14 }, () => {
  const a = makeAlert();
  a.ts = Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 6);
  a.status = (["New","Investigating","Resolved"] as AlertStatus[])[Math.floor(Math.random()*3)];
  return a;
}).sort((a,b) => b.ts - a.ts);

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  assignee: string;
  affected: number;
  created: number;
  updated: number;
  description: string;
  attackVector: string;
  mitre: string;
  affectedHosts: string[];
}

const ANALYSTS = ["Jesal Pavaskar", "Samruddhi Rao", "Harsh Mehta", "Nikhita Sharma", "Arjuna Patel"];
export const INCIDENTS: Incident[] = Array.from({ length: 22 }, (_, i) => {
  const sev = randomSeverity();
  const statuses: IncidentStatus[] = ["New", "Investigating", "Contained", "Resolved"];
  const created = Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 5);
  const hosts = Array.from({ length: 1 + Math.floor(Math.random()*3) }, () => pickAsset().hostname);
  return {
    id: `INC-${10000 + i}`,
    title: RULES[i % RULES.length] + ` on ${hosts[0]}`,
    severity: sev,
    status: statuses[Math.floor(Math.random()*statuses.length)],
    assignee: ANALYSTS[Math.floor(Math.random()*ANALYSTS.length)],
    affected: hosts.length,
    created,
    updated: created + Math.floor(Math.random()*1000*60*120),
    description: `Detection rule "${RULES[i % RULES.length]}" matched ${5 + Math.floor(Math.random()*40)} events. Investigation required.`,
    attackVector: ["Network", "Endpoint", "Identity", "Email"][Math.floor(Math.random()*4)],
    mitre: ["T1110 Brute Force", "T1059 Command Execution", "T1071 C2 Channel", "T1486 Data Encrypted for Impact", "T1078 Valid Accounts"][i % 5],
    affectedHosts: hosts,
  };
});

export interface RuleDef {
  id: string;
  name: string;
  category: "Authentication" | "Network" | "Endpoint" | "Malware" | "Insider Threat";
  severity: Severity;
  enabled: boolean;
  triggers7d: number;
  lastTriggered: number;
  description: string;
}
export const RULES_LIB: RuleDef[] = [
  { id:"R001", name:"Brute Force Detection", category:"Authentication", severity:"high", enabled:true,  triggers7d: 142, lastTriggered: Date.now()-1000*60*8,  description:"Detects 10+ failed logins from same source within 5 minutes." },
  { id:"R002", name:"SQL Injection Pattern", category:"Network", severity:"critical", enabled:true, triggers7d: 27, lastTriggered: Date.now()-1000*60*42, description:"WAF detection of SQLi tautologies and UNION-based payloads." },
  { id:"R003", name:"DNS Tunneling", category:"Network", severity:"high", enabled:true, triggers7d: 9, lastTriggered: Date.now()-1000*60*60*3, description:"Anomalous DNS query length / entropy on a single domain." },
  { id:"R004", name:"PowerShell Encoded Command", category:"Endpoint", severity:"high", enabled:true, triggers7d: 18, lastTriggered: Date.now()-1000*60*32, description:"powershell.exe -enc usage indicating obfuscation." },
  { id:"R005", name:"Impossible Travel", category:"Authentication", severity:"medium", enabled:true, triggers7d: 6, lastTriggered: Date.now()-1000*60*60*8, description:"Same user logging in from geographically impossible distance." },
  { id:"R006", name:"Mass File Encryption", category:"Malware", severity:"critical", enabled:true, triggers7d: 2, lastTriggered: Date.now()-1000*60*60*22, description:"100+ file rename events with new extension within 60s." },
  { id:"R007", name:"Port Scan Sweep", category:"Network", severity:"medium", enabled:true, triggers7d: 78, lastTriggered: Date.now()-1000*60*4, description:"Single source contacting 20+ ports on internal hosts." },
  { id:"R008", name:"C2 Beacon Interval", category:"Network", severity:"high", enabled:true, triggers7d: 11, lastTriggered: Date.now()-1000*60*55, description:"Periodic outbound beacons with low jitter." },
  { id:"R009", name:"Lateral Movement SMB", category:"Endpoint", severity:"high", enabled:true, triggers7d: 14, lastTriggered: Date.now()-1000*60*60*2, description:"Admin SMB connections to multiple internal hosts." },
  { id:"R010", name:"Data Staging Detection", category:"Insider Threat", severity:"medium", enabled:true, triggers7d: 5, lastTriggered: Date.now()-1000*60*60*5, description:"Compression of unusually large directories before egress." },
  { id:"R011", name:"Privilege Escalation UAC Bypass", category:"Endpoint", severity:"critical", enabled:true, triggers7d: 3, lastTriggered: Date.now()-1000*60*60*9, description:"Known UAC bypass binary execution." },
  { id:"R012", name:"Credential Dump LSASS", category:"Endpoint", severity:"critical", enabled:true, triggers7d: 1, lastTriggered: Date.now()-1000*60*60*30, description:"Process opening LSASS handle with PROCESS_VM_READ." },
  { id:"R013", name:"Scheduled Task Persistence", category:"Endpoint", severity:"medium", enabled:false, triggers7d: 0, lastTriggered: Date.now()-1000*60*60*48, description:"New scheduled task running from user-writable path." },
  { id:"R014", name:"Registry Run Key Added", category:"Endpoint", severity:"medium", enabled:true, triggers7d: 4, lastTriggered: Date.now()-1000*60*60*7, description:"New value added to HKCU\\...\\Run." },
  { id:"R015", name:"Suspicious Outbound Volume", category:"Insider Threat", severity:"high", enabled:true, triggers7d: 8, lastTriggered: Date.now()-1000*60*15, description:"User uploads >2GB to external destination in 10 min." },
];

export const SUSPICIOUS_IPS = COUNTRIES.map((c, i) => ({
  ip: randomIp(true),
  country: c.name,
  flag: c.flag,
  events: 200 + Math.floor(Math.random() * 4800),
  threat: 40 + Math.floor(Math.random() * 60),
  lastSeen: Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 4),
}));

export const UEBA_USERS = [
  { user: "harsh.mehta",    dept: "Engineering", anomaly: "Off-hours login",          risk: "high",     ts: Date.now()-1000*60*22 },
  { user: "rohan.k",        dept: "Finance",     anomaly: "Mass download (4.2GB)",    risk: "critical", ts: Date.now()-1000*60*9 },
  { user: "priya.s",        dept: "HR",          anomaly: "Privilege escalation attempt", risk: "high", ts: Date.now()-1000*60*48 },
  { user: "karan.w",        dept: "Sales",       anomaly: "Login from new geo",       risk: "medium",   ts: Date.now()-1000*60*60 },
  { user: "nikhita.s",      dept: "Marketing",   anomaly: "Unusual file access pattern", risk: "low",   ts: Date.now()-1000*60*120 },
  { user: "arjuna.p",       dept: "Engineering", anomaly: "Multiple failed MFA",      risk: "medium",   ts: Date.now()-1000*60*15 },
];

// MITRE ATT&CK simplified
export const MITRE_TACTICS = [
  "Reconnaissance", "Initial Access", "Execution", "Persistence",
  "Privilege Escalation", "Defense Evasion", "Credential Access",
  "Discovery", "Lateral Movement", "Collection", "Exfiltration", "Impact"
];
export const MITRE_TECHNIQUES: Record<string, { id: string; name: string; status: "none"|"covered"|"triggered" }[]> = {};
MITRE_TACTICS.forEach((t, i) => {
  MITRE_TECHNIQUES[t] = Array.from({ length: 4 + (i % 3) }, (_, j) => {
    const r = Math.random();
    return {
      id: `T${1000 + i*10 + j}`,
      name: `${t.split(" ")[0]} Technique ${j+1}`,
      status: r < 0.15 ? "triggered" : r < 0.7 ? "covered" : "none",
    };
  });
});

export function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" });
}
export function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString("en-IN", { hour12: false, timeZone: "Asia/Kolkata" });
}
export function relTime(ts: number) {
  const d = Math.floor((Date.now() - ts) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

// 24h hourly event volume seed
export function seedEventTimeline() {
  const now = Date.now();
  return Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(now - (23 - i) * 3600 * 1000);
    const base = 200 + Math.floor(Math.sin(i / 3) * 80) + Math.floor(Math.random() * 100);
    return {
      time: hour.getHours().toString().padStart(2, "0") + ":00",
      auth: base + Math.floor(Math.random() * 80),
      net: 150 + Math.floor(Math.random() * 200),
      edr: 80 + Math.floor(Math.random() * 120),
      attack: [5, 12, 18].includes(i),
    };
  });
}
