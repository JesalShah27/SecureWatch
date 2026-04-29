import React, { useState } from 'react';
import { threatIntelFeed } from '../data';
import { Card } from './shared';
import { Globe, Search, Shield, ExternalLink } from 'lucide-react';

const CONF_COLOR = (c) => c >= 90 ? '#ff3355' : c >= 75 ? '#ffaa00' : '#ffcc00';
const TYPE_COLOR = { IP: '#00d4ff', Domain: '#ffaa00', Hash: '#ff3355', URL: '#00ff88' };

export default function ThreatIntel({ addToast }) {
  const [feed, setFeed] = useState(threatIntelFeed);
  const [searchIOC, setSearchIOC] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [looking, setLooking] = useState(false);

  const lookup = () => {
    if (!searchIOC.trim()) return;
    setLooking(true);
    setTimeout(() => {
      const existing = feed.find(f => f.ioc.toLowerCase().includes(searchIOC.toLowerCase()));
      if (existing) {
        setLookupResult({ found: true, data: existing });
      } else {
        setLookupResult({
          found: true,
          data: {
            ioc: searchIOC,
            type: searchIOC.includes('.') && !searchIOC.includes('/') ? (searchIOC.match(/^\d/) ? 'IP' : 'Domain') : 'Hash',
            threat: 'No known threats',
            confidence: Math.floor(Math.random() * 40) + 10,
            source: 'VirusTotal + AbuseIPDB',
            tags: ['unknown'],
            lastSeen: 'First seen',
          }
        });
      }
      setLooking(false);
    }, 1200);
  };

  const block = (ioc) => {
    addToast(`IOC ${ioc} added to blocklist`, 'success');
  };

  return (
    <div className="animate-slide-down space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Threat Intelligence</h2>
        <div className="flex gap-2 text-[10px] text-[#8b949e]">
          <span className="bg-[#1e2535] px-2 py-1 rounded">Sources: VirusTotal, MISP, AbuseIPDB, GreyNoise, MalwareBazaar</span>
        </div>
      </div>

      {/* IOC Lookup */}
      <Card className="border-[#00d4ff]/20">
        <h3 className="text-xs font-bold text-[#8b949e] uppercase mb-3">IOC Lookup</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]" />
            <input value={searchIOC} onChange={e => setSearchIOC(e.target.value)} onKeyDown={e => e.key === 'Enter' && lookup()}
              placeholder="Enter IP, Domain, or File Hash to investigate..."
              className="w-full bg-[#0a0a0a] border border-[#1e2535] rounded p-2 pl-9 text-sm font-mono text-[#e8eaed] focus:outline-none focus:border-[#00d4ff] transition-colors" />
          </div>
          <button onClick={lookup} disabled={looking}
            className="bg-[#00d4ff] hover:bg-[#00b4d8] text-[#0a0a0a] px-5 py-2 rounded text-sm font-bold transition-colors disabled:opacity-60">
            {looking ? 'Querying...' : 'Lookup'}
          </button>
        </div>
        {lookupResult && (
          <div className="mt-3 bg-[#0a0a0a] border border-[#1e2535] rounded p-3">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div><span className="text-[#8b949e]">IOC: </span><span className="text-[#00d4ff] font-mono">{lookupResult.data.ioc}</span></div>
              <div><span className="text-[#8b949e]">Type: </span><span style={{ color: TYPE_COLOR[lookupResult.data.type] }}>{lookupResult.data.type}</span></div>
              <div><span className="text-[#8b949e]">Confidence: </span><span style={{ color: CONF_COLOR(lookupResult.data.confidence) }}>{lookupResult.data.confidence}%</span></div>
              <div><span className="text-[#8b949e]">Threat: </span><span className="text-[#e8eaed]">{lookupResult.data.threat}</span></div>
              <div><span className="text-[#8b949e]">Source: </span><span className="text-[#8b949e]">{lookupResult.data.source}</span></div>
              <div><span className="text-[#8b949e]">Last Seen: </span><span className="text-[#8b949e]">{lookupResult.data.lastSeen}</span></div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => block(lookupResult.data.ioc)} className="text-xs bg-[#ff3355]/10 hover:bg-[#ff3355]/20 text-[#ff3355] border border-[#ff3355]/30 px-3 py-1.5 rounded font-bold transition-colors">
                Add to Blocklist
              </button>
              <button onClick={() => setLookupResult(null)} className="text-xs bg-[#1e2535] text-[#8b949e] px-3 py-1.5 rounded transition-colors">
                Clear
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Live Feed */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-[#1e2535]">
          <h3 className="text-sm font-bold text-[#e8eaed]">Live IOC Feed</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="text-[#8b949e] border-b border-[#1e2535] text-[10px] uppercase tracking-wider bg-[#111111]">
            <tr>
              <th className="py-2.5 px-4">IOC</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4">Threat</th>
              <th className="py-2.5 px-4">Confidence</th>
              <th className="py-2.5 px-4">Tags</th>
              <th className="py-2.5 px-4">Source</th>
              <th className="py-2.5 px-4">Last Seen</th>
              <th className="py-2.5 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2535]">
            {feed.map((item, i) => (
              <tr key={i} className="hover:bg-[#111111] transition-colors">
                <td className="py-2.5 px-4 font-mono text-[#e8eaed] text-[10px]">{item.ioc}</td>
                <td className="py-2.5 px-4">
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ color: TYPE_COLOR[item.type], backgroundColor: `${TYPE_COLOR[item.type]}22` }}>
                    {item.type}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-[#8b949e] max-w-[180px] truncate" title={item.threat}>{item.threat}</td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-[#1e2535] rounded overflow-hidden">
                      <div className="h-full rounded" style={{ width: `${item.confidence}%`, backgroundColor: CONF_COLOR(item.confidence) }}></div>
                    </div>
                    <span className="font-mono font-bold" style={{ color: CONF_COLOR(item.confidence) }}>{item.confidence}%</span>
                  </div>
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map(t => (
                      <span key={t} className="text-[8px] bg-[#1e2535] text-[#8b949e] px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 px-4 text-[#8b949e] text-[10px]">{item.source}</td>
                <td className="py-2.5 px-4 text-[#8b949e] font-mono text-[10px]">{item.lastSeen}</td>
                <td className="py-2.5 px-4">
                  <button onClick={() => block(item.ioc)}
                    className="text-[9px] bg-[#ff3355]/10 hover:bg-[#ff3355]/20 text-[#ff3355] border border-[#ff3355]/30 px-2 py-0.5 rounded font-bold transition-colors">
                    Block
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
