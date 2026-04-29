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
    <div className="p-4 border-b border-gray-800">
      <h2 className="text-lg font-bold text-gray-100 font-mono mb-4 flex items-center gap-2">
        <Crosshair className="text-red-500" size={20} />
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
              className={`flex flex-col items-start p-3 rounded border text-left transition-all ${
                isActive 
                  ? 'bg-red-500/20 border-red-500 text-red-200 cursor-not-allowed opacity-80'
                  : 'bg-gray-800 border-gray-700 hover:border-red-500 hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={isActive ? 'text-red-400' : 'text-gray-400'}>
                  {scenario.icon}
                </span>
                <span className="font-bold text-sm truncate">{scenario.name}</span>
              </div>
              <span className="text-xs text-gray-500 truncate w-full" title={scenario.desc}>
                {scenario.desc}
              </span>
              {isActive && (
                <div className="w-full mt-2 h-1 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 animate-pulse w-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
