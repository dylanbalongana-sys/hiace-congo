import { useState } from 'react';
import { Save, User, Bus, Globe, Wallet, Wifi, Lock, ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import FirebaseSetup from '../firebase/FirebaseSetup';
import { syncSettings, syncCash } from '../firebase/useFirebaseSync';
import { isFirebaseConnected } from '../firebase/firebaseService';
import { useAuth } from '../auth/AuthContext';

export default function Settings() {
  const { settings, updateSettings, cashBalance, updateCashBalance } = useStore();
  const { role, ownerPin, collaboratorPin, setOwnerPin, setCollaboratorPin } = useAuth();
  const [form, setForm] = useState({ ...settings });
  const [staffForm, setStaffForm] = useState({ ...settings.staff });
  const [newCash, setNewCash] = useState(cashBalance.toString());
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'firebase' | 'security'>('general');

  // PIN management
  const [newOwnerPin, setNewOwnerPin] = useState('');
  const [newCollabPin, setNewCollabPin] = useState('');
  const [showOwnerPin, setShowOwnerPin] = useState(false);
  const [showCollabPin, setShowCollabPin] = useState(false);
  const [pinSaved, setPinSaved] = useState<string | null>(null);

  const handleSaveOwnerPin = () => {
    if (newOwnerPin.length === 4 && /^\d{4}$/.test(newOwnerPin)) {
      setOwnerPin(newOwnerPin);
      setNewOwnerPin('');
      setPinSaved('owner');
      setTimeout(() => setPinSaved(null), 2500);
    }
  };

  const handleSaveCollabPin = () => {
    if (newCollabPin.length === 4 && /^\d{4}$/.test(newCollabPin)) {
      setCollaboratorPin(newCollabPin);
      setNewCollabPin('');
      setPinSaved('collab');
      setTimeout(() => setPinSaved(null), 2500);
    }
  };

  const handleSave = async () => {
    const newSettings = { ...form, staff: staffForm };
    updateSettings(newSettings);
    updateCashBalance(Number(newCash) || 0);
    if (isFirebaseConnected()) {
      await syncSettings(newSettings);
      await syncCash(Number(newCash) || 0);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-1.5">
        <button
          onClick={() => setActiveSection('general')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeSection === 'general' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >⚙️ Général</button>
        <button
          onClick={() => setActiveSection('security')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
            activeSection === 'security' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3 h-3" /> Sécurité
          {role !== 'owner' && <span className="text-[9px] opacity-60">(owner)</span>}
        </button>
        <button
          onClick={() => setActiveSection('firebase')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
            activeSection === 'firebase' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wifi className="w-3 h-3" /> Firebase
          {isFirebaseConnected() && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />}
        </button>
      </div>

      {activeSection === 'firebase' ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-400" />
            Synchronisation en temps réel
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            Connecte Firebase pour partager les données entre toi (France) et ton collaborateur (Congo) en temps réel.
          </p>
          <FirebaseSetup onConnected={() => window.location.reload()} />
        </div>
      ) : activeSection === 'security' ? (
        <div className="space-y-4">
          {role !== 'owner' ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
              <ShieldCheck className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-300 font-semibold">Accès réservé au propriétaire</p>
              <p className="text-slate-400 text-sm mt-1">Connectez-vous en tant que propriétaire pour modifier les codes PIN.</p>
            </div>
          ) : (
            <>
              {pinSaved && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  PIN {pinSaved === 'owner' ? 'propriétaire' : 'collaborateur'} modifié avec succès !
                </div>
              )}

              {/* Owner PIN */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">PIN Propriétaire</h3>
                    <p className="text-slate-500 text-xs">Accès complet à l'application</p>
                  </div>
                  <span className="ml-auto text-xs text-slate-500">PIN actuel : {'•'.repeat(ownerPin.length)}</span>
                </div>
                <div className="relative">
                  <label className="text-slate-400 text-xs mb-1.5 block">Nouveau PIN (4 chiffres)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showOwnerPin ? 'text' : 'password'}
                        value={newOwnerPin}
                        onChange={(e) => setNewOwnerPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••"
                        maxLength={4}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 tracking-widest"
                      />
                      <button
                        onClick={() => setShowOwnerPin(!showOwnerPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showOwnerPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveOwnerPin}
                      disabled={newOwnerPin.length !== 4}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                  {newOwnerPin.length > 0 && newOwnerPin.length < 4 && (
                    <p className="text-slate-500 text-xs mt-1">{4 - newOwnerPin.length} chiffre(s) restant(s)</p>
                  )}
                </div>
              </div>

              {/* Collaborator PIN */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">PIN Collaborateur</h3>
                    <p className="text-slate-500 text-xs">Accès saisie journalière</p>
                  </div>
                  <span className="ml-auto text-xs text-slate-500">PIN actuel : {'•'.repeat(collaboratorPin.length)}</span>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block">Nouveau PIN (4 chiffres)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showCollabPin ? 'text' : 'password'}
                        value={newCollabPin}
                        onChange={(e) => setNewCollabPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="••••"
                        maxLength={4}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 tracking-widest"
                      />
                      <button
                        onClick={() => setShowCollabPin(!showCollabPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showCollabPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSaveCollabPin}
                      disabled={newCollabPin.length !== 4}
                      className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                  {newCollabPin.length > 0 && newCollabPin.length < 4 && (
                    <p className="text-slate-500 text-xs mt-1">{4 - newCollabPin.length} chiffre(s) restant(s)</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-700/20 border border-slate-700/50 rounded-xl p-4">
                <p className="text-slate-400 text-xs leading-relaxed">
                  💡 <span className="text-slate-300 font-medium">Conseil :</span> Changez les PIN par défaut (1234 / 0000) dès la première utilisation. Ne partagez jamais le PIN propriétaire avec votre collaborateur.
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Saved banner */}
          {saved && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-400 text-sm font-medium flex items-center gap-2">
              <span className="text-emerald-400 text-lg">✓</span> Paramètres sauvegardés avec succès !
            </div>
          )}

          {/* Vehicle info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Bus className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Informations du véhicule</h3>
                <p className="text-slate-500 text-xs">Modifiez les infos de votre Toyota Hiace</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Nom du véhicule</label>
                <input
                  type="text"
                  value={form.vehicleName}
                  onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                  placeholder="Toyota Hiace"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Immatriculation</label>
                <input
                  type="text"
                  value={form.vehiclePlate}
                  onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
                  placeholder="Ex: CG-1234-AB"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-400 text-xs mb-1.5 block">Nom du propriétaire</label>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Votre nom complet"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* General */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Devise & Affichage</h3>
                <p className="text-slate-500 text-xs">Choisissez la devise utilisée dans toute l'application</p>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-2 block">Devise</label>
              <div className="flex gap-3 flex-wrap">
                {['Fr', 'FCFA', 'CFA', '€', '$'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, currency: c })}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      form.currency === c
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-700/50 text-slate-400 border-slate-600/50 hover:border-amber-500/30 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Actuellement : <span className="text-amber-400 font-semibold">{form.currency}</span> — Cette devise s'affiche partout dans l'application.
              </p>
            </div>
          </div>

          {/* Cash */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Gestion de la caisse</h3>
                <p className="text-slate-500 text-xs">Ajustez manuellement le solde de caisse si nécessaire</p>
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Solde actuel de la caisse ({form.currency})</label>
              <input
                type="text"
                inputMode="numeric"
                value={newCash}
                onChange={(e) => setNewCash(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-slate-500 text-xs mt-1">
                Utilisez ce champ pour corriger le solde en cas d'erreur ou de sortie d'argent non enregistrée.
              </p>
            </div>
          </div>

          {/* Staff */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <User className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Équipe & Personnel</h3>
                <p className="text-slate-500 text-xs">Informations du chauffeur, contrôleur et collaborateur</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nom complet du chauffeur', key: 'driverName', placeholder: 'Prénom & Nom', type: 'text' },
                { label: 'Téléphone chauffeur', key: 'driverPhone', placeholder: '+242 06 XXX XX XX', type: 'tel' },
                { label: 'Nom complet du contrôleur', key: 'controllerName', placeholder: 'Prénom & Nom', type: 'text' },
                { label: 'Téléphone contrôleur', key: 'controllerPhone', placeholder: '+242 06 XXX XX XX', type: 'tel' },
                { label: 'Nom complet du collaborateur', key: 'collaboratorName', placeholder: 'Prénom & Nom', type: 'text' },
                { label: 'Téléphone collaborateur', key: 'collaboratorPhone', placeholder: '+242 06 XXX XX XX', type: 'tel' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-slate-400 text-xs mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    value={staffForm[key as keyof typeof staffForm]}
                    onChange={(e) => setStaffForm({ ...staffForm, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-base"
          >
            <Save className="w-5 h-5" /> Sauvegarder tous les paramètres
          </button>
        </>
      )}
    </div>
  );
}
