import { SimulationProvider } from './context/SimulationContext';
import Header from './components/Header';
import NetworkMap from './components/NetworkMap';
import AttackPanel from './components/AttackPanel';
import AlertDashboard from './components/AlertDashboard';
import RulesPanel from './components/RulesPanel';
import LogStream from './components/LogStream';

function AppContent() {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-950 text-gray-300 font-sans overflow-hidden">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Network Map */}
        <div className="w-1/2 h-full border-r border-gray-800 relative flex flex-col">
          <div className="p-4 border-b border-gray-800 bg-gray-900/50">
            <h2 className="text-xl font-bold text-gray-100 font-mono">NETWORK_TOPOLOGY</h2>
          </div>
          <div className="flex-1 relative bg-gray-950">
            <NetworkMap />
          </div>
        </div>

        {/* Right column: Dashboards */}
        <div className="w-1/2 h-full flex flex-col overflow-y-auto bg-gray-900/30">
          <AttackPanel />
          <div className="grid grid-cols-2 gap-4 p-4 flex-1">
            <AlertDashboard />
            <RulesPanel />
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
