import React from 'react';
import { Users, FileText, CheckCircle, Clock, IndianRupee, Landmark } from 'lucide-react';

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
  
  const stats = [
    {
      id: 'total-customers',
      name: 'Total Customers',
      value: metrics.totalCustomers,
      icon: Users,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30',
    },
    {
      id: 'total-invoices',
      name: 'Invoices Generated',
      value: metrics.totalInvoices,
      icon: FileText,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/30',
    },
    {
      id: 'paid-invoices',
      name: 'Paid Invoices',
      value: metrics.paidCount,
      icon: CheckCircle,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30',
    },
    {
      id: 'pending-invoices',
      name: 'Pending Payments',
      value: metrics.pendingCount,
      icon: Clock,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30',
    },
    {
      id: 'monthly-revenue',
      name: 'Monthly Revenue',
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
