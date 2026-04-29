import React, { useState } from 'react';
import { Play, Edit, Plus, Clock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { Card } from './shared';

const PLAYBOOKS = [
  {
    id: 1, name: 'Ransomware Containment', active: true, lastRun: '3 days ago', runs: 2,
    desc: 'Isolates affected host, dumps memory for forensics, blocks C2 IPs, notifies SOC lead via Slack.',
    steps: ['Isolate endpoint from network', 'Capture memory dump', 'Block known C2 IPs at firewall', 'Alert SOC Lead via Slack', 'Open P1 incident ticket', 'Begin threat hunting on adjacent hosts'],
    trigger: 'Mass File Encryption Rule',
  },
  {
    id: 2, name: 'Brute Force IP Block', active: true, lastRun: '2 hrs ago', runs: 47,
    desc: 'Adds source IP to perimeter firewall blocklist, closes all sessions from that IP, logs action.',
    steps: ['Extract source IP from alert', 'Add IP to pfSense blocklist', 'Kill active sessions from IP', 'Log action to audit trail', 'Send notification to analyst'],
    trigger: 'Brute Force Detection Rule',
  },
  {
    id: 3, name: 'Phishing Auto-Remediation', active: false, lastRun: '1 week ago', runs: 5,
    desc: 'Purges malicious email from all Exchange mailboxes, resets compromised user passwords, notifies IT.',
    steps: ['Extract email hash/sender from alert', 'Purge from all mailboxes via Exchange API', 'Reset user password and revoke sessions', 'Notify user and IT helpdesk', 'Create incident ticket'],
    trigger: 'Manual / Phishing Alert',
  },
  {
    id: 4, name: 'Malware Quarantine & Re-image', active: true, lastRun: '5 days ago', runs: 1,
    desc: 'Quarantines malicious file, runs AV scan, prepares endpoint for re-imaging if needed.',
    steps: ['Quarantine suspicious file via EDR', 'Run full AV scan', 'Collect forensic artifacts', 'Notify asset owner', 'Schedule re-imaging if confirmed', 'Restore from clean backup'],
    trigger: 'Malware Signature Match Rule',
  },
  {
    id: 5, name: 'Privilege Escalation Response', active: true, lastRun: 'Never', runs: 0,
    desc: 'Revokes suspicious elevated privileges, locks user account pending investigation, creates incident.',
    steps: ['Revoke elevated privileges', 'Lock user account', 'Capture process tree', 'Alert SOC and HR', 'Open incident ticket'],
    trigger: 'UAC Bypass / Privilege Escalation Rule',
  },
  {
    id: 6, name: 'Data Exfiltration Containment', active: true, lastRun: '1 day ago', runs: 3,
    desc: 'Blocks outbound traffic to suspicious destination, captures flow logs, creates high-severity incident.',
    steps: ['Block destination IP at firewall', 'Capture network flow logs', 'Identify data classification of transferred files', 'Notify DLP team', 'Create P1 incident', 'Preserve evidence chain'],
    trigger: 'Suspicious Outbound Volume Rule',
  },
];

export default function Playbooks({ addToast }) {
  const [playbooks, setPlaybooks] = useState(PLAYBOOKS);
  const [running, setRunning] = useState(null);
  const [runStep, setRunStep] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const runPlaybook = (pb) => {
    if (!pb.active) { addToast(`Playbook "${pb.name}" is disabled`, 'warning'); return; }
    setRunning(pb.id);
    setRunStep(0);
    addToast(`Executing: ${pb.name}...`, 'info');
    pb.steps.forEach((_, i) => {
      setTimeout(() => {
        setRunStep(i + 1);
        if (i === pb.steps.length - 1) {
          setTimeout(() => {
            setRunning(null);
            setRunStep(0);
            setPlaybooks(prev => prev.map(p => p.id === pb.id ? { ...p, lastRun: 'Just now', runs: p.runs + 1 } : p));
            addToast(`✓ ${pb.name} completed successfully`, 'success');
          }, 800);
        }
      }, (i + 1) * 900);
    });
  };

  const toggle = (id) => {
    setPlaybooks(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    const pb = playbooks.find(p => p.id === id);
    addToast(`Playbook "${pb.name}" ${pb.active ? 'disabled' : 'enabled'}`, pb.active ? 'warning' : 'success');
  };

  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Active Response Playbooks</h2>
        <div className="flex gap-2">
          <button onClick={() => addToast('Playbook builder coming soon', 'info')}
            className="bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a] px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors">
            <Plus size={14} /> New Playbook
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {playbooks.map(pb => {
          const isRunning = running === pb.id;
          return (
            <Card key={pb.id} className={`flex flex-col transition-all ${isRunning ? 'ring-1 ring-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.2)]' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-[#e8eaed] text-sm">{pb.name}</h3>
                  <div className="text-[9px] text-[#8b949e] mt-0.5 flex items-center gap-2">
                    <Clock size={9} /> Last run: {pb.lastRun}
                    <span className="text-[#8b949e]">• {pb.runs} total runs</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${pb.active ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#1e2535] text-[#8b949e]'}`}>
                    {pb.active ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#8b949e] mb-3 flex-1">{pb.desc}</p>

              <div className="text-[9px] text-[#8b949e] mb-3 flex items-center gap-1">
                <AlertTriangle size={9} className="text-[#ffaa00]" /> Triggered by: <span className="text-[#ffaa00]">{pb.trigger}</span>
              </div>

              {/* Steps Preview */}
              <div className="mb-4 space-y-1">
                {pb.steps.map((step, i) => {
                  const done = isRunning && i < runStep;
                  const active = isRunning && i === runStep - 1;
                  return (
                    <div key={i} className={`flex items-center gap-2 text-[10px] transition-all ${done ? 'text-[#00ff88]' : active ? 'text-[#00d4ff]' : 'text-[#4a5568]'}`}>
                      {done ? <CheckCircle size={10} className="text-[#00ff88] flex-shrink-0" /> :
                        active ? <span className="w-2.5 h-2.5 border border-[#00d4ff] rounded-full flex-shrink-0 animate-spin" style={{ borderTopColor: 'transparent' }}></span> :
                          <span className="w-2.5 h-2.5 border border-[#1e2535] rounded-full flex-shrink-0"></span>}
                      {step}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 border-t border-[#1e2535] pt-3">
                <button onClick={() => runPlaybook(pb)} disabled={!!running}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-bold transition-all ${isRunning ? 'bg-[#00d4ff]/20 text-[#00d4ff] animate-pulse cursor-wait' : 'bg-[#1e2535] hover:bg-[#2a3441] text-[#00d4ff] disabled:opacity-40 disabled:cursor-not-allowed'}`}>
                  <Play size={12} /> {isRunning ? 'Executing...' : 'Run Now'}
                </button>
                <button onClick={() => toggle(pb.id)}
                  className="flex-1 bg-[#1e2535] hover:bg-[#2a3441] text-[#8b949e] hover:text-[#e8eaed] py-1.5 rounded text-xs font-bold transition-colors">
                  {pb.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
