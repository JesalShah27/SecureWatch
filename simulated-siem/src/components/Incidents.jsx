import React, { useState } from 'react';
import { User, AlertTriangle, ChevronRight, X, Shield, Clock, Link } from 'lucide-react';
import { Card, SeverityBadge, severityColors } from './shared';

const STATUS_COLORS = {
  New: { bg: 'bg-[#ff3355]/20', text: 'text-[#ff3355]' },
  Investigating: { bg: 'bg-[#ffaa00]/20', text: 'text-[#ffaa00]' },
  Contained: { bg: 'bg-[#00d4ff]/20', text: 'text-[#00d4ff]' },
  Resolved: { bg: 'bg-[#00ff88]/20', text: 'text-[#00ff88]' },
};

const TLP_COLORS = { RED: '#ff3355', AMBER: '#ffaa00', WHITE: '#8b949e', GREEN: '#00ff88' };

export default function Incidents({ addToast, incidents, setIncidents }) {
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [newTitle, setNewTitle] = useState('');

  const filtered = filterStatus === 'All' ? incidents : incidents.filter(i => i.status === filterStatus);

  const updateStatus = (id, status) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    addToast(`Incident ${id} updated to ${status}`, 'success');
  };

  const createIncident = () => {
    if (!newTitle.trim()) return;
    const id = `INC-2026-${String(incidents.length + 1).padStart(3, '0')}`;
    const inc = {
      id, title: newTitle, severity: 'medium', status: 'New',
      assigned: 'Jesal Pavaskar', assets: [], created: 'Just now',
      updated: 'Just now', description: 'Manually created incident. Add details below.',
      mitre: [], tlp: 'AMBER',
    };
    setIncidents(prev => [inc, ...prev]);
    setNewTitle('');
    setShowCreate(false);
    addToast(`Incident ${id} created`, 'success');
  };

  return (
    <div className="animate-slide-down h-full flex gap-6">
      {/* List */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Incident Management</h2>
          <div className="flex gap-2">
            {['All', 'New', 'Investigating', 'Contained', 'Resolved'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${filterStatus === s ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1e2535] text-[#8b949e] hover:text-[#e8eaed]'}`}>
                {s}
              </button>
            ))}
            <button onClick={() => setShowCreate(true)}
              className="bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a] px-4 py-1.5 rounded text-xs font-bold transition-colors ml-2">
              + Create
            </button>
          </div>
        </div>

        {showCreate && (
          <Card className="mb-4 border border-[#00d4ff]/30">
            <div className="flex gap-2">
              <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createIncident()}
                placeholder="Incident title... (press Enter to create)"
                className="flex-1 bg-[#0a0a0a] border border-[#1e2535] rounded p-2 text-sm font-mono text-[#e8eaed] focus:outline-none focus:border-[#00d4ff]" />
              <button onClick={createIncident} className="bg-[#00d4ff] text-[#0a0a0a] px-4 py-2 rounded text-sm font-bold">Create</button>
              <button onClick={() => setShowCreate(false)} className="text-[#8b949e] hover:text-[#e8eaed] px-2"><X size={16} /></button>
            </div>
          </Card>
        )}

        <Card className="flex-1 p-0 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-[#8b949e] border-b border-[#1e2535] text-xs uppercase tracking-wider sticky top-0 bg-[#111111] z-10">
              <tr>
                <th className="pb-3 px-4 pt-3">ID</th>
                <th className="pb-3 px-4 pt-3">Title</th>
                <th className="pb-3 px-4 pt-3">Severity</th>
                <th className="pb-3 px-4 pt-3">Status</th>
                <th className="pb-3 px-4 pt-3">Assigned</th>
                <th className="pb-3 px-4 pt-3">Updated</th>
                <th className="pb-3 px-4 pt-3">TLP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2535]">
              {filtered.map(inc => {
                const sc = STATUS_COLORS[inc.status] || STATUS_COLORS.New;
                return (
                  <tr key={inc.id} onClick={() => setSelected(inc)}
                    className={`hover:bg-[#111111] cursor-pointer group transition-colors ${selected?.id === inc.id ? 'bg-[#1a2a1a]/30' : ''}`}>
                    <td className="py-3 px-4 font-mono text-[#00d4ff] text-xs">{inc.id}</td>
                    <td className="py-3 px-4 text-[#e8eaed] font-medium border-l-2 border-transparent group-hover:border-[#00d4ff] pl-3 truncate max-w-[240px]">{inc.title}</td>
                    <td className="py-3 px-4"><SeverityBadge severity={inc.severity} /></td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase ${sc.bg} ${sc.text}`}>{inc.status}</span>
                    </td>
                    <td className="py-3 px-4 text-[#8b949e] flex items-center gap-1 text-xs"><User size={12} />{inc.assigned}</td>
                    <td className="py-3 px-4 text-[#8b949e] font-mono text-xs">{inc.updated}</td>
                    <td className="py-3 px-4">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border" style={{ color: TLP_COLORS[inc.tlp], borderColor: `${TLP_COLORS[inc.tlp]}44`, backgroundColor: `${TLP_COLORS[inc.tlp]}11` }}>
                        TLP:{inc.tlp}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Detail Panel */}
      <div className={`w-96 flex flex-col transition-all duration-300 ${selected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
        {selected && (
          <Card className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-[#8b949e]">{selected.id}</span>
                <h3 className="text-base font-bold text-[#e8eaed] mt-0.5 leading-tight">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#8b949e] hover:text-[#e8eaed] ml-2 flex-shrink-0"><X size={16} /></button>
            </div>

            <p className="text-xs text-[#8b949e] leading-relaxed mb-4 border-b border-[#1e2535] pb-4">{selected.description}</p>

            <div className="space-y-2 mb-4 text-xs">
              {[
                ['Severity', <SeverityBadge severity={selected.severity} />],
                ['Status', <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase ${(STATUS_COLORS[selected.status]||STATUS_COLORS.New).bg} ${(STATUS_COLORS[selected.status]||STATUS_COLORS.New).text}`}>{selected.status}</span>],
                ['Assigned', selected.assigned],
                ['Created', selected.created],
                ['Assets', Array.isArray(selected.assets) ? selected.assets.join(', ') || 'None' : selected.assets],
                ['TLP', <span style={{ color: TLP_COLORS[selected.tlp] }}>TLP:{selected.tlp}</span>],
              ].map(([label, val], i) => (
                <div key={i} className="flex justify-between items-center border-b border-[#1e2535] pb-2">
                  <span className="text-[#8b949e]">{label}</span>
                  <span className="text-[#e8eaed]">{val}</span>
                </div>
              ))}
            </div>

            {selected.mitre?.length > 0 && (
              <div className="mb-4">
                <span className="text-[10px] text-[#8b949e] uppercase font-bold">MITRE Techniques</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selected.mitre.map(m => (
                    <span key={m} className="text-[9px] bg-[#1e2535] text-[#00d4ff] px-2 py-0.5 rounded font-mono">{m}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2">
              <h4 className="text-[10px] text-[#8b949e] uppercase font-bold mb-2">Change Status</h4>
              {['Investigating', 'Contained', 'Resolved'].map(s => (
                <button key={s} onClick={() => updateStatus(selected.id, s)}
                  disabled={selected.status === s}
                  className={`w-full py-2 rounded text-xs font-bold transition-all ${selected.status === s ? 'bg-[#1e2535] text-[#4a5568] cursor-not-allowed' : 'bg-[#1e2535] hover:bg-[#2a3441] text-[#e8eaed] hover:text-[#00d4ff]'}`}>
                  Mark as {s}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
