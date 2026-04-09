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
        if (health.status === 'healthy') return 'bg-siemok/10 text-siemok border-siemok/30';
        if (health.status === 'warning') return 'bg-siemwarn/10 text-siemwarn border-siemwarn/30';
        return 'bg-siemdanger/10 text-siemdanger border-siemdanger/30';
    };

    const getIcon = () => {
        if (health.status === 'healthy') return <ShieldCheck size={14} className="mr-1.5" />;
        if (health.status === 'warning') return <AlertTriangle size={14} className="mr-1.5 animate-pulse" />;
        return <ServerCrash size={14} className="mr-1.5 animate-bounce" />;
    };

    return (
        <div className={`px-4 py-1.5 flex items-center text-xs font-mono font-medium border-b backdrop-blur-md z-50 transition-all shadow-sm ${getStatusStyle()}`}>
            <div className="flex items-center w-full max-w-7xl mx-auto">
                {getIcon()}
                <span className="uppercase tracking-widest mr-6 font-bold">System {health.status}</span>
                
                {health.system && (
                    <div className="flex space-x-6 opacity-80 hidden md:flex text-[11px]">
                        <span className="flex items-center"><Activity size={12} className="mr-1 opacity-70" /> CPU: {health.system.cpu_percent.toFixed(1)}%</span>
                        <span className="flex items-center"><Activity size={12} className="mr-1 opacity-70" /> MEM: {health.system.memory_percent.toFixed(1)}%</span>
                        <span className="flex items-center"><Activity size={12} className="mr-1 opacity-70" /> DISK: {health.system.disk_percent.toFixed(1)}%</span>
                    </div>
                )}
                
                {health.error && <span className="ml-auto flex items-center text-siemdanger font-bold"><ServerCrash size={12} className="mr-1" /> API Disconnected</span>}
            </div>
        </div>
    );
};

export default HealthBar;
