import React, { useState } from 'react';
import { Search, Globe, FileDigit, AlertTriangle, ShieldCheck } from 'lucide-react';
import { lookupThreatIntelIP, lookupThreatIntelHash } from '../services/api';

export default function ThreatIntel() {
    const [query, setQuery] = useState("");
    const [queryType, setQueryType] = useState("ip"); // "ip" or "hash"
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResults(null);
        
        try {
            if (queryType === "ip") {
                const data = await lookupThreatIntelIP(query);
                setResults({ type: "ip", data });
            } else {
                const data = await lookupThreatIntelHash(query);
                setResults({ type: "hash", data });
            }
        } catch (err) {
            console.error(err);
            setResults({ error: "Failed to connect to backend intelligence router." });
        }
        
        setLoading(false);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-8">Manual Threat Intelligence</h1>

            <div className="bg-siempanel border border-slate-800 rounded-xl p-6 shadow-lg mb-8">
                <form onSubmit={handleSearch} className="flex space-x-4">
                    <select 
                        value={queryType}
                        onChange={(e) => setQueryType(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none"
                    >
                        <option value="ip">IP Address</option>
                        <option value="hash">File Hash (MD5, SHA256)</option>
                    </select>
                    
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            required
                            placeholder={queryType === "ip" ? "e.g. 185.15.20.100" : "e.g. 44d88612fea8a8f36de82e1278abb02f..."}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded pl-10 pr-4 py-2 w-full text-white outline-none focus:border-siemaccent font-mono"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-siemaccent hover:bg-cyan-500 text-siembg font-bold py-2 px-6 rounded transition-colors"
                    >
                        {loading ? "Searching..." : "Analyze"}
                    </button>
                </form>
            </div>

            {results && (
                <div className="bg-siempanel border border-slate-800 rounded-xl p-6 shadow-lg animate-pulse md:animate-none">
                    {results.error || results.data?.error ? (
                        <div className="text-siemdanger flex items-center space-x-2">
                            <AlertTriangle size={20} />
                            <span>{results.error || results.data.error}</span>
                        </div>
                    ) : results.type === "ip" ? (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <Globe className="text-siemwarn" size={28} />
                                    <h2 className="text-2xl font-bold text-white font-mono">{results.data.ipAddress}</h2>
                                </div>
                                <div className={`px-4 py-1 rounded font-bold ${results.data.abuseConfidenceScore > 50 ? 'bg-siemdanger/20 text-siemdanger border border-siemdanger/50' : 'bg-siemok/10 text-siemok border border-siemok/50'}`}>
                                    {results.data.abuseConfidenceScore > 50 ? 'MALICIOUS' : 'CLEAN'}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6 font-mono text-sm">
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1">Abuse Confidence</p>
                                    <p className={`text-2xl ${results.data.abuseConfidenceScore > 50 ? 'text-siemdanger' : 'text-siemok'}`}>{results.data.abuseConfidenceScore}%</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1">Total Reports (30 Days)</p>
                                    <p className="text-white text-2xl">{results.data.totalReports}</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1">ISP / Usage Type</p>
                                    <p className="text-white text-lg">{results.data.isp}</p>
                                    <p className="text-slate-400 text-xs mt-1">{results.data.domain || 'Unknown Domain'}</p>
                                </div>
                            </div>
                            <p className="text-right text-xs text-slate-500 mt-4">Powered by AbuseIPDB</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <FileDigit className="text-siemdanger" size={28} />
                                    <h2 className="text-lg font-bold text-white font-mono break-all">{query}</h2>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-6 font-mono text-sm">
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1 flex items-center space-x-1"><AlertTriangle size={12}/> <span>Malicious Hits</span></p>
                                    <p className="text-3xl text-siemdanger">{results.data.malicious || 0}</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1">Suspicious</p>
                                    <p className="text-3xl text-siemwarn">{results.data.suspicious || 0}</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1 flex items-center space-x-1"><ShieldCheck size={12}/> <span>Undetected</span></p>
                                    <p className="text-3xl text-siemok">{results.data.undetected || 0}</p>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded">
                                    <p className="text-slate-500 uppercase text-xs mb-1">Harmless Context</p>
                                    <p className="text-3xl text-slate-400">{results.data.harmless || 0}</p>
                                </div>
                            </div>
                            <p className="text-right text-xs text-slate-500 mt-4">Powered by VirusTotal</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
