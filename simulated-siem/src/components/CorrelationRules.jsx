import React, { useState } from 'react';

import { Card, SeverityBadge, severityColors } from './shared';
import { Plus, Search, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';

export default function CorrelationRules({ addToast, rules, setRules }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const categories = ['all', ...new Set(rules.map(r => r.category))];

  const filtered = rules.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.mitre?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const toggleRule = (id) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    const rule = rules.find(r => r.id === id);
    addToast(`Rule "${rule.name}" ${rule.enabled ? 'disabled' : 'enabled'}`, rule.enabled ? 'warning' : 'success');
  };

  const stats = {
    total: rules.length,
    enabled: rules.filter(r => r.enabled).length,
    critical: rules.filter(r => r.severity === 'Critical' && r.enabled).length,
    triggered: rules.reduce((a, r) => a + r.triggerCount, 0),
  };

  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Correlation Rules</h2>
        <button onClick={() => addToast('Rule editor coming soon', 'info')}
          className="bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a] px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors">
          <Plus size={14} /> New Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: stats.total, color: '#e8eaed' },
          { label: 'Enabled', value: stats.enabled, color: '#00ff88' },
          { label: 'Critical Active', value: stats.critical, color: '#ff3355' },
          { label: 'Total Triggers (7d)', value: stats.triggered.toLocaleString(), color: '#ffaa00' },
        ].map((s, i) => (
          <Card key={i} className="flex flex-col">
            <div className="text-[10px] text-[#8b949e] uppercase">{s.label}</div>
            <div className="text-2xl font-mono font-bold mt-1" style={{ color: s.color }}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules or MITRE ID..."
            className="w-full bg-[#111111] border border-[#1e2535] rounded pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#00d4ff] text-[#e8eaed]" />
        </div>
        <div className="flex gap-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`text-xs px-3 py-1.5 rounded font-bold transition-colors capitalize ${catFilter === c ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1e2535] text-[#8b949e] hover:text-[#e8eaed]'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-[#8b949e] border-b border-[#1e2535] uppercase tracking-wider text-[10px] bg-[#111111] sticky top-0 z-10">
            <tr>
              <th className="py-2.5 px-3 w-4"></th>
              <th className="py-2.5 px-3">Rule Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">MITRE</th>
              <th className="py-2.5 px-3">Enabled</th>
              <th className="py-2.5 px-3 text-right">Triggers (7d)</th>
              <th className="py-2.5 px-3">Last Triggered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2535]">
            {filtered.map(rule => (
              <React.Fragment key={rule.id}>
                <tr onClick={() => setExpanded(expanded === rule.id ? null : rule.id)}
                  className={`hover:bg-[#111111] cursor-pointer transition-colors ${!rule.enabled ? 'opacity-50' : ''} ${expanded === rule.id ? 'bg-[#111111]' : ''}`}>
                  <td className="py-2.5 px-3 text-[#8b949e]">
                    {expanded === rule.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#e8eaed]">{rule.name}</td>
                  <td className="py-2.5 px-3 text-[#8b949e]">{rule.category}</td>
                  <td className="py-2.5 px-3"><SeverityBadge severity={rule.severity.toLowerCase()} /></td>
                  <td className="py-2.5 px-3">
                    {rule.mitre && <span className="text-[9px] bg-[#1e2535] text-[#00d4ff] px-1.5 py-0.5 rounded font-mono">{rule.mitre}</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <button onClick={e => { e.stopPropagation(); toggleRule(rule.id); }} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                      {rule.enabled
                        ? <><ToggleRight size={20} className="text-[#00ff88]" /><span className="text-[9px] text-[#00ff88] font-bold">ON</span></>
                        : <><ToggleLeft size={20} className="text-[#8b949e]" /><span className="text-[9px] text-[#8b949e] font-bold">OFF</span></>
                      }
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-[#e8eaed]">
                    <span className={rule.triggerCount > 100 ? 'text-[#ffaa00]' : ''}>{rule.triggerCount.toLocaleString()}</span>
                  </td>
                  <td className="py-2.5 px-3 text-[#8b949e]">{rule.lastTriggered}</td>
                </tr>
                {expanded === rule.id && (
                  <tr className="bg-[#0a0a0a]">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-[10px] text-[#8b949e] uppercase mb-1">Description</div>
                          <div className="text-xs text-[#e8eaed]">{rule.description}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#8b949e] uppercase mb-1">Detection Logic</div>
                          <code className="text-[10px] text-[#00ff88] font-mono bg-[#111111] border border-[#1e2535] rounded p-2 block whitespace-pre-wrap">{rule.condition}</code>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
