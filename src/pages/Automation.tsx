import { useState } from 'react';
import { Plus, Trash2, Save, Zap, ZapOff, Edit2, ChevronDown } from 'lucide-react';
import { useStore, uid } from '../store/useStore';
import type { AutomationTask } from '../types';

export const EXPENSE_CATEGORIES = [
  { label: 'Carburant', value: 'carburant', hasLiters: true },
  { label: 'Huile moteur', value: 'huile_moteur', hasLiters: true },
  { label: 'Huile de boîte', value: 'huile_boite', hasLiters: true },
  { label: 'Huile de frein', value: 'huile_frein', hasLiters: true },
  { label: 'Huile de direction', value: 'huile_direction', hasLiters: true },
  { label: 'Huile différentiel', value: 'huile_differentiel', hasLiters: true },
  { label: 'Salaire chauffeur', value: 'salaire_chauffeur' },
  { label: 'Salaire contrôleur', value: 'salaire_controleur' },
  { label: 'Salaire collaborateur', value: 'salaire_collaborateur' },
  { label: 'Police (JC)', value: 'police_jc' },
  { label: 'Assurance', value: 'assurance' },
  { label: 'Patente', value: 'patente' },
  { label: 'Lavage', value: 'lavage' },
  { label: 'Parking', value: 'parking' },
  { label: 'Autre charge', value: 'autre' },
];

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

const FREQ_LABELS: Record<string, string> = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
};

export default function Automation() {
  const { automations, addAutomation, updateAutomation, deleteAutomation, toggleAutomation, settings } = useStore();
  const currency = settings.currency || 'Fr';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AutomationTask>>({
    category: 'carburant',
    amount: 0,
    liters: 0,
    frequency: 'daily',
    isActive: true,
    comment: '',
  });

  const resetForm = () => {
    setForm({ category: 'carburant', amount: 0, liters: 0, frequency: 'daily', isActive: true, comment: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (task: AutomationTask) => {
    setForm({ ...task });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.amount) return alert('Renseignez le montant.');
    const catLabel = EXPENSE_CATEGORIES.find(c => c.value === form.category)?.label || 'Charge';
    const task: AutomationTask = {
      id: editingId || uid(),
      name: catLabel, // Nom = label de la catégorie automatiquement
      category: form.category || 'autre',
      subcategory: form.subcategory,
      amount: Number(form.amount) || 0,
      liters: Number(form.liters) || undefined,
      frequency: form.frequency || 'daily',
      isActive: form.isActive ?? true,
      comment: form.comment || '',
    };
    if (editingId) {
      updateAutomation(editingId, task);
    } else {
      addAutomation(task);
    }
    resetForm();
  };

  const selectedCat = EXPENSE_CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
        <h3 className="text-blue-400 font-semibold text-sm mb-1">⚡ Comment fonctionne l'automatisation ?</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Les tâches automatisées s'ajoutent <strong className="text-white">automatiquement</strong> comme charges dans l'activité journalière selon leur fréquence, quelle que soit la date sélectionnée. L'icône ⚡ apparaît sur les charges automatisées. Vous pouvez arrêter une automatisation à tout moment.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Tâches actives</p>
          <p className="text-blue-400 font-bold text-xl">{automations.filter(a => a.isActive).length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Tâches inactives</p>
          <p className="text-slate-400 font-bold text-xl">{automations.filter(a => !a.isActive).length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Coût journalier auto</p>
          <p className="text-amber-400 font-bold text-xl">
            {fmt(automations.filter(a => a.isActive && a.frequency === 'daily').reduce((s, a) => s + a.amount, 0), currency)}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-4 h-4" /> Nouvelle automatisation
      </button>

      {showForm && (
        <div className="bg-slate-800/50 border border-blue-500/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">{editingId ? 'Modifier' : 'Nouvelle tâche automatisée'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Catégorie — champ principal, le nom est déduit automatiquement */}
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs mb-1.5 block">Catégorie de charge *</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Vous pouvez sélectionner une catégorie existante ou modifier si besoin. Le nom de la tâche sera automatiquement le nom de la catégorie.
              </p>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Fréquence</label>
              <div className="relative">
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as AutomationTask['frequency'] })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Montant ({currency}) *</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {selectedCat?.hasLiters && (
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Litres (optionnel)</label>
                <input
                  type="number"
                  value={form.liters || ''}
                  onChange={(e) => setForm({ ...form, liters: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                />
              </div>
            )}

            <div className={selectedCat?.hasLiters ? '' : 'sm:col-span-2'}>
              <label className="text-slate-400 text-xs mb-1.5 block">Commentaire (optionnel)</label>
              <input
                type="text"
                value={form.comment || ''}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                placeholder="Ex: Carburant quotidien du trajet Brazzaville..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
            <p className="text-blue-400 text-xs font-semibold mb-1">Aperçu de la tâche</p>
            <p className="text-white text-sm font-medium">
              {EXPENSE_CATEGORIES.find(c => c.value === form.category)?.label || 'Charge'} — {FREQ_LABELS[form.frequency || 'daily']}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {fmt(Number(form.amount) || 0, currency)}{form.liters ? ` · ${form.liters}L` : ''}
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl">
              <Save className="w-4 h-4" /> {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 hover:text-white rounded-xl text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {automations.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Zap className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p className="font-medium">Aucune tâche automatisée</p>
            <p className="text-xs mt-1 text-slate-600">Créez une automatisation pour ne plus saisir les charges répétitives</p>
          </div>
        ) : (
          automations.map((task) => (
            <div key={task.id} className={`bg-slate-800/50 border rounded-2xl p-5 transition-colors ${task.isActive ? 'border-blue-500/20' : 'border-slate-700/50'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${task.isActive ? 'bg-blue-500/20' : 'bg-slate-700/50'}`}>
                    <Zap className={`w-5 h-5 ${task.isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-semibold">
                        {EXPENSE_CATEGORIES.find(c => c.value === task.category)?.label || task.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${task.isActive ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-slate-500 bg-slate-700/50 border-slate-600/20'}`}>
                        {task.isActive ? '⚡ Actif' : 'Inactif'}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-700/30 px-2 py-0.5 rounded-full border border-slate-600/20">
                        {FREQ_LABELS[task.frequency]}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span>Montant: <span className="text-white font-semibold">{fmt(task.amount, currency)}</span></span>
                      {task.liters && <span>Litres: <span className="text-white">{task.liters}L</span></span>}
                      {task.comment && <span className="text-slate-500 italic">"{task.comment}"</span>}
                    </div>
                    {task.lastTriggered && (
                      <p className="text-slate-600 text-xs mt-1">Dernière exécution: {new Date(task.lastTriggered).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => toggleAutomation(task.id)}
                    className={`p-2 rounded-xl transition-colors ${task.isActive ? 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300' : 'text-slate-500 hover:bg-slate-700/50 hover:text-white'}`}
                    title={task.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {task.isActive ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(task)} className="p-2 rounded-xl text-amber-400 hover:bg-amber-500/10">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteAutomation(task.id)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
