import { useState } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  BarChart3, Calendar, Lightbulb,
  ThumbsUp, ThumbsDown, Wrench, BanIcon, Zap, Target,
  ArrowUp, ArrowDown, Minus, Star, Activity
} from 'lucide-react';
import { useStore } from '../store/useStore';

function fmt(n: number, currency = 'Fr') {
  return `${n.toLocaleString('fr-FR')} ${currency}`;
}

function pct(val: number, total: number) {
  if (total === 0) return 0;
  return Math.round((val / total) * 100);
}

type Period = 'week' | 'month' | 'all';

const CAT_LABELS: Record<string, string> = {
  carburant: 'Carburant',
  huile_moteur: 'Huile moteur',
  huile_boite: 'Huile de boîte',
  huile_frein: 'Huile de frein',
  huile_direction: 'Huile direction',
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

// Mini bar chart component
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${w}%` }} />
    </div>
  );
}

// Donut-like visual
function DonutStat({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const p = pct(value, total);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (p / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke="currentColor"
          className={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{p}%</text>
      </svg>
      <p className="text-slate-400 text-[10px] text-center leading-tight">{label}</p>
    </div>
  );
}

// Day trend chart (last 7 days bars)
function DayBarsChart({ entries, currency: _currency }: { entries: { date: string; netRevenue: number; revenue: number; dayType: string }[]; currency: string }) {
  if (entries.length === 0) return null;
  const last7 = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const maxVal = Math.max(...last7.map(e => Math.abs(e.netRevenue)), 1);
  return (
    <div className="space-y-2">
      {last7.map(entry => {
        const isNormal = (entry.dayType || 'normal') === 'normal';
        const net = entry.netRevenue;
        const barW = Math.max(3, (Math.abs(net) / maxVal) * 100);
        const dayLabel = new Date(entry.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        return (
          <div key={entry.date} className="flex items-center gap-3">
            <span className="text-slate-500 text-xs w-16 flex-shrink-0">{dayLabel}</span>
            <div className="flex-1 h-6 bg-slate-700/40 rounded-lg overflow-hidden relative">
              <div
                className={`h-6 rounded-lg transition-all duration-500 ${
                  !isNormal ? 'bg-slate-600/50' :
                  net >= 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
                }`}
                style={{ width: `${barW}%` }}
              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white">
                {isNormal ? fmt(net, _currency) : entry.dayType === 'maintenance' ? '🔧 Maint.' : '🚫 Inactif'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Weekly summary
function WeeklySummary({ entries, currency: _cur }: { entries: { date: string; netRevenue: number; revenue: number; dayType: string }[]; currency: string }) {
  void _cur;
  // Grouper par semaine
  const weeks: Record<string, typeof entries> = {};
  entries.forEach(e => {
    const d = new Date(e.date + 'T12:00:00');
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];
    if (!weeks[key]) weeks[key] = [];
    weeks[key].push(e);
  });
  const weekKeys = Object.keys(weeks).sort().slice(-4);
  if (weekKeys.length < 2) return null;
  const maxNet = Math.max(...weekKeys.map(k => Math.abs(weeks[k].reduce((s, e) => s + (e.dayType === 'normal' ? e.netRevenue : 0), 0))), 1);
  return (
    <div>
      <p className="text-slate-400 text-xs mb-3 font-medium">Évolution semaine par semaine</p>
      <div className="flex items-end gap-2 h-24">
        {weekKeys.map((key, idx) => {
          const weekEntries = weeks[key];
          const weekNet = weekEntries.reduce((s, e) => s + (e.dayType === 'normal' ? e.netRevenue : 0), 0);
          const h = Math.max(4, (Math.abs(weekNet) / maxNet) * 88);
          const prev = idx > 0 ? weeks[weekKeys[idx - 1]].reduce((s, e) => s + (e.dayType === 'normal' ? e.netRevenue : 0), 0) : null;
          const trend = prev !== null ? (weekNet > prev ? 'up' : weekNet < prev ? 'down' : 'flat') : null;
          return (
            <div key={key} className="flex-1 flex flex-col items-center gap-1">
              {trend === 'up' && <ArrowUp className="w-3 h-3 text-emerald-400" />}
              {trend === 'down' && <ArrowDown className="w-3 h-3 text-red-400" />}
              {trend === 'flat' && <Minus className="w-3 h-3 text-slate-500" />}
              {trend === null && <div className="w-3 h-3" />}
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '72px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all duration-700 ${weekNet >= 0 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'}`}
                  style={{ height: `${h}px` }}
                />
              </div>
              <p className="text-slate-600 text-[9px] text-center">
                {new Date(key + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
              <p className={`text-[10px] font-bold ${weekNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {weekNet >= 0 ? '+' : ''}{Math.round(weekNet / 1000)}k
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Bilan() {
  const { dailyEntries, debts, objectives, automations, settings, cashBalance } = useStore();
  const currency = settings.currency || 'Fr';
  const [period, setPeriod] = useState<Period>('month');

  const now = new Date();
  const filterEntries = () => {
    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return dailyEntries.filter((e) => new Date(e.date) >= weekAgo);
    }
    if (period === 'month') {
      const monthStr = now.toISOString().slice(0, 7);
      return dailyEntries.filter((e) => e.date.startsWith(monthStr));
    }
    return dailyEntries;
  };

  const entries = filterEntries();
  const normalDays = entries.filter(e => (e.dayType || 'normal') === 'normal');
  const maintenanceDays = entries.filter(e => e.dayType === 'maintenance');
  const inactiveDays = entries.filter(e => e.dayType === 'inactive');

  const totalRevenue = normalDays.reduce((s, e) => s + e.revenue, 0);
  const totalExpenses = entries.reduce((s, e) => s + e.expenses.reduce((a, b) => a + b.amount, 0), 0);
  const totalBreakdownCost = entries.reduce((s, e) => s + e.breakdowns.reduce((a, b) => a + b.amount, 0), 0);
  const totalNet = normalDays.reduce((s, e) => s + e.netRevenue, 0);
  const totalDebt = debts.filter(d => d.status !== 'paid').reduce((s, d) => s + d.remainingAmount, 0);
  const totalBreakdownCount = entries.reduce((s, e) => s + e.breakdowns.length, 0);

  const avgDailyRevenue = normalDays.length > 0 ? totalRevenue / normalDays.length : 0;
  const avgDailyExpenses = normalDays.length > 0 ? totalExpenses / normalDays.length : 0;
  const avgDailyNet = normalDays.length > 0 ? totalNet / normalDays.length : 0;

  const expenseRatio = pct(totalExpenses + totalBreakdownCost, totalRevenue);
  const profitMargin = pct(totalNet, totalRevenue);

  // Dépenses par catégorie
  const expenseByCategory: Record<string, number> = {};
  entries.forEach(e => {
    e.expenses.forEach(exp => {
      expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
    });
  });
  const topExpenses = Object.entries(expenseByCategory).sort(([, a], [, b]) => b - a).slice(0, 6);

  // Pannes
  const breakdownByCategory: Record<string, { count: number; total: number }> = {};
  entries.forEach(e => {
    e.breakdowns.forEach(bd => {
      if (!breakdownByCategory[bd.category]) breakdownByCategory[bd.category] = { count: 0, total: 0 };
      breakdownByCategory[bd.category].count++;
      breakdownByCategory[bd.category].total += bd.amount;
    });
  });
  const topBreakdowns = Object.entries(breakdownByCategory).sort(([, a], [, b]) => b.total - a.total).slice(0, 4);

  // Meilleur / pire jour
  const bestDay = normalDays.length > 0 ? normalDays.reduce((b, e) => e.netRevenue > b.netRevenue ? e : b) : null;
  const worstDay = normalDays.length > 0 ? normalDays.reduce((w, e) => e.netRevenue < w.netRevenue ? e : w) : null;

  // Score santé globale (0-100)
  let healthScore = 50;
  if (profitMargin >= 40) healthScore += 20;
  else if (profitMargin >= 20) healthScore += 10;
  else if (profitMargin < 0) healthScore -= 20;
  if (inactiveDays.length === 0) healthScore += 10;
  else if (inactiveDays.length > 3) healthScore -= 15;
  if (totalBreakdownCount === 0) healthScore += 10;
  else if (totalBreakdownCount > 3) healthScore -= 10;
  if (totalDebt === 0) healthScore += 10;
  else if (totalDebt > totalNet * 0.5) healthScore -= 10;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const healthColor = healthScore >= 70 ? 'text-emerald-400' : healthScore >= 40 ? 'text-amber-400' : 'text-red-400';
  const healthBg = healthScore >= 70 ? 'from-emerald-500' : healthScore >= 40 ? 'from-amber-500' : 'from-red-500';
  const healthLabel = healthScore >= 70 ? 'Excellente' : healthScore >= 40 ? 'Correcte' : 'Préoccupante';

  // Recommandations
  const recommendations: { type: 'positive' | 'warning' | 'danger' | 'info'; text: string }[] = [];
  if (profitMargin >= 40) recommendations.push({ type: 'positive', text: `Excellente marge bénéficiaire de ${profitMargin}% — Très bonne gestion des charges !` });
  else if (profitMargin >= 20) recommendations.push({ type: 'info', text: `Marge bénéficiaire correcte (${profitMargin}%) — Cherchez à optimiser les charges pour améliorer.` });
  else if (profitMargin > 0) recommendations.push({ type: 'warning', text: `Marge faible (${profitMargin}%) — Analysez et réduisez vos principales dépenses.` });
  else if (totalRevenue > 0) recommendations.push({ type: 'danger', text: `Marge négative ! Vos charges dépassent vos recettes. Action urgente requise.` });

  if (inactiveDays.length > 2) recommendations.push({ type: 'warning', text: `${inactiveDays.length} jours sans activité — Vérifiez l'état du véhicule et planifiez la maintenance.` });
  if (maintenanceDays.length > 0) recommendations.push({ type: 'info', text: `${maintenanceDays.length} journée(s) de maintenance — Bon suivi de l'entretien du véhicule.` });
  if (totalBreakdownCount > 3) recommendations.push({ type: 'danger', text: `${totalBreakdownCount} pannes enregistrées — Envisagez un contrôle technique complet du véhicule.` });
  if (totalBreakdownCount === 0 && entries.length > 0) recommendations.push({ type: 'positive', text: 'Aucune panne sur la période — Excellent état mécanique du véhicule !' });
  if (totalDebt > totalNet * 0.5 && totalNet > 0) recommendations.push({ type: 'warning', text: `Vos dettes (${fmt(totalDebt, currency)}) représentent plus de 50% de vos bénéfices nets.` });
  if (totalDebt === 0) recommendations.push({ type: 'positive', text: 'Aucune dette en cours — Excellente santé financière !' });
  if (automations.filter(a => a.isActive).length > 0) recommendations.push({ type: 'info', text: `${automations.filter(a => a.isActive).length} tâche(s) automatisée(s) active(s) — Gain de temps et de précision assuré.` });
  const lateObjectives = objectives.filter(o => o.status === 'late');
  if (lateObjectives.length > 0) recommendations.push({ type: 'warning', text: `${lateObjectives.length} objectif(s) en retard — Réévaluez vos priorités et vos délais.` });
  if (avgDailyRevenue > 0 && avgDailyExpenses / avgDailyRevenue > 0.6)
    recommendations.push({ type: 'warning', text: 'Les charges journalières dépassent 60% des recettes — Cherchez à optimiser le carburant ou les salaires.' });
  if (normalDays.length >= 5 && totalRevenue > 0)
    recommendations.push({ type: 'positive', text: `${normalDays.length} jours d'activité normale sur la période — Bonne régularité d'exploitation !` });

  // Projection mensuelle si on a des données
  const daysInMonth = 30;
  const workingDaysRatio = entries.length > 0 ? normalDays.length / entries.length : 0;
  const projectedMonthlyRevenue = avgDailyRevenue * daysInMonth * workingDaysRatio;
  const projectedMonthlyNet = avgDailyNet * daysInMonth * workingDaysRatio;

  const periodLabel = period === 'week' ? '7 derniers jours' : period === 'month' ? 'Ce mois-ci' : 'Toute la période';

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-violet-500/10 border border-violet-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" /> Bilan & Rapport Financier
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Analyse complète de vos performances — {periodLabel}</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl p-1 border border-slate-700/50">
          {(['week', 'month', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${period === p ? 'bg-violet-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {p === 'week' ? '7 jours' : p === 'month' ? 'Ce mois' : 'Tout'}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Aucune donnée pour cette période</p>
          <p className="text-slate-600 text-sm mt-1">Commencez par enregistrer des activités journalières</p>
        </div>
      ) : (
        <>
          {/* Score santé globale */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Score de santé globale
                </h3>
                <p className="text-slate-400 text-xs mb-3">Évaluation basée sur la marge, les pannes, les dettes et la régularité</p>
                <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full bg-gradient-to-r ${healthBg} to-white/20 transition-all duration-1000`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-slate-600 text-xs">0</span>
                  <span className={`text-xs font-bold ${healthColor}`}>{healthScore}/100 — {healthLabel}</span>
                  <span className="text-slate-600 text-xs">100</span>
                </div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${healthScore >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : healthScore >= 40 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <span className={`text-2xl font-black ${healthColor}`}>{healthScore}</span>
                </div>
                <p className={`text-xs mt-1 font-semibold ${healthColor}`}>{healthLabel}</p>
              </div>
            </div>
          </div>

          {/* KPIs principaux */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 text-xs">Recettes brutes</span>
              </div>
              <p className="text-emerald-400 font-bold text-lg">{fmt(totalRevenue, currency)}</p>
              <p className="text-slate-500 text-xs mt-1">Moy/j: {fmt(Math.round(avgDailyRevenue), currency)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-orange-400" />
                <span className="text-slate-400 text-xs">Charges totales</span>
              </div>
              <p className="text-orange-400 font-bold text-lg">{fmt(totalExpenses + totalBreakdownCost, currency)}</p>
              <p className="text-slate-500 text-xs mt-1">{expenseRatio}% des recettes</p>
            </div>
            <div className={`bg-gradient-to-br rounded-2xl p-4 border ${totalNet >= 0 ? 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' : 'from-red-500/20 to-rose-500/20 border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className={`w-4 h-4 ${totalNet >= 0 ? 'text-blue-400' : 'text-red-400'}`} />
                <span className="text-slate-400 text-xs">Bénéfice net</span>
              </div>
              <p className={`font-bold text-lg ${totalNet >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{fmt(totalNet, currency)}</p>
              <p className="text-slate-500 text-xs mt-1">Marge: {profitMargin}%</p>
            </div>
            <div className="bg-gradient-to-br from-slate-600/20 to-slate-700/20 border border-slate-600/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-xs">Caisse actuelle</span>
              </div>
              <p className={`font-bold text-lg ${cashBalance >= 0 ? 'text-white' : 'text-red-400'}`}>{fmt(cashBalance, currency)}</p>
              <p className="text-slate-500 text-xs mt-1">{entries.length} jour(s) saisis</p>
            </div>
          </div>

          {/* Graphique évolution + répartition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Graphique barres journalières */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Résultats journaliers (7 derniers jours)
              </h3>
              <DayBarsChart
                entries={entries.map(e => ({ date: e.date, netRevenue: e.netRevenue, revenue: e.revenue, dayType: e.dayType || 'normal' }))}
                currency={currency}
              />
              {entries.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Aucune donnée</p>}
            </div>

            {/* Évolution hebdomadaire */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" /> Évolution hebdomadaire
              </h3>
              <WeeklySummary
                entries={entries.map(e => ({ date: e.date, netRevenue: e.netRevenue, revenue: e.revenue, dayType: e.dayType || 'normal' }))}
                currency={currency}
              />
              {entries.length < 2 && <p className="text-slate-500 text-sm text-center py-4">Pas assez de données pour l'évolution</p>}
            </div>
          </div>

          {/* Indicateurs visuels (donuts) */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" /> Indicateurs de performance
            </h3>
            <div className="flex flex-wrap gap-6 justify-around">
              <DonutStat value={totalNet} total={totalRevenue} color="text-emerald-400" label={`Marge\nbénéficiaire`} />
              <DonutStat value={normalDays.length} total={entries.length} color="text-blue-400" label={`Jours\nnormaux`} />
              <DonutStat value={totalExpenses} total={totalRevenue} color="text-orange-400" label={`Charges /\nRecettes`} />
              <DonutStat value={Math.min(totalDebt, totalNet)} total={Math.max(totalNet, totalDebt)} color="text-red-400" label={`Dettes /\nBénéfices`} />
              <DonutStat value={objectives.filter(o => o.status === 'done').length} total={Math.max(objectives.length, 1)} color="text-violet-400" label={`Objectifs\nréalisés`} />
            </div>
          </div>

          {/* Top dépenses avec barres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-orange-400" /> Répartition des dépenses
              </h3>
              {topExpenses.length === 0 ? (
                <p className="text-slate-500 text-sm">Aucune dépense enregistrée</p>
              ) : (
                <div className="space-y-3.5">
                  {topExpenses.map(([cat, amt], i) => (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-400'}`}>
                            {i + 1}
                          </span>
                          <span className="text-slate-300 text-xs">{CAT_LABELS[cat] || cat}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-orange-400 font-semibold text-xs">{fmt(amt, currency)}</span>
                          <span className="text-slate-600 text-[10px] ml-1">({pct(amt, totalExpenses + totalBreakdownCost)}%)</span>
                        </div>
                      </div>
                      <MiniBar value={amt} max={topExpenses[0][1]} color="bg-gradient-to-r from-orange-500 to-red-500" />
                    </div>
                  ))}
                  <div className="bg-slate-700/30 rounded-xl px-3 py-2 flex justify-between mt-2">
                    <span className="text-slate-400 text-xs font-medium">Total charges</span>
                    <span className="text-orange-400 font-bold text-sm">{fmt(totalExpenses + totalBreakdownCost, currency)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pannes */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-400" /> Pannes & Réparations
              </h3>
              {topBreakdowns.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
                  <p className="text-emerald-400 font-semibold text-sm">Aucune panne sur la période</p>
                  <p className="text-slate-600 text-xs mt-1">Excellent état mécanique !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topBreakdowns.map(([cat, data]) => (
                    <div key={cat} className="bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-300 text-sm font-medium">{cat}</span>
                        <span className="text-red-400 font-bold text-sm">{fmt(data.total, currency)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniBar value={data.total} max={topBreakdowns[0][1].total} color="bg-gradient-to-r from-red-500 to-rose-500" />
                        <span className="text-slate-500 text-xs flex-shrink-0">{data.count}x</span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex justify-between mt-1">
                    <span className="text-slate-400 text-sm font-medium">Total réparations</span>
                    <span className="text-red-400 font-bold">{fmt(totalBreakdownCost, currency)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meilleur et pire jour */}
          {(bestDay || worstDay) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestDay && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-semibold text-sm">🏆 Meilleure journée</h3>
                  </div>
                  <p className="text-white font-medium capitalize">{new Date(bestDay.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p className="text-emerald-400 font-black text-3xl mt-1">{fmt(bestDay.netRevenue, currency)}</p>
                  <p className="text-slate-500 text-xs mt-1">Brut: {fmt(bestDay.revenue, currency)} · Charges: {fmt(bestDay.revenue - bestDay.netRevenue, currency)}</p>
                </div>
              )}
              {worstDay && worstDay.id !== bestDay?.id && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ThumbsDown className="w-4 h-4 text-red-400" />
                    <h3 className="text-white font-semibold text-sm">📉 Jour le plus difficile</h3>
                  </div>
                  <p className="text-white font-medium capitalize">{new Date(worstDay.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <p className={`font-black text-3xl mt-1 ${worstDay.netRevenue >= 0 ? 'text-amber-400' : 'text-red-400'}`}>{fmt(worstDay.netRevenue, currency)}</p>
                  <p className="text-slate-500 text-xs mt-1">Brut: {fmt(worstDay.revenue, currency)}</p>
                </div>
              )}
            </div>
          )}

          {/* Répartition journées */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" /> Répartition des journées
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-emerald-400 font-black text-2xl">{normalDays.length}</p>
                <p className="text-slate-400 text-xs mt-1">Normales</p>
                <p className="text-slate-600 text-xs">{pct(normalDays.length, entries.length)}%</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <Wrench className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-400 font-black text-2xl">{maintenanceDays.length}</p>
                <p className="text-slate-400 text-xs mt-1">Maintenance</p>
                <p className="text-slate-600 text-xs">{pct(maintenanceDays.length, entries.length)}%</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <BanIcon className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 font-black text-2xl">{inactiveDays.length}</p>
                <p className="text-slate-400 text-xs mt-1">Sans activité</p>
                <p className="text-slate-600 text-xs">{pct(inactiveDays.length, entries.length)}%</p>
              </div>
            </div>
            {/* Barre de répartition visuelle */}
            <div className="h-4 rounded-full overflow-hidden flex gap-0.5">
              {normalDays.length > 0 && (
                <div className="bg-emerald-500 rounded-l-full" style={{ width: `${pct(normalDays.length, entries.length)}%` }} />
              )}
              {maintenanceDays.length > 0 && (
                <div className="bg-amber-500" style={{ width: `${pct(maintenanceDays.length, entries.length)}%` }} />
              )}
              {inactiveDays.length > 0 && (
                <div className="bg-red-500 rounded-r-full" style={{ width: `${pct(inactiveDays.length, entries.length)}%` }} />
              )}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-emerald-400 text-[10px]">■ Normales {pct(normalDays.length, entries.length)}%</span>
              <span className="text-amber-400 text-[10px]">■ Maintenance {pct(maintenanceDays.length, entries.length)}%</span>
              <span className="text-red-400 text-[10px]">■ Inactives {pct(inactiveDays.length, entries.length)}%</span>
            </div>
          </div>

          {/* Moyennes et projections */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> Moyennes & Projections
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-slate-400 text-xs mb-1">Recette brute / jour</p>
                <p className="text-emerald-400 font-bold text-lg">{fmt(Math.round(avgDailyRevenue), currency)}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-slate-400 text-xs mb-1">Charges / jour</p>
                <p className="text-orange-400 font-bold text-lg">{fmt(Math.round(avgDailyExpenses), currency)}</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4">
                <p className="text-slate-400 text-xs mb-1">Net / jour</p>
                <p className={`font-bold text-lg ${avgDailyNet >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{fmt(Math.round(avgDailyNet), currency)}</p>
              </div>
            </div>
            {projectedMonthlyRevenue > 0 && (
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                <p className="text-violet-400 text-xs font-semibold mb-2">📈 Projection mensuelle (basée sur les moyennes)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-400 text-xs">Recettes projetées</p>
                    <p className="text-emerald-400 font-bold">{fmt(Math.round(projectedMonthlyRevenue), currency)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Bénéfice projeté</p>
                    <p className={`font-bold ${projectedMonthlyNet >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{fmt(Math.round(projectedMonthlyNet), currency)}</p>
                  </div>
                </div>
                <p className="text-slate-600 text-xs mt-2">* Projection basée sur {Math.round(workingDaysRatio * 100)}% de jours actifs</p>
              </div>
            )}
          </div>

          {/* Analyse financière dette */}
          {totalDebt > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Situation des dettes
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <p className="text-slate-400 text-xs">Dettes totales</p>
                  <p className="text-red-400 font-bold text-lg">{fmt(totalDebt, currency)}</p>
                </div>
                <div className={`rounded-xl p-3 border ${totalNet - totalDebt >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <p className="text-slate-400 text-xs">Solde après dettes</p>
                  <p className={`font-bold text-lg ${totalNet - totalDebt >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(totalNet - totalDebt, currency)}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Ratio dettes / bénéfices nets</span>
                  <span className={`font-semibold ${pct(totalDebt, Math.max(totalNet, 1)) <= 30 ? 'text-emerald-400' : pct(totalDebt, Math.max(totalNet, 1)) <= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {pct(totalDebt, Math.max(totalNet, 1))}%
                  </span>
                </div>
                <MiniBar
                  value={totalDebt}
                  max={Math.max(totalNet, totalDebt)}
                  color={pct(totalDebt, Math.max(totalNet, 1)) <= 30 ? 'bg-emerald-500' : pct(totalDebt, Math.max(totalNet, 1)) <= 70 ? 'bg-amber-500' : 'bg-red-500'}
                />
              </div>
            </div>
          )}

          {/* Recommandations */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Analyse & Recommandations personnalisées
            </h3>

            {recommendations.filter(r => r.type === 'positive').length > 0 && (
              <div className="mb-4">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ThumbsUp className="w-3 h-3" /> Points positifs
                </p>
                <div className="space-y-2">
                  {recommendations.filter(r => r.type === 'positive').map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.filter(r => r.type === 'danger' || r.type === 'warning').length > 0 && (
              <div className="mb-4">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" /> Points d'attention & Recommandations
                </p>
                <div className="space-y-2">
                  {recommendations.filter(r => r.type === 'danger' || r.type === 'warning').map((r, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${r.type === 'danger' ? 'bg-red-500/8 border border-red-500/20' : 'bg-amber-500/5 border border-amber-500/15'}`}>
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${r.type === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
                      <p className="text-slate-300 text-sm">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.filter(r => r.type === 'info').length > 0 && (
              <div>
                <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3" /> Informations & Conseils
                </p>
                <div className="space-y-2">
                  {recommendations.filter(r => r.type === 'info').map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
                      <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-slate-300 text-sm">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recommendations.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                <Lightbulb className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                Enregistrez plus d'activités pour obtenir des recommandations personnalisées
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
