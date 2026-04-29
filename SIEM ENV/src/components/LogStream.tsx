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
    <div className="h-64 border-t border-gray-800 bg-black flex flex-col shrink-0 font-mono text-sm">
      <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal size={16} />
          <span>LIVE_LOG_STREAM</span>
        </div>
        <div className="text-xs text-gray-500">
          {logs.length} events logged
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.map(log => {
          let colorClass = 'text-gray-400';
          if (log.severity === 'WARN') colorClass = 'text-yellow-500';
          if (log.severity === 'CRITICAL') colorClass = 'text-red-500 font-bold';

          return (
            <div key={log.id} className={`flex gap-4 ${colorClass} hover:bg-gray-900 px-2 py-0.5 rounded`}>
              <span className="text-gray-600 shrink-0">
                {format(log.timestamp, 'HH:mm:ss.SSS')}
              </span>
              <span className={`w-16 shrink-0 ${log.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/10' : ''}`}>
                [{log.severity}]
              </span>
              <span className="w-32 shrink-0">{log.srcIp}</span>
              <span className="text-gray-600 shrink-0">{'->'}</span>
              <span className="w-32 shrink-0">{log.dstIp}</span>
              <span className="truncate">{log.message}</span>
            </div>
          );
        })}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
