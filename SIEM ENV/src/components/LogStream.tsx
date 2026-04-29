import React, { useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { format } from 'date-fns';
import { Terminal } from 'lucide-react';

export default function LogStream() {
  const { logs } = useSimulation();
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-64 border-t border-[#30363d] bg-[#0d1117] flex flex-col shrink-0 font-mono text-sm">
      <div className="px-4 py-2 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#8b949e]">
          <Terminal size={16} />
          <span>LIVE_LOG_STREAM</span>
        </div>
        <div className="text-xs text-[#8b949e]">
          {logs.length} events logged
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.map(log => {
          let colorClass = 'text-[#8b949e]';
          if (log.severity === 'WARN') colorClass = 'text-[#ffaa00]';
          if (log.severity === 'CRITICAL') colorClass = 'text-[#ff3355] font-bold';

          return (
            <div key={log.id} className={`flex gap-4 ${colorClass} hover:bg-[#161b22] px-2 py-0.5 rounded`}>
              <span className="text-[#8b949e] opacity-50 shrink-0">
                {format(log.timestamp, 'HH:mm:ss.SSS')}
              </span>
              <span className={`w-16 shrink-0 ${log.severity === 'CRITICAL' ? 'text-[#ff3355] bg-[#ff3355]/10' : ''}`}>
                [{log.severity}]
              </span>
              <span className="w-32 shrink-0 text-[#c9d1d9]">{log.srcIp}</span>
              <span className="text-[#8b949e] shrink-0 opacity-50">{'->'}</span>
              <span className="w-32 shrink-0 text-[#c9d1d9]">{log.dstIp}</span>
              <span className="truncate text-[#c9d1d9]">{log.message}</span>
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
