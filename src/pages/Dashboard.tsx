import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Invoice, CompanySettings } from '../services/types';
import { DashboardStats } from '../components/DashboardStats';
import { RevenueCharts } from '../components/RevenueCharts';
import { InvoicePDFPreview } from '../components/InvoicePDFPreview';
import { useToast } from '../components/Toast';
import { 
  Plus, 
  ArrowUpRight, 
  Eye, 
  Check, 
  Clock 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (tabId: string) => void;
  openCustomerModal: () => void;
  openInvoiceModal: () => void;
  invoicesUpdated: boolean;
  setInvoicesUpdated: (val: boolean) => void;
  companySettings: CompanySettings;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  openCustomerModal,
  openInvoiceModal,
  invoicesUpdated,
  setInvoicesUpdated,
  companySettings
}) => {
  const { showToast } = useToast();
  interface MetricStats {
    totalCustomers: number;
    totalInvoices: number;
    paidCount: number;
    pendingCount: number;
    monthlyRevenue: number;
    totalRevenue: number;
  }
  interface MonthlyData { month: string; amount: number; }
  interface DailyData { date: string; amount: number; }

  const [metrics, setMetrics] = useState<MetricStats>({
    totalCustomers: 0,
    totalInvoices: 0,
    paidCount: 0,
    pendingCount: 0,
    monthlyRevenue: 0,
    totalRevenue: 0
  });
  const [chartsData, setChartsData] = useState<{ monthly: MonthlyData[]; daily: DailyData[] }>({
    monthly: [],
    daily: []
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // PDF Preview State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const reports = await dbService.getRevenueReports();
      setMetrics(reports.metrics);
      setChartsData(reports.charts);
      
      const allInvoices = await dbService.getInvoices();
      setRecentInvoices(allInvoices.slice(0, 5)); // Keep only top 5 recent
    } catch {
      showToast('Error', 'Failed to retrieve billing records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchDashboardData uses dbService (which requires auth); App only mounts Dashboard after login.
    queueMicrotask(() => fetchDashboardData());
    if (invoicesUpdated) {
      setInvoicesUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoicesUpdated]);

  const handleToggleStatus = async (invoiceId: string, currentStatus: 'Paid' | 'Pending') => {

    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await dbService.updateInvoiceStatus(invoiceId, nextStatus);
      showToast('Status Updated', `Invoice status changed to ${nextStatus}`, 'success');
      fetchDashboardData();
    } catch {
      showToast('Error', 'Failed to update invoice status.', 'error');
    }
  };

  const handleOpenPDF = async (invoiceId: string) => {
    const details = await dbService.getInvoiceDetails(invoiceId);
    if (details) {
      setSelectedInvoice(details);
      setPdfPreviewOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 font-sans tracking-wide">Loading billing workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Top Banner Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Welcome to Xivora Invoice Studio
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Generate invoices for your customers with Xivora Invoice Studio.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openCustomerModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-400" />
            <span>Add Customer</span>
          </button>
          <button
            onClick={openInvoiceModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Bill</span>
          </button>
        </div>
      </div>

      {/* Metrics DashboardStats */}
      <DashboardStats metrics={metrics} />

      {/* RevenueCharts */}
      <RevenueCharts monthlyData={chartsData.monthly} dailyData={chartsData.daily} />

      {/* Recent Invoices Panel */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h4>
            <p className="text-xs text-slate-400 font-sans">Last 5 bills generated</p>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* Invoices List Table */}
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 font-sans">Invoice No</th>
                <th className="px-5 py-3 font-sans">Customer</th>
                <th className="px-5 py-3 font-sans">Plan</th>
                <th className="px-5 py-3 text-right font-sans">Amount</th>
                <th className="px-5 py-3 text-center font-sans">Status</th>
                <th className="px-5 py-3 text-center font-sans w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentInvoices.map((inv) => (
                <tr 
                  key={inv.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-xs text-slate-600 dark:text-slate-350"
                >
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white font-sans">{inv.invoice_number}</td>
                  <td className="px-5 py-4 font-sans">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{inv.customer_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{inv.customer_mobile}</p>
                  </td>
                  <td className="px-5 py-4 font-sans">{inv.customer_plan}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-800 dark:text-slate-200 font-sans">
                    ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(inv.id, inv.payment_status)}
                      className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide font-sans cursor-pointer transition-all border
                        ${inv.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'}
                      `}
                      title="Click to toggle status"
                    >
                      {inv.payment_status === 'Paid' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>{inv.payment_status}</span>
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleOpenPDF(inv.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-650 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                      title="View PDF / Print Invoice"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 font-sans">
                    No transactions generated yet. Click 'Generate Bill' to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Printable Overlay */}
      <InvoicePDFPreview
        isOpen={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        invoice={selectedInvoice}
        companySettings={companySettings}
      />
    </div>
  );
};
