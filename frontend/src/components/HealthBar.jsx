import React, { useState, useEffect } from 'react';
import { Activity, ServerCrash, AlertTriangle, ShieldCheck } from 'lucide-react';
import { fetchBackendHealth } from '../services/api';

const HealthBar = () => {
    const [health, setHealth] = useState(null);

    useEffect(() => {
        const loadHealth = async () => {
            try {
                const data = await fetchBackendHealth();
                setHealth(data);
            } catch (err) {
                setHealth({ status: 'critical', error: true });
            }
        };
        
        loadHealth();
        const interval = setInterval(loadHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    if (!health) return null;

    const getStatusStyle = () => {
        if (health.status === 'healthy') return 'bg-emerald-900/50 text-emerald-400 border-emerald-800';
        if (health.status === 'warning') return 'bg-amber-900/50 text-amber-400 border-amber-800';
        return 'bg-rose-900/50 text-rose-400 border-rose-800';
    };

    const getIcon = () => {
        if (health.status === 'healthy') return <ShieldCheck size={14} className="mr-1" />;
        if (health.status === 'warning') return <AlertTriangle size={14} className="mr-1" />;
        return <ServerCrash size={14} className="mr-1" />;
    };

    return (
        <div className={`px-3 py-1 flex items-center text-xs font-mono font-bold border-b transition-colors ${getStatusStyle()}`}>
            {getIcon()}
            <span className="uppercase tracking-widest mr-4">System: {health.status}</span>
            
            {health.system && (
                <div className="flex space-x-4 opacity-80 hidden md:flex">
                    <span>CPU: {health.system.cpu_percent.toFixed(1)}%</span>
                    <span>MEM: {health.system.memory_percent.toFixed(1)}%</span>
                    <span>DISK: {health.system.disk_percent.toFixed(1)}%</span>
                </div>
            )}
            
            {health.error && <span className="ml-auto">API Connection Failed</span>}
        </div>
    );
};

export default HealthBar;
