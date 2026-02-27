import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown, Wrench, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

const EXPENSE_LABELS: Record<string, string> = {
  carburant: 'Carburant',
  huile_moteur: 'Huile moteur',
  huile_boite: 'Huile de boîte',
  huile_frein: 'Huile de frein',
  huile_direction: 'Huile de direction',
  huile_differentiel: 'Huile différentiel',
  salaire_chauffeur: 'Salaire chauffeur',
  salaire_controleur: 'Salaire contrôleur',
  salaire_collaborateur: 'Salaire collaborateur',
  police_jc: 'Police (JC)',
  assurance: 'Assurance',
  patente: 'Patente',
  lavage: 'Lavage',
  parking: 'Parking',
  autre: 'Autre',
};

export default function History() {
  const { dailyEntries, debts, settings } = useStore();
  const currency = settings.currency || 'Fr';

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [activeTab, setActiveTab] = useState<'revenues' | 'expenses' | 'breakdowns' | 'debts'>('revenues');

  const monthEntries = dailyEntries.filter((e) => e.date.startsWith(selectedMonth));
  const monthDebts = debts.filter((d) => d.dateCreated.startsWith(selectedMonth));

  const monthRevenue = monthEntries.reduce((s, e) => s + e.revenue, 0);
  const monthNet = monthEntries.reduce((s, e) => s + e.netRevenue, 0);
  const allExpenses = monthEntries.flatMap((e) => e.expenses.map((exp) => ({ ...exp, date: e.date })));
  const allBreakdowns = monthEntries.flatMap((e) => e.breakdowns.map((b) => ({ ...b, date: e.date })));
  const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalBreakdowns = allBreakdowns.reduce((s, b) => s + b.amount, 0);

  // Group expenses by category
  const expenseByCategory = allExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const tabs = [
    { id: 'revenues' as const, label: 'Recettes', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'expenses' as const, label: 'Charges', icon: TrendingDown, color: 'text-orange-400' },
    { id: 'breakdowns' as const, label: 'Pannes', icon: Wrench, color: 'text-red-400' },
    { id: 'debts' as const, label: 'Dettes', icon: Calendar, color: 'text-violet-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <label className="text-slate-400 text-sm">Mois :</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Recettes brutes</p>
          <p className="text-emerald-400 font-bold text-lg">{fmt(monthRevenue, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Charges</p>
          <p className="text-orange-400 font-bold text-lg">{fmt(totalExpenses, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Pannes</p>
          <p className="text-red-400 font-bold text-lg">{fmt(totalBreakdowns, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Net du mois</p>
          <p className={`font-bold text-lg ${monthNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(monthNet, currency)}</p>
        </div>
      </div>

      {/* Expense by category */}
      {Object.keys(expenseByCategory).length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Charges par catégorie</h3>
          <div className="space-y-3">
            {Object.entries(expenseByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{EXPENSE_LABELS[cat] || cat}</span>
                      <span className="text-white font-medium">{fmt(amt, currency)} <span className="text-slate-500 text-xs">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-2">
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${activeTab === id ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Icon className={`w-3.5 h-3.5 ${activeTab === id ? color : ''}`} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab === 'revenues' && (
          monthEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Aucune recette ce mois-ci</div>
          ) : (
            monthEntries.map((e) => (
              <div key={e.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="text-slate-500 text-xs">{e.expenses.length} charge(s) · {e.breakdowns.length} panne(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">{fmt(e.revenue, currency)}</p>
                  <p className={`text-xs ${e.netRevenue >= 0 ? 'text-slate-400' : 'text-red-400'}`}>Net: {fmt(e.netRevenue, currency)}</p>
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'expenses' && (
          allExpenses.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Aucune charge ce mois-ci</div>
          ) : (
            allExpenses.map((e, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{EXPENSE_LABELS[e.category] || e.category}</p>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span>{new Date(e.date).toLocaleDateString('fr-FR')}</span>
                    {e.liters ? <span>{e.liters}L</span> : null}
                    {e.comment ? <span className="italic">{e.comment}</span> : null}
                  </div>
                </div>
                <p className="text-orange-400 font-semibold">{fmt(e.amount, currency)}</p>
              </div>
            ))
          )
        )}

        {activeTab === 'breakdowns' && (
          allBreakdowns.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Aucune panne ce mois-ci</div>
          ) : (
            allBreakdowns.map((b, i) => (
              <div key={i} className="bg-slate-800/50 border border-red-500/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium text-sm">{b.category}</p>
                  <p className="text-red-400 font-semibold">{fmt(b.amount, currency)}</p>
                </div>
                <p className="text-slate-400 text-xs">Pièce: {b.partChanged}</p>
                {b.cause && <p className="text-slate-500 text-xs">Cause: {b.cause}</p>}
                <p className="text-slate-600 text-xs mt-1">{new Date(b.date).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          )
        )}

        {activeTab === 'debts' && (
          monthDebts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">Aucune dette ce mois-ci</div>
          ) : (
            monthDebts.map((d) => (
              <div key={d.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{d.supplier}</p>
                  <p className="text-slate-500 text-xs">{d.part} · {new Date(d.dateCreated).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className="text-violet-400 font-semibold">{fmt(d.remainingAmount, currency)}</p>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
