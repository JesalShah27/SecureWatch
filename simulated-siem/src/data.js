// Enhanced Mock Data for SecureWatch SIEM

export const mockAssets = [
  { id: 1, type: 'laptop', hostname: "JESAL-MBP", ip: '192.168.1.105', mac: 'a4:83:e7:12:34:56', os: 'macOS 14.4', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 34, mem: 61, disk: 42, agentVersion: 'v4.8.2', groups: ['workstations'], vulnerabilities: 2 },
  { id: 2, type: 'laptop', hostname: "SAMRUDDHI-MBA", ip: '192.168.1.110', mac: 'b8:27:eb:ab:cd:ef', os: 'macOS 14.2', status: 'online', openAlerts: 1, lastSeen: 'Just now', cpu: 22, mem: 55, disk: 38, agentVersion: 'v4.8.1', groups: ['workstations'], vulnerabilities: 1 },
  { id: 3, type: 'pc', hostname: "HARSH-WIN11", ip: '192.168.1.112', mac: 'c0:ee:fb:11:22:33', os: 'Windows 11 22H2', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 18, mem: 40, disk: 55, agentVersion: 'v4.8.2', groups: ['workstations'], vulnerabilities: 4 },
  { id: 4, type: 'pc', hostname: "NIKHITA-WIN10", ip: '192.168.1.113', mac: 'd2:45:9a:44:55:66', os: 'Windows 10 22H2', status: 'offline', openAlerts: 0, lastSeen: '2 hrs ago', cpu: 0, mem: 0, disk: 71, agentVersion: 'v4.7.9', groups: ['workstations'], vulnerabilities: 8 },
  { id: 5, type: 'pc', hostname: "ARJUN-WIN11", ip: '192.168.1.114', mac: 'e4:56:bc:77:88:99', os: 'Windows 11 23H2', status: 'online', openAlerts: 2, lastSeen: 'Just now', cpu: 45, mem: 72, disk: 63, agentVersion: 'v4.8.2', groups: ['workstations'], vulnerabilities: 3 },
  { id: 6, type: 'pc', hostname: "ROHAN-WIN10", ip: '192.168.1.115', mac: 'f6:67:cd:aa:bb:cc', os: 'Windows 10 21H2', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 12, mem: 38, disk: 48, agentVersion: 'v4.8.0', groups: ['workstations'], vulnerabilities: 11 },
  { id: 7, type: 'laptop', hostname: "PRIYA-UBUNTU", ip: '192.168.1.120', mac: '08:9e:01:dd:ee:ff', os: 'Ubuntu 22.04 LTS', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 28, mem: 44, disk: 33, agentVersion: 'v4.8.2', groups: ['workstations', 'devops'], vulnerabilities: 0 },
  { id: 8, type: 'pc', hostname: "KARAN-WIN11", ip: '192.168.1.121', mac: '1a:2b:3c:4d:5e:6f', os: 'Windows 11 22H2', status: 'compromised', openAlerts: 5, lastSeen: 'Just now', cpu: 98, mem: 91, disk: 77, agentVersion: 'v4.8.1', groups: ['workstations'], vulnerabilities: 17 },
  { id: 9, type: 'server', hostname: "EDR-SRV-01", ip: '10.0.0.50', mac: '2b:3c:4d:5e:6f:7a', os: 'Windows Server 2022', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 22, mem: 51, disk: 60, agentVersion: 'v4.8.2', groups: ['servers', 'edr'], vulnerabilities: 1 },
  { id: 10, type: 'server', hostname: "EDR-SRV-02", ip: '10.0.0.51', mac: '3c:4d:5e:6f:7a:8b', os: 'Windows Server 2022', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 19, mem: 48, disk: 58, agentVersion: 'v4.8.2', groups: ['servers', 'edr'], vulnerabilities: 1 },
  { id: 11, type: 'firewall', hostname: "FW-PERIMETER-01", ip: '10.0.0.1', mac: '4d:5e:6f:7a:8b:9c', os: 'pfSense 2.7', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 8, mem: 22, disk: 14, agentVersion: 'v4.8.2', groups: ['network', 'firewall'], vulnerabilities: 0 },
  { id: 12, type: 'firewall', hostname: "FW-PERIMETER-02", ip: '10.0.0.2', mac: '5e:6f:7a:8b:9c:ad', os: 'pfSense 2.7', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 7, mem: 20, disk: 14, agentVersion: 'v4.8.2', groups: ['network', 'firewall'], vulnerabilities: 0 },
  { id: 13, type: 'server', hostname: "WEB-SRV-01", ip: '10.0.0.10', mac: '6f:7a:8b:9c:ad:be', os: 'Ubuntu Server 22.04', status: 'online', openAlerts: 1, lastSeen: 'Just now', cpu: 55, mem: 68, disk: 71, agentVersion: 'v4.8.2', groups: ['servers', 'dmz'], vulnerabilities: 5 },
  { id: 14, type: 'server', hostname: "DC-01", ip: '10.0.0.20', mac: '7a:8b:9c:ad:be:cf', os: 'Windows Server 2019', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 31, mem: 57, disk: 44, agentVersion: 'v4.8.2', groups: ['servers', 'ad'], vulnerabilities: 3 },
  { id: 15, type: 'server', hostname: "SIEM-SRV-01", ip: '10.0.0.100', mac: '8b:9c:ad:be:cf:d0', os: 'Ubuntu Server 22.04', status: 'online', openAlerts: 0, lastSeen: 'Just now', cpu: 41, mem: 63, disk: 52, agentVersion: 'v4.8.2', groups: ['servers', 'siem'], vulnerabilities: 0 },
];

const LOG_TEMPLATES = [
  { tpl: (h,ip) => `Multiple failed SSH authentication attempts from ${ip} on ${h}`, sev: 'high', eid: 5760, cat: 'Authentication', mitre: 'T1110' },
  { tpl: (h,ip) => `Successful RDP login to ${h} from unusual location ${ip}`, sev: 'medium', eid: 4624, cat: 'Authentication', mitre: 'T1078' },
  { tpl: (h,ip) => `PowerShell encoded command executed on ${h}`, sev: 'high', eid: 4104, cat: 'Endpoint', mitre: 'T1059.001' },
  { tpl: (h,ip) => `Outbound connection to known C2 IP ${ip} from ${h}`, sev: 'critical', eid: 5156, cat: 'Network', mitre: 'T1071' },
  { tpl: (h,ip) => `LSASS memory access detected on ${h}`, sev: 'critical', eid: 10, cat: 'Endpoint', mitre: 'T1003.001' },
  { tpl: (h,ip) => `New scheduled task created on ${h}`, sev: 'medium', eid: 4698, cat: 'Persistence', mitre: 'T1053.005' },
  { tpl: (h,ip) => `Registry run key modification on ${h}`, sev: 'low', eid: 13, cat: 'Persistence', mitre: 'T1547.001' },
  { tpl: (h,ip) => `Large data transfer to external IP ${ip} from ${h}`, sev: 'high', eid: 3, cat: 'Exfiltration', mitre: 'T1048' },
  { tpl: (h,ip) => `Port scan sweep detected from ${ip} targeting ${h}`, sev: 'medium', eid: 5156, cat: 'Network', mitre: 'T1046' },
  { tpl: (h,ip) => `DNS query to known malware domain from ${h}`, sev: 'high', eid: 22, cat: 'Network', mitre: 'T1071.004' },
  { tpl: (h,ip) => `User account created on ${h}`, sev: 'info', eid: 4720, cat: 'Account', mitre: 'T1136' },
  { tpl: (h,ip) => `Firewall rule change on ${h}`, sev: 'medium', eid: 4947, cat: 'Network', mitre: 'T1562.004' },
  { tpl: (h,ip) => `Successful login from ${ip} to ${h}`, sev: 'info', eid: 4624, cat: 'Authentication', mitre: '' },
  { tpl: (h,ip) => `Service started on ${h}`, sev: 'info', eid: 7036, cat: 'System', mitre: '' },
  { tpl: (h,ip) => `File integrity check passed on ${h}`, sev: 'info', eid: 550, cat: 'Integrity', mitre: '' },
  { tpl: (h,ip) => `USB device connected to ${h}`, sev: 'low', eid: 2003, cat: 'Endpoint', mitre: 'T1091' },
  { tpl: (h,ip) => `Admin privilege escalation on ${h}`, sev: 'high', eid: 4672, cat: 'Privilege', mitre: 'T1068' },
  { tpl: (h,ip) => `SQL injection attempt on WEB-SRV-01 from ${ip}`, sev: 'critical', eid: 1002, cat: 'Web', mitre: 'T1190' },
  { tpl: (h,ip) => `Malware signature match on ${h}: Trojan.GenericKD`, sev: 'critical', eid: 1116, cat: 'Malware', mitre: 'T1204' },
  { tpl: (h,ip) => `Backup job completed on ${h}`, sev: 'info', eid: 8224, cat: 'System', mitre: '' },
];

const EXTERNAL_IPS = ['198.51.100.42','203.0.113.8','192.0.2.145','185.220.101.34','45.33.32.156','185.107.56.207','91.108.4.15'];

export const generateMockLog = () => {
  const asset = mockAssets[Math.floor(Math.random() * mockAssets.length)];
  const extIp = EXTERNAL_IPS[Math.floor(Math.random() * EXTERNAL_IPS.length)];
  const tmpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  const isMalicious = ['critical','high','medium'].includes(tmpl.sev);
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    severity: tmpl.sev,
    sourceHost: asset.hostname,
    sourceIp: isMalicious ? extIp : asset.ip,
    destIp: asset.ip,
    eventId: tmpl.eid,
    category: tmpl.cat,
    mitre: tmpl.mitre,
    message: tmpl.tpl(asset.hostname, isMalicious ? extIp : asset.ip),
    action: isMalicious ? (Math.random() > 0.4 ? 'Blocked' : 'Allowed') : 'Allowed',
    ruleId: `R-${1000 + Math.floor(Math.random() * 15)}`,
  };
};

export const initialRules = [
  { id: 1, name: 'Brute Force Detection', category: 'Authentication', severity: 'High', enabled: true, triggerCount: 142, lastTriggered: '2 mins ago', description: 'Detects >5 failed logins in 60s from same source IP.', mitre: 'T1110', condition: 'event.id:4625 AND count() > 5 WITHIN 60s' },
  { id: 2, name: 'SQL Injection Pattern', category: 'Network', severity: 'Critical', enabled: true, triggerCount: 15, lastTriggered: '1 hr ago', description: 'Detects SQL injection patterns in web server logs.', mitre: 'T1190', condition: 'category:Web AND message:(*UNION* OR *SELECT* OR *DROP*)' },
  { id: 3, name: 'DNS Tunneling', category: 'Network', severity: 'Medium', enabled: true, triggerCount: 8, lastTriggered: '5 hrs ago', description: 'Detects unusually long DNS queries indicative of tunneling.', mitre: 'T1071.004', condition: 'event.id:22 AND dns.query.length > 100' },
  { id: 4, name: 'PowerShell Encoded Command', category: 'Endpoint', severity: 'High', enabled: true, triggerCount: 22, lastTriggered: '1 day ago', description: 'Detects base64 encoded PowerShell commands.', mitre: 'T1059.001', condition: 'event.id:4104 AND message:*encodedcommand*' },
  { id: 5, name: 'Impossible Travel', category: 'Authentication', severity: 'High', enabled: true, triggerCount: 3, lastTriggered: '2 days ago', description: 'Login from two geographically distant IPs within 30 mins.', mitre: 'T1078', condition: 'event.id:4624 AND geo.distance > 1000km WITHIN 30m' },
  { id: 6, name: 'Mass File Encryption', category: 'Malware', severity: 'Critical', enabled: true, triggerCount: 0, lastTriggered: 'Never', description: 'Detects ransomware via rapid file modification events.', mitre: 'T1486', condition: 'event.id:4663 AND count() > 100 WITHIN 10s' },
  { id: 7, name: 'Port Scan Sweep', category: 'Network', severity: 'Low', enabled: true, triggerCount: 890, lastTriggered: '1 min ago', description: 'Source IP connecting to >50 ports in 10 seconds.', mitre: 'T1046', condition: 'event.id:5156 AND dest.port.count() > 50 WITHIN 10s' },
  { id: 8, name: 'C2 Beacon Interval', category: 'Network', severity: 'Critical', enabled: true, triggerCount: 12, lastTriggered: '4 hrs ago', description: 'Regular outbound connections matching C2 beacon timing.', mitre: 'T1071', condition: 'network.direction:outbound AND interval.deviation < 0.1' },
  { id: 9, name: 'Lateral Movement SMB', category: 'Network', severity: 'High', enabled: true, triggerCount: 4, lastTriggered: '1 day ago', description: 'Detects SMB connections between internal workstations.', mitre: 'T1021.002', condition: 'dest.port:445 AND source.type:workstation AND dest.type:workstation' },
  { id: 10, name: 'Data Staging Detection', category: 'Insider Threat', severity: 'Medium', enabled: true, triggerCount: 1, lastTriggered: '3 days ago', description: 'Large file access in short time by single user.', mitre: 'T1074', condition: 'event.id:4663 AND file.size.sum() > 1GB WITHIN 5m' },
  { id: 11, name: 'Privilege Escalation UAC Bypass', category: 'Endpoint', severity: 'Critical', enabled: false, triggerCount: 0, lastTriggered: 'Never', description: 'Detects known UAC bypass techniques.', mitre: 'T1548.002', condition: 'process.parent:fodhelper.exe AND process.child:cmd.exe' },
  { id: 12, name: 'Credential Dump LSASS', category: 'Endpoint', severity: 'Critical', enabled: true, triggerCount: 2, lastTriggered: '1 week ago', description: 'OpenProcess handle to LSASS from non-system process.', mitre: 'T1003.001', condition: 'event.id:10 AND target.image:lsass.exe' },
  { id: 13, name: 'Scheduled Task Persistence', category: 'Persistence', severity: 'Medium', enabled: true, triggerCount: 45, lastTriggered: '2 hrs ago', description: 'New scheduled task created by non-admin process.', mitre: 'T1053.005', condition: 'event.id:4698 AND process.user != SYSTEM' },
  { id: 14, name: 'Registry Run Key', category: 'Persistence', severity: 'Low', enabled: true, triggerCount: 120, lastTriggered: '10 mins ago', description: 'Modification of HKLM/HKCU Run registry keys.', mitre: 'T1547.001', condition: 'event.id:13 AND registry.key:*\\Run*' },
  { id: 15, name: 'Suspicious Outbound Volume', category: 'Network', severity: 'High', enabled: true, triggerCount: 7, lastTriggered: '12 hrs ago', description: 'Outbound traffic > 500MB in 1 hour to single external host.', mitre: 'T1048', condition: 'network.direction:outbound AND bytes.sum() > 500MB WITHIN 1h' },
];

export const initialIncidents = [
  { id: 'INC-2026-001', title: 'Multiple Failed Logins + Impossible Travel', severity: 'high', status: 'Investigating', assigned: 'Jesal Pavaskar', assets: ['JESAL-MBP', 'DC-01'], created: '1 hr ago', updated: '10 mins ago', description: 'User account "jpavaskar" received 14 failed login attempts from 198.51.100.42 (RU), followed by a successful login from the same IP 12 minutes after a local login from 192.168.1.105 — indicating impossible travel or credential compromise.', mitre: ['T1110', 'T1078'], tlp: 'AMBER' },
  { id: 'INC-2026-002', title: 'Suspicious PowerShell Download Cradle on KARAN-WIN11', severity: 'critical', status: 'New', assigned: 'Unassigned', assets: ['KARAN-WIN11'], created: '2 hrs ago', updated: '2 hrs ago', description: 'Encoded PowerShell command detected executing a download cradle (IEX + WebClient) from 185.220.101.34. Possible initial stage of ransomware or RAT deployment. Host CPU at 98%.', mitre: ['T1059.001', 'T1105'], tlp: 'RED' },
  { id: 'INC-2026-003', title: 'Large Data Exfiltration to External Host', severity: 'critical', status: 'Contained', assigned: 'Samruddhi', assets: ['WEB-SRV-01'], created: '1 day ago', updated: '5 hrs ago', description: '2.4GB of data transferred from WEB-SRV-01 to 45.33.32.156 over HTTPS port 443. Source was a web shell planted via CVE-2024-21762. Web shell removed and server patched.', mitre: ['T1048', 'T1190'], tlp: 'RED' },
  { id: 'INC-2026-004', title: 'Internal Port Scan Sweep from Subnet', severity: 'low', status: 'Resolved', assigned: 'Harsh', assets: ['HARSH-WIN11'], created: '2 days ago', updated: '1 day ago', description: 'Automated Nmap scan detected originating from HARSH-WIN11. User confirmed it was an authorized vulnerability assessment. Ticket closed as false positive.', mitre: ['T1046'], tlp: 'WHITE' },
  { id: 'INC-2026-005', title: 'Malware: Trojan.GenericKD on ARJUN-WIN11', severity: 'high', status: 'Investigating', assigned: 'Jesal Pavaskar', assets: ['ARJUN-WIN11'], created: '4 hrs ago', updated: '1 hr ago', description: 'Defender ATP flagged Trojan.GenericKD in %APPDATA%\\tmp\\svchost.exe. File quarantined. Investigating lateral movement potential via SMB. Agent shows 45% CPU anomaly.', mitre: ['T1204', 'T1021.002'], tlp: 'RED' },
];

export const vulnerabilityData = [
  { id: 1, host: 'KARAN-WIN11', cve: 'CVE-2024-21338', cvss: 8.8, title: 'Windows Kernel Elevation of Privilege', severity: 'High', status: 'Open', package: 'Windows Kernel', patchAvailable: true },
  { id: 2, host: 'ROHAN-WIN10', cve: 'CVE-2024-21762', cvss: 9.8, title: 'FortiOS Auth Bypass RCE', severity: 'Critical', status: 'Open', package: 'FortiOS 7.2', patchAvailable: true },
  { id: 3, host: 'WEB-SRV-01', cve: 'CVE-2024-4577', cvss: 9.8, title: 'PHP CGI Argument Injection', severity: 'Critical', status: 'Patched', package: 'PHP 8.1.0', patchAvailable: true },
  { id: 4, host: 'NIKHITA-WIN10', cve: 'CVE-2023-36884', cvss: 8.3, title: 'Windows HTML RCE via Office', severity: 'High', status: 'Open', package: 'Microsoft Office', patchAvailable: true },
  { id: 5, host: 'HARSH-WIN11', cve: 'CVE-2024-30051', cvss: 7.8, title: 'DWM Core Library Privilege Escalation', severity: 'High', status: 'Open', package: 'dwmcore.dll', patchAvailable: true },
  { id: 6, host: 'ARJUN-WIN11', cve: 'CVE-2024-21447', cvss: 7.8, title: 'Windows Authentication Privilege Escalation', severity: 'High', status: 'Open', package: 'WinAuth 10.0', patchAvailable: true },
  { id: 7, host: 'DC-01', cve: 'CVE-2024-26234', cvss: 6.7, title: 'Proxy Driver Spoofing Vulnerability', severity: 'Medium', status: 'Open', package: 'Proxy Driver 10.0', patchAvailable: false },
  { id: 8, host: 'SAMRUDDHI-MBA', cve: 'CVE-2024-27804', cvss: 7.5, title: 'macOS IOKit Privilege Escalation', severity: 'High', status: 'Open', package: 'IOKit', patchAvailable: true },
];

export const fileIntegrityData = [
  { id: 1, host: 'DC-01', path: 'C:\\Windows\\System32\\lsass.exe', event: 'MODIFIED', hash_before: 'a1b2c3d4...', hash_after: 'e5f6a7b8...', time: '14:22:15', severity: 'critical' },
  { id: 2, host: 'WEB-SRV-01', path: '/var/www/html/wp-config.php', event: 'MODIFIED', hash_before: 'deadbeef...', hash_after: '12345678...', time: '13:48:02', severity: 'high' },
  { id: 3, host: 'WEB-SRV-01', path: '/etc/passwd', event: 'ACCESSED', hash_before: '9abcdef0...', hash_after: '9abcdef0...', time: '12:31:44', severity: 'medium' },
  { id: 4, host: 'SIEM-SRV-01', path: '/etc/crontab', event: 'MODIFIED', hash_before: 'a2b3c4d5...', hash_after: 'f1e2d3c4...', time: '11:05:58', severity: 'high' },
  { id: 5, host: 'EDR-SRV-01', path: 'C:\\Windows\\System32\\drivers\\etc\\hosts', event: 'MODIFIED', hash_before: 'b1c2d3e4...', hash_after: 'a9b8c7d6...', time: '10:17:33', severity: 'high' },
  { id: 6, host: 'JESAL-MBP', path: '/etc/sudoers', event: 'ACCESSED', hash_before: 'c3d4e5f6...', hash_after: 'c3d4e5f6...', time: '09:44:21', severity: 'medium' },
];

export const threatIntelFeed = [
  { ioc: '185.220.101.34', type: 'IP', threat: 'Tor Exit Node / Ransomware C2', confidence: 95, source: 'AbuseIPDB', tags: ['ransomware', 'tor'], lastSeen: '2 mins ago' },
  { ioc: '45.33.32.156', type: 'IP', threat: 'Known Port Scanner (Shodan)', confidence: 80, source: 'GreyNoise', tags: ['scanner'], lastSeen: '1 hr ago' },
  { ioc: 'update-secure[.]net', type: 'Domain', threat: 'Phishing / Credential Harvester', confidence: 92, source: 'VirusTotal', tags: ['phishing'], lastSeen: '6 hrs ago' },
  { ioc: '91.108.4.15', type: 'IP', threat: 'APT29 Infrastructure', confidence: 88, source: 'MISP', tags: ['apt', 'russia'], lastSeen: '1 day ago' },
  { ioc: 'e5f6a7b812345678abcdef', type: 'Hash', threat: 'Trojan.GenericKD Variant', confidence: 99, source: 'MalwareBazaar', tags: ['trojan', 'malware'], lastSeen: '4 hrs ago' },
  { ioc: '203.0.113.8', type: 'IP', threat: 'Brute Force Botnet Node', confidence: 75, source: 'Shodan', tags: ['bruteforce', 'botnet'], lastSeen: '30 mins ago' },
];
