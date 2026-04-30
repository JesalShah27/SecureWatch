import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Shield, RotateCcw, Download, Search } from 'lucide-react';

export default function Header() {
  const { resetSimulation, activeAttacks } = useSimulation();

  return (
    <header className="h-14 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between px-6 shrink-0 z-10 relative">
      <div className="flex items-center gap-3">
        <Shield className="text-[#00d4ff]" size={24} />
        <h1 className="text-lg font-bold text-[#c9d1d9] tracking-wider">SECURE_WATCH // Attack Sandbox</h1>
        
        {activeAttacks.length > 0 && (
          <div className="ml-4 px-3 py-1 bg-[#ff3355]/20 border border-[#ff3355]/50 text-[#ff3355] rounded-full text-xs font-mono animate-pulse">
            ACTIVE SIMULATION
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input 
            type="text" 
            placeholder="Search sandbox logs..." 
            className="bg-[#0d1117] border border-[#30363d] text-sm rounded px-3 py-1.5 pl-9 focus:outline-none focus:border-[#00d4ff] w-64 text-[#c9d1d9] placeholder-[#8b949e]"
          />
        </div>

        <button 
          onClick={resetSimulation}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] hover:bg-[#30363d] border border-[#30363d] rounded text-sm transition-colors text-[#c9d1d9]"
        >
          <RotateCcw size={16} />
          <span>Reset Environment</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] hover:bg-[#30363d] border border-[#30363d] rounded text-sm transition-colors text-[#c9d1d9]">
          <Download size={16} />
          <span>Export Logs</span>
        </button>
      </div>
    </header>
  );
}
