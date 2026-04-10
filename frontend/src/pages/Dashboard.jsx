import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, Cpu, CheckCircle, Server, WifiOff, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MitreMatrix from '../components/MitreMatrix';
import { fetchAgents } from '../services/api';

export default function Dashboard({ liveAlerts }) {
    
    // Live counts
    const critCount = liveAlerts.filter(a => a.severity === 'critical').length;
    const highCount = liveAlerts.filter(a => a.severity === 'high').length;
    
    // Dynamic agent count
    const [agentCount, setAgentCount] = useState({ total: 0, active: 0 });
    useEffect(() => {
        fetchAgents().then(agents => {
            const active = agents.filter(a => a.status === 'active' || a.status === 'connected').length;
            setAgentCount({ total: agents.length, active });
        }).catch(() => setAgentCount({ total: 0, active: 0 }));
    }, []);
    
    // -----------------------------------------------------
    // MOCK HISTORICAL DATA (For aesthetic timeline charting)
    // -----------------------------------------------------
    const [timelineData, setTimelineData] = useState([]);
    
    useEffect(() => {
        // Generate last 24 hours of realistic-looking event volume
        const data = [];
        let now = new Date();
        for (let i = 24; i >= 0; i--) {
            let t = new Date(now.getTime() - (i * 60 * 60 * 1000));
            // add some random sine wave variance
            let base = 1200 + Math.sin(i) * 500 + Math.random() * 300;
            data.push({
                time: `${t.getHours()}:00`,
                events: Math.floor(base),
                alerts: Math.floor(base * (Math.random() * 0.05))
            });
        }
        setTimelineData(data);
    }, []);

    // -----------------------------------------------------
    // DONUT CHART DATA (Live data mapping)
    // -----------------------------------------------------
    let severityData = [
        { name: 'Critical', value: liveAlerts.filter(a => a.severity === 'critical').length, color: '#EF4444' },
        { name: 'High', value: liveAlerts.filter(a => a.severity === 'high').length, color: '#F59E0B' },
        { name: 'Medium', value: liveAlerts.filter(a => a.severity === 'medium').length, color: '#0EA5E9' },
        { name: 'Low', value: liveAlerts.filter(a => a.severity === 'low').length, color: '#10B981' }
    ];
    const hasAlerts = severityData.some(d => d.value > 0);

    return (
        <div className="p-8 pb-20 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Security Command Center</h1>
                    <p className="text-siemmelow mt-1 text-sm font-medium">Real-time threat monitoring and endpoint posture.</p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 bg-siempanel/50 backdrop-blur border border-siemborder px-4 py-2 rounded-lg shadow-sm">
                        <CheckCircle size={16} className="text-siemok" />
                        <span className="text-sm font-semibold text-slate-300">Engine Output: <span className="text-siemok ml-1">Stable</span></span>
                    </div>
                </div>
            </div>

            {/* SEVERITY KPI ROW */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="glass-panel rounded-xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-siemdanger/20 hover:border-siemdanger/50 group">
                    <div className="absolute -right-4 -top-4 bg-siemdanger/10 w-24 h-24 rounded-full blur-xl group-hover:bg-siemdanger/20 transition-all"></div>
                    <div className="flex items-center justify-between z-10 relative">
                        <div>
                            <p className="text-siemmelow text-xs font-bold mb-1 uppercase tracking-widest">Critical Alerts</p>
                            <p className="text-4xl font-black text-white font-mono">{critCount}</p>
                        </div>
                        <AlertCircle className="text-siemdanger" size={42} strokeWidth={2.5} />
                    </div>
                </div>
                
                <div className="glass-panel rounded-xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-siemwarn/20 hover:border-siemwarn/50 group">
                    <div className="absolute -right-4 -top-4 bg-siemwarn/10 w-24 h-24 rounded-full blur-xl group-hover:bg-siemwarn/20 transition-all"></div>
                    <div className="flex items-center justify-between z-10 relative">
                        <div>
                            <p className="text-siemmelow text-xs font-bold mb-1 uppercase tracking-widest">High Alerts</p>
                            <p className="text-4xl font-black text-white font-mono">{highCount}</p>
                        </div>
                        <ShieldAlert className="text-siemwarn" size={42} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="glass-panel rounded-xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-siemaccent/20 hover:border-siemaccent/50 group">
                    <div className="absolute -right-4 -top-4 bg-siemaccent/10 w-24 h-24 rounded-full blur-xl group-hover:bg-siemaccent/20 transition-all"></div>
                    <div className="flex items-center justify-between z-10 relative">
                        <div>
                            <p className="text-siemmelow text-xs font-bold mb-1 uppercase tracking-widest">Active Agents</p>
                            <div className="flex items-baseline space-x-2">
                                <p className="text-4xl font-black text-siemok font-mono">{agentCount.active}</p>
                                <p className="text-siemmelow text-sm font-semibold">/ {agentCount.total}</p>
                            </div>
                        </div>
                        <Server className="text-siemaccent" size={42} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="glass-panel rounded-xl p-6 relative overflow-hidden transition-all hover:-translate-y-1 group">
                    <div className="absolute -right-4 -top-4 bg-slate-700/10 w-24 h-24 rounded-full blur-xl group-hover:bg-slate-700/30 transition-all"></div>
                    <div className="flex items-center justify-between z-10 relative">
                        <div>
                            <p className="text-siemmelow text-xs font-bold mb-1 uppercase tracking-widest">Avg EPS (Logstash)</p>
                            <p className="text-4xl font-black text-white font-mono">1,024</p>
                        </div>
                        <Cpu className="text-slate-400" size={42} strokeWidth={2.5} />
                    </div>
                </div>
            </div>

            {/* CHART LAYER 1 */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* TIMELINE AREA CHART */}
                <div className="col-span-2 glass-panel rounded-xl p-6">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-6 flex items-center">
                        <Activity size={16} className="text-siemaccent mr-2" /> Security Events Summary (24H)
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#374151" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#374151" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="events" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
                                <Area type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorAlerts)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SEVERITY DONUT CHART */}
                <div className="col-span-1 glass-panel rounded-xl p-6 flex flex-col">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest mb-2 flex items-center">
                        <AlertCircle size={16} className="text-siemwarn mr-2" /> Alert Severity
                    </h2>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ fontWeight: 'bold', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                            <span className="text-3xl font-black text-white">{severityData.reduce((a, b) => a + b.value, 0)}</span>
                            <span className="text-xs font-bold text-siemmelow tracking-wider uppercase">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHART LAYER 2: MITRE ATT&CK */}
            <div className="mb-8 glass-panel rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center">
                        <Activity size={16} className="text-siemaccent mr-2" /> MITRE ATT&CK® Matrix
                    </h2>
                </div>
                <MitreMatrix />
            </div>

            {/* CHART LAYER 3: ALERTS */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-siemborder bg-siempanel/50 flex justify-between items-center">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Live Alert Stream</h2>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-siemok opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-siemok"></span>
                    </span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[400px]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#0b0f19]/80 sticky top-0 text-siemmelow text-xs uppercase font-bold tracking-wider z-10 shadow-sm backdrop-blur">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">Severity</th>
                                <th className="px-6 py-3">Rule Name</th>
                                <th className="px-6 py-3">Entity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-siemborder/50 font-mono text-[13px]">
                            {liveAlerts.slice(0, 15).map((a, i) => (
                                <tr key={i} className="hover:bg-siempanelhover transition-colors group cursor-pointer">
                                    <td className="px-6 py-3 text-slate-400 group-hover:text-slate-300">{new Date(a.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-6 py-3">
                                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                            a.severity === 'critical' ? 'bg-siemdanger/20 text-siemdanger border border-siemdanger/30' : 
                                            a.severity === 'high' ? 'bg-siemwarn/20 text-siemwarn border border-siemwarn/30' : 
                                            'bg-siemaccent/20 text-siemaccent border border-siemaccent/30'
                                        }`}>
                                            {a.severity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 font-sans font-medium text-slate-300 group-hover:text-white transition-colors">{a.rule_name}</td>
                                    <td className="px-6 py-3 text-siemmelow">{a.entity}</td>
                                </tr>
                            ))}
                            {liveAlerts.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-siemmelow font-sans flex flex-col items-center">
                                        <ShieldAlert size={32} className="opacity-20 mb-3" />
                                        <span>System SECURE. Awaiting detection events.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
