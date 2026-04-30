import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { AttackType } from '../types';
import { Crosshair, Skull, UserX, Database, Lock, Globe, FileWarning, Cpu, Key, RadioTower } from 'lucide-react';

const ATTACK_SCENARIOS: { type: AttackType; name: string; desc: string; icon: React.ReactNode }[] = [
  { type: 'brute-force', name: 'Brute Force SSH', desc: 'Karan Windows → SIEM Server', icon: <Key size={16} /> },
  { type: 'ddos', name: 'DDoS Attack', desc: 'External IPs → Web Server', icon: <Globe size={16} /> },
  { type: 'dos', name: 'DoS Attack', desc: 'Rohan Windows → Domain Controller', icon: <Crosshair size={16} /> },
  { type: 'sql-injection', name: 'SQL Injection', desc: 'External → Web Server', icon: <Database size={16} /> },
  { type: 'port-scan', name: 'Port Scan / Recon', desc: 'Harsh Windows → Firewall 1', icon: <RadioTower size={16} /> },
  { type: 'phishing', name: 'Phishing / Lateral', desc: 'Nikhita Win → Arjuna Win', icon: <FileWarning size={16} /> },
  { type: 'privilege-escalation', name: 'Privilege Escalation', desc: 'Priya Linux → EDR Server 1', icon: <Cpu size={16} /> },
  { type: 'ransomware', name: 'Ransomware Spread', desc: 'Karan Win → Windows machines', icon: <Lock size={16} /> },
  { type: 'insider-threat', name: 'Insider Threat', desc: 'Samruddhi Mac → Unusual access', icon: <UserX size={16} /> },
  { type: 'mitm', name: 'MITM / ARP Spoof', desc: 'Jesal Mac ↔ Domain Controller', icon: <Skull size={16} /> },
];

export default function AttackPanel() {
  const { triggerAttack, activeAttacks } = useSimulation();

  return (
    <div className="p-4 border-b border-[#30363d] bg-[#0d1117]">
      <h2 className="text-lg font-bold text-[#e8eaed] font-mono mb-4 flex items-center gap-2">
        <Crosshair className="text-[#ff3355]" size={20} />
        ATTACK_SIMULATION_CONTROL
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {ATTACK_SCENARIOS.map((scenario) => {
          const isActive = activeAttacks.includes(scenario.type);
          return (
            <button
              key={scenario.type}
              onClick={() => triggerAttack(scenario.type)}
              disabled={isActive}
              className={`flex flex-col items-start p-3 rounded border text-left transition-all w-full overflow-hidden ${
                isActive 
                  ? 'bg-[#ff3355]/20 border-[#ff3355] text-[#ff3355] cursor-not-allowed opacity-80'
                  : 'bg-[#161b22] border-[#30363d] hover:border-[#ff3355] hover:bg-[#1f2428] text-[#c9d1d9]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                <span className={`shrink-0 ${isActive ? 'text-[#ff3355]' : 'text-[#8b949e]'}`}>
                  {scenario.icon}
                </span>
                <span className="font-bold text-sm leading-tight">{scenario.name}</span>
              </div>
              <span className="text-xs text-[#8b949e] leading-tight mt-1" title={scenario.desc}>
                {scenario.desc}
              </span>
              {isActive && (
                <div className="w-full mt-2 h-1 bg-[#0d1117] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff3355] animate-pulse w-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
