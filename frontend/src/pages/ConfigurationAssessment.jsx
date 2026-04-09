import React, { useState, useEffect } from 'react';
import { Search, Server, CheckCircle, XCircle, FileText, ClipboardList } from 'lucide-react';
import { fetchSCAResults, fetchSCASummary } from '../services/api';

const ConfigurationAssessment = () => {
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [scaData, sumData] = await Promise.all([
                    fetchSCAResults(),
                    fetchSCASummary()
                ]);
                setResults(scaData);
                setSummary(sumData);
            } catch (err) {
                console.error("Failed to fetch SCA data:", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 70) return 'text-amber-400';
        return 'text-rose-400';
    };

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2 flex items-center">
                        <ClipboardList className="mr-3 text-siemaccent" size={32} />
                        Security Configuration Assessment
                    </h1>
                    <p className="text-slate-400">Validate system hardening continuously against CIS benchmarks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-siempanel border border-slate-800 p-4 rounded-lg">
                    <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Fleet Pass Rate</h3>
                    <div className={`text-4xl font-mono font-bold ${getScoreColor(summary.avg_score || 0)}`}>
                        {summary.avg_score || 0}%
                    </div>
                </div>
                <div className="bg-siempanel border border-slate-800 p-4 rounded-lg">
                    <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Policies Scanned</h3>
                    <div className="text-4xl text-white font-mono font-bold">
                        {summary.total_policies_scanned || 0}
                    </div>
                </div>
                <div className="bg-siempanel border border-slate-800 p-4 rounded-lg">
                    <h3 className="text-slate-400 uppercase text-xs font-bold mb-2">Failed Checks Across Fleet</h3>
                    <div className="text-4xl text-rose-500 font-mono font-bold">
                        {summary.failed_checks || 0}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                <div className="bg-siempanel border border-slate-800 rounded-lg overflow-y-auto lg:col-span-1">
                    <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0">
                        <h2 className="font-bold text-white text-lg">Agent Scans</h2>
                    </div>
                    <div className="p-2 space-y-2">
                        {results.map(r => (
                            <div 
                                key={r.id} 
                                onClick={() => setSelectedPolicy(r)}
                                className={`p-4 rounded border cursor-pointer transition-colors ${
                                    selectedPolicy?.id === r.id ? 'bg-slate-800 border-siemaccent' : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-bold text-white truncate max-w-[70%]">{r.hostname}</div>
                                    <div className={`font-mono font-bold ${getScoreColor(r.score)}`}>{r.score}%</div>
                                </div>
                                <div className="text-xs text-slate-400 mb-2 truncate">
                                    <FileText size={12} className="inline mr-1" /> {r.policy_name}
                                </div>
                                <div className="flex space-x-2 text-xs">
                                    <span className="text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">Pass: {r.passed_checks}</span>
                                    <span className="text-rose-400 bg-rose-900/30 px-2 py-1 rounded">Fail: {r.total_checks - r.passed_checks}</span>
                                </div>
                            </div>
                        ))}
                        {results.length === 0 && !loading && (
                            <div className="p-6 text-center text-slate-500">No scans available.</div>
                        )}
                    </div>
                </div>

                <div className="bg-siempanel border border-slate-800 rounded-lg overflow-hidden flex flex-col lg:col-span-2">
                    {selectedPolicy ? (
                        <>
                            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-white text-lg">{selectedPolicy.policy_name}</h2>
                                    <div className="text-sm text-slate-400 font-mono">Host: {selectedPolicy.hostname} | Scan Time: {new Date(selectedPolicy.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-1 p-4 space-y-3">
                                {selectedPolicy.results.map((check, idx) => (
                                    <div key={idx} className="border border-slate-800 bg-slate-900 rounded p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-start">
                                                {check.status === 'passed' ? (
                                                    <CheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={18} />
                                                ) : (
                                                    <XCircle className="text-rose-500 mt-1 mr-3 flex-shrink-0" size={18} />
                                                )}
                                                <div>
                                                    <div className="font-bold text-siemaccent">[{check.check_id}] {check.title}</div>
                                                    <div className="text-sm text-slate-400 mt-1">{check.description}</div>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${check.status === 'passed' ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800' : 'bg-rose-900/40 text-rose-400 border border-rose-800'}`}>
                                                {check.status}
                                            </div>
                                        </div>
                                        {check.status === 'failed' && check.remediation && (
                                            <div className="mt-3 pl-8 text-sm border-l-2 border-rose-500 ml-2">
                                                <div className="font-bold text-rose-300">Remediation:</div>
                                                <code className="bg-slate-800 p-2 rounded block mt-1 text-rose-200">
                                                    {check.remediation}
                                                </code>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <Server size={48} className="mb-4 opacity-50" />
                            <p>Select a scan result to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigurationAssessment;
