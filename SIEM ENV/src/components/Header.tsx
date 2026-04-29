import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Shield, RotateCcw, Download, Search } from 'lucide-react';

export default function Header() {
  const { resetSimulation, activeAttacks } = useSimulation();

  return (
    <header className="h-14 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="text-green-500" size={24} />
        <h1 className="text-lg font-bold text-gray-100 tracking-wider">SECURE_WATCH // SIEM Sandbox</h1>
        
        {activeAttacks.length > 0 && (
          <div className="ml-4 px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-xs font-mono animate-pulse">
            ACTIVE ATTACK
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search logs, IPs..." 
            className="bg-gray-800 border border-gray-700 text-sm rounded px-3 py-1.5 pl-9 focus:outline-none focus:border-green-500 w-64 text-gray-300 placeholder-gray-500"
          />
        </div>

        <button 
          onClick={resetSimulation}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm transition-colors"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm transition-colors">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
