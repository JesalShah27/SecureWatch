import React, { useState, useEffect } from 'react';
import { Clock, Filter, AlertTriangle, Shield, CheckCircle, Zap, Crosshair, ChevronDown, Activity, ChevronRight, DownloadCloud, Server, ShieldAlert, Map, Globe } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MitreMatrix from '../components/MitreMatrix';
import { fetchAgents } from '../services/api';

export default function Dashboard({ liveAlerts }) {
    
    // Live counts
    const critCount = liveAlerts.filter(a => a.severity === 'critical').length;
    const highCount = liveAlerts.filter(a => a.severity === 'high').length;
    const medCount = liveAlerts.filter(a => a.severity === 'medium').length;
    const lowCount = liveAlerts.filter(a => a.severity === 'low').length;
    
    // Dynamic agent count
    const [agentCount, setAgentCount] = useState({ total: 0, active: 0 });
    useEffect(() => {
        fetchAgents().then(agents => {
            const active = agents.filter(a => a.status === 'active' || a.status === 'connected').length;
            setAgentCount({ total: agents.length, active });
        }).catch(() => setAgentCount({ total: 0, active: 0 }));
    }, []);
    
    // MOCK HISTORICAL DATA (Event Timeline Bar Chart)
    const [timelineData, setTimelineData] = useState([]);
    useEffect(() => {
        const data = [];
        let now = new Date();
        for (let i = 24; i >= 0; i--) {
            let t = new Date(now.getTime() - (i * 60 * 60 * 1000));
            let base = 50 + Math.sin(i) * 30 + Math.random() * 20;
            data.push({
                time: `${t.getHours()}:00`,
                critical: Math.floor(base * 0.1),
                high: Math.floor(base * 0.2),
                medium: Math.floor(base * 0.3),
                low: Math.floor(base * 0.4),
            });
        }
        setTimelineData(data);
    }, []);

    // SEVERITY DONUT CHART DATA
    let severityData = [
        { name: 'Critical', value: critCount, color: '#ff3333' },
        { name: 'High', value: highCount, color: '#ff9933' },
        { name: 'Medium', value: medCount, color: '#ffcc00' },
        { name: 'Low', value: lowCount, color: '#33cc33' }
    ];
    if (critCount === 0 && highCount === 0 && medCount === 0 && lowCount === 0) {
        severityData = [
            { name: 'Critical', value: 24, color: '#ff3333' },
            { name: 'High', value: 75, color: '#ff9933' },
            { name: 'Medium', value: 411, color: '#ffcc00' },
            { name: 'Low', value: 9, color: '#33cc33' }
        ];
    }

    const Panel = ({ title, subtitle, children, className = '' }) => (
        <div className={`bg-[#121212] border border-[#2a2a2a] flex flex-col ${className}`}>
            <div className="px-4 py-2 border-b border-[#2a2a2a] flex justify-between items-center bg-[#1a1a1a]">
                <h3 className="text-[#e0e0e0] font-bold text-xs uppercase tracking-wider">{title}</h3>
                {subtitle && <span className="text-xs text-[#888]">{subtitle}</span>}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );

    return (
        <div className="bg-[#000000] min-h-screen text-[#e0e0e0] font-sans overflow-x-hidden">
            {/* TOP NAVBAR / TOOLBAR */}
            <div className="bg-[#121212] border-b border-[#2a2a2a] px-4 py-2 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-6">
                    <h1 className="text-lg font-bold tracking-wide text-white">Security Posture Dashboard</h1>
                    <div className="hidden md:flex space-x-4 text-xs font-semibold text-[#aaa]">
                        <button className="text-white border-b-2 border-[#0ea5e9] pb-1">Continuous Monitoring</button>
                        <button className="hover:text-white pb-1">Advanced Threats</button>
                        <button className="hover:text-white pb-1">Investigation</button>
                        <button className="hover:text-white pb-1">Compliance</button>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-[#1a1a1a] border border-[#333] rounded px-3 py-1 text-xs">
                        <Clock size={14} className="text-[#888] mr-2" />
                        <span className="text-[#ccc] font-mono">Last 24 Hours</span>
                        <ChevronDown size={14} className="text-[#888] ml-2" />
                    </div>
                    <button className="bg-[#222] hover:bg-[#333] border border-[#444] text-xs px-3 py-1 rounded text-white transition-colors">
                        Edit
                    </button>
                    <button className="bg-[#222] hover:bg-[#333] border border-[#444] text-xs px-3 py-1 rounded text-white transition-colors">
                        Export
                    </button>
                </div>
            </div>

            <div className="p-2 space-y-2">
                
                {/* KPI ROW */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="bg-[#121212] border border-[#2a2a2a] p-3 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="text-[10px] uppercase tracking-widest text-[#888] font-bold mb-1 w-full text-left">Total Events</div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">1,275<span className="text-xs text-siemok ml-2 inline-flex items-center">▼ 20%</span></div>
                    </div>
                    <div className="bg-[#ff3333]/10 border-t-2 border-[#ff3333] border-b border-b-[#2a2a2a] border-x border-x-[#2a2a2a] p-3 flex flex-col items-center justify-center">
                        <div className="text-[10px] uppercase tracking-widest text-[#ff3333] font-bold mb-1 w-full text-left">Critical Severity</div>
                        <div className="text-3xl font-mono font-bold text-[#ff3333] tracking-tighter">{severityData[0].value}</div>
                    </div>
                    <div className="bg-[#ff9933]/10 border-t-2 border-[#ff9933] border-b border-b-[#2a2a2a] border-x border-x-[#2a2a2a] p-3 flex flex-col items-center justify-center">
                        <div className="text-[10px] uppercase tracking-widest text-[#ff9933] font-bold mb-1 w-full text-left">High Severity</div>
                        <div className="text-3xl font-mono font-bold text-[#ff9933] tracking-tighter">{severityData[1].value}</div>
                    </div>
                    <div className="bg-[#ffcc00]/10 border-t-2 border-[#ffcc00] border-b border-b-[#2a2a2a] border-x border-x-[#2a2a2a] p-3 flex flex-col items-center justify-center">
                        <div className="text-[10px] uppercase tracking-widest text-[#ffcc00] font-bold mb-1 w-full text-left">Medium Severity</div>
                        <div className="text-3xl font-mono font-bold text-[#ffcc00] tracking-tighter">{severityData[2].value}</div>
                    </div>
                    <div className="bg-[#33cc33]/10 border-t-2 border-[#33cc33] border-b border-b-[#2a2a2a] border-x border-x-[#2a2a2a] p-3 flex flex-col items-center justify-center">
                        <div className="text-[10px] uppercase tracking-widest text-[#33cc33] font-bold mb-1 w-full text-left">Low Severity</div>
                        <div className="text-3xl font-mono font-bold text-[#33cc33] tracking-tighter">{severityData[3].value}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* EVENT TIMELINE CHART */}
                    <Panel title="Notable Events Over Time" className="col-span-2">
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={timelineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                    <XAxis dataKey="time" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', fontSize: '12px' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                        cursor={{fill: '#222'}}
                                    />
                                    <Bar dataKey="low" stackId="a" fill="#33cc33" />
                                    <Bar dataKey="medium" stackId="a" fill="#ffcc00" />
                                    <Bar dataKey="high" stackId="a" fill="#ff9933" />
                                    <Bar dataKey="critical" stackId="a" fill="#ff3333" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Panel>

                    {/* EVENTS BY STATUS DONUT */}
                    <Panel title="Events By Severity">
                        <div className="h-[220px] w-full relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold font-mono text-white">{severityData.reduce((a, b) => a + b.value, 0)}</span>
                                <span className="text-[10px] text-[#888] uppercase">Events</span>
                            </div>
                        </div>
                    </Panel>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* INTRUSION SIGNATURES TABLE */}
                    <Panel title="Intrusion Signatures" className="col-span-2 overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-auto max-h-[250px]">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-[#1a1a1a] sticky top-0 text-[#888] uppercase">
                                    <tr>
                                        <th className="px-4 py-2 font-normal cursor-pointer hover:text-white">Signature ↕</th>
                                        <th className="px-4 py-2 font-normal cursor-pointer hover:text-white w-24">Severity ↕</th>
                                        <th className="px-4 py-2 font-normal cursor-pointer hover:text-white text-right w-20">Count ↕</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#222]">
                                    {liveAlerts.length > 0 ? liveAlerts.slice(0, 8).map((a, i) => (
                                        <tr key={i} className="hover:bg-[#1a1a1a] transition-colors group">
                                            <td className="px-4 py-2 text-[#0ea5e9] hover:underline cursor-pointer truncate max-w-[400px]">"{a.rule_name}"</td>
                                            <td className="px-4 py-2">
                                                <div className={`px-2 py-0.5 inline-block ${
                                                    a.severity === 'critical' ? 'bg-[#ff3333] text-white' : 
                                                    a.severity === 'high' ? 'bg-[#ff9933] text-black' : 
                                                    a.severity === 'medium' ? 'bg-[#ffcc00] text-black' : 'bg-[#33cc33] text-white'
                                                }`}>
                                                    {a.severity}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right">{Math.floor(Math.random() * 5) + 1}</td>
                                        </tr>
                                    )) : (
                                        <>
                                            <tr className="hover:bg-[#1a1a1a]">
                                                <td className="px-4 py-2 text-[#0ea5e9]">"Allow ping, pong and tracert"</td>
                                                <td className="px-4 py-2"><div className="px-2 py-0.5 inline-block bg-[#ff3333] text-white">critical</div></td>
                                                <td className="px-4 py-2 text-right">1</td>
                                            </tr>
                                            <tr className="hover:bg-[#1a1a1a]">
                                                <td className="px-4 py-2 text-[#0ea5e9]">Adobe Flash Player Remote Code Execution</td>
                                                <td className="px-4 py-2"><div className="px-2 py-0.5 inline-block bg-[#ff3333] text-white">critical</div></td>
                                                <td className="px-4 py-2 text-right">2</td>
                                            </tr>
                                            <tr className="hover:bg-[#1a1a1a]">
                                                <td className="px-4 py-2 text-[#0ea5e9]">Microsoft Excel Index Array Remote Code Execution</td>
                                                <td className="px-4 py-2"><div className="px-2 py-0.5 inline-block bg-[#ff3333] text-white">critical</div></td>
                                                <td className="px-4 py-2 text-right">4</td>
                                            </tr>
                                            <tr className="hover:bg-[#1a1a1a]">
                                                <td className="px-4 py-2 text-[#0ea5e9]">Suspicious PowerShell Download Cradle</td>
                                                <td className="px-4 py-2"><div className="px-2 py-0.5 inline-block bg-[#ff9933] text-black">high</div></td>
                                                <td className="px-4 py-2 text-right">12</td>
                                            </tr>
                                            <tr className="hover:bg-[#1a1a1a]">
                                                <td className="px-4 py-2 text-[#0ea5e9]">Multiple Failed Logins Detected</td>
                                                <td className="px-4 py-2"><div className="px-2 py-0.5 inline-block bg-[#ffcc00] text-black">medium</div></td>
                                                <td className="px-4 py-2 text-right">89</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-[#1a1a1a] p-2 text-[10px] text-[#888] flex justify-between items-center border-t border-[#222]">
                            <span>« Prev 1 2 3 4 5 6 ... Next »</span>
                            <span>Showing 1-8 of 102</span>
                        </div>
                    </Panel>

                    {/* SAVED SEARCHES / DRILLDOWNS */}
                    <Panel title="Saved Searches / Risk Analysis">
                        <div className="flex flex-col h-full justify-between space-y-4">
                            <div>
                                <div className="text-[10px] text-[#888] uppercase mb-2">Top Host Risk</div>
                                <div className="flex justify-between items-center border-b border-[#222] pb-2">
                                    <div className="text-xs text-[#0ea5e9]">web-server-prod-01</div>
                                    <div className="text-xs font-mono bg-[#ff3333]/20 text-[#ff3333] px-2 py-0.5">280.0</div>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#222] py-2">
                                    <div className="text-xs text-[#0ea5e9]">db-cluster-node-3</div>
                                    <div className="text-xs font-mono bg-[#ff9933]/20 text-[#ff9933] px-2 py-0.5">145.5</div>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#222] py-2">
                                    <div className="text-xs text-[#0ea5e9]">user-jdoe-laptop</div>
                                    <div className="text-xs font-mono bg-[#ffcc00]/20 text-[#ffcc00] px-2 py-0.5">77.0</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-[#1a1a1a] p-2 rounded">
                                    <div className="text-[10px] text-[#888] uppercase">Mean Time To Resolve</div>
                                    <div className="text-xl font-mono text-white mt-1">1<span className="text-xs text-[#888]">hr</span> 21<span className="text-xs text-[#888]">m</span></div>
                                </div>
                                <div className="bg-[#1a1a1a] p-2 rounded">
                                    <div className="text-[10px] text-[#888] uppercase">Executed Playbooks</div>
                                    <div className="text-xl font-mono text-white mt-1">1.5K</div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>
                
                {/* MITRE MATRIX PANEL */}
                <Panel title="MITRE ATT&CK Matrix Overlay" className="min-h-[300px]">
                     <MitreMatrix />
                </Panel>
            </div>
        </div>
    );
}
