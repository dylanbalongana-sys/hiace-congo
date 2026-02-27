import { useState } from 'react';
import { Plus, Trash2, Save, Edit2, Check, ChevronDown } from 'lucide-react';
import { useStore, uid } from '../store/useStore';
import type { Debt } from '../types';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

const SUPPLIER_TYPES = [
  { value: 'mechanic', label: 'Mécanicien' },
  { value: 'wholesaler', label: 'Grossiste / Fournisseur' },
  { value: 'other', label: 'Autre' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-red-400 bg-red-500/10 border-red-500/20',
  partial: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Non payée',
  partial: 'Partielle',
  paid: 'Payée',
};

export default function Debts() {
  const { debts, addDebt, updateDebt, deleteDebt, settings } = useStore();
  const currency = settings.currency || 'Fr';

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Debt>>({
    supplier: '',
    supplierType: 'mechanic',
    part: '',
    amount: 0,
    remainingAmount: 0,
    dateCreated: new Date().toISOString().split('T')[0],
    dateDue: '',
    status: 'pending',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      supplier: '',
      supplierType: 'mechanic',
      part: '',
      amount: 0,
      remainingAmount: 0,
      dateCreated: new Date().toISOString().split('T')[0],
      dateDue: '',
      status: 'pending',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (debt: Debt) => {
    setForm({ ...debt });
    setEditingId(debt.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.supplier || !form.part || !form.amount) return alert('Remplissez les champs obligatoires.');
    const debt: Debt = {
      id: editingId || uid(),
      supplier: form.supplier!,
      supplierType: form.supplierType || 'other',
      part: form.part!,
      amount: Number(form.amount) || 0,
      remainingAmount: Number(form.remainingAmount) || Number(form.amount) || 0,
      dateCreated: form.dateCreated || new Date().toISOString().split('T')[0],
      dateDue: form.dateDue || '',
      status: form.status || 'pending',
      notes: form.notes || '',
    };
    if (editingId) {
      updateDebt(editingId, debt);
    } else {
      addDebt(debt);
    }
    resetForm();
  };

  const totalDebt = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
  const paid = debts.filter(d => d.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total dettes</p>
          <p className="text-red-400 font-bold text-xl">{fmt(totalDebt, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">En attente</p>
          <p className="text-amber-400 font-bold text-xl">{debts.filter(d => d.status === 'pending').length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Réglées</p>
          <p className="text-emerald-400 font-bold text-xl">{paid}</p>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
      >
        <Plus className="w-4 h-4" /> Nouvelle dette
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-800/50 border border-amber-500/20 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">{editingId ? 'Modifier la dette' : 'Nouvelle dette'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Fournisseur / Mécanicien *</label>
              <input
                type="text"
                value={form.supplier || ''}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                placeholder="Nom du fournisseur"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Type</label>
              <div className="relative">
                <select
                  value={form.supplierType}
                  onChange={(e) => setForm({ ...form, supplierType: e.target.value as Debt['supplierType'] })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none"
                >
                  {SUPPLIER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Pièce / Objet *</label>
              <input
                type="text"
                value={form.part || ''}
                onChange={(e) => setForm({ ...form, part: e.target.value })}
                placeholder="Ex: Plaquettes de frein..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Montant total ({currency}) *</label>
              <input
                type="number"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value), remainingAmount: Number(e.target.value) })}
                placeholder="0"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Montant restant ({currency})</label>
              <input
                type="number"
                value={form.remainingAmount || ''}
                onChange={(e) => setForm({ ...form, remainingAmount: Number(e.target.value) })}
                placeholder="0"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Statut</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Debt['status'] })}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none"
                >
                  <option value="pending">Non payée</option>
                  <option value="partial">Partiellement payée</option>
                  <option value="paid">Entièrement payée</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Date de création</label>
              <input
                type="date"
                value={form.dateCreated || ''}
                onChange={(e) => setForm({ ...form, dateCreated: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1.5 block">Date d'échéance</label>
              <input
                type="date"
                value={form.dateDue || ''}
                onChange={(e) => setForm({ ...form, dateDue: e.target.value })}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">Notes</label>
            <textarea
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Informations supplémentaires..."
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
            >
              <Save className="w-4 h-4" /> {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 bg-slate-700/50 text-slate-400 hover:text-white rounded-xl text-sm transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Debts list */}
      <div className="space-y-3">
        {debts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">💳</p>
            <p>Aucune dette enregistrée</p>
          </div>
        ) : (
          debts.map((debt) => (
            <div key={debt.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-white font-semibold">{debt.supplier}</span>
                    <span className="text-slate-500 text-xs bg-slate-700/50 px-2 py-0.5 rounded-full">
                      {SUPPLIER_TYPES.find(t => t.value === debt.supplierType)?.label}
                    </span>
                    <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_COLORS[debt.status]}`}>
                      {STATUS_LABELS[debt.status]}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">📦 {debt.part}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Créé: {new Date(debt.dateCreated).toLocaleDateString('fr-FR')}</span>
                    {debt.dateDue && <span>Échéance: {new Date(debt.dateDue).toLocaleDateString('fr-FR')}</span>}
                  </div>
                  {debt.notes && <p className="text-slate-500 text-xs mt-1 italic">{debt.notes}</p>}
                </div>
                <div className="text-right ml-4">
                  <p className="text-red-400 font-bold text-lg">{fmt(debt.remainingAmount, currency)}</p>
                  {debt.remainingAmount !== debt.amount && (
                    <p className="text-slate-500 text-xs">/{fmt(debt.amount, currency)}</p>
                  )}
                  <div className="flex gap-2 mt-2 justify-end">
                    <button onClick={() => handleEdit(debt)} className="text-amber-400 hover:text-amber-300">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => updateDebt(debt.id, { status: 'paid', remainingAmount: 0 })}
                      className="text-emerald-400 hover:text-emerald-300"
                      title="Marquer comme payée"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteDebt(debt.id)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
