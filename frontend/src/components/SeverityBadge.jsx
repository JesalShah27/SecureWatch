import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getSeverityStyles = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return 'bg-siemdanger/20 text-siemdanger border-siemdanger/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]';
      case 'high':
        return 'bg-siemwarn/20 text-siemwarn border-siemwarn/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
      case 'low':
        return 'bg-siemok/20 text-siemok border-siemok/50';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border ${getSeverityStyles(severity)}`}>
      {severity || 'UNKNOWN'}
    </span>
  );
};

export default SeverityBadge;
