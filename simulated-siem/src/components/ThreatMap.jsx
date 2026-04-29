import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, Line } from 'react-simple-maps';
import { Card } from './shared';

const THREAT_SOURCES = [
  { name: 'RU', coordinates: [37.6, 55.7], color: '#ff3355', count: '4,210', label: 'Moscow, RU' },
  { name: 'CN', coordinates: [116.4, 39.9], color: '#ffaa00', count: '2,845', label: 'Beijing, CN' },
  { name: 'KP', coordinates: [125.7, 39.0], color: '#00d4ff', count: '1,102', label: 'Pyongyang, KP' },
  { name: 'IR', coordinates: [51.4, 35.7], color: '#ff6600', count: '842', label: 'Tehran, IR' },
  { name: 'NG', coordinates: [3.4, 6.5], color: '#ffcc00', count: '614', label: 'Lagos, NG' },
];

const TARGET = [78.96, 20.59]; // India

export default function ThreatMap() {
  const [active, setActive] = useState(null);

  return (
    <div className="h-full flex flex-col animate-slide-down gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Global Threat Map</h2>
        <div className="flex gap-2 text-[10px]">
          {THREAT_SOURCES.map(s => (
            <span key={s.name} className="flex items-center gap-1 bg-[#1e2535] px-2 py-1 rounded cursor-pointer hover:bg-[#2a3441]" onClick={() => setActive(s.name === active ? null : s.name)}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></span>
              <span style={{ color: s.color }}>{s.name}</span>
              <span className="text-[#8b949e]">{s.count}</span>
            </span>
          ))}
        </div>
      </div>

      <Card className="flex-1 relative overflow-hidden bg-[#050505] p-0 min-h-[400px]">
        <div className="absolute inset-0">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 140, center: [40, 30] }}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography="/features.json">
              {({ geographies }) => geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#111111"
                  stroke="#1e2535"
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { fill: '#1a1a2e', outline: 'none' }, pressed: { outline: 'none' } }}
                />
              ))}
            </Geographies>

            {THREAT_SOURCES.filter(s => !active || s.name === active).map((src, i) => (
              <Line
                key={`line-${i}`}
                from={src.coordinates}
                to={TARGET}
                stroke={src.color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            ))}

            <Marker coordinates={TARGET}>
              <circle r={6} fill="#00ff88" />
              <circle r={14} fill="#00ff88" opacity={0.15} className="animate-ping" />
              <circle r={22} fill="#00ff88" opacity={0.07} className="animate-ping" style={{ animationDelay: '0.5s' }} />
              <text textAnchor="middle" y={-18} style={{ fontFamily: 'monospace', fill: '#00ff88', fontSize: '9px' }}>HQ</text>
            </Marker>

            {THREAT_SOURCES.filter(s => !active || s.name === active).map((src, i) => (
              <Marker key={`marker-${i}`} coordinates={src.coordinates}>
                <circle r={5} fill={src.color} className="animate-pulse" />
                <circle r={10} fill={src.color} opacity={0.2} />
                <text textAnchor="middle" y={-14} style={{ fontFamily: 'monospace', fill: src.color, fontSize: '9px', fontWeight: 'bold' }}>{src.name}</text>
              </Marker>
            ))}
          </ComposableMap>
        </div>

        {/* Overlay panel */}
        <div className="absolute top-4 left-4 glass-card p-4 w-56 z-10">
          <h3 className="text-[10px] font-bold uppercase text-[#8b949e] mb-3">Attack Summary</h3>
          <div className="space-y-2">
            {THREAT_SOURCES.map(s => (
              <div key={s.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span style={{ color: s.color }}>{s.label}</span>
                </div>
                <span className="font-mono text-[#e8eaed]">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1e2535] mt-3 pt-3 text-[9px] text-[#8b949e]">
            Click a country tag to filter lines
          </div>
        </div>

        <div className="absolute bottom-4 right-4 glass-card p-3 z-10 text-[9px] text-[#8b949e]">
          <div className="flex items-center gap-1.5 mb-1"><span className="w-3 h-0.5 bg-[#ff3355] inline-block"></span>Active Attack</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00ff88] inline-block"></span>Protected HQ</div>
        </div>
      </Card>
    </div>
  );
}
