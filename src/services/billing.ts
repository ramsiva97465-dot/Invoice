import { dbService } from './db';

export type PlanId = 'free' | 'basic' | 'pro';
export type PlanTier = {
  id: PlanId;
  name: string;
  priceMonthlyINR: number;
  limits: {
    maxCustomers: number;
    maxInvoicesPerMonth: number;
  };
  perks: string[];
};

export const PLANS: PlanTier[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthlyINR: 0,
    limits: { maxCustomers: 25, maxInvoicesPerMonth: 100 },
    perks: ['Invoice creation', 'Customer management', 'Basic reports (in-app)'],
  },
  {
    id: 'basic',
    name: 'Basic',
    priceMonthlyINR: 499,
    limits: { maxCustomers: 200, maxInvoicesPerMonth: 2000 },
    perks: ['GST fields', 'Advanced reports', 'Priority reminders'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthlyINR: 999,
    limits: { maxCustomers: 2000, maxInvoicesPerMonth: 20000 },
    perks: ['Higher usage', 'Export (CSV) (coming)', 'Faster PDF generation (coming)'],
  },
];

// ------------------------------
// MOCK BILLING (demo / no Stripe)
// ------------------------------
// In a real SaaS, this would be driven by Stripe webhooks + DB rows.
const LOCAL_KEY = 'aitel_subscription_mock';

export type Subscription = {
  tenantId: string;
  planId: PlanId;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  updatedAt: string;
};

export function getMockOrDefaultSubscription(tenantId: string): Subscription {
  if (typeof window === 'undefined') {
    return {
      tenantId,
      planId: 'free',
      status: 'trialing',
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) {
      return {
        tenantId,
        planId: 'free',
        status: 'trialing',
        updatedAt: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(raw) as Subscription;
    if (parsed.tenantId !== tenantId) {
      return {
        tenantId,
        planId: 'free',
        status: 'trialing',
        updatedAt: new Date().toISOString(),
      };
    }
    return parsed;
  } catch {
    return {
      tenantId,
      planId: 'free',
      status: 'trialing',
      updatedAt: new Date().toISOString(),
    };
  }
}

export function setMockSubscription(sub: Subscription) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(sub));
}

// ------------------------------
// USAGE HELPERS
// ------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUsageForTenant(_tenantId: string = 'single'): Promise<{
  customersCount: number;
  invoicesCountThisMonth: number;
}> {
  // Single-company only.
  const customers = await dbService.getCustomers('', 'All');
  const invoices = await dbService.getInvoices('', 'All');

  const now = new Date();
  const yearMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const invoicesThisMonth = invoices.filter((i) => i.invoice_date.startsWith(yearMonthKey));

  return {
    customersCount: customers.length,
    invoicesCountThisMonth: invoicesThisMonth.length,
  };
}


export async function getPlanForTenant(tenantId: string): Promise<PlanTier> {
  // If Supabase billing tables exist later, wire them here.
  // For now: mock subscription.
  const sub = getMockOrDefaultSubscription(tenantId);
  return PLANS.find((p) => p.id === sub.planId) ?? PLANS[0];
}

export async function changePlanMock(tenantId: string, planId: PlanId): Promise<Subscription> {
  const current = getMockOrDefaultSubscription(tenantId);
  const next: Subscription = {
    ...current,
    planId,
    status: 'active',
    updatedAt: new Date().toISOString(),
  };
  setMockSubscription(next);
  return next;
}

