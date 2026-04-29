import React, { useState } from 'react';
import { X, Search, Lock, Play, ShieldCheck, Monitor, Cpu, HardDrive, MemoryStick, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import { Card, SeverityBadge, StatusDot, severityColors } from './shared';

const ACTION_RESULTS = {
  isolate: { status: 'isolated', msg: (h) => `${h} isolated from network. All traffic blocked.`, type: 'warning' },
  reconnect: { status: 'online', msg: (h) => `${h} reconnected. Network access restored.`, type: 'success' },
  scan: { status: null, msg: (h) => `Deep scan initiated on ${h}. Results in ~2 mins.`, type: 'info' },
  playbook: { status: null, msg: (h) => `Incident Response Playbook deployed on ${h}.`, type: 'info' },
  patch: { status: null, msg: (h) => `Patch deployment queued for ${h}.`, type: 'success' },
};

const MiniBar = ({ value, color = '#00d4ff', label }) => (
  <div className="mb-2">
    <div className="flex justify-between text-[9px] text-[#8b949e] mb-0.5">
      <span>{label}</span><span className="font-mono" style={{ color }}>{value}%</span>
    </div>
    <div className="bg-[#1e2535] h-1.5 rounded overflow-hidden">
      <div className="h-full rounded transition-all duration-500" style={{ width: `${value}%`, backgroundColor: value > 80 ? '#ff3355' : value > 60 ? '#ffaa00' : color }}></div>
    </div>
  </div>
);

const STATUS_LABEL = { online: '#00ff88', offline: '#8b949e', compromised: '#ff3355', isolated: '#ffaa00', suspicious: '#ffcc00' };

export default function Assets({ assets, setAssets, addToast }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [scanProgress, setScanProgress] = useState(null);

  const handleAction = (action) => {
    if (!selected) return;
    const def = ACTION_RESULTS[action];
    if (def.status) {
      setAssets(prev => prev.map(a => a.id === selected.id ? { ...a, status: def.status } : a));
      setSelected(prev => ({ ...prev, status: def.status }));
    }
    if (action === 'scan') {
      setScanProgress(0);
      const iv = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) { clearInterval(iv); addToast(`Scan complete on ${selected.hostname}: ${Math.floor(Math.random()*3)} threats found`, 'warning'); return null; }
          return p + 10;
        });
      }, 400);
    }
    addToast(def.msg(selected.hostname), def.type);
  };

  const types = ['all', 'laptop', 'pc', 'server', 'firewall'];
  const filtered = assets.filter(a => {
    const matchType = filter === 'all' || a.type === filter;
    const matchSearch = !search || a.hostname.toLowerCase().includes(search.toLowerCase()) || a.ip.includes(search);
    return matchType && matchSearch;
  });

  const statusCounts = assets.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});

  return (
    <div className="animate-slide-down h-full flex gap-6">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Endpoint Management</h2>
          <div className="flex gap-3 text-[10px]">
            {Object.entries(statusCounts).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1 bg-[#1e2535] px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_LABEL[s] || '#8b949e' }}></span>
                <span className="text-[#8b949e]">{s}:</span>
                <span className="font-bold text-[#e8eaed]">{c}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hostname or IP..."
              className="w-full bg-[#111111] border border-[#1e2535] rounded pl-8 pr-3 py-1.5 text-xs text-[#e8eaed] focus:outline-none focus:border-[#00d4ff]" />
          </div>
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`text-xs px-3 py-1.5 rounded font-bold transition-colors capitalize ${filter === t ? 'bg-[#00d4ff] text-[#0a0a0a]' : 'bg-[#1e2535] text-[#8b949e] hover:text-[#e8eaed]'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 xl:grid-cols-4 gap-3 content-start overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {filtered.map(asset => (
            <Card key={asset.id}
              danger={asset.status === 'compromised' || asset.status === 'isolated'}
              onClick={() => setSelected(asset)}
              className={`cursor-pointer transition-all hover:scale-[1.02] ${selected?.id === asset.id ? 'ring-1 ring-[#00d4ff]' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <Monitor size={20} className={`flex-shrink-0 ${asset.status === 'compromised' ? 'text-[#ff3355]' : asset.status === 'isolated' ? 'text-[#ffaa00]' : 'text-[#00d4ff]'}`} />
                <div className="flex items-center gap-1.5">
                  {asset.openAlerts > 0 && <span className="bg-[#ff3355] text-white text-[8px] font-bold px-1 py-0.5 rounded">{asset.openAlerts}</span>}
                  <StatusDot status={asset.status} />
                </div>
              </div>
              <h4 className="font-bold text-xs text-[#e8eaed] truncate hover:text-[#00d4ff] transition-colors">{asset.hostname}</h4>
              <p className="text-[10px] font-mono text-[#8b949e] mt-0.5">{asset.ip}</p>
              <div className="mt-2 pt-2 border-t border-[#1e2535] flex justify-between items-center">
                <span className="text-[9px] bg-[#1e2535] px-1.5 py-0.5 rounded text-[#8b949e]">{asset.type}</span>
                <span className="text-[9px] font-bold uppercase" style={{ color: STATUS_LABEL[asset.status] || '#8b949e' }}>{asset.status}</span>
              </div>
              {asset.vulnerabilities > 0 && (
                <div className="mt-1.5 text-[8px] text-[#ffaa00] flex items-center gap-1">
                  <AlertTriangle size={9} />{asset.vulnerabilities} vulnerabilities
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      <div className={`w-80 flex flex-col gap-4 transition-all duration-300 ${selected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
        {selected && (
          <>
            <Card className="flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#00d4ff]">{selected.hostname}</h3>
                  <p className="text-[10px] font-mono text-[#8b949e]">{selected.ip} • {selected.mac}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[#8b949e] hover:text-[#e8eaed]"><X size={14} /></button>
              </div>

              <div className="space-y-1.5 text-[10px] mb-4">
                {[
                  ['OS', selected.os], ['Agent', selected.agentVersion], ['Type', selected.type],
                  ['Open Alerts', <span className={selected.openAlerts > 0 ? 'text-[#ff3355] font-bold' : 'text-[#00ff88]'}>{selected.openAlerts}</span>],
                  ['Status', <span className="font-bold uppercase" style={{ color: STATUS_LABEL[selected.status] }}>{selected.status}</span>],
                  ['Groups', (selected.groups || []).join(', ')],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-[#1e2535] pb-1.5">
                    <span className="text-[#8b949e]">{k}</span>
                    <span className="text-[#e8eaed]">{v}</span>
                  </div>
                ))}
              </div>

              <MiniBar value={selected.cpu} color="#00d4ff" label="CPU" />
              <MiniBar value={selected.mem} color="#00ff88" label="Memory" />
              <MiniBar value={selected.disk} color="#ffaa00" label="Disk" />
            </Card>

            <Card>
              <h4 className="text-[10px] text-[#8b949e] uppercase font-bold mb-3">Endpoint Actions</h4>
              <div className="space-y-2">
                {scanProgress !== null && (
                  <div className="mb-2">
                    <div className="flex justify-between text-[9px] text-[#8b949e] mb-1">
                      <span>Deep Scan Progress</span><span>{scanProgress}%</span>
                    </div>
                    <div className="bg-[#1e2535] h-1.5 rounded overflow-hidden">
                      <div className="h-full bg-[#00d4ff] rounded transition-all" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                  </div>
                )}
                {selected.status === 'isolated' ? (
                  <button onClick={() => handleAction('reconnect')} className="w-full flex items-center justify-center gap-2 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] py-2 rounded text-xs font-bold transition-all">
                    <ShieldCheck size={14} /> Reconnect to Network
                  </button>
                ) : (
                  <button onClick={() => handleAction('isolate')} className="w-full flex items-center justify-center gap-2 bg-[#ffaa00]/10 hover:bg-[#ffaa00]/20 border border-[#ffaa00]/50 text-[#ffaa00] py-2 rounded text-xs font-bold transition-all">
                    <Lock size={14} /> Isolate Endpoint
                  </button>
                )}
                <button onClick={() => handleAction('scan')} disabled={scanProgress !== null} className="w-full flex items-center justify-center gap-2 bg-[#1e2535] hover:bg-[#2a3441] text-[#00d4ff] py-2 rounded text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Search size={14} /> Run Deep Scan
                </button>
                <button onClick={() => handleAction('playbook')} className="w-full flex items-center justify-center gap-2 bg-[#1e2535] hover:bg-[#2a3441] text-[#00d4ff] py-2 rounded text-xs font-bold transition-all">
                  <Play size={14} /> Deploy IR Playbook
                </button>
                <button onClick={() => handleAction('patch')} className="w-full flex items-center justify-center gap-2 bg-[#1e2535] hover:bg-[#2a3441] text-[#e8eaed] py-2 rounded text-xs font-bold transition-all">
                  <RefreshCw size={14} /> Queue Patch Update
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
