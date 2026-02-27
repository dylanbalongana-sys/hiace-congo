import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronDown, Zap, FileText, AlertTriangle, Wrench, BanIcon, CheckCircle2 } from 'lucide-react';
import { useStore, uid } from '../store/useStore';
import type { ExpenseItem, BreakdownItem, DailyEntry, DayType } from '../types';

const EXPENSE_CATEGORIES = [
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

const BREAKDOWN_CATEGORIES = [
  'Moteur', 'Freins', 'Transmission', 'Suspension', 'Direction',
  'Électrique', 'Refroidissement', 'Pneus / Roues', 'Carrosserie', 'Climatisation', 'Autre',
];

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

const DAY_TYPES: { value: DayType; label: string; desc: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
  {
    value: 'normal',
    label: 'Journée Normale',
    desc: 'Activité complète avec recettes',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
  },
  {
    value: 'maintenance',
    label: 'Journée Maintenance',
    desc: 'Entretien du véhicule, pas de recettes',
    icon: Wrench,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
  },
  {
    value: 'inactive',
    label: 'Sans Activité',
    desc: 'Panne grave ou jour chômé',
    icon: BanIcon,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/40',
  },
];

// Expense row state: amount et liters en string pour éviter le bug de saisie
interface ExpenseRow {
  id: string;
  category: string;
  amountStr: string;
  litersStr: string;
  comment: string;
  isAutomated?: boolean;
  automationId?: string;
}

interface BreakdownRow {
  id: string;
  category: string;
  partChanged: string;
  cause: string;
  amountStr: string;
}

function expenseRowToItem(row: ExpenseRow): ExpenseItem {
  return {
    id: row.id,
    category: row.category,
    amount: parseFloat(row.amountStr) || 0,
    liters: row.litersStr ? parseFloat(row.litersStr) : undefined,
    comment: row.comment,
    isAutomated: row.isAutomated,
    automationId: row.automationId,
  };
}

function breakdownRowToItem(row: BreakdownRow): BreakdownItem {
  return {
    id: row.id,
    category: row.category,
    partChanged: row.partChanged,
    cause: row.cause,
    amount: parseFloat(row.amountStr) || 0,
  };
}

function expenseItemToRow(item: ExpenseItem): ExpenseRow {
  return {
    id: item.id,
    category: item.category,
    amountStr: item.amount ? item.amount.toString() : '',
    litersStr: item.liters ? item.liters.toString() : '',
    comment: item.comment || '',
    isAutomated: item.isAutomated,
    automationId: item.automationId,
  };
}

function breakdownItemToRow(item: BreakdownItem): BreakdownRow {
  return {
    id: item.id,
    category: item.category,
    partChanged: item.partChanged || '',
    cause: item.cause || '',
    amountStr: item.amount ? item.amount.toString() : '',
  };
}

export default function DailyActivity() {
  const { dailyEntries, addDailyEntry, updateDailyEntry, deleteDailyEntry, settings, automations } = useStore();
  const currency = settings.currency || 'Fr';

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [dayType, setDayType] = useState<DayType>('normal');
  const [revenueStr, setRevenueStr] = useState('');
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [breakdowns, setBreakdowns] = useState<BreakdownRow[]>([]);
  const [generalComment, setGeneralComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Charger les automatisations actives comme dépenses pour n'importe quelle date
  const getAutomatedExpenses = (): ExpenseRow[] => {
    return automations
      .filter(a => a.isActive && a.frequency === 'daily')
      .map(a => ({
        id: uid(),
        category: a.category,
        amountStr: a.amount.toString(),
        litersStr: a.liters ? a.liters.toString() : '',
        comment: a.comment || '',
        isAutomated: true,
        automationId: a.id,
      }));
  };

  // Quand la date change, charger l'entrée existante OU pré-remplir avec automations
  useEffect(() => {
    if (editingId) return; // Si on est en mode édition, ne pas recharger
    const existing = dailyEntries.find(e => e.date === date);
    if (existing) {
      // Si une entrée existe pour cette date, la charger
      handleLoadEntry(existing);
    } else {
      // Sinon, pré-remplir avec les automations quotidiennes
      const autoExpenses = getAutomatedExpenses();
      setExpenses(autoExpenses.length > 0 ? autoExpenses : [{ id: uid(), category: 'carburant', amountStr: '', litersStr: '', comment: '' }]);
      setBreakdowns([]);
      setRevenueStr('');
      setDayType('normal');
      setGeneralComment('');
      setEditingId(null);
    }
  }, [date]);

  // Initialisation au montage
  useEffect(() => {
    const existing = dailyEntries.find(e => e.date === today);
    if (!existing) {
      const autoExpenses = getAutomatedExpenses();
      if (autoExpenses.length > 0) setExpenses(autoExpenses);
    }
  }, []);

  // Quand dayType change
  useEffect(() => {
    if (dayType === 'inactive') {
      setRevenueStr('0');
      setExpenses([]);
      setBreakdowns([]);
    } else if (dayType === 'maintenance') {
      setRevenueStr('');
      if (expenses.length === 0) {
        const autoExpenses = getAutomatedExpenses();
        setExpenses(autoExpenses.length > 0 ? autoExpenses : [{ id: uid(), category: 'carburant', amountStr: '', litersStr: '', comment: '' }]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayType]);

  const handleLoadEntry = (entry: DailyEntry) => {
    setDate(entry.date);
    setDayType(entry.dayType || 'normal');
    setRevenueStr(entry.revenue > 0 ? entry.revenue.toString() : '');
    setExpenses(entry.expenses.map(expenseItemToRow));
    setBreakdowns(entry.breakdowns.map(breakdownItemToRow));
    setGeneralComment(entry.comment);
    setEditingId(entry.id);
  };

  const addExpense = () => {
    setExpenses(prev => [...prev, { id: uid(), category: 'carburant', amountStr: '', litersStr: '', comment: '' }]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateExpenseField = (id: string, field: keyof ExpenseRow, value: string) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addBreakdown = () => {
    setBreakdowns(prev => [...prev, { id: uid(), category: 'Moteur', partChanged: '', cause: '', amountStr: '' }]);
  };

  const removeBreakdown = (id: string) => {
    setBreakdowns(prev => prev.filter(b => b.id !== id));
  };

  const updateBreakdownField = (id: string, field: keyof BreakdownRow, value: string) => {
    setBreakdowns(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const totalExpensesAmt = expenses.reduce((s, e) => s + (parseFloat(e.amountStr) || 0), 0);
  const totalBreakdownsAmt = breakdowns.reduce((s, b) => s + (parseFloat(b.amountStr) || 0), 0);
  const totalDeductions = totalExpensesAmt + totalBreakdownsAmt;
  const grossRevenue = dayType === 'normal' ? (parseFloat(revenueStr) || 0) : 0;
  const netRevenue = grossRevenue - totalDeductions;

  const resetForm = () => {
    setDate(today);
    setDayType('normal');
    setRevenueStr('');
    const autoExpenses = getAutomatedExpenses();
    setExpenses(autoExpenses.length > 0 ? autoExpenses : [{ id: uid(), category: 'carburant', amountStr: '', litersStr: '', comment: '' }]);
    setBreakdowns([]);
    setGeneralComment('');
    setEditingId(null);
  };

  const handleSave = () => {
    const entry: DailyEntry = {
      id: editingId || uid(),
      date,
      dayType,
      revenue: grossRevenue,
      expenses: expenses.map(expenseRowToItem),
      breakdowns: breakdowns.map(breakdownRowToItem),
      comment: generalComment,
      netRevenue: dayType === 'inactive' ? 0 : netRevenue,
    };
    if (editingId) {
      updateDailyEntry(editingId, entry);
    } else {
      addDailyEntry(entry);
    }
    resetForm();
  };

  const selectedDayType = DAY_TYPES.find((d) => d.value === dayType)!;

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/80">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            {editingId ? 'Modifier l\'activité' : 'Nouvelle activité journalière'}
          </h2>
        </div>

        <div className="p-5 space-y-6">

          {/* Date */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 focus:bg-slate-700"
            />
          </div>

          {/* Type de journée */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-3 block">Type de journée</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DAY_TYPES.map((dt) => {
                const Icon = dt.icon;
                const isSelected = dayType === dt.value;
                return (
                  <button
                    key={dt.value}
                    onClick={() => setDayType(dt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center
                      ${isSelected
                        ? `${dt.bg} ${dt.border} shadow-lg`
                        : 'bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-700/50'
                      }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? dt.color : 'text-slate-400'}`} />
                    <div>
                      <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{dt.label}</p>
                      <p className={`text-xs mt-0.5 ${isSelected ? dt.color : 'text-slate-500'}`}>{dt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Badge type sélectionné */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${selectedDayType.bg} border ${selectedDayType.border}`}>
            <selectedDayType.icon className={`w-4 h-4 ${selectedDayType.color}`} />
            <span className={`text-sm font-medium ${selectedDayType.color}`}>{selectedDayType.label}</span>
            <span className="text-slate-500 text-xs ml-1">— {selectedDayType.desc}</span>
          </div>

          {/* Recette brute — seulement pour journée normale */}
          {dayType === 'normal' && (
            <div>
              <label className="text-slate-400 text-xs font-medium mb-1.5 block">
                Recette brute du jour ({currency})
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={revenueStr}
                onChange={(e) => setRevenueStr(e.target.value)}
                placeholder="Ex: 35000 (laisser vide si aucune recette)"
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-slate-500 text-xs mt-1">Laissez vide ou mettez 0 si aucune recette ce jour</p>
            </div>
          )}

          {/* Message journée sans activité */}
          {dayType === 'inactive' && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
              <BanIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 font-semibold text-sm">Journée sans activité</p>
              <p className="text-slate-500 text-xs mt-1">Expliquez la raison dans le commentaire ci-dessous (panne, repos, fête...)</p>
            </div>
          )}

          {/* Charges & Dépenses — masquées si inactive */}
          {dayType !== 'inactive' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full" />
                  {dayType === 'maintenance' ? 'Charges de maintenance' : 'Charges & Dépenses'}
                  {automations.some(a => a.isActive && a.frequency === 'daily') && (
                    <span className="text-blue-400 text-xs flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5" /> Auto inclus
                    </span>
                  )}
                </h3>
                <button onClick={addExpense} className="flex items-center gap-1.5 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg px-3 py-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une charge
                </button>
              </div>
              <div className="space-y-3">
                {expenses.map((exp) => {
                  const catInfo = EXPENSE_CATEGORIES.find((c) => c.value === exp.category);
                  const isAuto = exp.isAutomated;
                  const autoTask = isAuto ? automations.find((a) => a.id === exp.automationId) : null;
                  return (
                    <div key={exp.id} className={`bg-slate-700/30 rounded-xl p-4 border ${isAuto ? 'border-blue-500/30' : 'border-slate-600/30'}`}>
                      {isAuto && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400 text-xs font-medium">
                            ⚡ Automatisé — {autoTask ? (EXPENSE_CATEGORIES.find(c => c.value === autoTask.category)?.label || autoTask.name) : 'Tâche auto'}
                          </span>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Catégorie</label>
                          <div className="relative">
                            <select
                              value={exp.category}
                              onChange={(e) => updateExpenseField(exp.id, 'category', e.target.value)}
                              className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm appearance-none focus:outline-none focus:border-amber-500/50"
                            >
                              {EXPENSE_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-slate-500 text-xs mb-1 block">Montant ({currency})</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={exp.amountStr}
                            onChange={(e) => updateExpenseField(exp.id, 'amountStr', e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                        {catInfo?.hasLiters && (
                          <div>
                            <label className="text-slate-500 text-xs mb-1 block">Litres (optionnel)</label>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={exp.litersStr}
                              onChange={(e) => updateExpenseField(exp.id, 'litersStr', e.target.value)}
                              placeholder="0"
                              className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <label className="text-slate-500 text-xs mb-1 block">Commentaire / Précision</label>
                        <input
                          type="text"
                          value={exp.comment}
                          onChange={(e) => updateExpenseField(exp.id, 'comment', e.target.value)}
                          placeholder="Ex: Plein complet, 3L huile moteur..."
                          className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div className="flex justify-end mt-2">
                        <button onClick={() => removeExpense(exp.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {expenses.length === 0 && (
                  <div className="text-center py-6 text-slate-600 text-sm border border-dashed border-slate-700 rounded-xl">
                    Aucune charge ajoutée — cliquez sur "Ajouter une charge"
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pannes — toujours visibles sauf inactive */}
          {dayType !== 'inactive' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  Pannes & Réparations
                </h3>
                <button onClick={addBreakdown} className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg px-3 py-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Ajouter une panne
                </button>
              </div>
              <div className="space-y-3">
                {breakdowns.map((bd) => (
                  <div key={bd.id} className="bg-slate-700/30 border border-red-500/10 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-red-400 text-xs font-medium">Panne / Réparation</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 text-xs mb-1 block">Catégorie de panne</label>
                        <div className="relative">
                          <select
                            value={bd.category}
                            onChange={(e) => updateBreakdownField(bd.id, 'category', e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm appearance-none focus:outline-none focus:border-red-500/50"
                          >
                            {BREAKDOWN_CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-500 text-xs mb-1 block">Coût de réparation ({currency})</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={bd.amountStr}
                          onChange={(e) => updateBreakdownField(bd.id, 'amountStr', e.target.value)}
                          placeholder="0"
                          className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-xs mb-1 block">Pièce changée / Réparation effectuée</label>
                        <input
                          type="text"
                          value={bd.partChanged}
                          onChange={(e) => updateBreakdownField(bd.id, 'partChanged', e.target.value)}
                          placeholder="Ex: Filtre à huile, plaquettes de frein..."
                          className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-xs mb-1 block">Cause de la panne</label>
                        <input
                          type="text"
                          value={bd.cause}
                          onChange={(e) => updateBreakdownField(bd.id, 'cause', e.target.value)}
                          placeholder="Ex: Usure normale, choc, surchauffe..."
                          className="w-full bg-slate-700 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button onClick={() => removeBreakdown(bd.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {breakdowns.length === 0 && (
                  <div className="text-center py-4 text-slate-600 text-xs border border-dashed border-slate-700/50 rounded-xl">
                    Aucune panne ce jour — cliquez sur "Ajouter une panne" si nécessaire
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Commentaire général */}
          <div>
            <label className="text-slate-400 text-xs font-medium mb-1.5 block">
              {dayType === 'inactive' ? 'Raison (panne, repos, fête, grève...)' : 'Commentaire général de la journée'}
            </label>
            <textarea
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              rows={2}
              placeholder={dayType === 'inactive' ? 'Ex: Véhicule immobilisé, en attente de pièces...' : 'Notes supplémentaires sur la journée...'}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {/* Récapitulatif */}
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-700/30 border border-slate-600/30 rounded-xl p-4">
            <h4 className="text-white font-medium text-sm mb-3">📊 Récapitulatif de la journée</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Type de journée</span>
                <span className={`font-semibold text-xs px-2 py-1 rounded-lg ${selectedDayType.bg} ${selectedDayType.color}`}>
                  {selectedDayType.label}
                </span>
              </div>
              {dayType === 'normal' && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Recette brute</span>
                  <span className="text-emerald-400 font-semibold">{fmt(grossRevenue, currency)}</span>
                </div>
              )}
              {dayType !== 'inactive' && (
                <>
                  {totalExpensesAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Charges ({expenses.length})</span>
                      <span className="text-orange-400">- {fmt(totalExpensesAmt, currency)}</span>
                    </div>
                  )}
                  {totalBreakdownsAmt > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pannes ({breakdowns.length})</span>
                      <span className="text-red-400">- {fmt(totalBreakdownsAmt, currency)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="border-t border-slate-600/50 pt-2 flex justify-between">
                <span className="text-white font-semibold">
                  {dayType === 'normal' ? '💰 Recette nette' : '💸 Dépenses totales'}
                </span>
                <span className={`font-bold text-base ${netRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {dayType === 'inactive' ? fmt(0, currency) : fmt(dayType === 'normal' ? netRevenue : -(totalExpensesAmt + totalBreakdownsAmt), currency)}
                </span>
              </div>
              {dayType === 'normal' && netRevenue >= 0 && (
                <p className="text-slate-500 text-xs text-right">→ Montant rentré en caisse</p>
              )}
              {dayType === 'maintenance' && (
                <p className="text-slate-500 text-xs text-right">→ Journée d'entretien (pas de recettes)</p>
              )}
              {dayType === 'inactive' && (
                <p className="text-slate-500 text-xs text-right">→ Aucune activité ce jour</p>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Mettre à jour' : 'Enregistrer l\'activité'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all text-sm"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Historique des activités */}
      {dailyEntries.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h3 className="text-white font-semibold">Historique des activités ({dailyEntries.length})</h3>
          </div>
          <div className="divide-y divide-slate-700/30">
            {dailyEntries.map((entry) => {
              const dt = DAY_TYPES.find((d) => d.value === (entry.dayType || 'normal'))!;
              const DtIcon = dt.icon;
              const entryExpensesTotal = entry.expenses.reduce((s, e) => s + e.amount, 0);
              const entryBreakdownsTotal = entry.breakdowns.reduce((s, b) => s + b.amount, 0);
              return (
                <div key={entry.id} className="px-5 py-4 hover:bg-slate-700/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-medium text-sm">
                          {new Date(entry.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${dt.bg} ${dt.color} ${dt.border}`}>
                          <DtIcon className="w-2.5 h-2.5" /> {dt.label}
                        </span>
                        {entry.expenses.some((e) => e.isAutomated) && (
                          <span className="flex items-center gap-1 text-blue-400 text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                            <Zap className="w-2.5 h-2.5" /> Auto
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
                        {entry.dayType === 'normal' && (
                          <span>Brut: <span className="text-emerald-400 font-medium">{fmt(entry.revenue, currency)}</span></span>
                        )}
                        {entry.dayType !== 'inactive' && entryExpensesTotal > 0 && (
                          <span>Charges: <span className="text-orange-400">{fmt(entryExpensesTotal, currency)}</span></span>
                        )}
                        {entryBreakdownsTotal > 0 && (
                          <span>Pannes: <span className="text-red-400">{fmt(entryBreakdownsTotal, currency)}</span></span>
                        )}
                      </div>
                      {entry.comment && <p className="text-slate-500 text-xs mt-1 italic">"{entry.comment}"</p>}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-right">
                        {entry.dayType === 'normal' ? (
                          <>
                            <p className={`font-bold text-sm ${entry.netRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {fmt(entry.netRevenue, currency)}
                            </p>
                            <p className="text-slate-600 text-xs">net</p>
                          </>
                        ) : (
                          <p className={`font-bold text-sm ${dt.color}`}>{dt.label}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoadEntry(entry)}
                          className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteDailyEntry(entry.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
