import { useState } from 'react';
import { Plus, Trash2, Save, Edit2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useStore, uid } from '../store/useStore';
import type { ProvisionalDebt } from '../types';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

const STATUS_COLORS: Record<string, string> = {
  provisional: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  confirmed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-slate-500 bg-slate-700/30 border-slate-600/20',
};
const STATUS_LABELS: Record<string, string> = {
  provisional: 'Provisionnelle',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
};

export default function ProvisionalDebts() {
  const { provisionalDebts, debts, addProvisionalDebt, updateProvisionalDebt, deleteProvisionalDebt, settings } = useStore();
  const currency = settings.currency || 'Fr';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProvisionalDebt>>({
    label: '',
    originalDebtId: '',
    amount: 0,
    dateCreated: new Date().toISOString().split('T')[0],
    status: 'provisional',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      label: '',
      originalDebtId: '',
      amount: 0,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'provisional',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (pd: ProvisionalDebt) => {
    setForm({ ...pd });
    setEditingId(pd.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.label || !form.amount) return alert('Remplissez les champs obligatoires.');
    const pd: ProvisionalDebt = {
      id: editingId || uid(),
      label: form.label!,
      originalDebtId: form.originalDebtId,
      amount: Number(form.amount) || 0,
      dateCreated: form.dateCreated || new Date().toISOString().split('T')[0],
      status: form.status || 'provisional',
      notes: form.notes || '',
    };
    if (editingId) {
      updateProvisionalDebt(editingId, pd);
    } else {
      addProvisionalDebt(pd);
    }
    resetForm();
  };

  // Move to real debt
  const moveToDebt = (pd: ProvisionalDebt) => {
    updateProvisionalDebt(pd.id, { status: 'confirmed' });
  };

  const totalProvisional = provisionalDebts
    .filter((pd) => pd.status === 'provisional')
    .reduce((s, pd) => s + pd.amount, 0);

  return (
    <div className="space-y-6">
      {/* Explanation card */}
      <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
        <h3 className="text-orange-400 font-semibold text-sm mb-1">Qu'est-ce qu'une dette prévisionnelle ?</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Une dette prévisionnelle est une somme mise <strong className="text-white">de côté sur le papier</strong> — par exemple, de l'argent retiré de la caisse ou une dette anticipée — sans que la dette réelle soit encore décaissée. Elle peut être ramenée dans les dettes réelles à tout moment.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total prévisionnel</p>
          <p className="text-orange-400 font-bold text-xl">{fmt(totalProvisional, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">En attente</p>
          <p className="text-amber-400 font-bold text-xl">{provisionalDebts.filter(pd => pd.status === 'provisional').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Confirmées</p>
          <p className="text-emerald-400 font-bold text-xl">{provisionalDebts.filter(pd => pd.status === 'confirmed').length}</p>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-500/20"
      >
        <Plus className="w-4 h-4" /> Nouvelle dette prévisionnelle
      </button>

      {showForm && (
        <div className="bg-slate-800/50 border border-orange-500/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">{editingId ? 'Modifier' : 'Nouvelle dette prévisionnelle'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-slate-400 text-xs mb-1.5 block">Libellé / Description *</label>
              <input
                type="text"
                value={form.label || ''}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Ex: Argent retiré de la caisse, Avance sur dette..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Montant ({currency}) *</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                placeholder="0"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Dette réelle liée (optionnel)</label>
              <select
                value={form.originalDebtId || ''}
                onChange={(e) => setForm({ ...form, originalDebtId: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              >
                <option value="">Aucune</option>
                {debts.map((d) => (
                  <option key={d.id} value={d.id}>{d.supplier} — {d.part} ({fmt(d.remainingAmount, currency)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Date</label>
              <input
                type="date"
                value={form.dateCreated || ''}
                onChange={(e) => setForm({ ...form, dateCreated: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProvisionalDebt['status'] })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              >
                <option value="provisional">Prévisionnelle</option>
                <option value="confirmed">Confirmée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Notes</label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl">
              <Save className="w-4 h-4" /> {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 hover:text-white rounded-xl text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {provisionalDebts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">📋</p>
            <p>Aucune dette prévisionnelle</p>
          </div>
        ) : (
          provisionalDebts.map((pd) => {
            const linkedDebt = pd.originalDebtId ? debts.find((d) => d.id === pd.originalDebtId) : null;
            return (
              <div key={pd.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-white font-semibold">{pd.label}</span>
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_COLORS[pd.status]}`}>
                        {STATUS_LABELS[pd.status]}
                      </span>
                    </div>
                    {linkedDebt && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <ArrowRight className="w-3 h-3" />
                        Liée à: {linkedDebt.supplier} — {linkedDebt.part}
                      </div>
                    )}
                    <p className="text-slate-500 text-xs">{new Date(pd.dateCreated).toLocaleDateString('fr-FR')}</p>
                    {pd.notes && <p className="text-slate-500 text-xs mt-1 italic">{pd.notes}</p>}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-orange-400 font-bold text-lg">{fmt(pd.amount, currency)}</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      {pd.status === 'provisional' && (
                        <button
                          onClick={() => moveToDebt(pd)}
                          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg"
                          title="Confirmer / Ramener en dette réelle"
                        >
                          <ArrowLeft className="w-3 h-3" /> Confirmer
                        </button>
                      )}
                      <button onClick={() => handleEdit(pd)} className="text-amber-400 hover:text-amber-300">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProvisionalDebt(pd.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
