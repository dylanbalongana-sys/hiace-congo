import { useState, useEffect } from 'react';
import {
  TrendingUp, Wallet, AlertCircle, Zap,
  CreditCard, Target, ArrowUpRight, ArrowDownRight, Minus, PiggyBank
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

export default function Dashboard() {
  const { dailyEntries, debts, provisionalDebts, automations, objectives, cashBalance, settings } = useStore();
  const [deductDebt, setDeductDebt] = useState(false);
  const [animatedNet, setAnimatedNet] = useState(0);

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

  // Animate net value
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedNet(prev => {
        const diff = displayedNet - prev;
        if (Math.abs(diff) < 1) return displayedNet;
        return prev + diff * 0.1;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [displayedNet]);

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
      shadow: "shadow-emerald-500/25",
      sub: "Solde disponible",
      trend: cashBalance >= 0 ? 'up' : 'down',
    },
    {
      label: "Recette du jour",
      value: todayEntry ? fmt(todayEntry.revenue, currency) : fmt(0, currency),
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/25",
      sub: todayEntry ? `Net: ${fmt(todayEntry.netRevenue, currency)}` : "Aucune activité",
      trend: 'up',
    },
    {
      label: "Recette du mois",
      value: fmt(monthRevenue, currency),
      icon: Wallet,
      color: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/25",
      sub: `Net: ${fmt(monthNet, currency)}`,
      trend: monthNet >= 0 ? 'up' : 'down',
    },
    {
      label: "Total Dettes",
      value: fmt(totalDebt, currency),
      icon: CreditCard,
      color: "from-red-500 to-rose-600",
      shadow: "shadow-red-500/25",
      sub: "Dettes impayées",
      trend: 'down',
    },
  ];

  return (
    <div className="relative min-h-screen bg-black/90">
      {/* Fond futuriste 8K */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/8k-futuristic-bus.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 space-y-6 p-6">
        {/* Welcome */}
        <motion.div 
          className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex items-center justify-between backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className="text-white font-extrabold text-2xl tracking-wide">Bonjour 👋</h2>
            <p className="text-slate-400 text-sm mt-1">
              {settings.staff.collaboratorName || 'Collaborateur'} — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-amber-400 font-bold text-sm">{settings.vehicleName}</p>
            <p className="text-slate-500 text-xs">{settings.vehiclePlate}</p>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map(({ label, value, icon: Icon, color, shadow, sub, trend }) => (
            <motion.div 
              key={label}
              className={`bg-gradient-to-br ${color} rounded-3xl p-6 shadow-xl ${shadow} relative overflow-hidden backdrop-blur-sm cursor-pointer`}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-8 translate-x-8 animate-pulse" />
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {trend === 'up' ? (
                  <ArrowUpRight className="w-5 h-5 text-white/80" />
                ) : trend === 'down' ? (
                  <ArrowDownRight className="w-5 h-5 text-white/80" />
                ) : (
                  <Minus className="w-5 h-5 text-white/80" />
                )}
              </div>
              <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
              <motion.p 
                key={value}
                className="text-white font-extrabold text-2xl leading-tight"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {value}
              </motion.p>
              <p className="text-white/60 text-xs mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Net Global */}
        <motion.div 
          className="bg-slate-900/50 border border-slate-700/40 rounded-3xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold text-lg">Résultat Net Global</h3>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
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
            <div className="bg-slate-700/30 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Recettes Brutes</p>
              <motion.p key={totalRevenue} className="text-emerald-400 font-bold text-lg" 
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.3 }}>
                {fmt(totalRevenue, currency)}
              </motion.p>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Charges Totales</p>
              <motion.p key={totalExpenses+totalBreakdowns} className="text-orange-400 font-bold text-lg" 
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.3 }}>
                {fmt(totalExpenses + totalBreakdowns, currency)}
              </motion.p>
            </div>
            <div className="bg-slate-700/30 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Dettes Totales</p>
              <motion.p key={totalDebt} className="text-red-400 font-bold text-lg" 
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.3 }}>
                {fmt(totalDebt, currency)}
              </motion.p>
            </div>
            <div className={`rounded-2xl p-4 ${displayedNet >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <p className="text-slate-400 text-xs mb-1">Net {deductDebt ? '(- dettes)' : ''}</p>
              <motion.p className={`font-bold text-lg ${displayedNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`} 
                initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.3 }}>
                {fmt(animatedNet, currency)}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
