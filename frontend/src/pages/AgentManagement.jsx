import React, { useState, useEffect } from 'react';
import { fetchAgents, removeAgent, sendAgentCommand } from '../services/api';
import { Monitor, Activity, Terminal, Trash2, StopCircle, RefreshCw } from 'lucide-react';

const AgentManagement = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commandInput, setCommandInput] = useState('');

    const loadAgents = async () => {
        try {
            setLoading(true);
            const data = await fetchAgents();
            setAgents(data);
        } catch (error) {
            console.error("Failed to load agents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAgents();
        const interval = setInterval(loadAgents, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const handleRemove = async (agentId) => {
        if (window.confirm("Are you sure you want to remove this agent?")) {
            await removeAgent(agentId);
            setSelectedAgent(null);
            loadAgents();
        }
    };

    const handleCommand = async () => {
        if (!commandInput) return;
        try {
            await sendAgentCommand(selectedAgent.agent_id, commandInput);
            alert(`Command '${commandInput}' sent to agent ${selectedAgent.hostname}`);
            setCommandInput('');
        } catch (error) {
            alert("Failed to send command.");
        }
    };

    const StatusDot = ({ status }) => (
        <span className="flex h-3 w-3 relative">
            {status === 'active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
        </span>
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-mono text-white mb-2">Agent Management</h1>
                    <p className="text-slate-400">Deploy, monitor, and command endpoint agents.</p>
                </div>
                <button 
                  onClick={loadAgents}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded flex items-center border border-slate-700"
                >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* AGENT LIST */}
                <div className="bg-siempanel rounded-lg border border-slate-800 p-4 overflow-y-auto lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <Monitor className="mr-2 text-siemaccent" /> Deployed Agents
                    </h2>
                    
                    {agents.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                            <Monitor size={48} className="mb-4 opacity-50" />
                            <p>No agents connected.</p>
                            <p className="text-sm">Run the installation script on your endpoints.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agents.map(agent => (
                                <div 
                                    key={agent.agent_id}
                                    onClick={() => setSelectedAgent(agent)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedAgent?.agent_id === agent.agent_id 
                                        ? 'bg-slate-800 border-siemaccent shadow-lg shadow-siemaccent/10' 
                                        : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-white text-lg">{agent.hostname}</div>
                                        <StatusDot status={agent.status} />
                                    </div>
                                    <div className="text-sm text-slate-400 font-mono mb-3">{agent.ip_address}</div>
                                    <div className="flex justify-between text-xs">
                                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">{agent.os_type}</span>
                                        <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">{agent.group_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AGENT DETAILS & COMMAND CENTER */}
                {selectedAgent ? (
                    <div className="bg-siempanel rounded-lg border border-slate-800 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Agent Info</h2>
                            <button 
                                onClick={() => handleRemove(selectedAgent.agent_id)}
                                className="text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-900/30 rounded"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="grid grid-cols-2 gap-2 text-sm border-b border-slate-800 pb-4">
                                <div className="text-slate-500">Hostname</div>
                                <div className="text-white font-mono">{selectedAgent.hostname}</div>
                                
                                <div className="text-slate-500">IP Address</div>
                                <div className="text-white font-mono">{selectedAgent.ip_address}</div>
                                
                                <div className="text-slate-500">OS Version</div>
                                <div className="text-white">{selectedAgent.os_version}</div>
                                
                                <div className="text-slate-500">Agent Version</div>
                                <div className="text-white">{selectedAgent.agent_version}</div>
                                
                                <div className="text-slate-500">Last Seen</div>
                                <div className="text-white">
                                    {new Date(selectedAgent.last_seen).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <h3 className="font-bold text-white mb-3 flex items-center">
                                <Terminal size={16} className="mr-2 text-siemaccent" /> Command Center
                            </h3>
                            <div className="flex space-x-2">
                                <select 
                                    className="bg-slate-900 border border-slate-700 text-white rounded p-2 flex-1 focus:outline-none focus:border-siemaccent"
                                    value={commandInput}
                                    onChange={(e) => setCommandInput(e.target.value)}
                                >
                                    <option value="">Select a command...</option>
                                    <option value="restart_agent">Restart Agent</option>
                                    <option value="run_sca_scan">Run Config Assessment</option>
                                    <option value="collect_processes">Collect Process List</option>
                                    <option value="collect_connections">Collect Network Conns</option>
                                </select>
                                <button 
                                    onClick={handleCommand}
                                    disabled={!commandInput}
                                    className="bg-siemaccent hover:bg-cyan-500 text-slate-900 font-bold px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Execute
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-siempanel rounded-lg border border-slate-800 p-4 flex flex-col items-center justify-center text-slate-500">
                        <Terminal size={48} className="mb-4 opacity-50" />
                        <p>Select an agent to view details</p>
                        <p className="text-sm mt-2">and execute commands.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentManagement;
