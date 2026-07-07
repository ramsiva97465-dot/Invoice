import React from 'react';
import { Users, FileText, CheckCircle, Clock, IndianRupee, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MetricStats {
  totalCustomers: number;
  totalInvoices: number;
  paidCount: number;
  pendingCount: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface DashboardStatsProps {
  metrics: MetricStats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ metrics }) => {
  const { t } = useTranslation();
  
  const stats = [
    {
      id: 'total-revenue',
      name: t('dashboard.totalRevenue'),
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: Landmark,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20',
    },
    {
      id: 'total-invoices',
      name: t('dashboard.totalInvoices'),
      value: metrics.totalInvoices.toString(),
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
    },
    {
      id: 'paid-invoices',
      name: t('dashboard.paidInvoices'),
      value: metrics.paidCount.toString(),
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
    },
    {
      id: 'pending-invoices',
      name: t('dashboard.pendingInvoices'),
      value: metrics.pendingCount.toString(),
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
    },
    {
      id: 'total-customers',
      name: t('dashboard.totalCustomers'),
      value: metrics.totalCustomers.toString(),
      icon: Users,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30',
    },
    {
      id: 'monthly-revenue',
      name: t('dashboard.monthlyRevenue'),
      value: `₹${metrics.monthlyRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
    },
    {
      id: 'total-revenue',
      name: 'Total Collections',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      icon: Landmark,
      color: 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className={`p-6 rounded-2xl border bg-white dark:bg-slate-800 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className={`p-4 rounded-xl ${stat.color} border flex items-center justify-center`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-sans">{stat.name}</p>
              <h3 className="text-2xl font-bold font-sans mt-1 text-slate-800 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
