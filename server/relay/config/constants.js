module.exports = {
  PORT: process.env.PORT || 4000,
  MAX_LOGS: 2000,
  ATTACK_MITRE: {
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
  }
};
