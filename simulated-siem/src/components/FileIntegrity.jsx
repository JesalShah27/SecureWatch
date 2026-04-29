import React, { useState } from 'react';
import { fileIntegrityData } from '../data';
import { Card, SeverityBadge } from './shared';
import { FileText, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

export default function FileIntegrity({ addToast }) {
  const [events, setEvents] = useState(fileIntegrityData);
  const [selected, setSelected] = useState(null);

  const dismiss = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (selected?.id === id) setSelected(null);
    addToast('FIM alert dismissed', 'success');
  };

  const sevMap = { critical: '#ff3355', high: '#ffaa00', medium: '#ffcc00', low: '#33cc33' };
  const evtColor = { MODIFIED: '#ff3355', ACCESSED: '#ffaa00', CREATED: '#00d4ff', DELETED: '#ff3355' };

  return (
    <div className="animate-slide-down space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">File Integrity Monitoring</h2>
        <div className="flex gap-2 text-[10px]">
          <span className="bg-[#ff3355]/20 text-[#ff3355] px-2 py-1 rounded font-bold">{events.filter(e=>e.severity==='critical').length} Critical</span>
          <span className="bg-[#ffaa00]/20 text-[#ffaa00] px-2 py-1 rounded font-bold">{events.filter(e=>e.severity==='high').length} High</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Monitored Paths', value: '1,284', color: '#00d4ff' },
          { label: 'Changes Today', value: events.length, color: '#ffaa00' },
          { label: 'Auto-Alerts', value: events.filter(e => ['critical','high'].includes(e.severity)).length, color: '#ff3355' },
        ].map((s, i) => (
          <Card key={i}>
            <div className="text-[10px] text-[#8b949e] uppercase">{s.label}</div>
            <div className="text-2xl font-mono font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[#8b949e] border-b border-[#1e2535] text-[10px] uppercase tracking-wider bg-[#111111] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Host</th>
                  <th className="py-2.5 px-4">Event</th>
                  <th className="py-2.5 px-4">Path</th>
                  <th className="py-2.5 px-4">Severity</th>
                  <th className="py-2.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2535]">
                {events.map(ev => (
                  <tr key={ev.id} onClick={() => setSelected(ev)}
                    className={`hover:bg-[#111111] cursor-pointer transition-colors ${selected?.id === ev.id ? 'bg-[#111111]' : ''}`}>
                    <td className="py-2.5 px-4 font-mono text-[#8b949e] whitespace-nowrap">{ev.time}</td>
                    <td className="py-2.5 px-4 text-[#00d4ff] font-mono text-[10px]">{ev.host}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: evtColor[ev.event] || '#8b949e', backgroundColor: `${evtColor[ev.event]}22` }}>
                        {ev.event}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#e8eaed] text-[10px] max-w-[240px] truncate" title={ev.path}>{ev.path}</td>
                    <td className="py-2.5 px-4"><SeverityBadge severity={ev.severity} /></td>
                    <td className="py-2.5 px-4">
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); setSelected(ev); }}
                          className="text-[9px] bg-[#1e2535] hover:bg-[#2a3441] text-[#00d4ff] px-2 py-0.5 rounded transition-colors">
                          <Eye size={10} />
                        </button>
                        <button onClick={e => { e.stopPropagation(); dismiss(ev.id); }}
                          className="text-[9px] bg-[#1e2535] hover:bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {selected && (
          <Card className="w-72 flex flex-col flex-shrink-0">
            <h4 className="font-bold text-sm text-[#e8eaed] mb-3">Event Detail</h4>
            <div className="space-y-2 text-xs flex-1">
              {[
                ['Host', selected.host],
                ['Time', selected.time],
                ['Event Type', <span style={{ color: evtColor[selected.event] || '#8b949e' }}>{selected.event}</span>],
                ['Severity', <SeverityBadge severity={selected.severity} />],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-[#1e2535] pb-1.5">
                  <span className="text-[#8b949e]">{k}</span>
                  <span className="text-[#e8eaed]">{v}</span>
                </div>
              ))}
              <div className="pt-2">
                <div className="text-[10px] text-[#8b949e] mb-1">File Path</div>
                <div className="text-[10px] font-mono text-[#00d4ff] break-all bg-[#0a0a0a] p-2 rounded border border-[#1e2535]">{selected.path}</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8b949e] mb-1">Hash Before</div>
                <div className="text-[10px] font-mono text-[#8b949e] bg-[#0a0a0a] p-2 rounded border border-[#1e2535]">{selected.hash_before}</div>
              </div>
              {selected.event === 'MODIFIED' && (
                <div>
                  <div className="text-[10px] text-[#8b949e] mb-1">Hash After</div>
                  <div className="text-[10px] font-mono text-[#ff3355] bg-[#0a0a0a] p-2 rounded border border-[#ff3355]/30">{selected.hash_after}</div>
                </div>
              )}
            </div>
            <button onClick={() => dismiss(selected.id)}
              className="mt-4 w-full bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 py-2 rounded text-xs font-bold transition-colors">
              Mark as Reviewed
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}
