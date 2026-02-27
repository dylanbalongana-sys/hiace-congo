import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, LayoutDashboard, CalendarDays,
  Wrench, CreditCard, TrendingDown, History, Zap, Target, BarChart3,
  Settings, ShieldCheck, Users, Bell, Play, CheckCircle, AlertCircle,
  Info, Bus, Star, Lock
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  steps: { title: string; desc: string; tip?: string }[];
}

const sections: Section[] = [
  {
    id: 'auth',
    icon: <Lock className="w-5 h-5" />,
    title: 'Connexion & Accès',
    color: 'from-violet-500 to-purple-600',
    steps: [
      { title: 'Choisir son rôle', desc: 'À l\'ouverture de l\'application, choisissez votre rôle : Propriétaire (accès complet) ou Collaborateur (saisie journalière).', tip: 'Le propriétaire peut modifier les PIN dans Paramètres.' },
      { title: 'Entrer le PIN', desc: 'Tapez votre code PIN à 4 chiffres sur le clavier numérique. PIN par défaut : Propriétaire = 1234, Collaborateur = 0000.' },
      { title: 'Changer son PIN', desc: 'Allez dans Paramètres → Sécurité & PIN pour modifier votre code PIN à tout moment.', tip: 'Seul le propriétaire peut modifier les deux PIN.' },
    ]
  },
  {
    id: 'dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    title: 'Tableau de Bord',
    color: 'from-blue-500 to-indigo-600',
    steps: [
      { title: 'Vue d\'ensemble', desc: 'Le tableau de bord affiche en temps réel : la caisse disponible, les recettes du jour, les charges, les dettes en cours et les objectifs actifs.' },
      { title: 'Recette nette', desc: 'La recette nette = Recette brute - Toutes les charges et dépenses. Elle est calculée automatiquement et ajoutée à la caisse.' },
      { title: 'Mode dette', desc: 'Vous pouvez voir le solde avec ou sans déduction des dettes : "Avec dettes" soustrait les dettes du solde, "Sans dettes" affiche le solde brut.' },
      { title: 'Indicateurs colorés', desc: 'Vert = positif/bon, Rouge = négatif/alerte, Orange = attention, Violet = informations générales.' },
    ]
  },
  {
    id: 'daily',
    icon: <CalendarDays className="w-5 h-5" />,
    title: 'Activité Journalière',
    color: 'from-emerald-500 to-teal-600',
    steps: [
      { title: 'Choisir le type de journée', desc: '3 types de journée : Journée Normale (travail + recettes), Journée Maintenance (pas de recettes, que des dépenses), Journée Sans Activité (panne ou repos).', tip: 'La date est automatiquement remplie avec la date du jour, mais vous pouvez la modifier.' },
      { title: 'Saisir la recette', desc: 'En journée normale, entrez la recette brute du jour en Francs CFA. Le calcul est automatique.', tip: 'En journée maintenance ou sans activité, la case recette n\'apparaît pas.' },
      { title: 'Ajouter des charges', desc: 'Cliquez sur "+ Ajouter une charge" pour ajouter une dépense : carburant, huile moteur, huile de frein, salaires, police, assurance, etc. Vous pouvez en ajouter plusieurs.' },
      { title: 'Ajouter une panne', desc: 'Si le véhicule a eu une panne, cliquez sur "+ Ajouter une panne" : précisez la catégorie de panne, la pièce changée, la cause et le montant.', tip: 'Vous pouvez ajouter plusieurs pannes le même jour.' },
      { title: 'Récapitulatif automatique', desc: 'En bas du formulaire, un récapitulatif s\'affiche : Recette brute - Charges - Pannes = Recette nette. Cette somme est ajoutée automatiquement à la caisse.' },
      { title: 'Tâches automatisées', desc: 'Les tâches que vous avez configurées en automatisation (ex: carburant quotidien) apparaissent automatiquement dans les charges avec l\'icône ⚡.', tip: 'L\'icône ⚡ orange indique qu\'une charge est automatisée.' },
    ]
  },
  {
    id: 'charges',
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Charges & Dépenses',
    color: 'from-amber-500 to-orange-500',
    steps: [
      { title: 'Catégories de charges', desc: 'Carburant (avec litres), Huile moteur, Huile de frein, Huile de boîte, Liquide de refroidissement, Salaire chauffeur, Salaire contrôleur, Salaire collaborateur, Police (JCC), Assurance, Patente.' },
      { title: 'Charges personnalisées', desc: 'Vous pouvez écrire n\'importe quelle charge dans le champ commentaire. L\'application mémorise ce que vous tapez et vous le repropose la prochaine fois.' },
      { title: 'Ajouter plusieurs charges', desc: 'Cliquez sur "+ Ajouter une charge" autant de fois que nécessaire. Chaque charge a sa propre ligne avec catégorie, montant et commentaire.' },
    ]
  },
  {
    id: 'breakdowns',
    icon: <Wrench className="w-5 h-5" />,
    title: 'Pannes',
    color: 'from-red-500 to-rose-600',
    steps: [
      { title: 'Enregistrer une panne', desc: 'Dans l\'activité journalière, section Pannes : choisissez la catégorie (moteur, électrique, freins, etc.), notez la pièce changée, la cause de la panne et le coût.' },
      { title: 'Catégories de pannes', desc: 'Moteur, Transmission, Freins, Électrique, Carrosserie, Pneus/Roues, Climatisation, Suspension, Échappement, Courroie de distribution.' },
      { title: 'Historique des pannes', desc: 'Toutes les pannes sont enregistrées dans l\'onglet Historique, filtrable par mois. Cela permet d\'analyser les pannes récurrentes.' },
    ]
  },
  {
    id: 'debts',
    icon: <TrendingDown className="w-5 h-5" />,
    title: 'Dettes',
    color: 'from-rose-500 to-pink-600',
    steps: [
      { title: 'Ajouter une dette', desc: 'Indiquez le fournisseur (mécanicien, grossiste, autre), le type de pièce prise, le montant total, la date de création et la date d\'échéance prévue.' },
      { title: 'Statuts des dettes', desc: 'En attente (rouge) = pas encore payé, Partiel (orange) = partiellement payé, Payé (vert) = soldé. Le statut se met à jour automatiquement.' },
      { title: 'Tableau de bord dettes', desc: 'Le total des dettes impacte le tableau de bord. Vous choisissez si vous voulez déduire les dettes de votre solde ou pas.' },
    ]
  },
  {
    id: 'provisional',
    icon: <TrendingDown className="w-5 h-5" />,
    title: 'Dettes Prévisionnelles',
    color: 'from-pink-500 to-fuchsia-600',
    steps: [
      { title: 'Qu\'est-ce qu\'une dette prévisionnelle ?', desc: 'C\'est une dette réglée "sur le papier" mais qui reste dans le système. Ex: vous prenez 10 000 Fr dans la caisse — c\'est une dette envers la caisse.' },
      { title: 'Créer une dette prévisionnelle', desc: 'Donnez un libellé, le montant, liez-la éventuellement à une dette réelle. Elle reste en statut "Prévisionnelle" tant qu\'elle n\'est pas confirmée ou annulée.' },
      { title: 'Gérer les statuts', desc: 'Confirmer = la dette devient réelle. Annuler = elle est supprimée du calcul. Remettre en dette = elle revient dans les dettes normales.' },
    ]
  },
  {
    id: 'automation',
    icon: <Zap className="w-5 h-5" />,
    title: 'Automatisation',
    color: 'from-yellow-500 to-amber-500',
    steps: [
      { title: 'Créer une automatisation', desc: 'Choisissez une catégorie (ex: Carburant), définissez le montant, la fréquence (quotidienne, hebdomadaire, mensuelle) et activez-la.' },
      { title: 'Fréquences disponibles', desc: 'Quotidienne : s\'ajoute chaque jour dans les charges. Hebdomadaire : tous les 7 jours. Mensuelle : tous les 30 jours (idéal pour assurance, patente).', tip: 'Les tâches mensuelles ont des rappels automatiques 1 semaine et 2 semaines avant.' },
      { title: 'Activer / Désactiver', desc: 'Cliquez sur le switch pour activer ou désactiver une automatisation. Pratique si vous n\'avez pas l\'argent pour payer ce mois-ci.' },
      { title: 'Icône ⚡ dans les activités', desc: 'Dans l\'activité journalière, les charges automatisées ont une icône ⚡ orange pour les distinguer des charges manuelles.' },
    ]
  },
  {
    id: 'objectives',
    icon: <Target className="w-5 h-5" />,
    title: 'Objectifs',
    color: 'from-teal-500 to-cyan-600',
    steps: [
      { title: 'Créer un objectif', desc: 'Donnez un titre (ex: "Acheter nouveau pneu"), une description, une date cible, un montant estimé et le nombre de jours de rappel avant l\'échéance.' },
      { title: 'Statuts des objectifs', desc: 'En cours (bleu) = dans les temps, En retard (rouge) = la date est dépassée, Réalisé (vert) = cliquez sur ✓ pour marquer comme fait.' },
      { title: 'Alertes d\'objectifs', desc: 'La cloche 🔔 en haut de l\'écran indique le nombre d\'alertes. Les objectifs proches de l\'échéance et en retard génèrent automatiquement des notifications.' },
    ]
  },
  {
    id: 'history',
    icon: <History className="w-5 h-5" />,
    title: 'Historique',
    color: 'from-indigo-500 to-blue-600',
    steps: [
      { title: 'Filtrer par mois', desc: 'Utilisez le sélecteur de mois pour voir toutes les activités, dépenses et pannes d\'un mois précis.' },
      { title: 'Onglets de l\'historique', desc: 'Activités journalières, Dépenses/Charges, Pannes. Chaque onglet est filtrable et triable.' },
      { title: 'Supprimer un enregistrement', desc: 'Cliquez sur l\'icône 🗑 à côté de chaque entrée pour la supprimer définitivement.' },
    ]
  },
  {
    id: 'bilan',
    icon: <BarChart3 className="w-5 h-5" />,
    title: 'Bilan & Rapport',
    color: 'from-violet-500 to-purple-600',
    steps: [
      { title: 'Score de santé', desc: 'Un score de 0 à 100 indique la santé financière globale de votre activité. Vert = bonne santé, Orange = attention, Rouge = situation critique.' },
      { title: 'Graphiques journaliers', desc: 'Barres colorées des 7 derniers jours : vert = bénéfice, rouge = perte. Passez la souris pour voir les détails.' },
      { title: 'Évolution hebdomadaire', desc: 'Comparaison semaine par semaine avec flèches de tendance pour identifier si l\'activité progresse ou régresse.' },
      { title: 'Recommandations', desc: 'L\'application analyse vos données et génère des recommandations : "Vos charges de carburant représentent X% des recettes" etc.', tip: 'Ces recommandations vous aident à prendre de meilleures décisions.' },
    ]
  },
  {
    id: 'settings',
    icon: <Settings className="w-5 h-5" />,
    title: 'Paramètres',
    color: 'from-slate-500 to-slate-600',
    steps: [
      { title: 'Informations du véhicule', desc: 'Nom du véhicule, numéro de plaque, nom du propriétaire. Ces infos apparaissent sur les rapports.' },
      { title: 'Informations du personnel', desc: 'Nom, prénom et téléphone du chauffeur, du contrôleur et du collaborateur.' },
      { title: 'Sécurité & PIN (Propriétaire uniquement)', desc: 'Modifiez le PIN propriétaire (4 chiffres) et le PIN collaborateur. Accessible uniquement si vous êtes connecté en tant que propriétaire.' },
      { title: 'Synchronisation Firebase', desc: 'Connectez l\'application à Firebase pour synchroniser les données en temps réel entre le Congo et la France. Voir la section Déploiement.' },
    ]
  },
];

const deploySteps = [
  {
    num: '01',
    title: 'Créer un compte Firebase (gratuit)',
    desc: 'Allez sur console.firebase.google.com → Créer un projet → nommez-le "hiace-congo".',
    color: 'from-orange-500 to-amber-500',
  },
  {
    num: '02',
    title: 'Ajouter une application Web',
    desc: 'Dans Firebase Console → icône </> → donnez un nom → copiez la firebaseConfig.',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    num: '03',
    title: 'Activer Firestore',
    desc: 'Menu gauche → Firestore Database → Créer → Règles → allow read, write: if true;',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    num: '04',
    title: 'Connecter dans l\'app',
    desc: 'Paramètres → Synchronisation Firebase → Collez vos clés → Connecter.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    num: '05',
    title: 'Déployer sur Vercel (gratuit)',
    desc: 'Allez sur vercel.com → Import Project → Uploadez les fichiers → Deploy → Vous obtenez un lien URL.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    num: '06',
    title: 'Partager le lien',
    desc: 'Envoyez le lien à votre collaborateur au Congo. Il l\'ouvre sur Chrome → "Ajouter à l\'écran d\'accueil" pour une vraie app mobile.',
    color: 'from-amber-500 to-orange-500',
  },
];

export default function Guide() {
  const [openSection, setOpenSection] = useState<string | null>('auth');
  const [activeTab, setActiveTab] = useState<'guide' | 'deploy'>('guide');

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Guide d'utilisation</h1>
            <p className="text-blue-200 text-sm mt-0.5">HiaceManager • Toyota Hiace Congo Brazzaville</p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-medium">v1.0</span>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: <Bus className="w-4 h-4" />, label: 'Gestion du bus' },
            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Propriétaire' },
            { icon: <Users className="w-4 h-4" />, label: 'Collaborateur' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800/50 rounded-xl p-1">
        {[
          { id: 'guide', label: '📖 Guide des fonctionnalités', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'deploy', label: '🚀 Mise en ligne & Partage', icon: <Play className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'guide' ? (
        <div className="space-y-3">
          {/* Quick info */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Comment utiliser ce guide</p>
              <p className="text-slate-400 text-xs mt-1">Cliquez sur chaque section pour voir les étapes détaillées. Suivez l'ordre recommandé pour une première utilisation.</p>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                  {section.icon}
                </div>
                <span className="text-white font-semibold text-left flex-1">{section.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{section.steps.length} étapes</span>
                  {openSection === section.id
                    ? <ChevronDown className="w-5 h-5 text-slate-400" />
                    : <ChevronRight className="w-5 h-5 text-slate-400" />
                  }
                </div>
              </button>

              {openSection === section.id && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="h-px bg-slate-700/50" />
                  {section.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-7 h-7 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{step.title}</p>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{step.desc}</p>
                        {step.tip && (
                          <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-amber-300 text-xs">{step.tip}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Roles comparison */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Comparaison des accès
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 font-semibold text-sm">Propriétaire</span>
                </div>
                <ul className="space-y-1.5">
                  {['Voir tout', 'Modifier PIN', 'Supprimer données', 'Paramètres avancés', 'Gérer Firebase', 'Objectifs & Bilan', 'Toutes les dettes'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-300 font-semibold text-sm">Collaborateur</span>
                </div>
                <ul className="space-y-1.5">
                  {['Saisie journalière', 'Voir tableau de bord', 'Ajouter charges', 'Signaler pannes', 'Voir objectifs', 'Voir historique', 'Voir dettes'].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Deploy info */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">Objectif : 1 lien = accès depuis partout</p>
              <p className="text-slate-400 text-xs mt-1">Votre collaborateur au Congo et vous en France accédez aux mêmes données en temps réel via un simple lien internet.</p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {deploySteps.map((step, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 flex gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {step.num}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Firebase rules */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Règles Firestore à copier
            </h3>
            <div className="bg-slate-900/80 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-slate-700/50">
              <p className="text-slate-500">{'// Firestore Rules'}</p>
              <p>{'rules_version = \'2\';'}</p>
              <p>{'service cloud.firestore {'}</p>
              <p className="ml-4">{'match /databases/{database}/documents {'}</p>
              <p className="ml-8">{'match /{document=**} {'}</p>
              <p className="ml-12">{'allow read, write: if true;'}</p>
              <p className="ml-8">{'}'}</p>
              <p className="ml-4">{'}'}</p>
              <p>{'}'}</p>
            </div>
            <p className="text-slate-500 text-xs mt-2">⚠️ Ces règles sont pour un usage personnel. Pour plus de sécurité, contactez un développeur.</p>
          </div>

          {/* Tips */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3">💡 Conseils pratiques</h3>
            <ul className="space-y-2">
              {[
                'Sur mobile Android : Chrome → Menu ⋮ → "Ajouter à l\'écran d\'accueil" → l\'app apparaît comme une vraie application',
                'Sur iPhone : Safari → Partager → "Sur l\'écran d\'accueil" → icône de l\'app sur le bureau',
                'Votre collaborateur n\'a besoin que du lien et de son PIN — pas de téléchargement',
                'Les données sont sauvegardées automatiquement sur Firebase et accessibles hors ligne',
                'Changez les PIN par défaut dès la première utilisation pour plus de sécurité',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 flex-shrink-0 font-bold">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
