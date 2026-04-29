import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, LayoutDashboard, Map as MapIcon, AlertTriangle, FileSearch,
  Link as LinkIcon, Monitor, FileText, Settings, Bell, Search, LogOut,
  ChevronRight, Activity, X, Play, Bug, Globe, FileCheck, WifiOff, Wifi
} from 'lucide-react';
import { mockAssets, initialIncidents, initialRules } from './data';
import { Clock } from './components/shared';
import Dashboard from './components/Dashboard';
import ThreatMap from './components/ThreatMap';
import Incidents from './components/Incidents';
import LogExplorer from './components/LogExplorer';
import CorrelationRules from './components/CorrelationRules';
import Assets from './components/Assets';
import Playbooks from './components/Playbooks';
import Reports from './components/Reports';
import SettingsPage from './components/SettingsPage';
import Vulnerabilities from './components/Vulnerabilities';
import FileIntegrity from './components/FileIntegrity';
import ThreatIntel from './components/ThreatIntel';

const RELAY_BASE   = 'http://localhost:4000';
const RELAY_STREAM = `${RELAY_BASE}/api/logs/stream`;
const RELAY_CLEAR  = `${RELAY_BASE}/api/logs`;

const NAV_ITEMS = [
  { id: 'dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'map',             icon: MapIcon,         label: 'Threat Map' },
  { id: 'incidents',       icon: AlertTriangle,   label: 'Incidents' },
  { id: 'explorer',        icon: FileSearch,      label: 'Log Explorer' },
  { id: 'rules',           icon: LinkIcon,        label: 'Correlation Rules' },
  { id: 'assets',          icon: Monitor,         label: 'Endpoints' },
  { id: 'vulnerabilities', icon: Bug,             label: 'Vulnerabilities' },
  { id: 'fim',             icon: FileCheck,       label: 'File Integrity' },
  { id: 'threatintel',     icon: Globe,           label: 'Threat Intel' },
  { id: 'playbooks',       icon: Play,            label: 'Playbooks' },
  { id: 'reports',         icon: FileText,        label: 'Reports' },
  { id: 'settings',        icon: Settings,        label: 'Settings' },
];

export default function App() {
  const [activePage,       setActivePage]       = useState('dashboard');
  const [sidebarExpanded,  setSidebarExpanded]  = useState(false);
  const [currentTime,      setCurrentTime]      = useState(new Date());
  const [logs,             setLogs]             = useState([]);
  const [alerts,           setAlerts]           = useState([]);
  const [assets,           setAssets]           = useState(mockAssets);
  const [kpiEvents,        setKpiEvents]        = useState(0);
  const [blockedCount,     setBlockedCount]     = useState(0);
  const [eps,              setEps]              = useState(0);
  const [toasts,           setToasts]           = useState([]);
  const [showSearchModal,  setShowSearchModal]  = useState(false);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [relayConnected,   setRelayConnected]   = useState(false);
  const [incidents,        setIncidents]        = useState(initialIncidents);
  const [rules,            setRules]            = useState(initialRules);
  const [explorerQuery,    setExplorerQuery]    = useState('severity:"critical" | last 1h');

  const epsBuffer  = useRef([]);
  const cursorRef  = useRef(0);
  const esRef      = useRef(null);

  // ── Toast helper ────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7000);
  }, []);

  // ── Clock ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // ── EPS counter ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      epsBuffer.current = epsBuffer.current.filter(t => now - t < 5000);
      setEps(Math.round(epsBuffer.current.length / 5));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  // ── Keyboard shortcuts ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearchModal(true); }
      if (e.key === 'Escape') { setShowSearchModal(false); setNotifOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Ingest a single log entry from relay ────────────────────────────────────
  const ingestLog = useCallback((entry) => {
    // Skip clear signals
    if (entry.__clear) {
      setLogs([]);
      setAlerts([]);
      setKpiEvents(0);
      setBlockedCount(0);
      epsBuffer.current = [];
      return;
    }

    // Track cursor
    if (entry.cursor > cursorRef.current) cursorRef.current = entry.cursor;

    epsBuffer.current.push(Date.now());
    setKpiEvents(prev => prev + 1);

    if (entry.action === 'Blocked') setBlockedCount(prev => prev + 1);

    setLogs(prev => [entry, ...prev].slice(0, 2000));

    if (['critical', 'high'].includes(entry.severity)) {
      setAlerts(prev => [entry, ...prev].slice(0, 300));

      // Toast for attack events
      if (entry.severity === 'critical') {
        addToast(`🔴 CRITICAL: ${entry.message}`, 'critical');
      }

      // Update matching asset status
      setAssets(prev => prev.map(a => {
        if (a.ip === entry.sourceIp || a.hostname === entry.sourceHost) {
          return { ...a, status: 'compromised', openAlerts: (a.openAlerts || 0) + 1 };
        }
        return a;
      }));
      
      // Auto-generate or update Incident
      setIncidents(prev => {
        // Try to find an existing active incident for this category/host
        const existingIdx = prev.findIndex(i => i.status !== 'Resolved' && i.assets.includes(entry.sourceHost));
        if (existingIdx >= 0) {
          const updated = [...prev];
          const inc = { ...updated[existingIdx] };
          inc.updated = 'Just now';
          if (entry.mitre && !inc.mitre.includes(entry.mitre)) inc.mitre.push(entry.mitre);
          updated[existingIdx] = inc;
          return updated;
        } else {
          // Create new incident
          const id = `INC-${new Date().getFullYear()}-${String(prev.length + 1).padStart(3, '0')}`;
          const newInc = {
            id,
            title: `Automated Detection: ${entry.category || entry.eventType}`,
            severity: entry.severity,
            status: 'New',
            assigned: 'Unassigned',
            assets: [entry.sourceHost || entry.sourceIp],
            created: 'Just now',
            updated: 'Just now',
            description: `Auto-generated incident based on alert: ${entry.message}`,
            mitre: entry.mitre ? [entry.mitre] : [],
            tlp: entry.severity === 'critical' ? 'RED' : 'AMBER'
          };
          addToast(`New Incident Created: ${id}`, 'warning');
          return [newInc, ...prev];
        }
      });
    }

    // Trigger Correlation Rules
    if (entry.mitre) {
      setRules(prev => prev.map(r => {
        if (r.mitre === entry.mitre && r.enabled) {
          return { ...r, triggerCount: r.triggerCount + 1, lastTriggered: 'Just now' };
        }
        return r;
      }));
    }
  }, [addToast]);

  // ── SSE connection to relay ──────────────────────────────────────────────────
  useEffect(() => {
    let reconnectTimer = null;

    function connect() {
      const url = `${RELAY_STREAM}?since=${cursorRef.current}`;
      const es  = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setRelayConnected(true);
        addToast('✅ Connected to Attack Sandbox relay', 'success');
      };

      es.onmessage = (e) => {
        try {
          const entry = JSON.parse(e.data);
          ingestLog(entry);
        } catch (_) { /* ignore malformed */ }
      };

      es.onerror = () => {
        es.close();
        setRelayConnected(false);
        // Retry in 3 s
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      if (esRef.current) esRef.current.close();
      if (reconnectTimer)  clearTimeout(reconnectTimer);
    };
  }, [ingestLog, addToast]);

  // ── Clear all sandbox data ───────────────────────────────────────────────────
  const clearAll = useCallback(async () => {
    await fetch(RELAY_CLEAR, { method: 'DELETE' }).catch(() => {});
    setLogs([]);
    setAlerts([]);
    setKpiEvents(0);
    setBlockedCount(0);
    epsBuffer.current = [];
    cursorRef.current = 0;
    setAssets(mockAssets);
    addToast('Log store cleared', 'info');
  }, [addToast]);

  // ── Page renderer ────────────────────────────────────────────────────────────
  const renderPage = () => {
    const props = { addToast };
    switch (activePage) {
      case 'dashboard':       return <Dashboard kpiEvents={kpiEvents} alerts={alerts} assets={assets} eps={eps} blockedCount={blockedCount} setActivePage={setActivePage} logs={logs} incidents={incidents} onMitreClick={(tag) => { setExplorerQuery(`mitre:"${tag}"`); setActivePage('explorer'); }} />;
      case 'map':             return <ThreatMap />;
      case 'incidents':       return <Incidents {...props} logs={logs} incidents={incidents} setIncidents={setIncidents} />;
      case 'explorer':        return <LogExplorer logs={logs} queryState={[explorerQuery, setExplorerQuery]} />;
      case 'rules':           return <CorrelationRules {...props} rules={rules} setRules={setRules} />;
      case 'assets':          return <Assets assets={assets} setAssets={setAssets} {...props} />;
      case 'vulnerabilities': return <Vulnerabilities {...props} />;
      case 'fim':             return <FileIntegrity {...props} />;
      case 'threatintel':     return <ThreatIntel {...props} />;
      case 'playbooks':       return <Playbooks {...props} />;
      case 'reports':         return <Reports {...props} />;
      case 'settings':        return <SettingsPage {...props} onClearLogs={clearAll} />;
      default:                return <Dashboard kpiEvents={kpiEvents} alerts={alerts} assets={assets} eps={eps} blockedCount={blockedCount} setActivePage={setActivePage} />;
    }
  };

  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const searchResults = {
    assets:    assets.filter(a => a.hostname.toLowerCase().includes(searchQuery.toLowerCase()) || a.ip.includes(searchQuery)),
    incidents: initialIncidents.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())),
    logs:      logs.filter(l => l.message?.toLowerCase().includes(searchQuery.toLowerCase()) || l.sourceHost?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5),
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-[#e8eaed] overflow-hidden font-sans">

      {/* ── SIDEBAR WRAPPER (Fixed Width Spacer) ───────────────────────────── */}
      <div className="w-[60px] flex-shrink-0 relative z-50">
        <nav
          className={`absolute top-0 left-0 h-full flex flex-col bg-[#0d1117] border-r border-[#30363d] transition-all duration-300 ${sidebarExpanded ? 'w-[220px] shadow-2xl' : 'w-[60px]'}`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="h-14 flex items-center px-4 border-b border-[#30363d] overflow-hidden whitespace-nowrap flex-shrink-0">
          <Shield className="text-[#00d4ff] flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]" size={22} />
          <div className={`ml-3 font-mono font-bold text-base text-[#00d4ff] transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
            SENTRY <span className="text-white text-[10px] bg-[#1e2535] px-1.5 py-0.5 rounded ml-1">v3.0</span>
          </div>
        </div>

        <div className="flex-1 py-3 flex flex-col space-y-0.5 px-2 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center px-2 py-2 rounded-md transition-all whitespace-nowrap text-left ${
                activePage === item.id
                  ? 'bg-[#1e2535] text-[#00d4ff] border-l-2 border-[#00d4ff]'
                  : 'text-[#8b949e] hover:bg-[#111111] hover:text-[#e8eaed] border-l-2 border-transparent'
              }`}
            >
              <item.icon size={18} className={activePage === item.id ? 'drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]' : ''} />
              <span className={`ml-3 text-xs font-medium transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-[#1e2535] flex items-center overflow-hidden whitespace-nowrap flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">JP</div>
          <div className={`ml-2.5 transition-opacity duration-300 ${sidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-[11px] font-bold text-[#e8eaed]">Jesal Pavaskar</div>
            <div className="text-[9px] text-[#00d4ff]">SOC Analyst L2</div>
          </div>
          {sidebarExpanded && <LogOut size={14} className="ml-auto text-[#8b949e] hover:text-[#ff3355] cursor-pointer flex-shrink-0 transition-colors" />}
        </div>
        </nav>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <header className="h-14 border-b border-[#1e2535] bg-[#080808]/90 backdrop-blur flex items-center justify-between px-6 flex-shrink-0 gap-4">
          <div className="flex items-center text-[#8b949e] text-xs whitespace-nowrap">
            <span>SENTRY</span>
            <ChevronRight size={12} className="mx-1" />
            <span className="text-[#e8eaed] font-bold capitalize">{NAV_ITEMS.find(n => n.id === activePage)?.label}</span>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-4 relative" onClick={() => setShowSearchModal(true)}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <div className="w-full bg-[#111111] border border-[#1e2535] hover:border-[#00d4ff]/50 rounded-md py-1.5 pl-9 pr-4 text-xs text-[#8b949e] cursor-pointer transition-colors font-mono">
              Search logs, IPs, hostnames... <span className="text-[#4a5568] text-[10px]">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Relay status */}
            <div className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded border ${relayConnected ? 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10' : 'text-[#ff3355] border-[#ff3355]/30 bg-[#ff3355]/10 animate-pulse'}`}>
              {relayConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
              {relayConnected ? 'SANDBOX LIVE' : 'RELAY OFFLINE'}
            </div>

            <div className="text-[10px] font-mono text-[#8b949e] flex items-center gap-1 whitespace-nowrap">
              <Clock size={12} />{currentTime.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </div>

            {/* Notification bell */}
            <div className="relative cursor-pointer" onClick={() => setNotifOpen(v => !v)}>
              <Bell size={18} className="text-[#8b949e] hover:text-[#e8eaed] transition-colors" />
              {critCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ff3355] rounded-full border-2 border-[#080808] text-[7px] font-bold text-white flex items-center justify-center">
                  {Math.min(critCount, 9)}
                </span>
              )}
              {notifOpen && (
                <div className="absolute right-0 top-8 w-72 bg-[#111111] border border-[#1e2535] rounded-lg shadow-2xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="p-3 border-b border-[#1e2535] flex justify-between items-center">
                    <span className="text-xs font-bold">Sandbox Alerts</span>
                    <button onClick={() => setNotifOpen(false)}><X size={12} className="text-[#8b949e]" /></button>
                  </div>
                  {alerts.length === 0 ? (
                    <div className="p-6 text-center text-[#8b949e] text-xs">No alerts yet. Trigger an attack in the sandbox.</div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-[#1e2535]">
                      {alerts.slice(0, 8).map(a => (
                        <div key={a.id} className="p-3 hover:bg-[#0a0a0a] cursor-pointer" onClick={() => { setActivePage('incidents'); setNotifOpen(false); }}>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] text-[#e8eaed] font-medium leading-tight truncate max-w-[200px]">{a.message}</span>
                            <span className="text-[8px] ml-2 font-bold" style={{ color: a.severity === 'critical' ? '#ff3355' : '#ffaa00' }}>{a.severity?.toUpperCase()}</span>
                          </div>
                          <div className="text-[9px] text-[#8b949e] mt-0.5 font-mono">{a.sourceHost} → {a.destIp}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="p-2 border-t border-[#1e2535]">
                    <button onClick={() => { setActivePage('explorer'); setNotifOpen(false); }} className="w-full text-[10px] text-[#00d4ff] hover:text-[#e8eaed] transition-colors">
                      View all logs in Log Explorer →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 bg-[#111111] px-2 py-1 rounded border border-[#1e2535]">
              <span className="relative flex h-1.5 w-1.5">
                {relayConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${relayConnected ? 'bg-[#00ff88]' : 'bg-[#555]'}`}></span>
              </span>
              <span className={`text-[9px] font-bold tracking-wider ${relayConnected ? 'text-[#00ff88]' : 'text-[#555]'}`}>LIVE</span>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-smooth">
          {renderPage()}
        </main>

        {/* STATUS BAR */}
        <footer className="h-7 border-t border-[#1e2535] bg-[#080808] flex items-center justify-between px-4 text-[9px] text-[#8b949e] flex-shrink-0 font-mono">
          <div className="flex gap-5">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${relayConnected ? 'bg-[#00ff88]' : 'bg-[#ff3355]'}`}></span>
              Relay: {relayConnected ? 'Connected' : 'Offline'}
            </span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full"></span>Agents: {assets.filter(a => a.status !== 'offline').length}/{assets.length}</span>
            <span>Source: Attack Sandbox (localhost:4000)</span>
          </div>
          <div className="flex items-center gap-1 text-[#00d4ff] font-bold">
            <Activity size={10} /> {eps} EPS
          </div>
          <div className="flex gap-4">
            <span>Logs: {logs.length.toLocaleString()}</span>
            <span>Alerts: {alerts.length}</span>
            <span>Blocked: {blockedCount}</span>
          </div>
        </footer>
      </div>

      {/* ── TOASTS ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-10 right-4 flex flex-col gap-2 z-[200]">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center w-80 p-3 rounded-md border backdrop-blur animate-slide-down text-sm ${
            toast.type === 'critical' ? 'bg-[#ff3355]/10 border-[#ff3355]/50 text-[#ff3355]' :
            toast.type === 'warning'  ? 'bg-[#ffaa00]/10 border-[#ffaa00]/50 text-[#ffaa00]' :
            toast.type === 'success'  ? 'bg-[#00ff88]/10 border-[#00ff88]/50 text-[#00ff88]' :
                                        'bg-[#00d4ff]/10 border-[#00d4ff]/50 text-[#00d4ff]'
          }`}>
            <div className="flex-1 text-xs font-medium">{toast.message}</div>
            <X size={12} className="cursor-pointer opacity-70 hover:opacity-100 flex-shrink-0"
              onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} />
          </div>
        ))}
      </div>

      {/* ── GLOBAL SEARCH MODAL ─────────────────────────────────────────────── */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/80 backdrop-blur z-[100] flex justify-center pt-28 px-4"
          onClick={() => setShowSearchModal(false)}>
          <div className="w-full max-w-2xl bg-[#111111] border border-[#1e2535] rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[60vh] animate-slide-down"
            onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[#1e2535] flex items-center gap-3">
              <Search size={18} className="text-[#00d4ff] flex-shrink-0" />
              <input autoFocus type="text" placeholder="Search endpoints, logs, IPs..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[#e8eaed] text-base font-mono focus:outline-none placeholder-[#8b949e]" />
              <span className="text-[9px] text-[#8b949e] border border-[#1e2535] px-1.5 py-0.5 rounded font-mono">ESC</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {!searchQuery ? (
                <div className="p-8 text-center text-[#8b949e] text-sm">
                  Search across live sandbox data.
                  <div className="text-xs opacity-50 mt-2">Try: 10.0.0.1, Karan, BRUTE_FORCE, RANSOMWARE</div>
                </div>
              ) : (
                <>
                  {searchResults.assets.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-[#8b949e] uppercase mb-1.5">Endpoints</h4>
                      {searchResults.assets.map(a => (
                        <div key={a.id} className="p-2.5 hover:bg-[#1e2535] rounded cursor-pointer flex justify-between"
                          onClick={() => { setActivePage('assets'); setShowSearchModal(false); }}>
                          <span className="text-sm">{a.hostname}</span>
                          <span className="text-[10px] font-mono text-[#8b949e]">{a.ip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.logs.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-[#8b949e] uppercase mb-1.5">Live Logs</h4>
                      {searchResults.logs.map(l => (
                        <div key={l.id} className="p-2.5 hover:bg-[#1e2535] rounded cursor-pointer"
                          onClick={() => { setActivePage('explorer'); setShowSearchModal(false); }}>
                          <div className="text-xs text-[#e8eaed] truncate">{l.message}</div>
                          <div className="text-[9px] text-[#8b949e] font-mono mt-0.5">{l.sourceHost} • {l.category}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!searchResults.assets.length && !searchResults.logs.length && (
                    <div className="p-8 text-center text-[#8b949e] text-sm">No results for "{searchQuery}"</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
