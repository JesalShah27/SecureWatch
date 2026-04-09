import React, { useState, useEffect } from 'react';
import { FileSearch, Hash, AlertTriangle, ShieldCheck, Download, Trash } from 'lucide-react';
import { fetchFimEvents, fetchFimSummary } from '../services/api';

const FileIntegrityMonitor = () => {
    const [events, setEvents] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [evts, summ] = await Promise.all([
                    fetchFimEvents(),
                    fetchFimSummary()
                ]);
                setEvents(evts);
                setSummary(summ);
            } catch (err) {
                console.error("Failed to fetch FIM data:", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
        const int = setInterval(loadData, 10000);
        return () => clearInterval(int);
    }, []);

    const getTypeColor = (type) => {
        if (type === 'file_created') return 'text-emerald-400 bg-emerald-900/40 border-emerald-800';
        if (type === 'file_deleted') return 'text-rose-400 bg-rose-900/40 border-rose-800';
        return 'text-amber-400 bg-amber-900/40 border-amber-800';
    };

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2 flex items-center">
                        <FileSearch className="mr-3 text-siemaccent" size={32} />
                        File Integrity Monitoring
                    </h1>
                    <p className="text-slate-400">Track modifications to critical files and system binaries.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-siempanel border border-slate-800 p-4 rounded-lg">
                    <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Total FIM Events</h3>
                    <div className="text-4xl text-white font-mono font-bold">{events.length}</div>
                </div>
                <div className="bg-siempanel border border-slate-800 p-4 rounded-lg">
                    <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Most Targeted Host</h3>
                    <div className="text-2xl text-siemdanger font-mono font-bold">
                        {Object.entries(summary).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'}
                    </div>
                </div>
                <div className="bg-siempanel border border-slate-800 p-4 rounded-lg">
                    <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Critical Files Monitored</h3>
                    <div className="text-2xl text-siemaccent font-mono font-bold flex items-center">
                        <ShieldCheck className="mr-2" /> Active
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-siempanel border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                    <h2 className="font-bold text-white text-lg">Recent Integrity Events</h2>
                </div>
                
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Timestamp</th>
                                <th className="px-4 py-3">Host</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">File Path</th>
                                <th className="px-4 py-3">User/Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((evt, idx) => (
                                <tr key={evt.id || idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3 font-mono">{new Date(evt.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-bold">{evt.hostname}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(evt.event_type)}`}>
                                            {evt.event_type.replace('file_', '').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-siemaccent">{evt.file_path}</td>
                                    <td className="px-4 py-3">
                                        {evt.event_type === 'file_modified' ? (
                                            <div className="flex flex-col text-xs font-mono space-y-1">
                                                <div className="flex items-center text-slate-500">
                                                    <Hash size={12} className="mr-1" /> Old: {evt.old_hash?.substring(0, 16)}...
                                                </div>
                                                <div className="flex items-center text-rose-400">
                                                    <Hash size={12} className="mr-1" /> New: {evt.new_hash?.substring(0, 16)}...
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">Owner: {evt.owner}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-500">
                                        No file integrity events recorded.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FileIntegrityMonitor;
