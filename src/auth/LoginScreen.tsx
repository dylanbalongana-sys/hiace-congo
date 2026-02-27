import { useState } from 'react';
import { useAuth } from './AuthContext';
import { Bus, Lock, Delete, Eye, EyeOff, ShieldCheck, Users } from 'lucide-react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'collaborator' | null>(null);
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      setError('');
      if (newPin.length === 4) {
        setTimeout(() => handleLogin(newPin), 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError('');
  };

  const handleLogin = (p: string) => {
    const result = login(p);
    if (!result.success) {
      setError('PIN incorrect. Réessayez.');
      setShake(true);
      setTimeout(() => { setShake(false); setPin(''); }, 600);
    }
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-2xl mb-4">
            <Bus className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">HiaceManager</h1>
          <p className="text-slate-400 text-sm">Gestion Toyota Hiace • Congo Brazzaville</p>
        </div>

        {/* Role Selection */}
        {!selectedRole ? (
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <p className="text-slate-300 text-center text-sm mb-5 font-medium">Qui êtes-vous ?</p>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedRole('owner')}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl hover:border-amber-500/60 hover:from-amber-500/20 hover:to-orange-500/20 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Propriétaire</p>
                  <p className="text-slate-400 text-xs">Accès complet • Modifier tout</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedRole('collaborator')}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl hover:border-blue-500/60 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Collaborateur</p>
                  <p className="text-slate-400 text-xs">Saisie journalière • Activités</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Entry */
          <div className={`bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 transition-all ${shake ? 'animate-pulse border-red-500/50' : ''}`}>
            {/* Role indicator */}
            <button
              onClick={() => { setSelectedRole(null); setPin(''); setError(''); }}
              className="flex items-center gap-2 mb-5 text-slate-400 hover:text-white transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRole === 'owner' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                {selectedRole === 'owner' ? <ShieldCheck className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
              </div>
              <span className="text-sm font-medium">
                {selectedRole === 'owner' ? 'Propriétaire' : 'Collaborateur'}
              </span>
              <span className="text-xs text-slate-500 ml-auto">← Changer</span>
            </button>

            <div className="flex items-center gap-2 mb-5">
              <Lock className="w-4 h-4 text-slate-400" />
              <p className="text-slate-300 text-sm font-medium">Entrez votre PIN à 4 chiffres</p>
              <button
                onClick={() => setShowPin(!showPin)}
                className="ml-auto text-slate-400 hover:text-white transition-colors"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* PIN dots */}
            <div className="flex justify-center gap-4 mb-6">
              {[0,1,2,3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    pin.length > i
                      ? selectedRole === 'owner'
                        ? 'bg-amber-500 border-amber-500 scale-110'
                        : 'bg-blue-500 border-blue-500 scale-110'
                      : 'border-slate-600'
                  }`}
                >
                  {showPin && pin[i] && (
                    <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                      {pin[i]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3">
              {digits.map((d, i) => {
                if (d === '') return <div key={i} />;
                if (d === '⌫') {
                  return (
                    <button
                      key={i}
                      onClick={handleDelete}
                      className="h-14 flex items-center justify-center rounded-xl bg-slate-700/50 hover:bg-red-500/20 border border-slate-600/50 hover:border-red-500/30 text-slate-300 hover:text-red-400 transition-all active:scale-95"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  );
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleDigit(d)}
                    className={`h-14 flex items-center justify-center rounded-xl border text-white font-bold text-lg transition-all active:scale-95 ${
                      selectedRole === 'owner'
                        ? 'bg-slate-700/50 hover:bg-amber-500/20 border-slate-600/50 hover:border-amber-500/30'
                        : 'bg-slate-700/50 hover:bg-blue-500/20 border-slate-600/50 hover:border-blue-500/30'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Hint */}
            <p className="text-slate-500 text-xs text-center mt-4">
              PIN par défaut — Propriétaire: <span className="text-amber-400">1234</span> · Collaborateur: <span className="text-blue-400">0000</span>
            </p>
          </div>
        )}

        <p className="text-slate-600 text-xs text-center mt-6">
          © 2024 HiaceManager • Congo Brazzaville
        </p>
      </div>
    </div>
  );
}
