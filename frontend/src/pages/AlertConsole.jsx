import React, { useState, useEffect, useMemo } from 'react';
import { fetchAlerts } from '../services/api';
import axios from 'axios';
import { Search, Filter, ShieldOff, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';

export default function AlertConsole({ realtimeAlerts, setAlerts }) {
    const [historicAlerts, setHistoricAlerts] = useState([]);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const alertsPerPage = 15;

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
            await axios.post(`http://${window.location.hostname}:8000/api/alerts/${id}/close`, null, { params: { notes: "Closed via console" } });
            setAlerts(prev => prev.map(a => a.alert_id === id ? {...a, status: 'closed'} : a));
            setHistoricAlerts(prev => prev.map(a => a.alert_id === id ? {...a, status: 'closed'} : a));
        } catch (err) {
            console.error("Failed to close alert", err);
        }
    }

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSeverityWeight = (sev) => {
        const weights = { critical: 4, high: 3, medium: 2, low: 1 };
        return weights[sev?.toLowerCase()] || 0;
    };

    const filteredAndSortedAlerts = useMemo(() => {
        let filtered = allAlerts;
        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(a => 
                a.alert_id.toLowerCase().includes(lowerSearch) ||
                a.entity.toLowerCase().includes(lowerSearch) ||
                a.rule_name.toLowerCase().includes(lowerSearch)
            );
        }

        filtered.sort((a, b) => {
            if (sortConfig.key === 'severity') {
                const weightA = getSeverityWeight(a.severity);
                const weightB = getSeverityWeight(b.severity);
                return sortConfig.direction === 'asc' ? weightA - weightB : weightB - weightA;
            } else if (sortConfig.key === 'timestamp') {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
            } else {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            }
        });

        return filtered;
    }, [allAlerts, search, sortConfig]);

    const indexOfLastAlert = currentPage * alertsPerPage;
    const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
    const currentAlerts = filteredAndSortedAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
    const totalPages = Math.ceil(filteredAndSortedAlerts.length / alertsPerPage) || 1;

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span className="ml-1 opacity-20"><ChevronUp size={14} /></span>;
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1 text-siemaccent" /> : <ChevronDown size={14} className="ml-1 text-siemaccent" />;
    };

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
                        <input 
                            type="text" 
                            placeholder="Search entity, ID, rule..." 
                            className="bg-siempanel border border-slate-700 rounded pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-siemaccent w-64 shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-siempanel/80 backdrop-blur-md border border-slate-800 rounded-xl flex-1 flex flex-col shadow-2xl overflow-hidden">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#0b101e] sticky top-0 text-siemmelow text-xs uppercase font-semibold z-10 shadow-md">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>
                                    <div className="flex items-center">Status <SortIcon column="status" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('severity')}>
                                    <div className="flex items-center">Severity <SortIcon column="severity" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('alert_id')}>
                                    <div className="flex items-center">Alert ID <SortIcon column="alert_id" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('timestamp')}>
                                    <div className="flex items-center">Time <SortIcon column="timestamp" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('rule_name')}>
                                    <div className="flex items-center">Rule Mapping <SortIcon column="rule_name" /></div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('entity')}>
                                    <div className="flex items-center">Entity Key <SortIcon column="entity" /></div>
                                </th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 font-mono">
                            {currentAlerts.map((a) => (
                                <tr key={a.alert_id} className={`hover:bg-slate-800/40 transition-colors group ${a.status === 'closed' ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className={`w-2 h-2 rounded-full ${a.status === 'new' ? 'bg-siemaccent shadow-[0_0_8px_#00D1FF]' : 'bg-slate-600'}`}></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <SeverityBadge severity={a.severity} />
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 group-hover:text-siemaccent transition-colors">{a.alert_id.substring(0, 18)}...</td>
                                    <td className="px-6 py-4 text-slate-300">{new Date(a.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-sans font-medium text-slate-200">{a.rule_name}</div>
                                        <div className="text-xs text-slate-500 mt-1">{a.mitre_tactic} &rarr; {a.mitre_technique}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-bold tracking-wider">{a.entity}</td>
                                    <td className="px-6 py-4 text-right">
                                        {a.status === 'new' && (
                                            <button 
                                                onClick={() => closeAlert(a.alert_id)}
                                                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded border border-slate-600 transition-colors shadow-sm"
                                            >
                                                Close
                                            </button>
                                        )}
                                        {a.status === 'closed' && <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Closed</span>}
                                    </td>
                                </tr>
                            ))}
                            {currentAlerts.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-siemmelow italic">
                                        No alerts found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="border-t border-slate-800 p-4 bg-[#080d17] flex justify-between items-center">
                    <span className="text-xs text-siemmelow">
                        Showing {indexOfFirstAlert + 1} to {Math.min(indexOfLastAlert, filteredAndSortedAlerts.length)} of {filteredAndSortedAlerts.length} alerts
                    </span>
                    <div className="flex items-center space-x-2">
                        <button 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs font-medium px-2 text-slate-300">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
