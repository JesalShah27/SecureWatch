import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Activity, Server, Zap, Shield, Cpu, Network } from 'lucide-react';

export default function TelemetryPanel() {
  const { logs, activeAttacks } = useSimulation();

  // Calculate mock EPS (Events Per Second) based on recent logs
  const now = Date.now();
  const recentLogs = logs.filter(l => now - l.timestamp < 10000); // last 10 seconds
  const eps = Math.round(recentLogs.length / 10) || 0;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-[#30363d] bg-[#0d1117] flex justify-between items-center">
        <h3 className="font-mono text-[#e8eaed] font-bold flex items-center gap-2 text-sm">
          <Activity className="text-[#00d4ff]" size={16} />
          SANDBOX_TELEMETRY
        </h3>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88]"></span>
          </span>
          <span className="text-[10px] text-[#00ff88] font-bold tracking-wider">PIPELINE ACTIVE</span>
        </div>
      </div>
      
      <div className="flex-1 p-4 grid grid-cols-2 gap-4 bg-[#0d1117]">
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-col items-center justify-center">
          <Zap className="text-[#ffaa00] mb-2" size={24} />
          <div className="text-2xl font-bold text-[#e8eaed] font-mono">{eps}</div>
          <div className="text-xs text-[#8b949e]">Events / Sec (EPS)</div>
        </div>
        
        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-col items-center justify-center">
          <Server className="text-[#00d4ff] mb-2" size={24} />
          <div className="text-2xl font-bold text-[#e8eaed] font-mono">{logs.length}</div>
          <div className="text-xs text-[#8b949e]">Total Events Injected</div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-col items-center justify-center">
          <Network className="text-[#a855f7] mb-2" size={24} />
          <div className="text-2xl font-bold text-[#e8eaed] font-mono">{activeAttacks.length}</div>
          <div className="text-xs text-[#8b949e]">Active Attack Threads</div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex flex-col items-center justify-center">
          <Cpu className="text-[#ff3355] mb-2" size={24} />
          <div className="text-2xl font-bold text-[#e8eaed] font-mono">{(eps * 0.4).toFixed(1)}%</div>
          <div className="text-xs text-[#8b949e]">Engine Load</div>
        </div>
      </div>
    </div>
  );
}
