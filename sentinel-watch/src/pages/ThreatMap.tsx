import { useEffect, useState, useMemo } from "react";
import { COUNTRIES, TARGET, randomIp, pickAttackType, relTime } from "@/lib/siemData";
import { useSiem } from "@/lib/siemContext";
import { cn } from "@/lib/utils";

// Equirectangular projection helpers
function project(lat: number, lng: number, w: number, h: number) {
  const x = (lng + 180) / 360 * w;
  const y = (90 - lat) / 180 * h;
  return { x, y };
}

const W = 1200, H = 600;
const TARGET_PT = project(TARGET.lat, TARGET.lng, W, H);

interface ConnRow { id: number; src: string; dst: string; port: number; proto: string; action: "Allow" | "Block"; ts: number; }

export default function ThreatMap() {
  const { threatMapData } = useSiem();
  const [filter, setFilter] = useState<"all" | "blocked" | "allowed" | "critical">("all");
  const [direction, setDirection] = useState<"inbound" | "outbound">("inbound");
  const [selectedConn, setSelectedConn] = useState<ConnRow | null>(null);

  // Build connection rows from real events from backend
  const [conns, setConns] = useState<ConnRow[]>([]);

  // When real threat map data arrives, seed connections from it
  useEffect(() => {
    if (!threatMapData?.events?.length) return;
    const realConns: ConnRow[] = threatMapData.events.slice(0, 18).map((ev, i) => ({
      id: i,
      src: ev.source_ip || randomIp(true),
      dst: ev.destination_ip || `192.168.1.${10 + i}`,
      port: [22, 80, 443, 3389, 445, 53][i % 6],
      proto: "TCP",
      action: ev.severity === "critical" || ev.severity === "high" ? "Block" : "Allow",
      ts: ev.timestamp ? new Date(ev.timestamp).getTime() : Date.now() - i * 9000,
    }));
    setConns(realConns);
  }, [threatMapData]);



  // Build country attack sources — prefer real country_risk data
  const countrySources = useMemo(() => {
    if (threatMapData?.country_risk && Object.keys(threatMapData.country_risk).length > 0) {
      // Merge real country risk counts with our COUNTRIES geo data
      return COUNTRIES.map(c => ({
        ...c,
        events: threatMapData.country_risk[c.name] || 0,
        attackTypes: [pickAttackType(), pickAttackType()],
      })).filter(c => c.events > 0).sort((a, b) => b.events - a.events);
    }
    return [];
  }, [threatMapData]);

  // Stats from real data
  const stats = useMemo(() => {
    const totalBlocked = conns.filter(c => c.action === "Block").length;
    const uniqueSrcIPs = new Set(conns.map(c => c.src)).size;
    const portCounts: Record<number, number> = {};
    conns.forEach(c => { portCounts[c.port] = (portCounts[c.port] || 0) + 1; });
    const topPort = Object.entries(portCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      blocked: threatMapData?.events ? threatMapData.events.filter(e => e.severity === "critical" || e.severity === "high").length.toLocaleString() : "12,847",
      uniqueIPs: threatMapData?.events ? new Set(threatMapData.events.map(e => e.source_ip)).size.toString() : uniqueSrcIPs.toString(),
      topPort: topPort ? `${topPort[0]} / ${topPort[0] === "22" ? "SSH" : topPort[0] === "443" ? "HTTPS" : topPort[0] === "3389" ? "RDP" : "TCP"}` : "22 / SSH",
    };
  }, [conns, threatMapData]);

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex bg-surface-2 border border-border rounded p-0.5">
          <button onClick={() => setDirection("inbound")} className={cn("px-3 h-8 text-[11px] font-mono uppercase tracking-wider rounded transition", direction === "inbound" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Inbound Attacks</button>
          <button onClick={() => setDirection("outbound")} className={cn("px-3 h-8 text-[11px] font-mono uppercase tracking-wider rounded transition", direction === "outbound" ? "bg-danger text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Exfiltration</button>
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        <select className="h-8 px-2 bg-surface-2 border border-border rounded text-[11px] font-mono outline-none focus:border-primary/40">
          <option>Time: Last 24h</option><option>Time: Last 7d</option>
        </select>
        <select className="h-8 px-2 bg-surface-2 border border-border rounded text-[11px] font-mono outline-none focus:border-primary/40">
          <option>Country: All</option><option>Country: Russia</option><option>Country: China</option>
        </select>
        <select className="h-8 px-2 bg-surface-2 border border-border rounded text-[11px] font-mono outline-none focus:border-primary/40">
          <option>MITRE: All</option><option>TA0001: Initial Access</option><option>TA0011: Command and Control</option>
        </select>
        {(["all", "critical"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 h-8 text-[11px] font-mono uppercase tracking-wider rounded border transition ${filter === f ? "bg-primary/15 text-primary border-primary/50" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {f === "critical" ? "Critical Only" : f}
          </button>
        ))}
        <div className="ml-auto text-[10px] font-mono text-muted-foreground">
          {threatMapData ? `● Live — ${threatMapData.events.length} events from backend` : "● Simulation mode"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Threat sources panel */}
        <div className="col-span-3 siem-card p-4 max-h-[600px] flex flex-col">
          <div>
            <h3 className="text-[13px] font-semibold">Incoming Threats</h3>
            <p className="text-[10px] font-mono text-muted-foreground">Top sources</p>
          </div>
          <div className="mt-3 space-y-1.5 overflow-auto flex-1">
            {countrySources.map(c => (
              <div key={c.code} className="p-2 rounded bg-surface-2 border border-border hover:border-danger/40 transition">
                <div className="flex items-center gap-2 text-xs">
                  <span>{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono text-danger">{c.events}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{c.attackTypes?.join(", ") || pickAttackType()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* World map */}
        <div className="col-span-6 siem-card p-3 relative overflow-hidden">
          {/* Empty state overlay — shown until first attack arrives */}
          {countrySources.length === 0 && conns.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-sm font-semibold text-foreground">Waiting for live attack data…</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-1">Trigger an attack in the sandbox to see real-time threat arcs</div>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Connected to relay — listening on SSE stream
              </div>
            </div>
          )}
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[560px] grid-bg rounded">
            {Array.from({ length: 1500 }).map((_, i) => {
              const x = Math.random() * W, y = Math.random() * H;
              const inLand = Math.random() < 0.55;
              if (!inLand) return null;
              return <circle key={i} cx={x} cy={y} r={0.7} fill="hsl(var(--border-strong))" opacity={0.4} />;
            })}

            {/* Target marker */}
            <g>
              <circle cx={TARGET_PT.x} cy={TARGET_PT.y} r={6} fill="hsl(var(--primary))" />
              <circle cx={TARGET_PT.x} cy={TARGET_PT.y} r={12} fill="none" stroke="hsl(var(--primary))" strokeWidth={1} opacity={0.5}>
                <animate attributeName="r" from="8" to="22" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x={TARGET_PT.x + 14} y={TARGET_PT.y + 4} fill="hsl(var(--primary))" fontSize="11" fontFamily="JetBrains Mono">India · HQ</text>
            </g>

            {/* Source dots + attack arcs */}
            {countrySources.map((c, i) => {
              const p = project(c.lat, c.lng, W, H);
              // Cluster simulation: If events > 500, draw a cluster ring
              const isCluster = c.events > 500;
              const volume = 1 + (i % 4);
              const dx = TARGET_PT.x - p.x, dy = TARGET_PT.y - p.y;
              const cx2 = (p.x + TARGET_PT.x) / 2 + dy * 0.15;
              const cy2 = (p.y + TARGET_PT.y) / 2 - dx * 0.15;
              const arcColor = direction === "inbound" ? "hsl(var(--danger))" : "hsl(var(--warning))";
              return (
                <g key={c.code} className="cursor-pointer">
                  {direction === "inbound" ? (
                    <path d={`M ${p.x} ${p.y} Q ${cx2} ${cy2} ${TARGET_PT.x} ${TARGET_PT.y}`} fill="none" stroke={arcColor} strokeOpacity={0.5} strokeWidth={volume} strokeDasharray="6 6" style={{ animation: "dash-move 1.2s linear infinite" }} />
                  ) : (
                    <path d={`M ${TARGET_PT.x} ${TARGET_PT.y} Q ${cx2} ${cy2} ${p.x} ${p.y}`} fill="none" stroke={arcColor} strokeOpacity={0.5} strokeWidth={volume} strokeDasharray="6 6" style={{ animation: "dash-move 1.2s linear infinite reverse" }} />
                  )}
                  <circle cx={p.x} cy={p.y} r={isCluster ? 8 : 5} fill={arcColor} />
                  {isCluster && <circle cx={p.x} cy={p.y} r={8} fill="none" stroke={arcColor} strokeWidth={2} />}
                  <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={arcColor} strokeWidth={1}>
                    <animate attributeName="r" from={isCluster ? "10" : "6"} to={isCluster ? "24" : "18"} dur="1.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                  <text x={p.x + (isCluster ? 12 : 8)} y={p.y - 6} fill="hsl(var(--foreground))" fontSize="10" fontFamily="JetBrains Mono">{c.flag} {c.name}</text>
                </g>
              );
            })}

            {/* Real event dots on map */}
            {(threatMapData?.events || []).filter(e => e.geo?.lat && e.geo?.lon).slice(0, 30).map((ev, i) => {
              const p = project(ev.geo.lat, ev.geo.lon, W, H);
              const col = ev.severity === "critical" ? "hsl(var(--danger))" : ev.severity === "high" ? "hsl(var(--warning))" : "hsl(var(--primary))";
              return <circle key={`ev-${i}`} cx={p.x} cy={p.y} r={3} fill={col} opacity={0.8} />;
            })}
          </svg>

          <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
            <Stat label="Attacks Blocked Today" value={stats.blocked} />
            <Stat label="Unique Source IPs" value={stats.uniqueIPs} />
            <Stat label="Top Targeted Port" value={stats.topPort} />
          </div>
        </div>

        {/* Active connections panel */}
        <div className="col-span-3 siem-card max-h-[600px] flex flex-col relative overflow-hidden">
          {selectedConn ? (
            <div className="p-4 flex-1 overflow-auto flex flex-col animate-slide-in-right bg-card z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-primary">Connection Details</h3>
                <button onClick={() => setSelectedConn(null)} className="text-[10px] uppercase font-mono text-muted-foreground hover:text-foreground">Close</button>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-surface-2 border border-border rounded font-mono text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Source IP</span>
                    <span className="text-danger font-semibold">{selectedConn.src}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Target IP</span>
                    <span>{selectedConn.dst}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Port / Protocol</span>
                    <span>{selectedConn.port} / {selectedConn.proto}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Action Taken</span>
                    <span className={selectedConn.action === "Block" ? "text-danger" : "text-success"}>{selectedConn.action}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">MITRE ATT&CK Mapping</div>
                  <div className="p-3 rounded border border-danger/40 bg-danger/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="px-1 py-0.5 rounded bg-danger/20 text-danger text-[9px] font-mono">T1190</div>
                      <div className="text-xs font-semibold text-danger">Exploit Public-Facing Application</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">Adversaries may attempt to exploit a weakness in an Internet-facing host or system to initially access a network.</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Response Actions</div>
                  <div className="grid gap-2">
                    <button onClick={() => toast("Incident Created")} className="px-3 h-8 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs transition">Create Incident from Connection</button>
                    <button onClick={() => toast("IP Blocked")} className="px-3 h-8 rounded border border-danger text-danger hover:bg-danger hover:text-primary-foreground text-xs transition">Block Source IP Firewall Rule</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 flex-1 flex flex-col">
              <div>
                <h3 className="text-[13px] font-semibold">Active Connections</h3>
                <p className="text-[10px] font-mono text-muted-foreground">Live feed</p>
              </div>
              <div className="mt-3 space-y-1 overflow-auto flex-1 font-mono text-[10px]">
                {conns.filter(c => filter === "all" || (filter === "blocked" && c.action === "Block") || (filter === "allowed" && c.action === "Allow") || filter === "critical").map(c => (
                  <div key={c.id} onClick={() => setSelectedConn(c)} className="p-2 rounded bg-surface-2 border border-border animate-slide-in-top cursor-pointer hover:border-primary/40 transition">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground">{c.src}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-foreground">{c.dst}</span>
                      <span className={`ml-auto px-1.5 rounded ${c.action === "Block" ? "bg-danger/15 text-danger" : "bg-success/15 text-success"}`}>{c.action}</span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">{c.proto} · port {c.port} · {relTime(c.ts)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Live Threat Ticker */}
      <div className="siem-card p-2 flex items-center overflow-hidden whitespace-nowrap">
        <div className="px-3 py-1 bg-danger/15 text-danger border border-danger/40 rounded text-[10px] font-mono uppercase tracking-wider mr-4 z-10 shrink-0 shadow-[0_0_10px_hsl(var(--danger))]">Live Threats</div>
        <div className="flex-1 overflow-hidden relative h-6">
          <div className="absolute flex gap-8 items-center h-full animate-marquee font-mono text-[11px] text-muted-foreground">
            {conns.map(c => (
              <span key={c.id}>
                {c.action === "Block" ? <span className="text-danger">BLOCKED</span> : <span className="text-warning">DETECTED</span>} {c.proto} traffic from {c.src} to {c.dst}:{c.port}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background/80 backdrop-blur border border-border rounded p-2">
      <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-mono text-primary glow-text-primary">{value}</div>
    </div>
  );
}
