import React from 'react';
import { DeviceNode } from '../types';
import { X, Server, Shield, Monitor, MonitorCheck } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface NodeDetailsPanelProps {
  node: DeviceNode;
  onClose: () => void;
}

export default function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  const { logs, alerts } = useSimulation();

  // Get recent logs for this node
  const nodeLogs = logs
    .filter(l => l.srcIp === node.ip || l.dstIp === node.ip)
    .slice(0, 15);

  const nodeAlerts = alerts
    .filter(a => a.srcDevice === node.hostname || a.dstDevice === node.hostname)
    .slice(0, 5);

  const Icon = node.os === 'Appliance' ? Shield :
               node.os === 'Ubuntu' || node.os.includes('Server') ? Server :
               node.os === 'macOS' ? Monitor : MonitorCheck;

  let statusColor = 'text-green-500';
  let bgColor = 'bg-green-500/10 border-green-500/30';
  
  if (node.status === 'RED') {
    statusColor = 'text-red-500';
    bgColor = 'bg-red-500/20 border-red-500/50';
  } else if (node.status === 'YELLOW') {
    statusColor = 'text-yellow-500';
    bgColor = 'bg-yellow-500/10 border-yellow-500/30';
  } else if (node.status === 'GREY') {
    statusColor = 'text-gray-500';
    bgColor = 'bg-gray-800 border-gray-600';
  }

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col z-10 animate-slide-in">
      <div className="p-4 border-b border-gray-800 flex justify-between items-start bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${bgColor} ${statusColor}`}>
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-100">{node.hostname}</h3>
            <p className="text-xs text-gray-500 font-mono">{node.ip}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <X size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-gray-800 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500 text-xs block">OS</span>
            <span className="text-gray-300">{node.os}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs block">Role</span>
            <span className="text-gray-300">{node.role}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs block">Status</span>
            <span className={`font-bold ${statusColor}`}>{node.status}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs block">Group</span>
            <span className="text-gray-300 capitalize">{node.group}</span>
          </div>
        </div>
      </div>

      {nodeAlerts.length > 0 && (
        <div className="p-4 border-b border-gray-800">
          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Related Alerts</h4>
          <div className="space-y-2">
            {nodeAlerts.map(alert => (
              <div key={alert.id} className="text-xs p-2 rounded bg-gray-900 border border-red-500/20 text-gray-300">
                <span className="text-red-400 font-bold block mb-1">{alert.ruleName}</span>
                <span className="text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Recent Activity</h4>
        <div className="space-y-2">
          {nodeLogs.length === 0 ? (
            <p className="text-xs text-gray-600">No recent logs.</p>
          ) : (
            nodeLogs.map(log => (
              <div key={log.id} className="text-xs p-2 rounded bg-gray-900 font-mono text-gray-400">
                <span className={log.severity === 'CRITICAL' ? 'text-red-400' : 'text-gray-500'}>
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>{' '}
                <span className="text-gray-300">{log.eventType}</span>
                {log.severity === 'CRITICAL' && (
                  <p className="text-red-500 mt-1">{log.message}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
