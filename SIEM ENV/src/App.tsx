import { SimulationProvider } from './context/SimulationContext';
import Header from './components/Header';
import NetworkMap from './components/NetworkMap';
import AttackPanel from './components/AttackPanel';
import TelemetryPanel from './components/TelemetryPanel';
import AgentStatusPanel from './components/AgentStatusPanel';
import LogStream from './components/LogStream';

function AppContent() {
  return (
    <div className="flex flex-col h-screen w-full bg-[#0d1117] text-[#c9d1d9] font-sans overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Network Map */}
        <div className="w-1/2 h-full border-r border-[#30363d] relative flex flex-col">
          <div className="p-4 border-b border-[#30363d] bg-[#161b22]">
            <h2 className="text-xl font-bold text-[#e8eaed] font-mono">NETWORK_TOPOLOGY</h2>
          </div>
          <div className="flex-1 relative bg-[#0d1117]">
            <NetworkMap />
          </div>
        </div>

        {/* Right column: Dashboards */}
        <div className="w-1/2 h-full flex flex-col overflow-y-auto bg-[#0d1117]">
          <AttackPanel />
          <div className="grid grid-cols-2 gap-4 p-4 flex-1">
            <TelemetryPanel />
            <AgentStatusPanel />
          </div>
        </div>
      </div>

      {/* Footer: Live Log Stream */}
      <LogStream />
    </div>
  );
}

function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}

export default App;
