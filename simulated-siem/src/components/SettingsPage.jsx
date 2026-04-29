import React, { useState } from 'react';
import { Globe, Bell, Monitor, User, Save, CheckCircle } from 'lucide-react';
import { Card } from './shared';

const INTEGRATIONS = [
  { name: 'VirusTotal API', desc: 'Threat Intelligence enrichment', status: 'Connected', icon: '🦠', color: '#00ff88' },
  { name: 'Slack Webhooks', desc: 'Alert routing & notifications', status: 'Connected', icon: '💬', color: '#00ff88' },
  { name: 'MISP', desc: 'Threat sharing platform', status: 'Connected', icon: '🌐', color: '#00ff88' },
  { name: 'AWS CloudTrail', desc: 'Cloud audit logs', status: 'Disconnected', icon: '☁️', color: '#8b949e' },
  { name: 'Office 365', desc: 'Email & identity logs', status: 'Disconnected', icon: '📧', color: '#8b949e' },
  { name: 'Palo Alto NGFW', desc: 'Firewall event streaming', status: 'Connected', icon: '🔥', color: '#00ff88' },
];

const USERS = [
  { name: 'Jesal Pavaskar', email: 'jesal@corp.local', role: 'Admin', status: 'Active', mfa: true },
  { name: 'Samruddhi', email: 'samruddhi@corp.local', role: 'Analyst', status: 'Active', mfa: true },
  { name: 'Harsh', email: 'harsh@corp.local', role: 'Analyst', status: 'Active', mfa: false },
  { name: 'Nikhita', email: 'nikhita@corp.local', role: 'Read-only', status: 'Inactive', mfa: false },
];

export default function SettingsPage({ addToast }) {
  const [saved, setSaved] = useState(false);
  const [tz, setTz] = useState('Asia/Kolkata (IST)');
  const [retention, setRetention] = useState('90 Days');
  const [alertThreshold, setAlertThreshold] = useState('high');

  const save = () => {
    setSaved(true);
    addToast('Settings saved successfully', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const connect = (name) => addToast(`Connecting to ${name}...`, 'info');

  return (
    <div className="animate-slide-down max-w-5xl space-y-6 pb-10">
      <h2 className="text-xl font-bold">System Configuration</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col: Integrations + Users */}
        <div className="col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-[#e8eaed] mb-4 border-b border-[#1e2535] pb-2 text-sm">Integrations</h3>
            <div className="space-y-3">
              {INTEGRATIONS.map((intg, i) => (
                <div key={i} className="flex items-center justify-between hover:bg-[#0a0a0a] p-2 rounded transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1e2535] rounded flex items-center justify-center text-lg">{intg.icon}</div>
                    <div>
                      <div className="font-bold text-sm text-[#e8eaed]">{intg.name}</div>
                      <div className="text-[10px] text-[#8b949e]">{intg.desc}</div>
                    </div>
                  </div>
                  {intg.status === 'Connected' ? (
                    <div className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/30 px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle size={10} /> Connected
                    </div>
                  ) : (
                    <button onClick={() => connect(intg.name)}
                      className="text-[10px] font-bold text-[#00d4ff] bg-[#1e2535] hover:bg-[#2a3441] px-3 py-1 rounded transition-colors">
                      Connect
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[#e8eaed] mb-4 border-b border-[#1e2535] pb-2 text-sm">User Management</h3>
            <table className="w-full text-left text-xs">
              <thead className="text-[#8b949e] border-b border-[#1e2535] text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Role</th>
                  <th className="pb-2">MFA</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2535]">
                {USERS.map((u, i) => (
                  <tr key={i} className="hover:bg-[#0a0a0a] transition-colors">
                    <td className="py-2.5 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1e2535] flex items-center justify-center text-[10px] font-bold text-[#00d4ff]">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[#e8eaed] font-medium">{u.name}</div>
                        <div className="text-[9px] text-[#8b949e] font-mono">{u.email}</div>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${u.role === 'Admin' ? 'bg-[#ff3355]/20 text-[#ff3355]' : u.role === 'Analyst' ? 'bg-[#00d4ff]/20 text-[#00d4ff]' : 'bg-[#1e2535] text-[#8b949e]'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[9px] font-bold ${u.mfa ? 'text-[#00ff88]' : 'text-[#ff3355]'}`}>{u.mfa ? '✓ ON' : '✗ OFF'}</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[9px] font-bold ${u.status === 'Active' ? 'text-[#00ff88]' : 'text-[#8b949e]'}`}>{u.status}</span>
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => addToast(`Editing ${u.name}...`, 'info')} className="text-[9px] text-[#8b949e] hover:text-[#00d4ff] transition-colors">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addToast('Invite user dialog coming soon', 'info')} className="mt-3 text-xs text-[#00d4ff] hover:underline">+ Invite User</button>
          </Card>
        </div>

        {/* Right col: Global settings */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-[#e8eaed] mb-4 border-b border-[#1e2535] pb-2 text-sm">Global Settings</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-[10px] text-[#8b949e] uppercase block mb-1">Timezone</label>
                <select value={tz} onChange={e => setTz(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1e2535] rounded p-2 text-xs text-[#e8eaed] focus:border-[#00d4ff] focus:outline-none">
                  <option>Asia/Kolkata (IST)</option>
                  <option>UTC</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                  <option>America/Los_Angeles (PST)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#8b949e] uppercase block mb-1">Log Retention</label>
                <select value={retention} onChange={e => setRetention(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1e2535] rounded p-2 text-xs text-[#e8eaed] focus:border-[#00d4ff] focus:outline-none">
                  <option>30 Days</option>
                  <option>90 Days</option>
                  <option>180 Days</option>
                  <option>365 Days</option>
                  <option>7 Years (Compliance)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#8b949e] uppercase block mb-1">Alert Threshold</label>
                <select value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#1e2535] rounded p-2 text-xs text-[#e8eaed] focus:border-[#00d4ff] focus:outline-none">
                  <option value="critical">Critical Only</option>
                  <option value="high">High & Above</option>
                  <option value="medium">Medium & Above</option>
                  <option value="low">All Alerts</option>
                </select>
              </div>
              <button onClick={save} className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-[#00ff88] text-[#0a0a0a]' : 'bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a]'}`}>
                {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[#e8eaed] mb-4 border-b border-[#1e2535] pb-2 text-sm">System Health</h3>
            <div className="space-y-2 text-[10px]">
              {[
                { label: 'SIEM Engine', status: 'Running', color: '#00ff88' },
                { label: 'Elasticsearch', status: 'Running', color: '#00ff88' },
                { label: 'Log Ingestion', status: 'Active', color: '#00ff88' },
                { label: 'Correlation Engine', status: 'Active', color: '#00ff88' },
                { label: 'Kibana Dashboard', status: 'Running', color: '#00ff88' },
                { label: 'Agent Manager', status: 'Running', color: '#00ff88' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center border-b border-[#1e2535] pb-1.5">
                  <span className="text-[#8b949e]">{s.label}</span>
                  <span className="flex items-center gap-1 font-bold" style={{ color: s.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }}></span>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
