import { useState } from 'react';
import { Plus, Trash2, Save, Edit2, Check, Clock, AlertCircle } from 'lucide-react';
import { useStore, uid } from '../store/useStore';
import type { Objective } from '../types';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  done: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  late: 'text-red-400 bg-red-500/10 border-red-500/20',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'En cours',
  done: 'Réalisé ✓',
  late: 'En retard',
};

export default function Objectives() {
  const { objectives, addObjective, updateObjective, deleteObjective, settings } = useStore();
  const currency = settings.currency || 'Fr';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Objective>>({
    title: '',
    description: '',
    targetDate: '',
    amount: 0,
    status: 'pending',
    reminderDays: 7,
  });

  const resetForm = () => {
    setForm({ title: '', description: '', targetDate: '', amount: 0, status: 'pending', reminderDays: 7 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (o: Objective) => {
    setForm({ ...o });
    setEditingId(o.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title || !form.targetDate) return alert('Remplissez le titre et la date cible.');
    const obj: Objective = {
      id: editingId || uid(),
      title: form.title!,
      description: form.description || '',
      targetDate: form.targetDate!,
      amount: Number(form.amount) || undefined,
      status: form.status || 'pending',
      reminderDays: Number(form.reminderDays) || 7,
    };
    if (editingId) {
      updateObjective(editingId, obj);
    } else {
      addObjective(obj);
    }
    resetForm();
  };

  const getDiffDays = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    return Math.ceil((target.getTime() - today.getTime()) / 86400000);
  };

  const pending = objectives.filter(o => o.status === 'pending');
  const late = objectives.filter(o => o.status === 'late');
  const done = objectives.filter(o => o.status === 'done');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">En cours</p>
          <p className="text-amber-400 font-bold text-xl">{pending.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">En retard</p>
          <p className="text-red-400 font-bold text-xl">{late.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Réalisés</p>
          <p className="text-emerald-400 font-bold text-xl">{done.length}</p>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-500/20"
      >
        <Plus className="w-4 h-4" /> Nouvel objectif
      </button>

      {showForm && (
        <div className="bg-slate-800/50 border border-violet-500/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">{editingId ? 'Modifier l\'objectif' : 'Nouvel objectif'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs mb-1.5 block">Titre *</label>
              <input
                type="text"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Acheter un nouveau pneu, Révision moteur..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs mb-1.5 block">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Détails supplémentaires..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Date cible *</label>
              <input
                type="date"
                value={form.targetDate || ''}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Budget estimé ({currency})</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Rappel avant (jours)</label>
              <input
                type="number"
                value={form.reminderDays || 7}
                onChange={(e) => setForm({ ...form, reminderDays: Number(e.target.value) })}
                min={1}
                max={30}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold px-5 py-2.5 rounded-xl">
              <Save className="w-4 h-4" /> {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 hover:text-white rounded-xl text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Lists */}
      {[...late, ...pending, ...done].length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-3">🎯</p>
          <p>Aucun objectif défini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...late, ...pending, ...done].map((o) => {
            const diff = getDiffDays(o.targetDate);
            return (
              <div
                key={o.id}
                className={`bg-slate-800/50 border rounded-2xl p-5 transition-colors ${
                  o.status === 'late' ? 'border-red-500/20' :
                  o.status === 'done' ? 'border-emerald-500/20' :
                  'border-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-white font-semibold">{o.title}</span>
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLES[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </div>
                    {o.description && <p className="text-slate-400 text-sm mb-2">{o.description}</p>}
                    <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(o.targetDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      {o.status !== 'done' && (
                        <span className={`flex items-center gap-1 ${diff < 0 ? 'text-red-400' : diff <= 7 ? 'text-amber-400' : 'text-slate-500'}`}>
                          <AlertCircle className="w-3 h-3" />
                          {diff < 0 ? `${Math.abs(diff)} jour(s) de retard` : `Dans ${diff} jour(s)`}
                        </span>
                      )}
                      {o.amount ? (
                        <span>Budget: <span className="text-white">{fmt(o.amount, currency)}</span></span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {o.status !== 'done' && (
                      <button
                        onClick={() => updateObjective(o.id, { status: 'done' })}
                        className="p-2 rounded-xl text-emerald-400 hover:bg-emerald-500/10"
                        title="Marquer comme réalisé"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleEdit(o)} className="p-2 rounded-xl text-amber-400 hover:bg-amber-500/10">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteObjective(o.id)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
