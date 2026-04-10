import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Shield, Activity, Users, Settings as SettingsIcon, Crosshair, AlertOctagon, Globe, Monitor, FileSearch, Bug, ClipboardList, BookOpen, Terminal, FileText, Loader2 } from 'lucide-react';
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
import Login from './pages/Login';
import { useAuth } from './context/AuthContext';

function App() {
  const { token, loading } = useAuth();
  const [alerts, setAlerts] = useState([]);
  
  // Singleton WebSocket connection handling
  useEffect(() => {
    if (!token) return;
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
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050B14]">
        <Loader2 className="w-10 h-10 animate-spin text-siemaccent" />
      </div>
    );
  }

  if (!token) {
    return <Login />;
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-siembg">
      <HealthBar />
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <nav className="w-64 bg-[#0b0f19] border-r border-siemborder flex flex-col pt-6 pb-4 space-y-6 flex-shrink-0 z-10 shadow-2xl relative">
        <div className="flex items-center space-x-3 text-white px-5 mb-2">
          <div className="p-1.5 bg-gradient-to-br from-siemaccent to-blue-600 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.5)]">
            <Shield className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-wider font-mono bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SecureWatch</h1>
        </div>
        
        <div className="flex flex-col space-y-1 text-sm font-semibold mt-8 px-3">
          <Link to="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Activity size={18} className="text-siemaccent group-hover:scale-110 transition-transform" /><span>Global Overview</span>
          </Link>
          <Link to="/alerts" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group justify-between">
            <div className="flex items-center space-x-3">
              <AlertOctagon size={18} className="text-siemdanger group-hover:scale-110 transition-transform" /><span>Alerts Data</span>
            </div>
          </Link>
          <Link to="/response" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Crosshair size={18} className="text-siemwarn group-hover:scale-110 transition-transform" /><span>Active Response</span>
          </Link>
          <div className="my-2 border-t border-siemborder/50 mx-2"></div>
          <p className="px-3 text-xs font-bold text-siemmelow uppercase tracking-wider mb-1 mt-2">Threats</p>
          <Link to="/threat-intel" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Globe size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" /><span>Threat Intel</span>
          </Link>
          <Link to="/hunting" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Terminal size={18} className="text-purple-400 group-hover:scale-110 transition-transform" /><span>Threat Hunting</span>
          </Link>

          <div className="my-2 border-t border-siemborder/50 mx-2"></div>
          <p className="px-3 text-xs font-bold text-siemmelow uppercase tracking-wider mb-1 mt-2">Endpoints</p>
          <Link to="/agents" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Monitor size={18} className="text-siemok group-hover:scale-110 transition-transform" /><span>Agents</span>
          </Link>
          <Link to="/assets" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Users size={18} className="text-indigo-400 group-hover:scale-110 transition-transform" /><span>Asset Inventory</span>
          </Link>
          <Link to="/vulnerabilities" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <Bug size={18} className="text-rose-400 group-hover:scale-110 transition-transform" /><span>Vulnerabilities</span>
          </Link>

          <div className="my-2 border-t border-siemborder/50 mx-2"></div>
          <p className="px-3 text-xs font-bold text-siemmelow uppercase tracking-wider mb-1 mt-2">Auditing</p>
          <Link to="/fim" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <FileSearch size={18} className="text-amber-400 group-hover:scale-110 transition-transform" /><span>File Integrity</span>
          </Link>
          <Link to="/sca" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <ClipboardList size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" /><span>Configuration</span>
          </Link>
          <Link to="/compliance" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <BookOpen size={18} className="text-blue-400 group-hover:scale-110 transition-transform" /><span>Compliance</span>
          </Link>
          
          <div className="flex-1"></div>
          <Link to="/reports" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group mt-6">
            <FileText size={18} className="text-slate-400 group-hover:text-white" /><span>Executive Reports</span>
          </Link>
          <Link to="/settings" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-siempanelhover hover:text-white transition-all group">
            <SettingsIcon size={18} className="text-slate-400 group-hover:text-white group-hover:rotate-90 transition-transform duration-300" /><span>Settings</span>
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
