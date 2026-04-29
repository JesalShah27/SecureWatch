import React, { useState } from 'react';
import { FileText, DownloadCloud, Clock, Calendar, CheckCircle } from 'lucide-react';
import { Card } from './shared';

const REPORTS = [
  { id: 1, name: 'Executive Security Summary', desc: 'High-level posture, incident count, MTTD/MTTR, blocked threats, and SOC performance metrics.', lastRun: 'Today 08:00', schedule: 'Daily 08:00', format: 'PDF', icon: '📊' },
  { id: 2, name: 'Compliance: ISO 27001', desc: 'Maps current log coverage and controls to ISO 27001 Annex A requirements with gap analysis.', lastRun: '1 week ago', schedule: 'Weekly Mon 06:00', format: 'PDF', icon: '✅' },
  { id: 3, name: 'Threat Intelligence Report', desc: 'Summary of IOCs observed, attacking campaigns, blocked geographic regions, and CVE exposure.', lastRun: 'Yesterday 14:00', schedule: 'Daily 14:00', format: 'PDF', icon: '🌍' },
  { id: 4, name: 'User Activity & Audit Trail', desc: 'Privileged account usage, anomalous login patterns, failed authentications, and after-hours access.', lastRun: '3 days ago', schedule: 'Weekly Fri 17:00', format: 'CSV', icon: '👤' },
  { id: 5, name: 'Vulnerability Assessment', desc: 'All open CVEs, CVSS scores, patch status, affected assets, and recommended remediation order.', lastRun: '2 days ago', schedule: 'Weekly Sun 02:00', format: 'PDF', icon: '🛡️' },
  { id: 6, name: 'Incident Response Summary', desc: 'All incidents in period: status, severity, MTTR, assigned analyst, and resolution notes.', lastRun: 'Today 06:00', schedule: 'Daily 06:00', format: 'PDF', icon: '🚨' },
];

export default function Reports({ addToast }) {
  const [generating, setGenerating] = useState(null);
  const [generated, setGenerated] = useState([]);

  const generate = (id) => {
    setGenerating(id);
    const rep = REPORTS.find(r => r.id === id);
    setTimeout(() => {
      setGenerating(null);
      setGenerated(prev => [...prev, id]);
      addToast(`${rep.name} generated successfully`, 'success');
    }, 2000);
  };

  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Reporting Engine</h2>
        <div className="text-[10px] text-[#8b949e] bg-[#1e2535] px-3 py-1.5 rounded flex items-center gap-2">
          <Calendar size={12} /> Next scheduled: Today 14:00
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REPORTS.map(rep => {
          const isGenerating = generating === rep.id;
          const isDone = generated.includes(rep.id);
          return (
            <Card key={rep.id} className="flex flex-col group hover:border-[#00d4ff]/30 transition-all">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">{rep.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#e8eaed] text-sm">{rep.name}</h3>
                  <div className="text-[9px] text-[#8b949e] flex items-center gap-2 mt-0.5">
                    <Clock size={9} /> Last: {rep.lastRun}
                    <span>• Auto: {rep.schedule}</span>
                  </div>
                </div>
                <span className="text-[9px] bg-[#1e2535] text-[#8b949e] px-1.5 py-0.5 rounded font-mono">{rep.format}</span>
              </div>

              <p className="text-xs text-[#8b949e] mb-4 flex-1 ml-9">{rep.desc}</p>

              {isGenerating && (
                <div className="mb-3 ml-9">
                  <div className="flex justify-between text-[9px] text-[#8b949e] mb-1">
                    <span>Generating report...</span>
                  </div>
                  <div className="bg-[#1e2535] h-1 rounded overflow-hidden">
                    <div className="h-full bg-[#00d4ff] rounded animate-[progress_2s_ease-in-out_forwards]" style={{ width: '100%', animation: 'none', transition: 'width 2s ease' }}></div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between ml-9">
                <button onClick={() => addToast(`${rep.name} scheduled`, 'info')}
                  className="text-xs bg-[#1e2535] hover:bg-[#2a3441] text-[#8b949e] hover:text-[#e8eaed] px-3 py-1.5 rounded font-bold transition-colors">
                  Schedule
                </button>
                <button onClick={() => !isGenerating && !isDone && generate(rep.id)}
                  disabled={isGenerating}
                  className={`text-xs px-3 py-1.5 rounded font-bold flex items-center gap-1.5 transition-colors ${
                    isDone ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/30' :
                    isGenerating ? 'bg-[#00d4ff]/20 text-[#00d4ff] cursor-wait animate-pulse' :
                    'bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a]'
                  }`}>
                  {isDone ? <><CheckCircle size={12} /> Downloaded</> :
                    isGenerating ? 'Generating...' :
                      <><DownloadCloud size={12} /> Generate</>}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
