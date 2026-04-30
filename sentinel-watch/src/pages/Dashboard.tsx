import { useMemo, useState } from "react";
import {
  Activity, AlertOctagon, ShieldCheck, Server, Clock, ArrowUp, ArrowDown,
  Ban, Search, Wifi, WifiOff, Globe,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
} from "recharts";
import { useSiem } from "@/lib/siemContext";
import { SeverityPill, SeverityBar } from "@/components/siem/SeverityPill";
import {
  MITRE_TACTICS, MITRE_TECHNIQUES, RULES_LIB,
  fmtTime, relTime,
} from "@/lib/siemData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

const SEV_COLOR = {
  critical: "hsl(var(--sev-critical))",
  high: "hsl(var(--sev-high))",
  medium: "hsl(var(--sev-medium))",
  low: "hsl(var(--sev-low))",
  info: "hsl(var(--sev-info))",
};

export default function Dashboard() {
  const { kpis, alerts, incidents, timeline, assets, dashboardSummary, apiError, suspiciousIps, mitreCoverage, blockIp } = useSiem();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [blockingIp, setBlockingIp] = useState<string | null>(null);

  const onlineCount = assets.filter(a => a.status === "online").length;
  const offlineHost = assets.find(a => a.status === "offline");

  // Use real severity breakdown from backend if available, else fallback
  const sevData = dashboardSummary
    ? [
        { name: "Critical", value: dashboardSummary.critical_count || 0, color: SEV_COLOR.critical },
        { name: "High", value: dashboardSummary.high_count || 0, color: SEV_COLOR.high },
        { name: "Medium", value: dashboardSummary.security_posture?.details?.high_alerts || 0, color: SEV_COLOR.medium },
        { name: "Low", value: 0, color: SEV_COLOR.low },
        { name: "Info", value: 0, color: SEV_COLOR.info },
      ]
    : [
        { name: "Critical", value: 14, color: SEV_COLOR.critical },
        { name: "High", value: 38, color: SEV_COLOR.high },
        { name: "Medium", value: 92, color: SEV_COLOR.medium },
        { name: "Low", value: 142, color: SEV_COLOR.low },
        { name: "Info", value: 220, color: SEV_COLOR.info },
      ];
  const totalAlerts = sevData.reduce((s,d) => s+d.value, 0) || 1;

  // Use real top threats as attack type breakdown if available
  const attackTypes = dashboardSummary?.top_threats?.length
    ? dashboardSummary.top_threats.slice(0, 5).map(t => ({ name: t.rule_name || "Unknown", count: Math.round(t.urgency_score * 10) }))
    : [
        { name: "Brute Force", count: 412 },
        { name: "SQL Injection", count: 287 },
        { name: "Port Scan", count: 198 },
        { name: "DDoS", count: 124 },
        { name: "Lateral Movement", count: 76 },
      ];

  // Real events-per-hour timeline if available
  const realTimeline = dashboardSummary?.events_per_hour?.length
    ? dashboardSummary.events_per_hour.map(e => ({
        time: e.hour.slice(-5),
        auth: Math.round(e.count * 0.4),
        net: Math.round(e.count * 0.35),
        edr: Math.round(e.count * 0.25),
      }))
    : timeline;

  const sparkData = useMemo(() => Array.from({length: 20}, (_, i) => ({ v: 50 + Math.sin(i/2) * 20 + Math.random()*30 })), []);

  return (
    <div className="p-5 space-y-5">
      {/* Backend status indicator */}
      {apiError && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-warning/40 bg-warning/10 text-warning text-[11px] font-mono">
          <WifiOff className="w-3 h-3" /> Simulation mode — backend offline ({apiError})
        </div>
      )}
      {!apiError && dashboardSummary && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-success/40 bg-success/10 text-success text-[11px] font-mono">
          <Wifi className="w-3 h-3" /> Live data — connected to SecureWatch backend
        </div>
      )}

      {/* KPI ribbon */}
      <div className="grid grid-cols-6 gap-3">
        <KpiCard
          icon={Activity} label="Total Events (24h)"
          value={kpis.totalEvents.toLocaleString()}
          delta={+8.4}
          sparkline={sparkData}
        />
        <KpiCard
          icon={AlertOctagon} label="Active Alerts"
          value={(kpis.critical + kpis.high + kpis.medium).toString()}
          breakdown={
            <div className="flex gap-3 text-[10px] font-mono mt-1">
              <span className="text-sev-critical">C {kpis.critical}</span>
              <span className="text-sev-high">H {kpis.high}</span>
              <span className="text-sev-medium">M {kpis.medium}</span>
            </div>
          }
        />
        <KpiCard
          icon={AlertOctagon} label="Open Incidents"
          value={incidents.filter(i => i.status !== "Resolved").length.toString()}
          breakdown={<div className="text-[10px] font-mono text-warning mt-1">{assets.filter(a => a.status === "compromised" || a.status === "quarantined").length} assets at risk</div>}
        />
        <KpiCard
          icon={ShieldCheck} label="Security Posture"
          value={dashboardSummary ? `${dashboardSummary.security_posture.score}/100` : `${kpis.blocked.toLocaleString()}`}
          breakdown={<div className="text-[10px] font-mono text-success mt-1">{dashboardSummary ? dashboardSummary.security_posture.status : "✓ all neutralized"}</div>}
        />
        <KpiCard
          icon={Server} label="Endpoints Online"
          value={`${onlineCount} / ${assets.length}`}
          breakdown={offlineHost ? <div className="text-[10px] font-mono text-danger mt-1 truncate">⚠ {offlineHost.hostname}</div> : null}
        />
        <KpiCard
          icon={Clock} label="MTTD"
          value={`${typeof kpis.mttd === 'number' ? kpis.mttd.toFixed(1) : kpis.mttd}m`}
          delta={-12.1}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-10 gap-4">
        <div className="col-span-6 siem-card p-4">
          <PanelHeader title="Event Volume Timeline" subtitle="Last 24 hours" />
          <div className="h-[260px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realTimeline}>
                <defs>
                  <linearGradient id="g-auth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(190 100% 50%)" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="hsl(190 100% 50%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="g-net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(170 100% 45%)" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="hsl(170 100% 45%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="g-edr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(270 80% 65%)" stopOpacity={0.7}/>
                    <stop offset="100%" stopColor="hsl(270 80% 65%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                  labelStyle={{ color: "hsl(var(--primary))" }}
                />
                <Area type="monotone" dataKey="auth" name="Auth" stackId="1" stroke="hsl(190 100% 50%)" fill="url(#g-auth)" />
                <Area type="monotone" dataKey="net"  name="Network" stackId="1" stroke="hsl(170 100% 45%)" fill="url(#g-net)" />
                <Area type="monotone" dataKey="edr"  name="Endpoint" stackId="1" stroke="hsl(270 80% 65%)" fill="url(#g-edr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground mt-2">
            <Legend dot="hsl(190 100% 50%)" label="Authentication" />
            <Legend dot="hsl(170 100% 45%)" label="Network" />
            <Legend dot="hsl(270 80% 65%)" label="Endpoint" />
            <span className="ml-auto flex items-center gap-1 text-danger">▲ ATTACK DETECTED at 06:00, 12:00, 18:00</span>
          </div>
        </div>

        <div className="col-span-4 siem-card p-4 flex flex-col">
          <PanelHeader title="Threat Severity Breakdown" subtitle="Distribution" />
          <div className="relative h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sevData} dataKey="value" innerRadius={50} outerRadius={75} stroke="hsl(var(--background))" strokeWidth={2}>
                  {sevData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-2xl font-mono font-semibold text-primary glow-text-primary">{totalAlerts}</div>
              <div className="text-[10px] font-mono text-muted-foreground">Total Alerts</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono mt-1">
            {sevData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto text-foreground">{d.value} <span className="text-muted-foreground">({Math.round(d.value/totalAlerts*100)}%)</span></span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Top Attack Types</div>
            <div className="h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attackTypes} layout="vertical" margin={{ left: 0, right: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} width={92} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} cursor={{ fill: "hsl(var(--surface-2))" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-4">
        {/* Live alert feed */}
        <div className="col-span-4 siem-card p-4 flex flex-col max-h-[520px]">
          <PanelHeader title="Live Alert Feed" subtitle="Real-time" right={<span className="live-dot" />} />
          <div className="mt-3 space-y-1.5 overflow-auto pr-1 flex-1">
            {alerts.slice(0, 20).map((a, i) => (
              <div key={a.id} className={cn(
                "relative pl-3 pr-2 py-2 rounded bg-surface-2 border border-border hover:border-primary/30 transition cursor-pointer",
                i === 0 && "animate-slide-in-top"
              )} onClick={() => setExpanded(expanded === a.id ? null : a.id)}>
                <SeverityBar severity={a.severity} />
                <div className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="text-[9px] font-mono text-muted-foreground">{relTime(a.ts)}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-muted-foreground">
                  <span className="truncate">{a.src}</span>
                  <span>→</span>
                  <span className="truncate">{a.dst}</span>
                  <StatusBadge status={a.status} className="ml-auto" />
                </div>
                {expanded === a.id && (
                  <div className="mt-2 pt-2 border-t border-border space-y-1.5 animate-fade-in">
                    <div className="text-[10px]"><span className="text-muted-foreground">Rule:</span> <span className="text-primary">{a.rule}</span></div>
                    <div className="text-[10px] font-mono bg-background p-2 rounded border border-border break-all max-h-24 overflow-auto">{a.rawLog}</div>
                    <div className="text-[10px]"><span className="text-muted-foreground">Recommendation:</span> {a.recommendation}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="mt-2 text-[11px] font-mono text-primary hover:underline">View All Incidents →</button>
        </div>

        {/* MITRE heatmap — triggered cells from live sandbox data */}
        <div className="col-span-5 siem-card p-4">
          <PanelHeader title="MITRE ATT&CK Coverage" subtitle={`${Object.keys(mitreCoverage).length} tactics observed live`} right={Object.keys(mitreCoverage).length > 0 ? <span className="live-dot" /> : undefined} />
          <div className="mt-3 overflow-auto">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${MITRE_TACTICS.length}, minmax(60px, 1fr))` }}>
              {MITRE_TACTICS.map(t => (
                <div key={t} className="text-[8px] font-mono text-muted-foreground uppercase tracking-tight text-center px-0.5 leading-tight h-8 flex items-end justify-center pb-1 border-b border-border">
                  {t}
                </div>
              ))}
              {Array.from({ length: 6 }).map((_, row) => (
                MITRE_TACTICS.map(t => {
                  const cell = MITRE_TECHNIQUES[t][row];
                  if (!cell) return <div key={`${t}-${row}`} className="h-7" />;
                  // Check if this tactic has been triggered by live sandbox data
                  const isLiveTriggered = mitreCoverage[t] > 0;
                  const isCellTriggered = cell.status === "triggered" || isLiveTriggered;
                  const cls = isCellTriggered
                    ? "bg-danger/30 border-danger/60 hover:bg-danger/50 animate-pulse-once"
                    : cell.status === "covered"
                    ? "bg-primary/15 border-primary/30 hover:bg-primary/30"
                    : "bg-surface-2 border-border hover:bg-border-strong";
                  return (
                    <div
                      key={`${t}-${row}`}
                      className={cn("h-7 rounded-sm border cursor-pointer transition relative group", cls)}
                      title={`${cell.id} • ${cell.name}${isLiveTriggered ? ` — ${mitreCoverage[t]} live hits` : ""}`}
                    >
                      <div className="absolute z-20 hidden group-hover:block bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover border border-border rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap shadow-xl">
                        <div className="text-primary">{cell.id}</div>
                        <div>{cell.name}</div>
                        <div className="text-muted-foreground">Status: {isCellTriggered ? "triggered" : cell.status}</div>
                        {isLiveTriggered && <div className="text-danger font-semibold">{mitreCoverage[t]} live sandbox hits</div>}
                      </div>
                    </div>
                  );
                })
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground mt-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/40 border border-primary/60" /> Covered</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-danger/40 border border-danger/60" /> Triggered (live)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-surface-2 border border-border" /> Not Covered</span>
          </div>
        </div>

        {/* Top suspicious IPs — LIVE from sandbox */}
        <div className="col-span-3 siem-card p-4 flex flex-col">
          <PanelHeader title="Top Suspicious IPs" subtitle={`${suspiciousIps.length} active sources`} right={<span className="live-dot" />} />
          <div className="mt-3 space-y-1.5 flex-1 overflow-auto">
            {suspiciousIps.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-8">No suspicious IPs detected yet.<br/>Trigger an attack in the sandbox.</div>
            )}
            {suspiciousIps.map(ip => (
              <div key={ip.ip} className="p-2 rounded bg-surface-2 border border-border">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-foreground">{ip.ip}</span>
                  <span className="ml-auto text-[10px]">{ip.flag}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">{ip.country} · {ip.events} events · {relTime(ip.lastSeen)}</div>
                {ip.mitre && <div className="text-[9px] font-mono text-primary mt-0.5">{ip.mitre}</div>}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded bg-background border border-border overflow-hidden">
                    <div className="h-full transition-all duration-500" style={{ width: `${ip.threat}%`, background: ip.threat > 75 ? "hsl(var(--danger))" : ip.threat > 50 ? "hsl(var(--warning))" : "hsl(var(--success))" }} />
                  </div>
                  <span className="text-[10px] font-mono w-7 text-right">{ip.threat}</span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  <button
                    disabled={ip.isBlocked || blockingIp === ip.ip}
                    onClick={() => { setBlockingIp(ip.ip); blockIp(ip.ip, ""); setTimeout(() => setBlockingIp(null), 1000); }}
                    className={cn("flex-1 text-[10px] font-mono px-2 py-1 rounded border transition flex items-center justify-center gap-1", 
                      ip.isBlocked ? "bg-muted border-border text-muted-foreground cursor-not-allowed" : "bg-danger/15 border-danger/40 text-danger hover:bg-danger/25"
                    )}
                  >
                    <Ban className="w-3 h-3" /> {ip.isBlocked ? "Blocked" : "Block"}
                  </button>
                  <button 
                    onClick={() => navigate("/incidents", { state: { search: ip.ip } })}
                    className="flex-1 text-[10px] font-mono px-2 py-1 rounded bg-primary/15 border border-primary/40 text-primary hover:bg-primary/25 transition flex items-center justify-center gap-1">
                    <Search className="w-3 h-3" /> Investigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-12 gap-4">
        {/* Active Incidents Panel */}
        <div className="col-span-5 siem-card p-4">
          <PanelHeader title="Active Incidents" subtitle="Top 5 unresolved cases" />
          <table className="w-full mt-3 text-xs">
            <thead>
              <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left py-2 font-medium">Incident</th>
                <th className="text-left font-medium">Severity</th>
                <th className="text-left font-medium">Assigned</th>
                <th className="text-left font-medium">MITRE</th>
                <th className="text-right font-medium">Elapsed</th>
              </tr>
            </thead>
            <tbody>
            {/* Active Incidents — from live sandbox incidents context */}
            {incidents.filter(i => i.status !== "Resolved").slice(0, 5).map((inc, idx) => (
              <tr key={inc.id} className="border-b border-border/50 hover:bg-surface-2 transition cursor-pointer">
                <td className="py-2">
                  <div className="font-mono text-primary text-[10px]">{inc.id.slice(0, 14)}</div>
                  <div className="truncate max-w-[140px]" title={inc.title}>{inc.title}</div>
                </td>
                <td><SeverityPill severity={inc.severity} /></td>
                <td className="text-muted-foreground text-[11px]">{idx === 0 ? "Jesal Pavaskar" : idx === 1 ? "Samruddhi Rao" : "Unassigned"}</td>
                <td>
                  <span className="px-1.5 py-0.5 rounded border border-border bg-background text-[9px] font-mono">{inc.mitreTechnique}</span>
                </td>
                <td className="text-right text-[10px] font-mono text-danger">{relTime(inc.created)}</td>
              </tr>
            ))}
            {incidents.filter(i => i.status !== "Resolved").length === 0 && alerts.filter(a => a.status !== "Resolved").slice(0, 5).map((a, i) => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-surface-2 transition cursor-pointer">
                <td className="py-2">
                  <div className="font-mono text-primary text-[10px]">{a.id.slice(0,12)}</div>
                  <div className="truncate max-w-[140px]" title={a.title}>{a.title}</div>
                </td>
                <td><SeverityPill severity={a.severity} /></td>
                <td className="text-muted-foreground text-[11px]">{i === 0 ? "Jesal Pavaskar" : i === 1 ? "Samruddhi Rao" : "Unassigned"}</td>
                <td><span className="px-1.5 py-0.5 rounded border border-border bg-background text-[9px] font-mono">{a.rule.substring(0, 15)}</span></td>
                <td className="text-right text-[10px] font-mono text-danger">{relTime(a.ts)}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* Analyst Workload Panel */}
        <div className="col-span-3 siem-card p-4 flex flex-col">
          <PanelHeader title="Analyst Workload" subtitle="Current shift status" />
          <div className="mt-3 space-y-3 flex-1 overflow-auto">
            {[
              { name: "Jesal Pavaskar", cases: 3, status: "Available", color: "success" },
              { name: "Samruddhi Rao", cases: 5, status: "Busy", color: "warning" },
              { name: "Arjuna Patel", cases: 2, status: "Available", color: "success" },
              { name: "Nikhita Sharma", cases: 0, status: "Offline", color: "muted" },
              { name: "Harsh Mehta", cases: 4, status: "Busy", color: "warning" },
            ].map(user => (
              <div key={user.name} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded bg-surface-2 border border-border flex items-center justify-center font-semibold text-primary text-xs">{user.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div className={cn("absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card", 
                    user.color === "success" ? "bg-success" : user.color === "warning" ? "bg-warning" : "bg-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{user.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">{user.status}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-mono font-semibold">{user.cases}</div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">Cases</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Geographic Threat Activity widget (live mini map placeholder) */}
        <div className="col-span-4 siem-card p-4 flex flex-col">
          <PanelHeader title="Geographic Threat Activity" subtitle="Live originating regions" />
          <div className="flex-1 mt-3 relative bg-surface-2 border border-border rounded overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)', backgroundSize: '100% 100%' }} />
             <div className="text-center z-10">
               <Globe className="w-8 h-8 text-primary/50 mx-auto mb-2 animate-pulse" />
               <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Threat Map Live Stream</div>
               <div className="flex flex-wrap gap-1 justify-center mt-3">
                 {["US: 42%", "RU: 28%", "CN: 15%", "UNKNOWN: 15%"].map(c => (
                   <span key={c} className="px-2 py-0.5 rounded border border-border bg-background text-[9px] font-mono">{c}</span>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-[13px] font-semibold tracking-wide">{title}</h3>
        {subtitle && <p className="text-[10px] font-mono text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, delta, breakdown, sparkline,
}: { icon: React.ElementType; label: string; value: string; delta?: number; breakdown?: React.ReactNode; sparkline?: { v: number }[] }) {
  return (
    <div className="siem-card p-3.5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-2xl font-mono font-semibold text-foreground glow-text-primary">{value}</div>
        {sparkline && (
          <div className="w-20 h-8">
            <ResponsiveContainer><LineChart data={sparkline}>
              <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
            </LineChart></ResponsiveContainer>
          </div>
        )}
      </div>
      {delta !== undefined && (
        <div className={cn("mt-1 text-[10px] font-mono flex items-center gap-1", delta >= 0 ? "text-success" : "text-danger")}>
          {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(delta)}% vs prev
        </div>
      )}
      {breakdown}
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ background: dot }} /> {label}</span>;
}

function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cls = status === "New" ? "bg-danger/15 text-danger border-danger/40"
    : status === "Investigating" ? "bg-warning/15 text-warning border-warning/40"
    : "bg-success/15 text-success border-success/40";
  return <span className={cn("px-1.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider", cls, className)}>{status}</span>;
}

function RiskPill({ risk }: { risk: "low"|"medium"|"high"|"critical" }) {
  const cls = risk === "critical" ? "bg-danger/15 text-danger border-danger/40 animate-glow-danger"
    : risk === "high" ? "bg-danger/15 text-danger border-danger/40"
    : risk === "medium" ? "bg-warning/15 text-warning border-warning/40"
    : "bg-success/15 text-success border-success/40";
  return <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider", cls)}>{risk}</span>;
}
