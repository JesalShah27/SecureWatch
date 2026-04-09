import React from 'react';
import { AlertCircle, ShieldAlert, Cpu } from 'lucide-react';

export default function Dashboard({ liveAlerts }) {
    
    const critCount = liveAlerts.filter(a => a.severity === 'critical').length;
    const highCount = liveAlerts.filter(a => a.severity === 'high').length;
    const medCount = liveAlerts.filter(a => a.severity === 'medium').length;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">SOC Overview</h1>
                <div className="flex items-center space-x-2 text-siemok bg-siemok/10 px-3 py-1 rounded border border-siemok/20">
                    <div className="w-2 h-2 rounded-full bg-siemok animate-pulse"></div>
                    <span className="text-sm font-semibold">Engine Active</span>
                </div>
            </div>

            {/* SEVERITY COUNTERS */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-siempanel rounded-xl border border-siemdanger/30 p-6 flex items-center justify-between shadow-[0_0_15px_rgba(255,59,59,0.1)]">
                    <div>
                        <p className="text-siemmelow text-sm font-semibold mb-1 uppercase tracking-wider">Critical Alerts</p>
                        <p className="text-4xl font-bold text-siemdanger font-mono">{critCount}</p>
                    </div>
                    <AlertCircle className="text-siemdanger opacity-70" size={48} />
                </div>
                <div className="bg-siempanel rounded-xl border border-siemwarn/30 p-6 flex items-center justify-between shadow-[0_0_15px_rgba(255,184,0,0.05)]">
                    <div>
                        <p className="text-siemmelow text-sm font-semibold mb-1 uppercase tracking-wider">High Alerts</p>
                        <p className="text-4xl font-bold text-siemwarn font-mono">{highCount}</p>
                    </div>
                    <ShieldAlert className="text-siemwarn opacity-70" size={48} />
                </div>
                <div className="bg-siempanel rounded-xl border border-slate-700/50 p-6 flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-siemmelow text-sm font-semibold mb-1 uppercase tracking-wider">Medium Alerts</p>
                        <p className="text-4xl font-bold text-yellow-500 font-mono">{medCount}</p>
                    </div>
                    <Cpu className="text-yellow-500 opacity-50" size={48} />
                </div>
                <div className="bg-siempanel rounded-xl border border-slate-700/50 p-6 flex items-center justify-between shadow-lg">
                    <div>
                        <p className="text-siemmelow text-sm font-semibold mb-1 uppercase tracking-wider">Total Events Analyzed</p>
                        <p className="text-4xl font-bold text-siemaccent font-mono">1.2M+</p>
                    </div>
                    <ActivityIcon className="text-siemaccent opacity-50" size={48} />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* RECENT ALERTS FEED */}
                <div className="col-span-2 bg-siempanel border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                    <div className="mx-6 my-5 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-white">Live Alert Stream</h2>
                    </div>
                    <div className="border-t border-slate-800 bg-slate-900/50 flex-1 p-0 overflow-y-auto" style={{maxHeight:'500px'}}>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800/80 sticky top-0 text-siemmelow text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Severity</th>
                                    <th className="px-6 py-3">Rule Name</th>
                                    <th className="px-6 py-3">Entity</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono">
                                {liveAlerts.slice(0,10).map((a, i) => (
                                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-3">{new Date(a.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                a.severity === 'critical' ? 'bg-siemdanger/20 text-siemdanger border border-siemdanger/50' : 
                                                a.severity === 'high' ? 'bg-siemwarn/20 text-siemwarn border border-siemwarn/50' : 
                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/50'
                                            }`}>
                                                {a.severity.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 font-sans font-medium text-slate-200">{a.rule_name}</td>
                                        <td className="px-6 py-3">{a.entity}</td>
                                    </tr>
                                ))}
                                {liveAlerts.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-siemmelow font-sans">Awaiting detection events...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ASSET RISK PANEL */}
                <div className="col-span-1 bg-siempanel border border-slate-800 rounded-xl p-6">
                     <h2 className="text-lg font-semibold text-white mb-6">Top Riskiest Assets</h2>
                     <div className="text-sm text-siemmelow text-center mt-20">
                         Insufficient data to calculate risk scores.<br/>
                         Run the attack simulator to populate.
                     </div>
                </div>
            </div>
        </div>
    );
}

function ActivityIcon(props) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
}
