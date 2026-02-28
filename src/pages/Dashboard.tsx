import { useState } from 'react';
import {
  TrendingUp, Wallet, AlertCircle, Zap,
  CreditCard, Target, ArrowUpRight, ArrowDownRight, Minus, PiggyBank
} from 'lucide-react';
import { useStore } from '../store/useStore';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

export default function Dashboard() {
  const { dailyEntries, debts, provisionalDebts, automations, objectives, cashBalance, settings } = useStore();
  const [deductDebt, setDeductDebt] = useState(false);

  const currency = settings.currency || 'Fr';

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = dailyEntries.find((e) => e.date === today);

  // Stats
  const totalRevenue = dailyEntries.reduce((s, e) => s + e.revenue, 0);
  const totalExpenses = dailyEntries.reduce(
    (s, e) => s + e.expenses.reduce((a, b) => a + b.amount, 0), 0
  );
  const totalBreakdowns = dailyEntries.reduce(
    (s, e) => s + e.breakdowns.reduce((a, b) => a + b.amount, 0), 0
  );
  const totalNet = dailyEntries.reduce((s, e) => s + e.netRevenue, 0);
  const totalDebt = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
  const activeAutomations = automations.filter((a) => a.isActive).length;
  const pendingObjectives = objectives.filter((o) => o.status === 'pending').length;
  const lateObjectives = objectives.filter((o) => o.status === 'late').length;

  const netWithDebt = totalNet - totalDebt;
  const displayedNet = deductDebt ? netWithDebt : totalNet;

  // Monthly stats
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthEntries = dailyEntries.filter((e) => e.date.startsWith(thisMonth));
  const monthRevenue = monthEntries.reduce((s, e) => s + e.revenue, 0);
  const monthNet = monthEntries.reduce((s, e) => s + e.netRevenue, 0);
  const monthExpenses = monthEntries.reduce(
    (s, e) => s + e.expenses.reduce((a, b) => a + b.amount, 0), 0
  );

  const cards = [
    {
      label: "Caisse actuelle",
      value: fmt(cashBalance, currency),
      icon: PiggyBank,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      sub: "Solde disponible",
      trend: cashBalance >= 0 ? 'up' : 'down',
    },
    {
      label: "Recette du jour",
      value: todayEntry ? fmt(todayEntry.revenue, currency) : fmt(0, currency),
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
      sub: todayEntry ? `Net: ${fmt(todayEntry.netRevenue, currency)}` : "Aucune activité",
      trend: 'up',
    },
    {
      label: "Recette du mois",
      value: fmt(monthRevenue, currency),
      icon: Wallet,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
      sub: `Net: ${fmt(monthNet, currency)}`,
      trend: monthNet >= 0 ? 'up' : 'down',
    },
    {
      label: "Total Dettes",
      value: fmt(totalDebt, currency),
      icon: CreditCard,
      color: "from-red-500 to-rose-600",
      shadow: "shadow-red-500/20",
      sub: "Dettes impayées",
      trend: 'down',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Bonjour 👋</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {settings.staff.collaboratorName || 'Collaborateur'} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-amber-400 font-bold text-sm">{settings.vehicleName}</p>
          <p className="text-slate-500 text-xs">{settings.vehiclePlate}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, shadow, sub, trend }) => (
          <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 shadow-lg ${shadow} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              {trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-white/70" />
              ) : trend === 'down' ? (
                <ArrowDownRight className="w-4 h-4 text-white/70" />
              ) : (
                <Minus className="w-4 h-4 text-white/70" />
              )}
            </div>
            <p className="text-white/70 text-xs font-medium mb-1">{label}</p>
            <p className="text-white font-bold text-xl leading-tight">{value}</p>
            <p className="text-white/60 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Net comparison */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Résultat Net Global</h3>
          <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-1">
            <button
              onClick={() => setDeductDebt(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!deductDebt ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sans déduction dette
            </button>
            <button
              onClick={() => setDeductDebt(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deductDebt ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Avec déduction dette
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Recettes Brutes</p>
            <p className="text-emerald-400 font-bold text-lg">{fmt(totalRevenue, currency)}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Charges Totales</p>
            <p className="text-orange-400 font-bold text-lg">{fmt(totalExpenses + totalBreakdowns, currency)}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-4">
            <p className="text-slate-400 text-xs mb-1">Dettes Totales</p>
            <p className="text-red-400 font-bold text-lg">{fmt(totalDebt, currency)}</p>
          </div>
          <div className={`rounded-xl p-4 ${displayedNet >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <p className="text-slate-400 text-xs mb-1">Net {deductDebt ? '(- dettes)' : ''}</p>
            <p className={`font-bold text-lg ${displayedNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {fmt(displayedNet, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Automations */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Automatisations</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{activeAutomations}</p>
          <p className="text-slate-500 text-xs mt-1">tâches actives / {automations.length} total</p>
        </div>

        {/* Objectifs */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Objectifs</h3>
          </div>
          <p className="text-3xl font-bold text-violet-400">{pendingObjectives}</p>
          <p className="text-slate-500 text-xs mt-1">en cours · <span className="text-red-400">{lateObjectives} en retard</span></p>
        </div>

        {/* Mois */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-white font-semibold text-sm">Ce mois-ci</h3>
          </div>
          <p className="text-3xl font-bold text-amber-400">{fmt(monthRevenue, currency)}</p>
          <p className="text-slate-500 text-xs mt-1">Charges: {fmt(monthExpenses, currency)}</p>
        </div>
      </div>

      {/* Recent entries */}
      {dailyEntries.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50">
            <h3 className="text-white font-semibold">Dernières activités</h3>
          </div>
          <div className="divide-y divide-slate-700/30">
            {dailyEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div>
                  <p className="text-white text-sm font-medium">{new Date(entry.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="text-slate-500 text-xs">{entry.expenses.length} charge(s) · {entry.breakdowns.length} panne(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold text-sm">{fmt(entry.revenue, currency)}</p>
                  <p className={`text-xs ${entry.netRevenue >= 0 ? 'text-slate-400' : 'text-red-400'}`}>Net: {fmt(entry.netRevenue, currency)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dettes provisionnelles */}
      {provisionalDebts.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" /> Dettes Prévisionnelles
          </h3>
          <div className="space-y-2">
            {provisionalDebts.slice(0, 3).map((pd) => (
              <div key={pd.id} className="flex items-center justify-between bg-orange-500/5 border border-orange-500/10 rounded-xl px-4 py-2.5">
                <span className="text-slate-300 text-sm">{pd.label}</span>
                <span className="text-orange-400 font-semibold text-sm">{fmt(pd.amount, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
