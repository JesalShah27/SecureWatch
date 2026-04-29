// Shared utilities and components

export const severityColors = {
  critical: '#ff3355',
  high: '#ffaa00',
  medium: '#ffcc00',
  low: '#33cc33',
  info: '#00d4ff',
};

export const SeverityBadge = ({ severity }) => {
  const color = severityColors[severity] || '#8b949e';
  return (
    <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${color}22`, color }}>
      {severity}
    </span>
  );
};

export const Card = ({ children, className = '', danger = false }) => (
  <div className={`${danger ? 'glass-card-danger' : 'glass-card'} p-4 ${className}`}>
    {children}
  </div>
);

export const Clock = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export const StatusDot = ({ status }) => {
  const colors = {
    online: 'bg-[#00ff88]',
    offline: 'bg-[#8b949e]',
    compromised: 'bg-[#ff3355] animate-ping',
    isolated: 'bg-[#ffaa00]',
    suspicious: 'bg-[#ffcc00] animate-pulse',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[status] || 'bg-[#8b949e]'}`}></span>;
};
