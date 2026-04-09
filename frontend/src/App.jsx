import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Shield, Activity, Users, Settings as SettingsIcon, Crosshair, AlertOctagon, Globe, Monitor, FileSearch, Bug, ClipboardList, BookOpen, Terminal, FileText } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AlertConsole from './pages/AlertConsole';
import ActiveResponse from './pages/ActiveResponse';
import AssetInventory from './pages/AssetInventory';
import Settings from './pages/Settings';
import ThreatIntel from './pages/ThreatIntel';
import AgentManagement from './pages/AgentManagement';
import FileIntegrityMonitor from './pages/FileIntegrityMonitor';
import VulnerabilityManagement from './pages/VulnerabilityManagement';
import ConfigurationAssessment from './pages/ConfigurationAssessment';
import ComplianceCenter from './pages/ComplianceCenter';
import ThreatHunting from './pages/ThreatHunting';
import Reports from './pages/Reports';
import HealthBar from './components/HealthBar';

function App() {
  const [alerts, setAlerts] = useState([]);
  
  // Singleton WebSocket connection handling
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/api/alerts/ws');
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_alert') {
          setAlerts((prev) => [msg.data, ...prev].slice(0, 500)); // KEEP last 500 alerts in memory
        }
      } catch (e) {
        // Ignore non-JSON messages (e.g. 'pong' responses)
      }
    };
    
    ws.onerror = (err) => {
      console.warn('[SecureWatch] WebSocket connection failed - live alerts unavailable. Ensure backend is running.');
    };
    
    // Keepalive
    const interval = setInterval(() => { if(ws.readyState === 1) ws.send('ping'); }, 20000);
    return () => { clearInterval(interval); ws.close(); };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-siembg">
      <HealthBar />
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <nav className="w-64 bg-siempanel border-r border-slate-800 flex flex-col p-4 space-y-6 flex-shrink-0">
        <div className="flex items-center space-x-3 text-white px-2">
          <Shield className="text-siemaccent" size={32} />
          <h1 className="text-2xl font-bold tracking-widest font-mono">SecureWatch</h1>
        </div>
        
        <div className="flex flex-col space-y-2 text-sm font-semibold mt-8">
          <Link to="/" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-siemaccent transition-colors">
            <Activity size={18} /><span>Overview</span>
          </Link>
          <Link to="/alerts" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-siemdanger transition-colors justify-between">
            <div className="flex items-center space-x-3">
              <AlertOctagon size={18} /><span>Alerts Console</span>
            </div>
          </Link>
          <Link to="/response" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-siemwarn transition-colors">
            <Crosshair size={18} /><span>Active Response</span>
          </Link>
          <Link to="/threat-intel" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-cyan-400 transition-colors">
            <Globe size={18} /><span>Threat Intelligence</span>
          </Link>
          <Link to="/agents" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-siemaccent transition-colors">
            <Monitor size={18} /><span>Agents</span>
          </Link>
          <Link to="/fim" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-amber-400 transition-colors">
            <FileSearch size={18} /><span>File Integrity</span>
          </Link>
          <Link to="/vulnerabilities" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-rose-400 transition-colors">
            <Bug size={18} /><span>Vulnerabilities</span>
          </Link>
          <Link to="/sca" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-emerald-400 transition-colors">
            <ClipboardList size={18} /><span>Configuration</span>
          </Link>
          <Link to="/compliance" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-indigo-400 transition-colors">
            <BookOpen size={18} /><span>Compliance</span>
          </Link>
          <Link to="/hunting" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-siemaccent transition-colors">
            <Terminal size={18} /><span>Threat Hunting</span>
          </Link>
          <Link to="/assets" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 transition-colors">
            <Users size={18} /><span>Asset Inventory</span>
          </Link>
          <Link to="/reports" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 hover:text-siemwarn transition-colors">
            <FileText size={18} /><span>Reports</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-3 px-3 py-3 rounded hover:bg-slate-800 transition-colors mt-auto">
            <SettingsIcon size={18} /><span>Settings/Audit</span>
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-siembg text-slate-300">
        <Routes>
          <Route path="/" element={<Dashboard liveAlerts={alerts} />} />
          <Route path="/alerts" element={<AlertConsole realtimeAlerts={alerts} setAlerts={setAlerts}/>} />
          <Route path="/response" element={<ActiveResponse />} />
          <Route path="/threat-intel" element={<ThreatIntel />} />
          <Route path="/agents" element={<AgentManagement />} />
          <Route path="/fim" element={<FileIntegrityMonitor />} />
          <Route path="/vulnerabilities" element={<VulnerabilityManagement />} />
          <Route path="/sca" element={<ConfigurationAssessment />} />
          <Route path="/compliance" element={<ComplianceCenter />} />
          <Route path="/hunting" element={<ThreatHunting />} />
          <Route path="/assets" element={<AssetInventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      </div>
    </div>
  );
}

export default App;
