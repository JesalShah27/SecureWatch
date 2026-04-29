import React, { useState } from 'react';
import { CheckCircle, Activity, AlertTriangle, Monitor, Shield, TrendingUp, Eye, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Card, severityColors } from './shared';


const COLORS = { critical: '#ff3355', high: '#ffaa00', medium: '#ffcc00', low: '#33cc33', info: '#00d4ff' };

export default function Dashboard({ kpiEvents, alerts, assets, eps, blockedCount, setActivePage, logs = [], incidents = [], onMitreClick }) {
  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;
  const openInc = incidents.filter(i => i.status !== 'Resolved').length;

  const generateDynamicTimeline = () => {
    const bins = [];
    const now = new Date();
    // Create 24 bins for the last 24 minutes
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60000);
      bins.push({
        time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
        auth: 0,
        network: 0,
        endpoint: 0,
        _ms: d.getTime(),
      });
    }

    if (!logs || logs.length === 0) return bins;

    logs.forEach(log => {
      if (!log.timestamp) return;
      const logTime = new Date(log.timestamp).getTime();
      // Find which bin it belongs to
      const bin = bins.find(b => logTime >= b._ms && logTime < b._ms + 60000);
      if (bin) {
        const cat = (log.category || '').toLowerCase();
        const type = (log.eventType || '').toLowerCase();
        
        if (cat.includes('credential') || type.includes('auth') || type.includes('brute')) {
          bin.auth++;
        } else if (cat.includes('endpoint') || type.includes('file') || type.includes('process') || type.includes('dos')) {
          bin.endpoint++;
        } else {
          bin.network++; // default to network
        }
      }
    });

    return bins;
  };

  const timelineData = generateDynamicTimeline();

  // Calculate true counts
  const actualCrit = logs.filter(l => l.severity === 'critical').length;
  const actualHigh = logs.filter(l => l.severity === 'high').length;
  
  const severityData = [
    { name: 'Critical', value: actualCrit, color: COLORS.critical },
    { name: 'High', value: actualHigh, color: COLORS.high },
    { name: 'Medium', value: logs.filter(l => l.severity === 'medium').length, color: COLORS.medium },
    { name: 'Low', value: logs.filter(l => l.severity === 'low').length, color: COLORS.low },
    { name: 'Info', value: logs.filter(l => l.severity === 'info').length, color: COLORS.info },
  ];

  const kpis = [
    { label: 'Total Events (24h)', value: kpiEvents.toLocaleString(), sub: 'Live streaming', subColor: '#00ff88', icon: Activity },
    { label: 'Active Alerts', value: `${actualCrit} / ${actualHigh}`, sub: 'Critical / High', subColor: '#ff3355', icon: AlertTriangle, danger: actualCrit > 0 },
    { label: 'Open Incidents', value: openInc, sub: '2 escalated', subColor: '#ffaa00', icon: Shield },
    { label: 'Blocked Threats', value: blockedCount.toLocaleString(), sub: 'Auto-blocked', subColor: '#00ff88', icon: CheckCircle },
    { label: 'Endpoints Online', value: `${assets.filter(a=>a.status==='online').length} / ${assets.length}`, sub: assets.some(a=>a.status==='offline') ? '1 offline' : 'All healthy', subColor: assets.some(a=>a.status==='offline') ? '#ff3355' : '#00ff88', icon: Monitor },
    { label: 'EPS (Current)', value: eps, sub: 'Events/second', subColor: '#00d4ff', icon: Zap },
  ];

  const mitreItems = [
    // Row 1
    { t: 'Phishing', s: 'monitored', tag: 'T1566' }, { t: 'Cmd Line', s: 'monitored', tag: 'T1059.003' }, { t: 'Registry', s: 'monitored', tag: 'T1547.001' }, { t: 'Priv Esc', s: 'monitored', tag: 'T1068' },
    // Row 2
    { t: 'Exploit App', s: 'monitored', tag: 'T1190' }, { t: 'PowerShell', s: 'monitored', tag: 'T1059.001' }, { t: 'Exfiltration', s: 'monitored', tag: 'T1052' }, { t: 'UAC Bypass', s: 'monitored', tag: 'T1548.002' },
    // Row 3
    { t: 'AiTM/MITM', s: 'monitored', tag: 'T1557' }, { t: 'Port Scan', s: 'monitored', tag: 'T1046' }, { t: 'Sched Task', s: 'monitored', tag: 'T1053.005' }, { t: 'LSASS Dump', s: 'monitored', tag: 'T1003.001' },
    // Row 4
    { t: 'Valid Acct', s: 'monitored', tag: 'T1078' }, { t: 'WMI', s: 'monitored', tag: 'T1047' }, { t: 'Ransomware', s: 'monitored', tag: 'T1486' }, { t: 'DDoS/DoS', s: 'monitored', tag: 'T1498' },
  ].map(item => {
    // If any log in the session has this MITRE tag, mark it triggered
    if (logs.some(l => l.mitre === item.tag)) return { ...item, s: 'triggered' };
    return item;
  });

  const computeTopIPs = () => {
    if (!logs.length) return [];
    const ipCounts = {};
    logs.forEach(l => {
      if (['critical', 'high', 'medium'].includes(l.severity) && l.sourceIp) {
        ipCounts[l.sourceIp] = (ipCounts[l.sourceIp] || 0) + 1;
      }
    });
    return Object.entries(ipCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ip, hits]) => ({ ip, country: 'UNK', score: Math.min(100, hits * 5 + 40), hits, blocked: hits > 10 }));
  };

  const dynamicIPs = computeTopIPs();
  const suspiciousIPs = dynamicIPs.length > 0 ? dynamicIPs : [
    { ip: 'No Malicious Traffic', country: '--', score: 0, hits: 0, blocked: false }
  ];

  const [blockedIPs, setBlockedIPs] = useState(suspiciousIPs.map(i => i.blocked));

  return (
    <div className="space-y-6 animate-slide-down pb-10">
      {/* KPI Row */}
      <div className="grid grid-cols-6 gap-4">
        {kpis.map((k, i) => (
          <Card key={i} danger={k.danger} className="flex flex-col justify-between group cursor-default">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#8b949e] uppercase tracking-wider font-bold">{k.label}</span>
              <k.icon size={14} className="text-[#8b949e] group-hover:text-[#00d4ff] transition-colors" />
            </div>
            <div className="text-2xl font-mono text-[#e8eaed] font-bold mt-1">{k.value}</div>
            <div className="text-[10px] mt-1 font-medium" style={{ color: k.subColor }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Row 2: Timeline & Severity */}
      <div className="grid grid-cols-5 gap-6">
        <Card className="col-span-3 min-h-[280px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#e8eaed]">Event Volume Timeline (Last 24m)</h3>
            <div className="flex gap-3 text-[10px] text-[#8b949e]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00d4ff] rounded-full"></span>Auth</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#00ff88] rounded-full"></span>Network</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#ffaa00] rounded-full"></span>Endpoint</span>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#1e2535" tick={{ fill: '#8b949e', fontSize: 9 }} tickLine={false} interval={3} />
                <YAxis stroke="#1e2535" tick={{ fill: '#8b949e', fontSize: 9 }} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
                <RTooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#1e2535', color: '#e8eaed', fontSize: '11px', fontFamily: 'monospace' }} cursor={{ fill: '#1e2535', opacity: 0.4 }} />
                <Bar dataKey="endpoint" stackId="a" fill="#ffaa00" radius={[0,0,0,0]} />
                <Bar dataKey="network" stackId="a" fill="#00ff88" />
                <Bar dataKey="auth" stackId="a" fill="#00d4ff" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-2 min-h-[280px] flex flex-col">
          <h3 className="text-sm font-bold text-[#e8eaed] mb-2">Threat Severity Breakdown</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={severityData} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RTooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#1e2535', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-mono font-bold text-white">{severityData.reduce((a,b)=>a+b.value,0).toLocaleString()}</span>
              <span className="text-[9px] text-[#8b949e] uppercase tracking-wider">Total Alerts</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {severityData.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
                <span className="text-[#8b949e] w-14">{s.name}</span>
                <div className="flex-1 bg-[#1e2535] h-1 rounded overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${Math.min(100, s.value / 12)}%`, backgroundColor: s.color }}></div>
                </div>
                <span className="font-mono text-[#e8eaed] w-10 text-right">{s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Live Alerts, MITRE, Suspicious IPs */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="min-h-[360px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#e8eaed]">Live Alert Feed</h3>
            <span className="text-[9px] text-[#8b949e] font-mono">{alerts.length} total</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: 'thin' }}>
            {alerts.slice(0, 10).map((alert) => (
              <div key={alert.id} className="bg-[#0a0a0a] border border-[#1e2535] rounded p-2.5 border-l-4 hover:border-[#1e2535] hover:bg-[#0f0f0f] transition-all cursor-pointer" style={{ borderLeftColor: severityColors[alert.severity] }}>
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[11px] font-semibold text-[#e8eaed] leading-tight">{alert.message}</span>
                  <span className="text-[9px] text-[#8b949e] font-mono whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1.5 gap-2">
                  <span className="text-[9px] text-[#00d4ff] font-mono">{alert.sourceHost}</span>
                  <div className="flex gap-1">
                    {alert.mitre && <span className="text-[8px] bg-[#1e2535] px-1.5 py-0.5 rounded text-[#8b949e] font-mono">{alert.mitre}</span>}
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${severityColors[alert.severity]}22`, color: severityColors[alert.severity] }}>{alert.severity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setActivePage('incidents')} className="w-full mt-3 bg-[#1e2535] hover:bg-[#2a3441] text-[#00d4ff] text-xs py-2 rounded transition-colors font-bold">
            View All Incidents →
          </button>
        </Card>

        <Card className="min-h-[360px] flex flex-col">
          <h3 className="text-sm font-bold text-[#e8eaed] mb-3">MITRE ATT&CK® Coverage</h3>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {['Initial Access','Exec / Discovery','Persist / Exfil','Priv Esc / Impact'].map(t => (
              <div key={t} className="text-[8px] text-[#8b949e] font-bold uppercase truncate text-center" title={t}>{t}</div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1 flex-1">
            {mitreItems.map((tech, i) => {
              const cls = tech.s === 'triggered'
                ? 'bg-[#ff3355]/20 border border-[#ff3355]/50 text-[#ff3355] animate-pulse-red'
                : tech.s === 'monitored'
                  ? 'bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff]'
                  : 'bg-[#1e2535] text-[#4a5568]';
              return (
                <div key={i} onClick={() => onMitreClick?.(tech.tag)} className={`p-1.5 rounded text-[8px] font-mono truncate cursor-pointer hover:opacity-90 transition-opacity text-center ${cls}`} title={tech.t}>
                  {tech.t}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-3 text-[9px] text-[#8b949e]">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#00d4ff]/20 border border-[#00d4ff]/50"></div>Monitored</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#ff3355]/30 border border-[#ff3355]"></div>Triggered</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#1e2535]"></div>No Coverage</span>
          </div>
        </Card>

        <Card className="min-h-[360px] flex flex-col">
          <h3 className="text-sm font-bold text-[#e8eaed] mb-4">Top Suspicious IPs</h3>
          <div className="flex-1 space-y-2">
            {suspiciousIPs.map((item, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-[#1e2535] rounded p-2.5 hover:border-[#ff3355]/30 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-[#e8eaed]">{item.ip}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#8b949e] bg-[#1e2535] px-1 py-0.5 rounded">{item.country}</span>
                    <span className="text-[9px] font-bold" style={{ color: item.score > 85 ? '#ff3355' : item.score > 70 ? '#ffaa00' : '#ffcc00' }}>
                      Score: {item.score}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#1e2535] h-1 rounded overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${item.score}%`, backgroundColor: item.score > 85 ? '#ff3355' : '#ffaa00' }}></div>
                  </div>
                  <span className="text-[9px] text-[#8b949e]">{item.hits} hits</span>
                  <button
                    onClick={() => setBlockedIPs(prev => { const n = [...prev]; n[i] = !n[i]; return n; })}
                    className={`text-[9px] px-2 py-0.5 rounded font-bold transition-colors ${blockedIPs[i] ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/50' : 'bg-[#ff3355]/10 hover:bg-[#ff3355]/30 text-[#ff3355] border border-[#ff3355]/30'}`}
                  >
                    {blockedIPs[i] ? 'Blocked' : 'Block'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
