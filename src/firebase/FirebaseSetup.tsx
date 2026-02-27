import { useState, useEffect } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle, ExternalLink, Eye, EyeOff, Loader } from 'lucide-react';
import { connectFirebase, isFirebaseConnected, FirebaseConfig } from './firebaseService';

const CONFIG_KEY = 'hiace-firebase-config';

function saveConfigLocally(config: FirebaseConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function loadSavedConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw) as FirebaseConfig;
    return null;
  } catch {
    return null;
  }
}

interface Props {
  onConnected?: () => void;
}

export default function FirebaseSetup({ onConnected }: Props) {
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  const [status, setStatus] = useState<'idle' | 'connecting' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const saved = loadSavedConfig();
    if (saved) {
      setConfig(saved);
      handleConnect(saved);
    }
    setConnected(isFirebaseConnected());
  }, []);

  const handleConnect = async (cfg: FirebaseConfig = config) => {
    setStatus('connecting');
    setErrorMsg('');
    const ok = connectFirebase(cfg);
    if (ok) {
      saveConfigLocally(cfg);
      setStatus('ok');
      setConnected(true);
      if (onConnected) onConnected();
    } else {
      setStatus('error');
      setErrorMsg('Impossible de se connecter. Vérifiez votre configuration Firebase.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(CONFIG_KEY);
    setConnected(false);
    setStatus('idle');
    window.location.reload();
  };

  if (connected && status === 'ok') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Firebase Connecté ✅</h3>
            <p className="text-sm text-green-600">Synchronisation en temps réel active</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        </div>
        <p className="text-sm text-green-700 mb-4">
          🌍 Toutes les données sont synchronisées en temps réel. Votre collaborateur au Congo et vous en France voyez les mêmes données instantanément.
        </p>
        <div className="bg-white rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-1">Projet Firebase connecté</p>
          <p className="text-sm font-mono text-gray-800">{config.projectId}</p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          Déconnecter Firebase
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statut */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        connected ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
      }`}>
        {connected ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-orange-600" />
        )}
        <div>
          <p className={`font-semibold text-sm ${connected ? 'text-green-800' : 'text-orange-800'}`}>
            {connected ? 'Connecté à Firebase' : 'Non connecté — Mode local uniquement'}
          </p>
          <p className={`text-xs ${connected ? 'text-green-600' : 'text-orange-600'}`}>
            {connected
              ? 'Données synchronisées en temps réel'
              : 'Les données ne sont sauvegardées que sur cet appareil'}
          </p>
        </div>
      </div>

      {/* Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h4 className="font-bold text-blue-800 mb-3">📋 Comment configurer Firebase (5 min)</h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex gap-2">
            <span className="font-bold text-blue-600 min-w-[20px]">1.</span>
            <span>Va sur <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline font-medium inline-flex items-center gap-1">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-600 min-w-[20px]">2.</span>
            <span>Clique <strong>"Créer un projet"</strong> → nomme-le <code className="bg-blue-100 px-1 rounded">hiace-congo</code></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-600 min-w-[20px]">3.</span>
            <span>Clique sur l'icône <strong>"Web" (&lt;/&gt;)</strong> pour ajouter une app web</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-600 min-w-[20px]">4.</span>
            <span>Copie la <strong>firebaseConfig</strong> et colle les valeurs ci-dessous</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-600 min-w-[20px]">5.</span>
            <span>Dans <strong>Firestore Database</strong> → Créer → Mode <strong>Production</strong></span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-blue-600 min-w-[20px]">6.</span>
            <span>Dans <strong>Règles Firestore</strong>, colle :</span>
          </li>
        </ol>
        <div className="mt-3 bg-gray-900 text-green-400 rounded-xl p-3 text-xs font-mono leading-5">
          <p>{"rules_version = '2';"}</p>
          <p>{"service cloud.firestore {"}</p>
          <p>&nbsp;&nbsp;{"match /databases/{_}/documents {"}</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;{"match /{document=**} {"}</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"allow read, write: if true;"}</p>
          <p>&nbsp;&nbsp;&nbsp;&nbsp;{"}"}</p>
          <p>&nbsp;&nbsp;{"}"}</p>
          <p>{"}"}</p>
        </div>
        <p className="text-xs text-blue-600 mt-2">⚠️ Ces règles donnent accès à toi et ton collaborateur. Tu peux les sécuriser plus tard avec une authentification.</p>
      </div>

      {/* Formulaire */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-gray-800">🔑 Clés de configuration Firebase</h4>
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showKeys ? 'Masquer' : 'Afficher'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(config) as Array<keyof FirebaseConfig>).map((key) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                {key}
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                value={config[key]}
                onChange={(e) => setConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={`Entrez ${key}...`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          ))}
        </div>

        {status === 'error' && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <button
          onClick={() => handleConnect()}
          disabled={status === 'connecting' || !config.apiKey || !config.projectId}
          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {status === 'connecting' ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4" />
              Connecter Firebase
            </>
          )}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-600">
          💡 <strong>Sans Firebase</strong> : L'app fonctionne en mode local (données sur cet appareil uniquement).{' '}
          <strong>Avec Firebase</strong> : Toi en France et ton collaborateur au Congo partagez les mêmes données en temps réel.
        </p>
      </div>
    </div>
  );
}
