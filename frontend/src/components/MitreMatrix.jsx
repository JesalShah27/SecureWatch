import React from 'react';
import { ShieldAlert, Crosshair, AlertTriangle, Key, Terminal, Network, Search, Cpu, Save, Share2, EyeOff, Radio } from 'lucide-react';

const mitreData = [
  {
    id: "TA0043",
    tactic: "Reconnaissance",
    icon: <Search size={16} />,
    techniques: [
      { id: "T1595", name: "Active Scanning", count: 12, severity: "low" },
      { id: "T1592", name: "Gather Victim Host Info", count: 4, severity: "low" },
      { id: "T1589", name: "Gather Victim Identity", count: 0, severity: "none" }
    ]
  },
  {
    id: "TA0001",
    tactic: "Initial Access",
    icon: <Terminal size={16} />,
    techniques: [
      { id: "T1190", name: "Exploit Public-Facing App", count: 52, severity: "critical" },
      { id: "T1078", name: "Valid Accounts", count: 14, severity: "high" },
      { id: "T1566", name: "Phishing", count: 3, severity: "low" },
      { id: "T1091", name: "Replication Through Media", count: 0, severity: "none" }
    ]
  },
  {
    id: "TA0002",
    tactic: "Execution",
    icon: <Cpu size={16} />,
    techniques: [
      { id: "T1059", name: "Command and Scripting", count: 87, severity: "high" },
      { id: "T1203", name: "Exploitation for Execution", count: 8, severity: "high" },
      { id: "T1053", name: "Scheduled Task/Job", count: 2, severity: "low" },
      { id: "T1569", name: "System Services", count: 0, severity: "none" }
    ]
  },
  {
    id: "TA0003",
    tactic: "Persistence",
    icon: <Save size={16} />,
    techniques: [
      { id: "T1543", name: "Create or Modify Process", count: 18, severity: "high" },
      { id: "T1546", name: "Event Triggered Execution", count: 1, severity: "low" },
      { id: "T1136", name: "Create Account", count: 2, severity: "low" },
      { id: "T1547", name: "Boot or Logon Autostart", count: 8, severity: "medium" }
    ]
  },
  {
    id: "TA0004",
    tactic: "Privilege Esc.",
    icon: <ShieldAlert size={16} />,
    techniques: [
      { id: "T1548", name: "Abuse Elevation Control", count: 24, severity: "critical" },
      { id: "T1134", name: "Access Token Manipulation", count: 5, severity: "high" },
      { id: "T1068", name: "Exploitation for Prov Esc", count: 0, severity: "none" }
    ]
  },
  {
    id: "TA0005",
    tactic: "Defense Evasion",
    icon: <EyeOff size={16} />,
    techniques: [
      { id: "T1140", name: "Deobfuscate/Decode", count: 35, severity: "medium" },
      { id: "T1070", name: "Indicator Removal", count: 12, severity: "high" },
      { id: "T1218", name: "System Binary Proxy", count: 19, severity: "medium" },
      { id: "T1574", name: "Hijack Execution Flow", count: 2, severity: "low" }
    ]
  },
  {
    id: "TA0006",
    tactic: "Credential Access",
    icon: <Key size={16} />,
    techniques: [
      { id: "T1110", name: "Brute Force", count: 420, severity: "critical" },
      { id: "T1003", name: "OS Credential Dumping", count: 8, severity: "critical" },
      { id: "T1555", name: "Credentials from Passwords", count: 5, severity: "medium" },
      { id: "T1558", name: "Steal or Forge Kerberos", count: 0, severity: "none" }
    ]
  },
  {
    id: "TA0008",
    tactic: "Lateral Move",
    icon: <Network size={16} />,
    techniques: [
      { id: "T1570", name: "Lateral Tool Transfer", count: 11, severity: "high" },
      { id: "T1021", name: "Remote Services", count: 28, severity: "medium" },
      { id: "T1091", name: "Replication Through Media", count: 0, severity: "none" },
      { id: "T1563", name: "Remote Service Session", count: 4, severity: "low" }
    ]
  },
  {
    id: "TA0011",
    tactic: "Command & Ctrl",
    icon: <Radio size={16} />,
    techniques: [
      { id: "T1071", name: "Application Layer Protocol", count: 115, severity: "high" },
      { id: "T1105", name: "Ingress Tool Transfer", count: 2, severity: "low" },
      { id: "T1090", name: "Proxy", count: 1, severity: "low" }
    ]
  },
];

const severityColors = {
  critical: 'bg-siemdanger/20 border-siemdanger/50 text-siemdanger',
  high: 'bg-siemwarn/20 border-siemwarn/50 text-siemwarn',
  medium: 'bg-siemaccent/20 border-siemaccent/50 text-siemaccent',
  low: 'bg-slate-700/40 border-slate-600/50 text-slate-300',
  none: 'bg-transparent border-transparent text-slate-600 opacity-60'
};

const MitreMatrix = () => {
  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-2 min-w-max">
        {mitreData.map((tacticGroup) => (
          <div key={tacticGroup.id} className="w-[180px] flex flex-col shrink-0">
            {/* Column Header */}
            <div className="bg-[#1e293b]/80 backdrop-blur border border-slate-700 p-3 rounded-t-xl shadow-lg border-b-2 border-b-siemaccent">
              <div className="flex items-center gap-2 mb-1 text-slate-200">
                <span className="text-siemaccent">{tacticGroup.icon}</span>
                <span className="font-bold text-sm tracking-wide truncate">{tacticGroup.tactic}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">{tacticGroup.id} | {tacticGroup.techniques.reduce((acc, t) => acc + t.count, 0)} hits</div>
            </div>
            
            {/* Techniques List */}
            <div className="bg-[#0b101e]/60 border border-t-0 border-slate-800 p-2 rounded-b-xl flex-1 flex flex-col gap-2">
              {tacticGroup.techniques.map((tech) => (
                <div 
                  key={tech.id} 
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.02] ${severityColors[tech.severity]} flex flex-col gap-1 relative overflow-hidden group`}
                >
                  <div className="flex justify-between items-start z-10 relative">
                    <span className="font-mono text-[9px] opacity-70 block">{tech.id}</span>
                    {tech.count > 0 && <span className="font-bold font-mono px-1.5 py-0.5 rounded text-[9px] bg-black/40">{tech.count}</span>}
                  </div>
                  <span className="font-semibold leading-tight z-10 relative">{tech.name}</span>
                  {tech.count > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MitreMatrix;
