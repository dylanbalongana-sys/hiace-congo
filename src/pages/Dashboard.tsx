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

const totalRevenue = dailyEntries.reduce((s, e) => s + e.revenue, 0);
const totalExpenses = dailyEntries.reduce((s, e) => s + e.expenses.reduce((a, b) => a + b.amount, 0), 0);
const totalBreakdowns = dailyEntries.reduce((s, e) => s + e.breakdowns.reduce((a, b) => a + b.amount, 0), 0);
const totalNet = dailyEntries.reduce((s, e) => s + e.netRevenue, 0);
const totalDebt = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
const activeAutomations = automations.filter((a) => a.isActive).length;
const pendingObjectives = objectives.filter((o) => o.status === 'pending').length;
const lateObjectives = objectives.filter((o) => o.status === 'late').length;

const netWithDebt = totalNet - totalDebt;
const displayedNet = deductDebt ? netWithDebt : totalNet;

const thisMonth = new Date().toISOString().slice(0, 7);
const monthEntries = dailyEntries.filter((e) => e.date.startsWith(thisMonth));
const monthRevenue = monthEntries.reduce((s, e) => s + e.revenue, 0);
const monthNet = monthEntries.reduce((s, e) => s + e.netRevenue, 0);
const monthExpenses = monthEntries.reduce((s, e) => s + e.expenses.reduce((a, b) => a + b.amount, 0), 0);

const cards = [
{ label: "Caisse actuelle", value: fmt(cashBalance, currency), icon: PiggyBank, color: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", sub: "Solde disponible", trend: cashBalance >= 0 ? 'up' : 'down' },
{ label: "Recette du jour", value: todayEntry ? fmt(todayEntry.revenue, currency) : fmt(0, currency), icon: TrendingUp, color: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", sub: todayEntry ? `Net: ${fmt(todayEntry.netRevenue, currency)}` : "Aucune activité", trend: 'up' },
{ label: "Recette du mois", value: fmt(monthRevenue, currency), icon: Wallet, color: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20", sub: `Net: ${fmt(monthNet, currency)}`, trend: monthNet >= 0 ? 'up' : 'down' },
{ label: "Total Dettes", value: fmt(totalDebt, currency), icon: CreditCard, color: "from-red-500 to-rose-600", shadow: "shadow-red-500/20", sub: "Dettes impayées", trend: 'down' },
];

return ( <div className="space-y-6 bg-[url('/bus-bg-8k.jpg')] bg-cover bg-center relative"> <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

```
  <div className="relative z-10 space-y-6">
    {/* Welcome */}
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <h2 className="text-white font-bold text-lg">Salut 👋</h2>
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
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 text-white/70" /> : trend === 'down' ? <ArrowDownRight className="w-4 h-4 text-white/70" /> : <Minus className="w-4 h-4 text-white/70" />}
          </div>
          <p className="text-white/70 text-xs font-medium mb-1">{label}</p>
          <p className="text-white font-bold text-xl leading-tight">{value}</p>
          <p className="text-white/60 text-xs mt-1">{sub}</p>
        </div>
      ))}
    </div>

    {/* Résultat Net Global */}
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Résultat Net Global</h3>
        <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl p-1">
          <button onClick={() => setDeductDebt(false)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!deductDebt ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Sans déduction dette</button>
          <button onClick={() => setDeductDebt(true)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${deductDebt ? 'bg-red-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Avec déduction dette</button>
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
          <p className={`font-bold text-lg ${displayedNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(displayedNet, currency)}</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

);
}
