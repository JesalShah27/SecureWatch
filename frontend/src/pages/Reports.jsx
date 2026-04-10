import React from 'react';
import { FileDown, FileText, CheckCircle, Clock } from 'lucide-react';
import { generateReport } from '../services/api';

const Reports = () => {
    const [isGenerating, setIsGenerating] = React.useState(false);

    const handleDownloadReport = async () => {
        setIsGenerating(true);
        try {
            const blob = await generateReport();
            
            const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', `SecureWatch_Executive_Report_${new Date().toISOString().slice(0,10)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            // Revoke the object URL to free memory
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
        } catch (error) {
            console.error("Failed to download PDF report:", error);
            alert(`Error generating report: ${error?.response?.data?.detail || error.message || 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2 flex items-center">
                        <FileDown className="mr-3 text-siemaccent" size={32} />
                        Reporting Engine
                    </h1>
                    <p className="text-slate-400">Generate executive summaries and compliance audit evidence on demand.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Executive Report Card */}
                <div className="bg-siempanel border border-slate-800 rounded-lg p-6 flex flex-col transform hover:scale-105 transition-transform">
                    <div className="flex items-center space-x-3 mb-4">
                        <FileText className="text-siemaccent" size={32} />
                        <h2 className="text-xl font-bold text-white">Executive Summary</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 flex-1">
                        Comprehensive C-Level overview rolling up active critical alerts, compliance grades (PCI, NIST, CIS), and active vulnerability summaries.
                    </p>
                    
                    <ul className="text-sm text-slate-500 space-y-2 mb-6">
                        <li className="flex items-center"><CheckCircle size={14} className="mr-2 text-emerald-500" /> Active Alert Snapshot</li>
                        <li className="flex items-center"><CheckCircle size={14} className="mr-2 text-emerald-500" /> Compliance Posture Grades</li>
                        <li className="flex items-center"><CheckCircle size={14} className="mr-2 text-emerald-500" /> Vulnerability Patch List</li>
                    </ul>

                    <button 
                        onClick={handleDownloadReport}
                        disabled={isGenerating}
                        className="w-full bg-siemaccent hover:bg-cyan-500 text-slate-900 font-bold px-4 py-3 rounded flex justify-center items-center disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <><span className="animate-spin mr-2 text-xl leading-none">⟳</span> Compiling PDF...</>
                        ) : (
                            <><FileDown size={18} className="mr-2" /> Download PDF Report</>
                        )}
                    </button>
                </div>

                {/* Future Upcoming Report Cards */}
                <div className="bg-siempanel border border-slate-800 rounded-lg p-6 flex flex-col opacity-50 cursor-not-allowed">
                    <div className="flex items-center space-x-3 mb-4">
                        <FileText className="text-slate-500" size={32} />
                        <h2 className="text-xl font-bold text-white">PCI-DSS Evidence Package</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 flex-1">
                        Generates a full audit trail and FIM historical log package corresponding directly to PCI sections 10 & 11.
                    </p>
                    <button disabled className="w-full bg-slate-800 text-slate-500 font-bold px-4 py-3 rounded flex justify-center items-center">
                        <Clock size={16} className="mr-2" /> Roadmap Item
                    </button>
                </div>
                
                <div className="bg-siempanel border border-slate-800 rounded-lg p-6 flex flex-col opacity-50 cursor-not-allowed">
                    <div className="flex items-center space-x-3 mb-4">
                        <FileText className="text-slate-500" size={32} />
                        <h2 className="text-xl font-bold text-white">Agent Health Dump</h2>
                    </div>
                    <p className="text-sm text-slate-400 mb-6 flex-1">
                        Extracts 30-day uptime and resource consumption graphs for all active monitored endpoints.
                    </p>
                    <button disabled className="w-full bg-slate-800 text-slate-500 font-bold px-4 py-3 rounded flex justify-center items-center">
                        <Clock size={16} className="mr-2" /> Roadmap Item
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Reports;
