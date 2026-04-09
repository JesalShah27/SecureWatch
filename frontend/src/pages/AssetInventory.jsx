import React, { useState, useEffect } from 'react';
import { api, fetchAssets } from '../services/api';
import { Network, Server, Shield } from 'lucide-react';

export default function AssetInventory() {
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAssets();
                setAssets(data);
            } catch (err) {
                console.error("Failed to load assets", err);
            }
        }
        load();
    }, []);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Asset Inventory</h1>
                    <p className="text-siemmelow mt-2">Discovered entities and their calculated risk profiles</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-siempanel rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center">
                    <Network className="text-siemaccent mb-2" size={32} />
                    <p className="text-2xl font-bold text-white">{assets.length}</p>
                    <p className="text-siemmelow text-sm">Monitored Assets</p>
                </div>
                <div className="bg-siempanel rounded-xl border border-siemdanger/30 p-6 flex flex-col items-center justify-center">
                    <Shield className="text-siemdanger mb-2" size={32} />
                    <p className="text-2xl font-bold text-siemdanger">{assets.filter(a => a.risk_score > 60).length}</p>
                    <p className="text-siemmelow text-sm">High Risk Assets</p>
                </div>
                <div className="bg-siempanel rounded-xl border border-siemok/30 p-6 flex flex-col items-center justify-center">
                    <Server className="text-siemok mb-2" size={32} />
                    <p className="text-2xl font-bold text-siemok">{assets.filter(a => a.risk_score <= 60).length}</p>
                    <p className="text-siemmelow text-sm">Healthy Assets</p>
                </div>
            </div>

            <div className="bg-siempanel border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800/80 text-siemmelow text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Entity Identifier</th>
                            <th className="px-6 py-4">Net Risk Score</th>
                            <th className="px-6 py-4">Triggered Tactics</th>
                            <th className="px-6 py-4">Latest Incident</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono">
                        {assets.map((asset, i) => (
                            <tr key={i} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-bold text-white">{asset.entity_id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-full bg-slate-700 rounded-full h-2.5 max-w-[100px]">
                                            <div 
                                                className={`h-2.5 rounded-full ${asset.risk_score > 70 ? 'bg-siemdanger' : asset.risk_score > 30 ? 'bg-siemwarn' : 'bg-siemok'}`} 
                                                style={{width: `${asset.risk_score}%`}}
                                            ></div>
                                        </div>
                                        <span className="text-slate-300">{asset.risk_score}/100</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {asset.tactics_hit.length === 0 ? <span className="text-slate-500">None</span> : 
                                            asset.tactics_hit.map((t, idx) => (
                                                <span key={idx} className="bg-slate-700 text-xs px-2 py-0.5 rounded text-slate-300">{t}</span>
                                            ))
                                        }
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-siemmelow">{asset.latest_alert || 'N/A'}</td>
                            </tr>
                        ))}
                        {assets.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center py-10 font-sans text-siemmelow">
                                    No assets have been registered into the Risk Engine yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
