export type Rola = 'ADMIN' | 'USER' | 'VIEWER';
export type Plan = 'FREE' | 'PRO';

export interface UserProfile {
  id: string;
  email: string;
  rola: Rola;
  zablokowany: boolean;
  utworzono: string;
}

export interface SubscriptionStatus {
  id: string;
  plan: Plan;
  status: 'AKTYWNA' | 'WSTRZYMANA' | 'ANULOWANA' | 'BRAK';
  currentPeriodEnd?: string | null;
}

export interface DashboardData {
  przychody: number;
  wydatki: number;
  saldo: number;
  wskOszczednosci: number;
  budzetLacznie: number;
  top5: { nazwa: string; suma: number }[];
  trend: { miesiac: string; suma: number }[];
}
