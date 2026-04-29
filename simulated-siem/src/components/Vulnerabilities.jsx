import React, { useState } from 'react';
import { vulnerabilityData } from '../data';
import { Card, SeverityBadge } from './shared';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const CVSS_COLOR = (s) => s >= 9 ? '#ff3355' : s >= 7 ? '#ffaa00' : s >= 4 ? '#ffcc00' : '#00ff88';

export default function Vulnerabilities({ addToast }) {
  const [vulns, setVulns] = useState(vulnerabilityData);
  const [filter, setFilter] = useState('all');

  const patch = (id) => {
    setVulns(prev => prev.map(v => v.id === id ? { ...v, status: 'Patching...' } : v));
    setTimeout(() => {
      setVulns(prev => prev.map(v => v.id === id ? { ...v, status: 'Patched' } : v));
      const v = vulns.find(v => v.id === id);
      addToast(`${v.cve} patched on ${v.host}`, 'success');
    }, 2000);
  };

  const filtered = filter === 'all' ? vulns : vulns.filter(v => v.status === filter);
  const open = vulns.filter(v => v.status === 'Open').length;
  const critical = vulns.filter(v => v.severity === 'Critical').length;
  const patched = vulns.filter(v => v.status === 'Patched').length;

  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Vulnerability Scanner</h2>
        <button onClick={() => addToast('Full network scan initiated...', 'info')}
          className="bg-[#1e2535] hover:bg-[#2a3441] text-[#00d4ff] px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors">
          <RefreshCw size={14} /> Run Scan
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total CVEs', value: vulns.length, color: '#e8eaed', icon: Shield },
          { label: 'Open', value: open, color: '#ff3355', icon: AlertTriangle },
          { label: 'Critical Severity', value: critical, color: '#ff3355', icon: AlertTriangle },
          { label: 'Patched', value: patched, color: '#00ff88', icon: CheckCircle },
        ].map((s, i) => (
          <Card key={i} className="flex items-center gap-3">
            <s.icon size={24} style={{ color: s.color }} className="flex-shrink-0 opacity-70" />
            <div>
              <div className="text-[10px] text-[#8b949e] uppercase">{s.label}</div>
              <div className="text-2xl font-mono font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        {['all', 'Open', 'Patching...', 'Patched'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${filter === s ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1e2535] text-[#8b949e] hover:text-[#e8eaed]'}`}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="text-[#8b949e] border-b border-[#1e2535] text-[10px] uppercase tracking-wider bg-[#111111]">
            <tr>
              <th className="py-2.5 px-4">CVE ID</th>
              <th className="py-2.5 px-4">Host</th>
              <th className="py-2.5 px-4">Title</th>
              <th className="py-2.5 px-4">CVSS</th>
              <th className="py-2.5 px-4">Severity</th>
              <th className="py-2.5 px-4">Package</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2535]">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-[#111111] transition-colors">
                <td className="py-2.5 px-4 font-mono text-[#00d4ff] whitespace-nowrap">{v.cve}</td>
                <td className="py-2.5 px-4 text-[#e8eaed] font-mono text-[10px] whitespace-nowrap">{v.host}</td>
                <td className="py-2.5 px-4 text-[#8b949e] max-w-[220px] truncate" title={v.title}>{v.title}</td>
                <td className="py-2.5 px-4">
                  <span className="font-mono font-bold text-xs" style={{ color: CVSS_COLOR(v.cvss) }}>{v.cvss}</span>
                </td>
                <td className="py-2.5 px-4"><SeverityBadge severity={v.severity.toLowerCase()} /></td>
                <td className="py-2.5 px-4 text-[#8b949e] font-mono text-[10px]">{v.package}</td>
                <td className="py-2.5 px-4">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                    v.status === 'Patched' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                    v.status === 'Patching...' ? 'bg-[#00d4ff]/20 text-[#00d4ff] animate-pulse' :
                    'bg-[#ff3355]/20 text-[#ff3355]'
                  }`}>{v.status}</span>
                </td>
                <td className="py-2.5 px-4">
                  {v.status === 'Open' && v.patchAvailable && (
                    <button onClick={() => patch(v.id)}
                      className="text-[9px] bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30 px-2 py-1 rounded font-bold transition-colors whitespace-nowrap">
                      Apply Patch
                    </button>
                  )}
                  {v.status === 'Patched' && <CheckCircle size={14} className="text-[#00ff88]" />}
                  {v.status === 'Open' && !v.patchAvailable && <span className="text-[9px] text-[#8b949e]">No patch yet</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
