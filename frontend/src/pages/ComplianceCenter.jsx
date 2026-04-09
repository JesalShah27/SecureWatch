import React, { useState, useEffect } from 'react';
import { ShieldCheck, BookOpen, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { fetchComplianceState } from '../services/api';

const ComplianceCenter = () => {
    const [complianceData, setComplianceData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchComplianceState();
                setComplianceData(data);
            } catch (err) {
                console.error("Failed to load compliance state:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400 border-emerald-500 bg-emerald-900/20';
        if (score >= 70) return 'text-amber-400 border-amber-500 bg-amber-900/20';
        return 'text-rose-400 border-rose-500 bg-rose-900/20';
    };

    if (loading || !complianceData) {
        return <div className="p-6 text-slate-400">Loading Compliance Data...</div>;
    }

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2 flex items-center">
                        <BookOpen className="mr-3 text-siemaccent" size={32} />
                        Regulatory Compliance Center
                    </h1>
                    <p className="text-slate-400">Unified view of your compliance posture across established frameworks.</p>
                </div>
                <div className={`p-4 rounded-lg flex flex-col items-center justify-center border ${getScoreColor(complianceData.overall_score)}`}>
                    <div className="text-xs uppercase font-bold opacity-80 mb-1">Overall Posture</div>
                    <div className="text-3xl font-mono font-bold">{complianceData.overall_score}/100</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto">
                {Object.entries(complianceData.frameworks).map(([key, framework]) => (
                    <div key={key} className="bg-siempanel border border-slate-800 rounded-lg p-5 flex flex-col hover:border-slate-600 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                {framework.compliance_score >= 90 ? (
                                    <ShieldCheck className="text-emerald-400 mr-2" size={24} />
                                ) : (
                                    <FileText className="text-slate-400 mr-2" size={24} />
                                )}
                                {framework.name}
                            </h2>
                            <div className={`px-2 py-1 rounded text-sm font-bold font-mono border ${getScoreColor(framework.compliance_score)}`}>
                                {framework.compliance_score}%
                            </div>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                                <span className="text-slate-400 text-sm">Active Violations</span>
                                <span className="text-2xl font-mono text-rose-400 font-bold">{framework.total_violations}</span>
                            </div>
                            
                            <div>
                                <span className="text-slate-400 text-sm block mb-2">Failed Controls</span>
                                {framework.controls_failed.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {framework.controls_failed.map(c => (
                                            <span key={c} className="bg-rose-900/30 text-rose-300 border border-rose-800 px-2 py-1 rounded text-xs font-mono">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-emerald-400 text-sm flex items-center">
                                        <CheckCircle size={14} className="mr-1" /> All monitored controls passing
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplianceCenter;
