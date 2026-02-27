export type Tab =
  | 'dashboard'
  | 'daily'
  | 'charges'
  | 'debts'
  | 'provisionalDebts'
  | 'history'
  | 'automation'
  | 'objectives'
  | 'bilan'
  | 'settings'
  | 'guide';

export type UserRole = 'owner' | 'collaborator' | null;

export type DayType = 'normal' | 'maintenance' | 'inactive';

export interface DailyEntry {
  id: string;
  date: string;
  dayType: DayType;
  revenue: number;
  expenses: ExpenseItem[];
  breakdowns: BreakdownItem[];
  comment: string;
  netRevenue: number;
}

export interface ExpenseItem {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  liters?: number;
  comment: string;
  isAutomated?: boolean;
  automationId?: string;
}

export interface BreakdownItem {
  id: string;
  category: string;
  partChanged: string;
  cause: string;
  amount: number;
}

export interface Debt {
  id: string;
  supplier: string;
  supplierType: 'mechanic' | 'wholesaler' | 'other';
  part: string;
  amount: number;
  remainingAmount: number;
  dateCreated: string;
  dateDue: string;
  status: 'pending' | 'partial' | 'paid';
  notes: string;
}

export interface ProvisionalDebt {
  id: string;
  label: string;
  originalDebtId?: string;
  amount: number;
  dateCreated: string;
  status: 'provisional' | 'confirmed' | 'cancelled';
  notes: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  amount: number;
  liters?: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastTriggered?: string;
  nextTrigger?: string;
  comment: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  amount?: number;
  status: 'pending' | 'done' | 'late';
  reminderDays: number;
}

export interface Notification {
  id: string;
  type: 'reminder' | 'automation' | 'objective' | 'debt';
  message: string;
  date: string;
  read: boolean;
}

export interface Staff {
  driverName: string;
  driverPhone: string;
  controllerName: string;
  controllerPhone: string;
  collaboratorName: string;
  collaboratorPhone: string;
}

export interface Settings {
  staff: Staff;
  currency: string;
  vehicleName: string;
  vehiclePlate: string;
  ownerName: string;
}

export interface AppData {
  dailyEntries: DailyEntry[];
  debts: Debt[];
  provisionalDebts: ProvisionalDebt[];
  automations: AutomationTask[];
  objectives: Objective[];
  notifications: Notification[];
  settings: Settings;
  cashBalance: number;
}
