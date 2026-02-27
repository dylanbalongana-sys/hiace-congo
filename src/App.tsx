import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LoginScreen from './auth/LoginScreen';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DailyActivity from './pages/DailyActivity';
import Charges from './pages/Charges';
import Debts from './pages/Debts';
import ProvisionalDebts from './pages/ProvisionalDebts';
import History from './pages/History';
import Automation from './pages/Automation';
import Objectives from './pages/Objectives';
import Bilan from './pages/Bilan';
import Settings from './pages/Settings';
import Guide from './pages/Guide';
import type { Tab } from './types';
import { loadSavedConfig } from './firebase/FirebaseSetup';
import { connectFirebase, isFirebaseConnected } from './firebase/firebaseService';
import { useFirebaseSync } from './firebase/useFirebaseSync';
import { Wifi, WifiOff } from 'lucide-react';

function SyncIndicator() {
  const { syncStatus } = useFirebaseSync();
  const connected = isFirebaseConnected();
  if (!connected) return null;
  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold shadow-lg transition-all ${
      syncStatus === 'ok' ? 'bg-green-500 text-white'
      : syncStatus === 'syncing' ? 'bg-blue-500 text-white'
      : 'bg-red-500 text-white'
    }`}>
      {syncStatus === 'ok' ? (
        <><Wifi className="w-3 h-3" /><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />Sync en direct</>
      ) : syncStatus === 'syncing' ? (
        <><Wifi className="w-3 h-3 animate-pulse" />Connexion...</>
      ) : (
        <><WifiOff className="w-3 h-3" />Erreur sync</>
      )}
    </div>
  );
}

function AppInner() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const savedConfig = loadSavedConfig();
    if (savedConfig && savedConfig.apiKey && savedConfig.projectId) {
      const ok = connectFirebase(savedConfig);
      if (ok) setFirebaseReady(true);
    }
  }, []);

  if (!isAuthenticated) return <LoginScreen />;

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'daily': return <DailyActivity />;
      case 'charges': return <Charges />;
      case 'debts': return <Debts />;
      case 'provisionalDebts': return <ProvisionalDebts />;
      case 'history': return <History />;
      case 'automation': return <Automation />;
      case 'objectives': return <Objectives />;
      case 'bilan': return <Bilan />;
      case 'settings': return <Settings />;
      case 'guide': return <Guide />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderPage()}
      </Layout>
      {firebaseReady && <SyncIndicator />}
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
