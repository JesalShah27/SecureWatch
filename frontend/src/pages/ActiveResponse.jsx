import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Unlock, AlertTriangle } from 'lucide-react';

export default function ActiveResponse() {
    const [blockedIps, setBlockedIps] = useState([]);
    const [ipInput, setIpInput] = useState("");

    useEffect(() => {
        loadBlocks();
    }, []);

    const loadBlocks = async () => {
        try {
            const res = await api.get('/response/blocklist');
            setBlockedIps(res.data.blocked_ips);
        } catch (e) {
            console.error(e);
        }
    }

    const handleBlock = async (e) => {
        e.preventDefault();
        try {
            await api.post('/response/block-ip', { ip_address: ipInput, reason: "Manual SOC UI Block" });
            setIpInput("");
            loadBlocks();
        } catch (e) {
            console.error(e);
        }
    }

    const handleUnblock = async (ip) => {
        try {
            await api.post('/response/unblock-ip', { ip_address: ip, reason: "Manual SOC UI Unblock" });
            loadBlocks();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-8">Active Response Engine</h1>

            <div className="grid grid-cols-2 gap-8 mb-8">
                {/* MANUAL BLOCK FORM */}
                <div className="bg-siempanel border border-slate-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                        <ShieldAlert className="text-siemdanger" size={24} />
                        <h2 className="text-xl font-semibold text-white">Manual IP Isolation</h2>
                    </div>
                    <form onSubmit={handleBlock}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Target IP Address</label>
                            <input 
                                type="text" 
                                value={ipInput}
                                onChange={(e) => setIpInput(e.target.value)}
                                placeholder="e.g. 192.168.1.50" 
                                className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white outline-none focus:border-siemdanger font-mono"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-siemdanger hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors shadow-[0_0_15px_rgba(255,59,59,0.3)]">
                            Deploy DROP Rule
                        </button>
                    </form>
                </div>

                {/* PLAYBOOK RUNNER */}
                <div className="bg-siempanel border border-slate-800 rounded-xl p-6 shadow-lg opacity-70">
                    <div className="flex items-center space-x-3 mb-6">
                        <AlertTriangle className="text-siemwarn" size={24} />
                        <h2 className="text-xl font-semibold text-white">Execute Playbook</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">Select an automated response playbook to run against a target asset.</p>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white mb-4">
                        <option>PLAYBOOK-001: Aggressive Isolate</option>
                        <option>PLAYBOOK-002: Malware Containment</option>
                        <option>PLAYBOOK-003: Revoke Credentials</option>
                    </select>
                    <button disabled className="w-full bg-slate-700 text-slate-400 font-bold py-2 px-4 rounded cursor-not-allowed">
                        Execute Playbook
                    </button>
                </div>
            </div>

            {/* ENFORCED BLOCKS TABLE */}
            <div className="bg-siempanel border border-slate-800 rounded-xl overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                    <h2 className="text-lg font-semibold text-white">Currently Enforced Blocks via API</h2>
                </div>
                <table className="w-full text-left font-mono text-sm">
                    <thead className="text-slate-500 bg-slate-900/50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">IP Address</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {blockedIps.map(ip => (
                            <tr key={ip} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 text-siemdanger font-bold">{ip}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-siemdanger/20 text-siemdanger border border-siemdanger/50 px-2 py-1 rounded text-xs">BLOCKED (iptables/ufw)</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleUnblock(ip)} className="text-slate-300 hover:text-white flex items-center justify-end space-x-1 w-full">
                                        <Unlock size={14} /> <span>Unblock</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {blockedIps.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-8 text-slate-500 font-sans">No IPs are currently blocked.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
