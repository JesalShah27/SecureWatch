import React from 'react';
import { Sliders, Bell, Database, Key } from 'lucide-react';

export default function Settings() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-8">System Configuration</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Engine Config */}
                <div className="bg-siempanel border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <Sliders className="text-siemaccent" size={24} />
                        <h2 className="text-xl font-semibold text-white">Detection Engine</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Rules Loaded</span>
                            <span className="text-white font-mono bg-slate-800 px-3 py-1 rounded">6 Active</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Default Severity</span>
                            <select className="bg-slate-900 border border-slate-700 rounded text-slate-300 px-3 py-1 focus:outline-none">
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Suppression Window</span>
                            <input type="number" defaultValue={15} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-slate-300" />
                            <span className="text-siemmelow text-sm ml-2">minutes</span>
                        </div>
                    </div>
                </div>

                {/* Threat Intel API Keys */}
                <div className="bg-siempanel border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <Key className="text-siemwarn" size={24} />
                        <h2 className="text-xl font-semibold text-white">Threat Intelligence</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">VirusTotal API Key</label>
                            <input type="password" placeholder="••••••••••••••••" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-300 font-mono" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">AbuseIPDB API Key</label>
                            <input type="password" placeholder="••••••••••••••••" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-300 font-mono" />
                        </div>
                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded transition-colors text-sm">Save Keys</button>
                    </div>
                </div>
                {/* Audit Logs */}
                <div className="bg-siempanel border border-slate-800 rounded-xl p-6 md:col-span-2 mt-4 mt-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <Database className="text-emerald-500" size={24} />
                        <h2 className="text-xl font-semibold text-white">System Audit Logs</h2>
                    </div>
                    <div className="overflow-y-auto max-h-64 border border-slate-800 rounded">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs uppercase bg-slate-800 text-slate-400 sticky top-0">
                          <tr>
                            <th className="px-3 py-2">Timestamp</th>
                            <th className="px-3 py-2">User</th>
                            <th className="px-3 py-2">Action</th>
                            <th className="px-3 py-2">Resource</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <AuditLogTable />
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Internal component for loading audit logs
const AuditLogTable = () => {
    const [logs, setLogs] = React.useState([]);
    React.useEffect(() => {
        import('../services/api').then(api => {
            api.fetchAuditLogs().then(setLogs).catch(console.error);
        });
    }, []);

    return logs.map((log, i) => (
        <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/50">
            <td className="px-3 py-2 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
            <td className="px-3 py-2 text-siemaccent font-bold">{log.user}</td>
            <td className="px-3 py-2 font-mono text-xs text-amber-400">{log.action}</td>
            <td className="px-3 py-2">{log.resource_id}</td>
            <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${log.status === 'success' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-rose-900/40 text-rose-400'}`}>
                    {log.status}
                </span>
            </td>
        </tr>
    ));
}
