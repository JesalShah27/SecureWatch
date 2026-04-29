import React, { useState, useEffect } from 'react';
import { fetchBlocklist, blockIp, unblockIp, fetchResponsePlaybooks, fetchResponseHistory } from '../services/api';
import { ShieldAlert, Unlock, AlertTriangle, Zap, CheckCircle, XCircle } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';

export default function ActiveResponse() {
    const [blockedIps, setBlockedIps] = useState([]);
    const [playbooks, setPlaybooks] = useState([]);
    const [history, setHistory] = useState([]);
    const [ipInput, setIpInput] = useState("");
    const [selectedPlaybook, setSelectedPlaybook] = useState("");
    const [playbookTarget, setPlaybookTarget] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [blocks, pbs, hist] = await Promise.all([
                fetchBlocklist(),
                fetchResponsePlaybooks(),
                fetchResponseHistory()
            ]);
            setBlockedIps(blocks.blocked_ips);
            setPlaybooks(pbs);
            setHistory(hist);
            if (pbs.length > 0) setSelectedPlaybook(pbs[0].id);
        } catch (e) {
            console.error(e);
        }
    }

    const handleBlock = async (e) => {
        e.preventDefault();
        try {
            await blockIp(ipInput, "Manual SOC UI Block");
            setIpInput("");
            loadData();
        } catch (e) {
            console.error(e);
        }
    }

    const handleUnblock = async (ip) => {
        try {
            await unblockIp(ip, "Manual SOC UI Unblock");
            loadData();
        } catch (e) {
            console.error(e);
        }
    }

    const executePlaybook = async (e) => {
        e.preventDefault();
        if (!selectedPlaybook || !playbookTarget) return;
        
        const confirmMsg = `Are you sure you want to execute playbook against ${playbookTarget}?`;
        if (window.confirm(confirmMsg)) {
            // Right now our backend only has block_ip for active response, so we mock playbook execution
            // by calling blockIp if it's an IP, otherwise just mocking it.
            try {
                const pb = playbooks.find(p => p.id === selectedPlaybook);
                if (pb?.name?.toLowerCase().includes("block")) {
                    await blockIp(playbookTarget, `Playbook: ${pb.name}`);
                } else {
                    alert(`Playbook ${pb?.name} executed successfully (mock)`);
                }
                setPlaybookTarget("");
                loadData();
            } catch (err) {
                console.error(err);
                alert("Execution failed");
            }
        }
    }

    return (
        <div className="p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Active Response Engine</h1>
            <p className="text-siemmelow mb-8">Execute automated playbooks or manually isolate threats</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* MANUAL BLOCK FORM */}
                <div className="bg-siempanel/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-6">
                        <ShieldAlert className="text-siemdanger" size={24} />
                        <h2 className="text-xl font-semibold text-white">Manual Isolation</h2>
                    </div>
                    <form onSubmit={handleBlock}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Target IP Address</label>
                            <input 
                                type="text" 
                                value={ipInput}
                                onChange={(e) => setIpInput(e.target.value)}
                                placeholder="e.g. 192.168.1.50" 
                                className="w-full bg-[#0b101e] border border-slate-700 rounded px-4 py-2 text-white outline-none focus:border-siemdanger font-mono"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-siemdanger hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                            Deploy DROP Rule
                        </button>
                    </form>
                </div>

                {/* PLAYBOOK RUNNER */}
                <div className="bg-siempanel/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-6">
                        <Zap className="text-siemaccent" size={24} />
                        <h2 className="text-xl font-semibold text-white">Trigger Playbook</h2>
                    </div>
                    <form onSubmit={executePlaybook}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Select Playbook</label>
                            <select 
                                value={selectedPlaybook}
                                onChange={(e) => setSelectedPlaybook(e.target.value)}
                                className="w-full bg-[#0b101e] border border-slate-700 rounded px-4 py-2 text-white font-sans outline-none focus:border-siemaccent"
                            >
                                {playbooks.map(pb => (
                                    <option key={pb.id} value={pb.id}>{pb.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Target Asset / IP</label>
                            <input 
                                type="text" 
                                value={playbookTarget}
                                onChange={(e) => setPlaybookTarget(e.target.value)}
                                placeholder="e.g. webserver-01 or 10.0.0.5" 
                                className="w-full bg-[#0b101e] border border-slate-700 rounded px-4 py-2 text-white outline-none focus:border-siemaccent font-mono"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-siemaccent hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded transition-colors shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                            Execute Playbook
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[300px]">
                {/* ACTIVE PLAYBOOKS TABLE */}
                <div className="bg-siempanel/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 bg-[#080d17]">
                        <h2 className="text-lg font-semibold text-white">Active Playbooks</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left font-sans text-sm">
                            <thead className="text-slate-500 bg-[#0b101e] uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Playbook Name</th>
                                    <th className="px-6 py-3">Trigger Condition</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {playbooks.map(pb => (
                                    <tr key={pb.id} className="hover:bg-slate-800/40">
                                        <td className="px-6 py-4 text-slate-200 font-medium">{pb.name}</td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{pb.trigger_condition || 'Manual'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {pb.is_active ? 
                                                <span className="text-siemok text-xs font-bold px-2 py-1 bg-siemok/10 rounded">ACTIVE</span> : 
                                                <span className="text-slate-500 text-xs font-bold px-2 py-1 bg-slate-800 rounded">DISABLED</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RESPONSE HISTORY LOG */}
                <div className="bg-siempanel/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-800 bg-[#080d17]">
                        <h2 className="text-lg font-semibold text-white">Response History Log</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left font-sans text-sm">
                            <thead className="text-slate-500 bg-[#0b101e] uppercase text-xs sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Playbook / Action</th>
                                    <th className="px-6 py-3">Target</th>
                                    <th className="px-6 py-3 text-center">Outcome</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {history.map(h => (
                                    <tr key={h.id} className="hover:bg-slate-800/40">
                                        <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">{new Date(h.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-200">{h.playbook_name}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-siemaccent">{h.target}</td>
                                        <td className="px-6 py-4 text-center flex justify-center">
                                            {h.outcome === 'Success' ? <CheckCircle size={16} className="text-siemok" /> : <XCircle size={16} className="text-siemdanger" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* ENFORCED BLOCKS TABLE (Bottom full width) */}
            <div className="bg-siempanel border border-slate-800 rounded-xl overflow-hidden mt-8 shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-[#080d17]">
                    <h2 className="text-lg font-semibold text-white">Currently Enforced Blocks via API</h2>
                </div>
                <table className="w-full text-left font-mono text-sm">
                    <thead className="text-slate-500 bg-[#0b101e] uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">IP Address</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {blockedIps.map(ip => (
                            <tr key={ip} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 text-siemdanger font-bold tracking-wider">{ip}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-siemdanger/20 text-siemdanger border border-siemdanger/50 px-2 py-1 rounded text-xs shadow-[0_0_5px_rgba(239,68,68,0.3)]">BLOCKED (iptables/ufw)</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleUnblock(ip)} className="text-slate-300 hover:text-white flex items-center justify-end space-x-1 w-full transition-colors">
                                        <Unlock size={14} /> <span>Unblock</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {blockedIps.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-slate-500 font-sans italic">No IPs are currently blocked.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
