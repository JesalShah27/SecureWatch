import React, { useState, useEffect } from 'react';
import { fetchAlerts, api } from '../services/api';
import { Search, Filter, ShieldOff } from 'lucide-react';

export default function AlertConsole({ realtimeAlerts, setAlerts }) {
    const [historicAlerts, setHistoricAlerts] = useState([]);
    
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAlerts();
                setHistoricAlerts(data);
            } catch (err) {
                console.error("Failed to fetch historic alerts", err);
            }
        };
        load();
    }, []);

    // Merge historic and realtime
    const allAlerts = [...realtimeAlerts, ...historicAlerts].filter((v,i,a)=>a.findIndex(v2=>(v2.alert_id===v.alert_id))===i);

    const closeAlert = async (id) => {
        try {
            await api.post(`/alerts/${id}/close`, null, { params: { notes: "Closed via console" } });
            // Update local state
            setAlerts(prev => prev.map(a => a.alert_id === id ? {...a, status: 'closed'} : a));
            setHistoricAlerts(prev => prev.map(a => a.alert_id === id ? {...a, status: 'closed'} : a));
        } catch (err) {
            console.error("Failed to close alert", err);
        }
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Alert Console</h1>
                    <p className="text-siemmelow mt-2">Triage and respond to correlated threats</p>
                </div>
                <div className="flex space-x-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input type="text" placeholder="Search entity, ID, rule..." className="bg-siempanel border border-slate-700 rounded pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-siemaccent w-64" />
                    </div>
                </div>
            </div>

            <div className="bg-siempanel border border-slate-800 rounded-xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-800/80 sticky top-0 text-siemmelow text-xs uppercase font-semibold z-10">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Alert ID</th>
                                <th className="px-6 py-4">Time</th>
                                <th className="px-6 py-4">Rule Mapping</th>
                                <th className="px-6 py-4">Entity Key</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 font-mono">
                            {allAlerts.map((a, i) => (
                                <tr key={a.alert_id} className={`hover:bg-slate-800/40 transition-colors ${a.status === 'closed' ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className={`w-2 h-2 rounded-full ${a.status === 'new' ? 'bg-siemaccent shadow-[0_0_8px_#00D1FF]' : 'bg-slate-600'}`}></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            a.severity === 'critical' ? 'bg-siemdanger/20 text-siemdanger border border-siemdanger/50' : 
                                            a.severity === 'high' ? 'bg-siemwarn/20 text-siemwarn border border-siemwarn/50' : 
                                            a.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/50' :
                                            'bg-siemok/10 text-siemok border border-siemok/50'
                                        }`}>
                                            {a.severity.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-siemmelow">{a.alert_id}</td>
                                    <td className="px-6 py-4">{new Date(a.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-sans font-medium text-slate-200">{a.rule_name}</div>
                                        <div className="text-xs text-siemmelow mt-1">{a.mitre_tactic} &rarr; {a.mitre_technique}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 font-bold">{a.entity}</td>
                                    <td className="px-6 py-4 text-right">
                                        {a.status === 'new' && (
                                            <button 
                                                onClick={() => closeAlert(a.alert_id)}
                                                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 transition-colors"
                                            >
                                                Close
                                            </button>
                                        )}
                                        {a.status === 'closed' && <span className="text-xs text-slate-500">Closed</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
