import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, Terminal, Loader2 } from 'lucide-react';

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
        } catch (err) {
            setError('Invalid credentials or backend unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#050B14] overflow-hidden font-sans">
            {/* Background Animations / Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-siemaccent/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10">
                    <div className="p-3 bg-gradient-to-br from-siemaccent to-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(14,165,233,0.4)] mb-4">
                        <Shield className="text-white" size={48} strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 uppercase">
                        Secure<span className="text-siemaccent">Watch</span>
                    </h1>
                    <p className="text-siemmelow mt-2 font-medium tracking-widest text-sm uppercase flex items-center gap-2">
                        <Terminal size={14} /> Next-Gen SIEM Platform
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#0b101e]/80 backdrop-blur-xl border border-siemborder/50 p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                    {/* Top border highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-siemaccent via-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-siemmelow text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-[#111729] border border-siemborder/60 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-siemaccent focus:ring-1 focus:ring-siemaccent transition-all placeholder-slate-600 font-medium"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-siemmelow text-xs uppercase tracking-wider font-semibold mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-500" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#111729] border border-siemborder/60 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-siemaccent focus:ring-1 focus:ring-siemaccent transition-all placeholder-slate-600 font-medium"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/40 text-rose-400 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-siemaccent hover:from-cyan-400 to-blue-600 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Authenticate'}
                        </button>
                    </form>
                </div>
                
                <div className="text-center mt-8 text-slate-600 text-xs font-mono">
                    SECUREWATCH OS v2.0.0. AUTH SECURED VIA JWT.
                </div>
            </div>
        </div>
    );
};

export default Login;
