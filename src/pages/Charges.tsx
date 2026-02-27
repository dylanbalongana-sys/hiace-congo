import { Wrench, TrendingDown, Droplets, ShieldCheck, Users } from 'lucide-react';
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

const CATEGORY_GROUPS = [
  {
    label: 'Carburants & Lubrifiants',
    icon: Droplets,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    keys: ['carburant', 'huile_moteur', 'huile_boite', 'huile_frein', 'huile_direction', 'huile_differentiel'],
  },
  {
    label: 'Charges réglementaires',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    keys: ['assurance', 'patente', 'police_jc'],
  },
  {
    label: 'Salaires',
    icon: Users,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    keys: ['salaire_chauffeur', 'salaire_controleur', 'salaire_collaborateur'],
  },
  {
    label: 'Autres charges',
    icon: TrendingDown,
    color: 'text-slate-400',
    bg: 'bg-slate-700/30',
    border: 'border-slate-600/20',
    keys: ['lavage', 'parking', 'autre'],
  },
];

export default function Charges() {
  const { dailyEntries, settings } = useStore();
  const currency = settings.currency || 'Fr';

  // Aggregate all expenses
  const allExpenses = dailyEntries.flatMap((e) => e.expenses);
  const allBreakdowns = dailyEntries.flatMap((e) => e.breakdowns);

  const totalByCategory = allExpenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const totalExpenses = allExpenses.reduce((s, e) => s + e.amount, 0);
  const totalBreakdowns = allBreakdowns.reduce((s, b) => s + b.amount, 0);

  // Breakdowns by category
  const breakdownsByCategory = allBreakdowns.reduce<Record<string, { count: number; total: number }>>((acc, b) => {
    if (!acc[b.category]) acc[b.category] = { count: 0, total: 0 };
    acc[b.category].count++;
    acc[b.category].total += b.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total charges</p>
          <p className="text-orange-400 font-bold text-xl">{fmt(totalExpenses, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total pannes</p>
          <p className="text-red-400 font-bold text-xl">{fmt(totalBreakdowns, currency)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 sm:col-span-1 col-span-2">
          <p className="text-slate-400 text-xs mb-1">Total déductions</p>
          <p className="text-rose-400 font-bold text-xl">{fmt(totalExpenses + totalBreakdowns, currency)}</p>
        </div>
      </div>

      {/* Charge groups */}
      <div className="space-y-4">
        {CATEGORY_GROUPS.map(({ label, icon: Icon, color, bg, border, keys }) => {
          const groupTotal = keys.reduce((s, k) => s + (totalByCategory[k] || 0), 0);
          if (groupTotal === 0 && allExpenses.length > 0) return null;
          return (
            <div key={label} className={`bg-slate-800/50 border ${border} rounded-2xl overflow-hidden`}>
              <div className={`${bg} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <h3 className={`font-semibold text-sm ${color}`}>{label}</h3>
                </div>
                <span className="text-white font-bold text-sm">{fmt(groupTotal, currency)}</span>
              </div>
              <div className="divide-y divide-slate-700/30">
                {keys.map((key) => {
                  const amt = totalByCategory[key] || 0;
                  const relEntries = allExpenses.filter((e) => e.category === key);
                  const totalLiters = relEntries.reduce((s, e) => s + (e.liters || 0), 0);
                  return (
                    <div key={key} className="px-5 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                      <div>
                        <p className="text-slate-300 text-sm">{EXPENSE_LABELS[key]}</p>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span>{relEntries.length} entrée(s)</span>
                          {totalLiters > 0 && <span>· {totalLiters}L</span>}
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${amt > 0 ? 'text-white' : 'text-slate-600'}`}>
                        {fmt(amt, currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdowns summary */}
      {Object.keys(breakdownsByCategory).length > 0 && (
        <div className="bg-slate-800/50 border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="bg-red-500/10 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-sm text-red-400">Pannes par catégorie</h3>
            </div>
            <span className="text-white font-bold text-sm">{fmt(totalBreakdowns, currency)}</span>
          </div>
          <div className="divide-y divide-slate-700/30">
            {Object.entries(breakdownsByCategory).map(([cat, { count, total }]) => (
              <div key={cat} className="px-5 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div>
                  <p className="text-slate-300 text-sm">{cat}</p>
                  <p className="text-xs text-slate-500">{count} panne(s)</p>
                </div>
                <span className="text-red-400 font-semibold text-sm">{fmt(total, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allExpenses.length === 0 && allBreakdowns.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Wrench className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-lg font-medium">Aucune charge enregistrée</p>
          <p className="text-sm mt-1">Commencez par enregistrer des activités journalières</p>
        </div>
      )}
    </div>
  );
}
