import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ShieldCheck, ServerCrash, Skull, CheckCircle } from 'lucide-react';

export default function AgentStatusPanel() {
  const { nodes } = useSimulation();

  const total = nodes.length;
  const compromised = nodes.filter(n => n.status === 'RED').length;
  const suspicious = nodes.filter(n => n.status === 'YELLOW').length;
  const healthy = nodes.filter(n => n.status === 'GREEN').length;

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-[#30363d] bg-[#0d1117] flex justify-between items-center">
        <h3 className="font-mono text-[#e8eaed] font-bold flex items-center gap-2 text-sm">
          <ShieldCheck className="text-[#00ff88]" size={16} />
          AGENT_HEALTH_STATUS
        </h3>
        <span className="bg-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded text-xs font-bold">
          {total} Endpoints
        </span>
      </div>
      
      <div className="flex-1 p-4 flex flex-col justify-center bg-[#0d1117] space-y-4">
        
        {/* Healthy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#00ff88]/10 p-2 rounded text-[#00ff88]">
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="text-[#e8eaed] font-bold text-sm">Healthy Agents</div>
              <div className="text-[#8b949e] text-xs">Normal operation</div>
            </div>
          </div>
          <div className="text-xl font-mono text-[#00ff88] font-bold">{healthy}</div>
        </div>

        {/* Suspicious */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#ffaa00]/10 p-2 rounded text-[#ffaa00]">
              <ServerCrash size={20} />
            </div>
            <div>
              <div className="text-[#e8eaed] font-bold text-sm">Suspicious Activity</div>
              <div className="text-[#8b949e] text-xs">Anomalous telemetry</div>
            </div>
          </div>
          <div className="text-xl font-mono text-[#ffaa00] font-bold">{suspicious}</div>
        </div>

        {/* Compromised */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#ff3355]/10 p-2 rounded text-[#ff3355]">
              <Skull size={20} />
            </div>
            <div>
              <div className="text-[#e8eaed] font-bold text-sm">Compromised</div>
              <div className="text-[#8b949e] text-xs">Active breach detected</div>
            </div>
          </div>
          <div className="text-xl font-mono text-[#ff3355] font-bold">{compromised}</div>
        </div>

      </div>
    </div>
  );
}
