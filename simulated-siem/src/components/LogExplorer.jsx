import React, { useState, useRef } from 'react';
import { Terminal, Search, Download, Filter, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, SeverityBadge, severityColors } from './shared';

const QUERY_EXAMPLES = [
  'severity:"critical" | last 1h',
  'category:"Authentication" AND action:"Blocked"',
  'sourceHost:"KARAN-WIN11"',
  'mitre:"T1059.001"',
  'eventId:4625 | count by sourceHost',
];

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

export default function LogExplorer({ logs, queryState }) {
  const [query, setQuery] = queryState || useState('severity:"critical" | last 1h');
  const [runQuery, setRunQuery] = useState(query);
  const [showExamples, setShowExamples] = useState(false);
  const [filterSev, setFilterSev] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [expanded, setExpanded] = useState(null);

  // When global query changes (e.g. from Dashboard click), auto-run it
  React.useEffect(() => {
    if (queryState && queryState[0] !== runQuery) {
      setRunQuery(queryState[0]);
    }
  }, [queryState]);

  const applyFilters = (log) => {
    const qLower = runQuery.toLowerCase().replace(/['"]/g, '');
    let pass = true;
    // Simple query matching
    if (qLower.includes('severity:')) {
      const sevMatch = qLower.match(/severity:(\w+)/);
      if (sevMatch && log.severity !== sevMatch[1]) pass = false;
    }
    if (qLower.includes('category:')) {
      const catMatch = qLower.match(/category:(\w+)/);
      if (catMatch && log.category?.toLowerCase() !== catMatch[1].toLowerCase()) pass = false;
    }
    if (qLower.includes('sourcehost:')) {
      const hMatch = qLower.match(/sourcehost:"?([^"\s]+)"?/);
      if (hMatch && !log.sourceHost.toLowerCase().includes(hMatch[1].toLowerCase())) pass = false;
    }
    if (qLower.includes('mitre:')) {
      const mMatch = qLower.match(/mitre:"?([^"\s]+)"?/);
      if (mMatch && log.mitre !== mMatch[1]) pass = false;
    }
    if (filterSev !== 'all' && log.severity !== filterSev) pass = false;
    if (filterCat !== 'all' && log.category !== filterCat) pass = false;
    return pass;
  };

  const filtered = logs.filter(applyFilters).sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
  const categories = ['all', ...new Set(logs.map(l => l.category).filter(Boolean))];

  const exportCSV = () => {
    const headers = ['timestamp', 'severity', 'sourceHost', 'sourceIp', 'eventId', 'category', 'mitre', 'message', 'action'];
    const rows = filtered.slice(0, 500).map(l => headers.map(h => `"${(l[h] || '').toString().replace(/"/g, "'")}"`).join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'siem-logs.csv'; a.click();
  };

  return (
    <div className="animate-slide-down h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Log Explorer</h2>
        <div className="flex gap-2 text-xs text-[#8b949e]">
          <span className="bg-[#1e2535] px-2 py-1 rounded font-mono">{filtered.length.toLocaleString()} results</span>
          <span className="bg-[#1e2535] px-2 py-1 rounded font-mono">{logs.length.toLocaleString()} total logs</span>
        </div>
      </div>

      {/* Query Bar */}
      <Card className="py-3">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Terminal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setRunQuery(query)}
              placeholder='severity:"critical" | last 1h'
              className="w-full bg-[#0a0a0a] border border-[#1e2535] rounded p-2 pl-9 text-sm font-mono text-[#00ff88] focus:outline-none focus:border-[#00d4ff] transition-colors"
            />
          </div>
          <button onClick={() => setRunQuery(query)} className="bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a] px-5 py-2 rounded text-sm font-bold transition-colors">Run</button>
          <button onClick={() => setShowExamples(v => !v)} className="bg-[#1e2535] hover:bg-[#2a3441] text-[#8b949e] px-3 py-2 rounded text-sm transition-colors">
            <ChevronDown size={14} />
          </button>
          <button onClick={exportCSV} className="bg-[#1e2535] hover:bg-[#2a3441] text-[#8b949e] hover:text-[#00ff88] px-3 py-2 rounded text-sm transition-colors" title="Export CSV">
            <Download size={14} />
          </button>
        </div>
        {showExamples && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1e2535]">
            {QUERY_EXAMPLES.map(ex => (
              <button key={ex} onClick={() => { setQuery(ex); setRunQuery(ex); setShowExamples(false); }}
                className="text-[10px] bg-[#0a0a0a] border border-[#1e2535] hover:border-[#00d4ff] text-[#00d4ff] px-2 py-1 rounded font-mono transition-colors">
                {ex}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1e2535] rounded px-2 py-1 text-xs text-[#e8eaed] focus:border-[#00d4ff] focus:outline-none">
            {['all','critical','high','medium','low','info'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-[#0a0a0a] border border-[#1e2535] rounded px-2 py-1 text-xs text-[#e8eaed] focus:border-[#00d4ff] focus:outline-none">
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>
      </Card>

      {/* Results */}
      <Card className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[#8b949e] sticky top-0 bg-[#111111] z-10 shadow-sm">
              <tr className="border-b border-[#1e2535]">
                <th className="py-2 px-3 font-normal w-4"></th>
                <th className="py-2 px-3 font-normal whitespace-nowrap">Timestamp</th>
                <th className="py-2 px-3 font-normal">Severity</th>
                <th className="py-2 px-3 font-normal">Host</th>
                <th className="py-2 px-3 font-normal">Event ID</th>
                <th className="py-2 px-3 font-normal">Category</th>
                <th className="py-2 px-3 font-normal">MITRE</th>
                <th className="py-2 px-3 font-normal w-full">Message</th>
                <th className="py-2 px-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2535]">
              {filtered.slice(0, 100).map((log) => (
                <React.Fragment key={log.id}>
                  <tr onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    className={`hover:bg-[#1a1a1a] cursor-pointer transition-colors ${expanded === log.id ? 'bg-[#1a1a1a]' : ''}`}>
                    <td className="py-1.5 px-3 text-[#8b949e]">
                      {expanded === log.id ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                    </td>
                    <td className="py-1.5 px-3 text-[#8b949e] whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-1.5 px-3">
                      <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: severityColors[log.severity] || '#8b949e' }}></span>
                      <span style={{ color: severityColors[log.severity] || '#8b949e' }}>{log.severity}</span>
                    </td>
                    <td className="py-1.5 px-3 text-[#00d4ff] whitespace-nowrap">{log.sourceHost}</td>
                    <td className="py-1.5 px-3 text-[#ffaa00]">{log.eventId}</td>
                    <td className="py-1.5 px-3 text-[#8b949e] whitespace-nowrap">{log.category}</td>
                    <td className="py-1.5 px-3">
                      {log.mitre && <span className="bg-[#1e2535] text-[#00d4ff] px-1.5 py-0.5 rounded text-[9px]">{log.mitre}</span>}
                    </td>
                    <td className="py-1.5 px-3 text-[#e8eaed] truncate max-w-[400px]">{log.message}</td>
                    <td className="py-1.5 px-3">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${log.action === 'Blocked' ? 'text-[#00ff88] bg-[#00ff88]/10' : 'text-[#8b949e] bg-[#1e2535]'}`}>
                        {log.action}
                      </span>
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr className="bg-[#0a0a0a]">
                      <td colSpan={9} className="px-6 py-3">
                        <div className="grid grid-cols-3 gap-4 text-[10px]">
                          {[
                            ['Source IP', log.sourceIp], ['Dest IP', log.destIp], ['Rule ID', log.ruleId],
                            ['Full Message', log.message], ['MITRE Tactic', log.mitre || 'N/A'], ['Timestamp', log.timestamp],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <div className="text-[#8b949e] mb-0.5">{k}</div>
                              <div className="text-[#e8eaed] break-all">{v}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-[#8b949e]">
              <Search size={32} className="mb-3 opacity-30" />
              <div className="text-sm">No logs match your query</div>
              <div className="text-xs mt-1 opacity-50">Try modifying the search or removing filters</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
