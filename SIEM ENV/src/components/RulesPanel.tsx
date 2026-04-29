import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Activity, Zap } from 'lucide-react';
import { format } from 'date-fns';

export default function RulesPanel() {
  const { rules } = useSimulation();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
        <h3 className="font-mono text-gray-200 font-bold flex items-center gap-2">
          <Activity className="text-purple-500" size={18} />
          CORRELATION_RULES
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 text-center px-4">
          <Zap size={48} className="text-purple-500/30" />
          <div>
            <p className="font-bold text-gray-300">Rules Engine Active Externally</p>
            <p className="text-xs mt-1">Check your SecureWatch dashboard for correlation rule hits and attack patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
