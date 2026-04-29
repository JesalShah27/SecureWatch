import { AttackType, DeviceNode, LogEntry, Alert, CorrelationRule } from '../types';

const FORWARDER_URL = 'http://localhost:4000/api/logs';

async function forwardLogToSIEM(log: object) {
  try {
    await fetch(FORWARDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
  } catch (err) {
    console.warn('Failed to forward log to SIEM backend', err);
  }
}

const backgroundEvents = [
  'Connection established',
  'DNS query',
  'HTTP GET /',
  'TLS handshake completed',
  'Authentication successful',
  'Heartbeat sent',
  'File read'
];

export function generateBackgroundLog(nodes: DeviceNode[]): Omit<LogEntry, 'id'> {
  const activeNodes = nodes.filter(n => n.status !== 'GREY');
  
  // Pick random source and dest
  const src = activeNodes[Math.floor(Math.random() * activeNodes.length)];
  let dest = activeNodes[Math.floor(Math.random() * activeNodes.length)];
  while (dest.id === src.id && activeNodes.length > 1) {
    dest = activeNodes[Math.floor(Math.random() * activeNodes.length)];
  }

  const event = backgroundEvents[Math.floor(Math.random() * backgroundEvents.length)];

  const log = {
    timestamp: Date.now(),
    srcIp: src.ip,
    dstIp: dest.ip,
    eventType: event,
    severity: 'INFO',
    message: `${event} from ${src.hostname} to ${dest.hostname}`
  };
  
  // Asynchronously forward to SIEM
  forwardLogToSIEM(log);
  
  return log as Omit<LogEntry, 'id'>;
}

interface AttackContext {
  nodes: DeviceNode[];
  updateNodeStatus: (id: string, status: DeviceNode['status']) => void;
  addLog: (log: Omit<LogEntry, 'id'>) => void;
  addAlert: (alert: Omit<Alert, 'id' | 'status'>) => void;
  addRule: (rule: Omit<CorrelationRule, 'id' | 'timestamp'>) => void;
  setActiveAttacks: React.Dispatch<React.SetStateAction<AttackType[]>>;
}

export function handleAttackLogic(type: AttackType, context: AttackContext) {
  const { nodes, updateNodeStatus, addLog, addAlert, addRule, setActiveAttacks } = context;
  
  const attackerNode = nodes.find(n => {
    if (type === 'brute-force') return n.id === 'karan-win';
    if (type === 'ddos') return n.id === 'internet';
    if (type === 'dos') return n.id === 'rohan-win';
    if (type === 'sql-injection') return n.id === 'internet';
    if (type === 'port-scan') return n.id === 'harsh-win';
    if (type === 'phishing') return n.id === 'nikhita-win';
    if (type === 'privilege-escalation') return n.id === 'priya-lin';
    if (type === 'ransomware') return n.id === 'karan-win';
    if (type === 'insider-threat') return n.id === 'sam-mac';
    if (type === 'mitm') return n.id === 'jesal-mac'; // Between jesal and DC
    return false;
  });

  const targetNode = nodes.find(n => {
    if (type === 'brute-force') return n.id === 'siem';
    if (type === 'ddos') return n.id === 'web-server';
    if (type === 'dos') return n.id === 'dc';
    if (type === 'sql-injection') return n.id === 'web-server';
    if (type === 'port-scan') return n.id === 'fw-1';
    if (type === 'phishing') return n.id === 'arjuna-win';
    if (type === 'privilege-escalation') return n.id === 'edr-1';
    if (type === 'ransomware') return n.id === 'arjuna-win'; // specific target for spread
    if (type === 'insider-threat') return n.id === 'siem'; // Exfiltrating DB?
    if (type === 'mitm') return n.id === 'dc';
    return false;
  });

  if (!attackerNode || !targetNode) return;

  // Step 1: Turn nodes RED
  updateNodeStatus(attackerNode.id, 'RED');
  updateNodeStatus(targetNode.id, 'RED');

  // Emit Critical Alert banner
  addAlert({
    timestamp: Date.now(),
    ruleName: `ATTACK DETECTED - ${type.toUpperCase()}`,
    srcDevice: attackerNode.hostname,
    dstDevice: targetNode.hostname,
    severity: 'CRITICAL'
  });

  // Step 2: Flood logs
  let logInterval: ReturnType<typeof setInterval>;
  let counter = 0;
  
  logInterval = setInterval(() => {
    if (counter > 15) {
      clearInterval(logInterval);
      setActiveAttacks(prev => prev.filter(a => a !== type));
      return;
    }
    
    const attackLog = {
      timestamp: Date.now(),
      srcIp: attackerNode.ip,
      dstIp: targetNode.ip,
      eventType: `ATTACK_${type.toUpperCase()}`,
      severity: 'CRITICAL',
      message: `Malicious activity detected: ${type} payload from ${attackerNode.ip}`
    };
    
    addLog(attackLog as Omit<LogEntry, 'id'>);
    forwardLogToSIEM(attackLog);
    
    counter++;
  }, 300);

  // Note: We removed the auto-blocking correlation logic.
  // The actual blocking will be done by the SecureWatch SIEM.
}
