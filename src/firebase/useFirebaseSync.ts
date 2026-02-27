import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import {
  isFirebaseConnected,
  listenCollection,
  listenMeta,
  fbSaveDailyEntry,
  fbDeleteDailyEntry,
  fbSaveDebt,
  fbDeleteDebt,
  fbSaveProvisionalDebt,
  fbDeleteProvisionalDebt,
  fbSaveAutomation,
  fbDeleteAutomation,
  fbSaveObjective,
  fbDeleteObjective,
  fbSaveNotification,
  fbDeleteNotification,
  fbSaveSettings,
  fbSaveCash,
} from './firebaseService';
import type {
  DailyEntry,
  Debt,
  ProvisionalDebt,
  AutomationTask,
  Objective,
  Notification,
  Settings,
} from '../types';

export function useFirebaseSync() {
  useStore();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');
  const unsubsRef = useRef<Array<() => void>>([]);
  const isListeningRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConnected() || isListeningRef.current) return;
    isListeningRef.current = true;
    setSyncStatus('syncing');

    const unsubs: Array<() => void> = [];

    try {
      // ── Daily Entries ───────────────────────────────────────────────────────
      unsubs.push(
        listenCollection('dailyEntries', (data) => {
          const entries = data as unknown as DailyEntry[];
          useStore.setState({ dailyEntries: entries.sort((a, b) => b.date.localeCompare(a.date)) });
        })
      );

      // ── Debts ───────────────────────────────────────────────────────────────
      unsubs.push(
        listenCollection('debts', (data) => {
          const debts = data as unknown as Debt[];
          useStore.setState({ debts });
        })
      );

      // ── Provisional Debts ───────────────────────────────────────────────────
      unsubs.push(
        listenCollection('provisionalDebts', (data) => {
          const pd = data as unknown as ProvisionalDebt[];
          useStore.setState({ provisionalDebts: pd });
        })
      );

      // ── Automations ─────────────────────────────────────────────────────────
      unsubs.push(
        listenCollection('automations', (data) => {
          const automations = data as unknown as AutomationTask[];
          useStore.setState({ automations });
        })
      );

      // ── Objectives ──────────────────────────────────────────────────────────
      unsubs.push(
        listenCollection('objectives', (data) => {
          const objectives = data as unknown as Objective[];
          useStore.setState({ objectives });
        })
      );

      // ── Notifications ───────────────────────────────────────────────────────
      unsubs.push(
        listenCollection('notifications', (data) => {
          const notifications = data as unknown as Notification[];
          useStore.setState({ notifications: notifications.sort((a, b) => b.date.localeCompare(a.date)) });
        })
      );

      // ── Settings ────────────────────────────────────────────────────────────
      unsubs.push(
        listenMeta('settings', (data) => {
          if (data) {
            useStore.setState({ settings: data as unknown as Settings });
          }
        })
      );

      // ── Cash ────────────────────────────────────────────────────────────────
      unsubs.push(
        listenMeta('cash', (data) => {
          if (data && typeof data.cashBalance === 'number') {
            useStore.setState({ cashBalance: data.cashBalance as number });
          }
        })
      );

      setSyncStatus('ok');
    } catch {
      setSyncStatus('error');
    }

    unsubsRef.current = unsubs;
    return () => {
      unsubs.forEach((u) => u());
      isListeningRef.current = false;
    };
  }, []);

  return { syncStatus };
}

// ─── Fonctions utilitaires pour écriture Firebase ────────────────────────────

export async function syncSave(collection: string, item: { id: string }) {
  if (!isFirebaseConnected()) return;
  switch (collection) {
    case 'dailyEntries': await fbSaveDailyEntry(item); break;
    case 'debts': await fbSaveDebt(item); break;
    case 'provisionalDebts': await fbSaveProvisionalDebt(item); break;
    case 'automations': await fbSaveAutomation(item); break;
    case 'objectives': await fbSaveObjective(item); break;
    case 'notifications': await fbSaveNotification(item); break;
  }
}

export async function syncDelete(collection: string, id: string) {
  if (!isFirebaseConnected()) return;
  switch (collection) {
    case 'dailyEntries': await fbDeleteDailyEntry(id); break;
    case 'debts': await fbDeleteDebt(id); break;
    case 'provisionalDebts': await fbDeleteProvisionalDebt(id); break;
    case 'automations': await fbDeleteAutomation(id); break;
    case 'objectives': await fbDeleteObjective(id); break;
    case 'notifications': await fbDeleteNotification(id); break;
  }
}

export async function syncSettings(settings: Settings) {
  if (!isFirebaseConnected()) return;
  await fbSaveSettings(settings);
}

export async function syncCash(cashBalance: number) {
  if (!isFirebaseConnected()) return;
  await fbSaveCash(cashBalance);
}
