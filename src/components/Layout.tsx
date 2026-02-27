import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, CalendarDays, Wrench, CreditCard, History,
  Zap, Target, Settings, Bell, Bus, ChevronRight,
  TrendingDown, X, BarChart3, CheckCircle2, AlertTriangle, Clock, Info,
  BookOpen, LogOut, ShieldCheck, Users
} from 'lucide-react';
import type { Tab } from '../types';
import { useStore } from '../store/useStore';
import { useAuth } from '../auth/AuthContext';

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'daily', label: 'Activité Journalière', icon: CalendarDays },
  { id: 'charges', label: 'Charges & Pannes', icon: Wrench },
  { id: 'debts', label: 'Dettes', icon: CreditCard },
  { id: 'provisionalDebts', label: 'Dettes Prévisionnelles', icon: TrendingDown },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'automation', label: 'Automatisation', icon: Zap },
  { id: 'objectives', label: 'Objectifs', icon: Target },
  { id: 'bilan', label: 'Bilan & Rapport', icon: BarChart3 },
  { id: 'settings', label: 'Paramètres', icon: Settings },
  { id: 'guide', label: "Guide d'utilisation", icon: BookOpen },
];

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
}

export default function Layout({ activeTab, setActiveTab, children }: LayoutProps) {
  const {
    notifications, markNotificationRead, deleteNotification, clearAllNotifications,
    checkObjectives, objectives, automations, debts
  } = useStore();
  const { role, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkObjectives();
    // Vérifier toutes les 5 minutes
    const interval = setInterval(() => checkObjectives(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculer le nombre total d'alertes : notifications non lues + objectifs en retard + objectifs proches
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const today = new Date();
  const lateObjectives = objectives.filter(o => o.status === 'late').length;
  const upcomingObjectives = objectives.filter(o => {
    if (o.status !== 'pending') return false;
    const target = new Date(o.targetDate);
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const pendingDebts = debts.filter(d => d.status !== 'paid').length;
  const activeAutomations = automations.filter(a => a.isActive).length;

  // Total badge sur la cloche
  const totalAlerts = unreadNotifs + lateObjectives + upcomingObjectives;

  // Toutes les alertes à afficher dans le panel
  const allAlerts: { id: string; type: 'notification' | 'late-obj' | 'upcoming-obj'; message: string; sub?: string; icon: 'warning' | 'info' | 'check' | 'clock'; read?: boolean; notifId?: string }[] = [];

  // Notifications non lues
  notifications.forEach(n => {
    allAlerts.push({
      id: n.id,
      type: 'notification',
      message: n.message.replace(/\[.*?\]/, '').trim(),
      sub: new Date(n.date).toLocaleDateString('fr-FR'),
      icon: n.type === 'objective' ? 'clock' : n.type === 'debt' ? 'warning' : 'info',
      read: n.read,
      notifId: n.id,
    });
  });

  // Objectifs en retard non déjà dans notifications
  objectives
    .filter(o => o.status === 'late')
    .forEach(o => {
      const alreadyIn = notifications.some(n => n.message.includes(o.id));
      if (!alreadyIn) {
        allAlerts.push({
          id: `late-${o.id}`,
          type: 'late-obj',
          message: `⚠️ Objectif en retard : "${o.title}"`,
          sub: `Prévu le ${new Date(o.targetDate + 'T12:00:00').toLocaleDateString('fr-FR')}`,
          icon: 'warning',
          read: false,
        });
      }
    });

  // Objectifs proches (dans les 7 jours)
  objectives
    .filter(o => {
      if (o.status !== 'pending') return false;
      const target = new Date(o.targetDate);
      const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);
      return diffDays >= 0 && diffDays <= 7;
    })
    .forEach(o => {
      const target = new Date(o.targetDate);
      const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000);
      allAlerts.push({
        id: `upcoming-${o.id}`,
        type: 'upcoming-obj',
        message: `📅 Objectif bientôt : "${o.title}"`,
        sub: diffDays === 0 ? "Aujourd'hui !" : `Dans ${diffDays} jour(s)`,
        icon: 'clock',
        read: false,
      });
    });

  const unreadAlerts = allAlerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">HiaceManager</p>
            <p className="text-slate-400 text-xs">Congo Brazzaville</p>
          </div>
        </div>

        {/* Stats rapides sidebar */}
        <div className="mx-3 mt-3 mb-1 grid grid-cols-2 gap-2">
          <div className="bg-slate-700/40 rounded-xl p-2.5 text-center border border-slate-600/20">
            <p className="text-amber-400 font-bold text-sm">{activeAutomations}</p>
            <p className="text-slate-500 text-[10px]">Auto actives</p>
          </div>
          <div className="bg-slate-700/40 rounded-xl p-2.5 text-center border border-slate-600/20">
            <p className="text-red-400 font-bold text-sm">{pendingDebts}</p>
            <p className="text-slate-500 text-[10px]">Dettes en cours</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${activeTab === id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {id === 'objectives' && lateObjectives > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {lateObjectives}
                </span>
              )}
              {activeTab === id && <ChevronRight className="w-3 h-3" />}
            </button>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-3 border-t border-slate-700/50 space-y-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${role === 'owner' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
            {role === 'owner'
              ? <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
              : <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${role === 'owner' ? 'text-amber-300' : 'text-blue-300'}`}>
                {role === 'owner' ? 'Propriétaire' : 'Collaborateur'}
              </p>
              <p className="text-slate-500 text-[10px]">Toyota Hiace · Brazzaville</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current mb-1" />
              <div className="w-5 h-0.5 bg-current" />
            </button>
            <h1 className="text-white font-semibold text-sm lg:text-base">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          {/* Bell with smart notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
            >
              <Bell className={`w-5 h-5 ${totalAlerts > 0 ? 'text-amber-400' : ''}`} />
              {totalAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/40 animate-pulse">
                  {totalAlerts > 99 ? '99+' : totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/80">
                  <div>
                    <span className="text-white font-semibold text-sm">Alertes & Notifications</span>
                    {totalAlerts > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                        {totalAlerts} non lu{totalAlerts > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearAllNotifications()}
                        className="text-slate-500 hover:text-red-400 text-xs transition-colors"
                      >
                        Tout effacer
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[70vh] overflow-y-auto">
                  {allAlerts.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium text-sm">Tout est en ordre !</p>
                      <p className="text-slate-500 text-xs mt-1">Aucune alerte en cours</p>
                    </div>
                  ) : (
                    <>
                      {/* Alertes urgentes en premier */}
                      {allAlerts.filter(a => !a.read).length > 0 && (
                        <div className="px-3 py-2 bg-red-500/5 border-b border-slate-700/50">
                          <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">
                            🔔 Alertes non lues ({unreadAlerts})
                          </p>
                        </div>
                      )}
                      {allAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`px-4 py-3 border-b border-slate-700/30 flex items-start gap-3 transition-colors hover:bg-slate-700/20 ${!alert.read ? 'bg-amber-500/3' : 'opacity-60'}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            alert.icon === 'warning' ? 'bg-red-500/15' :
                            alert.icon === 'clock' ? 'bg-amber-500/15' :
                            alert.icon === 'check' ? 'bg-emerald-500/15' :
                            'bg-blue-500/15'
                          }`}>
                            {alert.icon === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> :
                             alert.icon === 'clock' ? <Clock className="w-3.5 h-3.5 text-amber-400" /> :
                             alert.icon === 'check' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> :
                             <Info className="w-3.5 h-3.5 text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-relaxed ${!alert.read ? 'text-white' : 'text-slate-400'}`}>
                              {alert.message}
                            </p>
                            {alert.sub && (
                              <p className="text-slate-600 text-[10px] mt-0.5">{alert.sub}</p>
                            )}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {alert.type === 'notification' && alert.notifId && (
                              <>
                                {!alert.read && (
                                  <button
                                    onClick={() => markNotificationRead(alert.notifId!)}
                                    className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg"
                                  >
                                    Lu
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(alert.notifId!)}
                                  className="text-slate-600 hover:text-red-400 p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Section objectifs */}
                      {(lateObjectives > 0 || upcomingObjectives > 0) && (
                        <div className="px-4 py-3 bg-slate-700/20 border-t border-slate-700/50">
                          <button
                            onClick={() => { setActiveTab('objectives'); setShowNotifications(false); }}
                            className="text-amber-400 text-xs hover:text-amber-300 flex items-center gap-1.5 font-medium"
                          >
                            <Target className="w-3 h-3" />
                            Voir tous les objectifs ({lateObjectives} en retard, {upcomingObjectives} proches)
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
