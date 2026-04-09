import React, { useState, useEffect } from 'react';
import { Search, Play, Library, AlertOctagon, Terminal } from 'lucide-react';
import { fetchHuntPlaybooks, executeHuntQuery } from '../services/api';

const ThreatHunting = () => {
    const [playbooks, setPlaybooks] = useState([]);
    const [query, setQuery] = useState('');
    const [indexPattern, setIndexPattern] = useState('siem-*');
    const [results, setResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const loadPlaybooks = async () => {
            try {
                const data = await fetchHuntPlaybooks();
                setPlaybooks(data);
            } catch (err) {
                console.error("Failed to load playbooks:", err);
            }
        };
        loadPlaybooks();
    }, []);

    const handleExecute = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setResults(null);
        try {
            const data = await executeHuntQuery(query, indexPattern);
            setResults(data);
        } catch (err) {
            console.error("Hunt failed:", err);
            setResults({ error: "Search failed. Backend may not be connected to ES." });
        } finally {
            setIsSearching(false);
        }
    };

    const loadPlaybook = (playbook) => {
        setQuery(playbook.query_string);
        setIndexPattern(playbook.index_pattern);
    };

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2 flex items-center">
                        <Terminal className="mr-3 text-siemaccent" size={32} />
                        Threat Hunting Workbench
                    </h1>
                    <p className="text-slate-400">Proactively query log data to uncover sophisticated threats hiding in your environment.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                {/* PLAYBOOKS LIBRARY */}
                <div className="bg-siempanel border border-slate-800 rounded-lg overflow-hidden flex flex-col lg:col-span-1 border-r">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 flex items-center">
                        <Library className="mr-2 text-siemaccent" size={18} />
                        <h2 className="font-bold text-white text-lg">Hunt Playbooks</h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {playbooks.map(pb => (
                            <div 
                                key={pb.id} 
                                onClick={() => loadPlaybook(pb)}
                                className="p-3 rounded border border-slate-800 bg-slate-900 hover:border-siemaccent cursor-pointer transition-colors"
                            >
                                <div className="font-bold text-white text-sm leading-tight mb-1">{pb.name}</div>
                                <div className="text-xs text-slate-500 mb-2 truncate" title={pb.description}>{pb.description}</div>
                                <div className="flex space-x-2 text-[10px] font-mono">
                                    <span className="text-orange-400 bg-orange-900/30 px-1 py-0.5 rounded border border-orange-800/50">{pb.mitre_tactic}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* HUNTING WORKBENCH */}
                <div className="bg-siempanel rounded-lg flex flex-col lg:col-span-3">
                    <div className="p-4 border-b border-slate-800 flex flex-col space-y-4">
                        <div className="flex space-x-2">
                            <input 
                                type="text"
                                className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono rounded p-3 focus:outline-none focus:border-siemaccent placeholder-slate-600"
                                placeholder="process.name:powershell.exe AND process.command_line:*-enc*"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                            />
                            <select 
                                className="w-48 bg-slate-900 border border-slate-700 text-slate-300 rounded p-3 focus:outline-none focus:border-siemaccent"
                                value={indexPattern}
                                onChange={(e) => setIndexPattern(e.target.value)}
                            >
                                <option value="siem-*">siem-*</option>
                                <option value="siem-logs-endpoint-*">siem-logs-endpoint-*</option>
                                <option value="siem-logs-network-*">siem-logs-network-*</option>
                            </select>
                            <button 
                                onClick={handleExecute}
                                disabled={isSearching || !query}
                                className="bg-siemaccent hover:bg-cyan-500 text-slate-900 font-bold px-6 py-3 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSearching ? <span className="animate-spin mr-2">⟳</span> : <Search size={18} className="mr-2" />}
                                Hunt
                            </button>
                        </div>
                    </div>

                    {/* RESULTS AREA */}
                    <div className="flex-1 overflow-y-auto bg-[#0d1117] p-4 relative">
                        {!results && !isSearching ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                                <Search size={64} className="mb-4 opacity-30" />
                                <p className="text-lg">Enter a Lucene/KQL query or select a playbook</p>
                                <p className="text-sm mt-2">to begin threat hunting</p>
                            </div>
                        ) : isSearching ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-siemaccent">
                                <span className="animate-spin text-4xl mb-4">⟳</span>
                                <p>Executing cross-cluster search...</p>
                            </div>
                        ) : results.error ? (
                            <div className="flex items-center text-rose-500 p-4 bg-rose-900/20 border border-rose-800 rounded">
                                <AlertOctagon className="mr-2" /> {results.error}
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4 text-sm text-slate-400">
                                    <span>Hits: <strong className="text-white">{results.total_hits}</strong></span>
                                    <span>Time: <strong className="text-white">{results.took_ms}ms</strong></span>
                                </div>
                                {results.total_hits === 0 ? (
                                    <div className="flex-1 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded">
                                        No telemetry matched the hunting query.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {results.data.map((doc, i) => (
                                            <div key={i} className="bg-slate-900 border border-slate-800 rounded p-4 font-mono text-xs overflow-x-auto text-slate-300">
                                                <div className="text-siemaccent mb-2 border-b border-slate-800 pb-2">
                                                    _id: {doc._id} &nbsp;|&nbsp; _score: {doc._score.toFixed(3)}
                                                </div>
                                                <pre className="whitespace-pre-wrap">{JSON.stringify(doc._source, null, 2)}</pre>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatHunting;
