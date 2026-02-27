import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppData,
  DailyEntry,
  Debt,
  ProvisionalDebt,
  AutomationTask,
  Objective,
  Notification,
  Settings,
  ExpenseItem,
} from '../types';

export function uid(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

const defaultSettings: Settings = {
  staff: {
    driverName: '',
    driverPhone: '',
    controllerName: '',
    controllerPhone: '',
    collaboratorName: '',
    collaboratorPhone: '',
  },
  currency: 'Fr',
  vehicleName: 'Toyota Hiace',
  vehiclePlate: '',
  ownerName: '',
};

interface AppStore extends AppData {
  addDailyEntry: (entry: DailyEntry) => void;
  updateDailyEntry: (id: string, entry: Partial<DailyEntry>) => void;
  deleteDailyEntry: (id: string) => void;

  addDebt: (debt: Debt) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  addProvisionalDebt: (pd: ProvisionalDebt) => void;
  updateProvisionalDebt: (id: string, pd: Partial<ProvisionalDebt>) => void;
  deleteProvisionalDebt: (id: string) => void;

  addAutomation: (a: AutomationTask) => void;
  updateAutomation: (id: string, a: Partial<AutomationTask>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;

  addObjective: (o: Objective) => void;
  updateObjective: (id: string, o: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;

  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  updateSettings: (s: Partial<Settings>) => void;

  updateCashBalance: (amount: number) => void;
  addToCash: (amount: number) => void;
  removeFromCash: (amount: number) => void;

  triggerDailyAutomations: () => ExpenseItem[];
  checkObjectives: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      dailyEntries: [],
      debts: [],
      provisionalDebts: [],
      automations: [],
      objectives: [],
      notifications: [],
      settings: defaultSettings,
      cashBalance: 0,

      addDailyEntry: (entry) =>
        set((s) => ({
          dailyEntries: [entry, ...s.dailyEntries],
          cashBalance: s.cashBalance + entry.netRevenue,
        })),

      updateDailyEntry: (id, entry) =>
        set((s) => ({
          dailyEntries: s.dailyEntries.map((e) =>
            e.id === id ? { ...e, ...entry } : e
          ),
        })),

      deleteDailyEntry: (id) =>
        set((s) => {
          const entry = s.dailyEntries.find((e) => e.id === id);
          const delta = entry ? entry.netRevenue : 0;
          return {
            dailyEntries: s.dailyEntries.filter((e) => e.id !== id),
            cashBalance: s.cashBalance - delta,
          };
        }),

      addDebt: (debt) =>
        set((s) => ({ debts: [debt, ...s.debts] })),

      updateDebt: (id, debt) =>
        set((s) => ({
          debts: s.debts.map((d) => (d.id === id ? { ...d, ...debt } : d)),
        })),

      deleteDebt: (id) =>
        set((s) => ({ debts: s.debts.filter((d) => d.id !== id) })),

      addProvisionalDebt: (pd) =>
        set((s) => ({ provisionalDebts: [pd, ...s.provisionalDebts] })),

      updateProvisionalDebt: (id, pd) =>
        set((s) => ({
          provisionalDebts: s.provisionalDebts.map((d) =>
            d.id === id ? { ...d, ...pd } : d
          ),
        })),

      deleteProvisionalDebt: (id) =>
        set((s) => ({
          provisionalDebts: s.provisionalDebts.filter((d) => d.id !== id),
        })),

      addAutomation: (a) =>
        set((s) => ({ automations: [a, ...s.automations] })),

      updateAutomation: (id, a) =>
        set((s) => ({
          automations: s.automations.map((au) =>
            au.id === id ? { ...au, ...a } : au
          ),
        })),

      deleteAutomation: (id) =>
        set((s) => ({
          automations: s.automations.filter((a) => a.id !== id),
        })),

      toggleAutomation: (id) =>
        set((s) => ({
          automations: s.automations.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        })),

      addObjective: (o) =>
        set((s) => ({ objectives: [o, ...s.objectives] })),

      updateObjective: (id, o) =>
        set((s) => ({
          objectives: s.objectives.map((ob) =>
            ob.id === id ? { ...ob, ...o } : ob
          ),
        })),

      deleteObjective: (id) =>
        set((s) => ({
          objectives: s.objectives.filter((o) => o.id !== id),
        })),

      addNotification: (n) =>
        set((s) => ({ notifications: [n, ...s.notifications] })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      deleteNotification: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      clearAllNotifications: () => set({ notifications: [] }),

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      updateCashBalance: (amount) => set({ cashBalance: amount }),

      addToCash: (amount) =>
        set((s) => ({ cashBalance: s.cashBalance + amount })),

      removeFromCash: (amount) =>
        set((s) => ({ cashBalance: s.cashBalance - amount })),

      triggerDailyAutomations: () => {
        const { automations } = get();
        const today = new Date().toISOString().split('T')[0];
        const triggered: ExpenseItem[] = [];

        automations
          .filter((a) => a.isActive)
          .forEach((a) => {
            let shouldTrigger = false;
            if (a.frequency === 'daily') shouldTrigger = true;
            if (a.frequency === 'weekly') {
              const last = a.lastTriggered ? new Date(a.lastTriggered) : null;
              if (!last || Date.now() - last.getTime() >= 7 * 86400000)
                shouldTrigger = true;
            }
            if (a.frequency === 'monthly') {
              const last = a.lastTriggered ? new Date(a.lastTriggered) : null;
              if (!last || Date.now() - last.getTime() >= 30 * 86400000)
                shouldTrigger = true;
            }
            if (shouldTrigger) {
              triggered.push({
                id: uid(),
                category: a.category,
                subcategory: a.subcategory,
                amount: a.amount,
                liters: a.liters,
                comment: a.comment || a.name,
                isAutomated: true,
                automationId: a.id,
              });
              set((s) => ({
                automations: s.automations.map((au) =>
                  au.id === a.id ? { ...au, lastTriggered: today } : au
                ),
              }));
            }
          });
        return triggered;
      },

      checkObjectives: () => {
        const { objectives, notifications } = get();
        const today = new Date();
        objectives.forEach((o) => {
          if (o.status === 'done') return;
          const target = new Date(o.targetDate);
          const diffDays = Math.ceil(
            (target.getTime() - today.getTime()) / 86400000
          );
          if (diffDays < 0 && o.status !== 'late') {
            set((s) => ({
              objectives: s.objectives.map((ob) =>
                ob.id === o.id ? { ...ob, status: 'late' as const } : ob
              ),
            }));
          }
          if (
            diffDays >= 0 &&
            diffDays <= (o.reminderDays || 7) &&
            !notifications.some(
              (n) => n.type === 'objective' && n.message.includes(o.id)
            )
          ) {
            const notif: Notification = {
              id: uid(),
              type: 'objective',
              message: `Rappel: "${o.title}" prévu le ${o.targetDate} (dans ${diffDays} jour(s)) [${o.id}]`,
              date: today.toISOString(),
              read: false,
            };
            set((s) => ({ notifications: [notif, ...s.notifications] }));
          }
        });
      },
    }),
    { name: 'hiace-manager-store' }
  )
);
