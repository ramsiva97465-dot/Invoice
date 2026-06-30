import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Customer, Invoice, CompanySettings } from '../services/types';
import { useToast } from '../components/Toast';
import { Calendar, Download, Eye, IndianRupee, TrendingUp } from 'lucide-react';
import { InvoicePDFPreview } from '../components/InvoicePDFPreview';

interface ReportsProps {
  companySettings: CompanySettings;
}

export const Reports: React.FC<ReportsProps> = ({ companySettings }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [charts, setCharts] = useState<Record<string, Record<string, string | number>[]> | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  
  // PDF Preview State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const reports = await dbService.getRevenueReports();
      setMetrics(reports.metrics);
      setCharts(reports.charts);
      
      const allCustomers = await dbService.getCustomers('', 'All');
      setCustomers(allCustomers);
    } catch {
      showToast('Error', 'Failed to retrieve reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => fetchReportData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch invoices for a selected customer
  useEffect(() => {
    const fetchCustInvoices = async () => {
      if (!selectedCustomerId) {
        setCustomerInvoices([]);
        return;
      }
      try {
        const allInvoices = await dbService.getInvoices();
        const filtered = allInvoices.filter(inv => inv.customer_id === selectedCustomerId);
        setCustomerInvoices(filtered);
      } catch {
        showToast('Error', 'Failed to retrieve customer billing logs.', 'error');
      }
    };
    fetchCustInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomerId]);

  const handleOpenPDF = async (id: string) => {
    const details = await dbService.getInvoiceDetails(id);
    if (details) {
      setSelectedInvoice(details);
      setPdfPreviewOpen(true);
    }
  };

  // Export CSV Helper
  const handleExportCSV = (type: 'monthly' | 'daily' | 'customer') => {
    let headers: string[];
    let rows: string[][];
    let filename: string;

    if (type === 'monthly' && charts?.monthly) {
      headers = ['Month', 'Amount (INR)'];
      rows = charts.monthly.map((d) => [String(d.month), String(d.amount)]);
      filename = 'monthly_revenue_report.csv';
    } else if (type === 'daily' && charts?.daily) {
      headers = ['Date', 'Amount (INR)'];
      rows = charts.daily.map((d) => [String(d.date), String(d.amount)]);
      filename = 'daily_revenue_report.csv';
    } else if (type === 'customer' && selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      headers = ['Invoice Number', 'Date', 'Plan', 'Total Amount (INR)', 'Status'];
      rows = customerInvoices.map((inv) => [
        inv.invoice_number,
        inv.invoice_date,
        inv.customer_plan || '',
        String(inv.total_amount),
        inv.payment_status
      ]);
      filename = `customer_report_${cust?.name.replace(/\s+/g, '_')}.csv`;
    } else {
      showToast('Error', 'No data selected to export.', 'warning');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Success', `${filename} downloaded successfully.`, 'success');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 font-sans tracking-wide">Compiling financial metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Revenue Auditing & Reports
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Review historical collections, cash flow metrics, and customer invoice records.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Current Month Collections</span>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">
              ₹{metrics?.monthlyRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Lifetime Net Revenue</span>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">
              ₹{metrics?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h4>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Payment Rates</span>
            <h4 className="text-lg font-extrabold text-slate-800 dark:text-white mt-0.5">
              {metrics?.totalInvoices ? Math.round((metrics?.paidCount / metrics?.totalInvoices) * 100) : 0}% Paid ({metrics?.paidCount}/{metrics?.totalInvoices})
            </h4>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Report List */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Revenue Logs</h4>
              <p className="text-xs text-slate-400 font-sans">Aggregated collections by month</p>
            </div>
            <button
              onClick={() => handleExportCSV('monthly')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-slate-650 dark:text-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase font-sans">
                  <th className="px-5 py-3">Month</th>
                  <th className="px-5 py-3 text-right">Collections (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {charts?.monthly?.map((d, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-slate-650 dark:text-slate-350">
                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-250 font-sans">{d.month}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white font-sans">
                      ₹{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Active Income List */}
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Daily Records</h4>
              <p className="text-xs text-slate-400 font-sans">Daily cash flows summaries</p>
            </div>
            <button
              onClick={() => handleExportCSV('daily')}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 dark:bg-slate-700 dark:border-slate-600 text-slate-650 dark:text-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase font-sans">
                  <th className="px-5 py-3">Billing Date</th>
                  <th className="px-5 py-3 text-right">Collections (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {charts?.daily?.map((d, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-slate-650 dark:text-slate-350">
                    <td className="px-5 py-3.5 font-sans">
                      {new Date(d.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white font-sans">
                      ₹{d.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {charts?.daily?.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-5 py-6 text-center text-slate-400 font-sans">
                      No active daily invoices collected recently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer-wise Invoice History */}
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Customer Invoicing Ledger</h4>
            <p className="text-xs text-slate-400 font-sans">View complete historical logs for a specific subscriber</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold rounded-xl focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans flex-1 sm:w-60"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customer_id})
                </option>
              ))}
            </select>

            {selectedCustomerId && (
              <button
                onClick={() => handleExportCSV('customer')}
                className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow shadow-emerald-500/10"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {selectedCustomerId ? (
          <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase font-sans">
                  <th className="px-5 py-3">Invoice No</th>
                  <th className="px-5 py-3">Invoice Date</th>
                  <th className="px-5 py-3">Plan Details</th>
                  <th className="px-5 py-3 text-right">Invoice Amount (₹)</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {customerInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-slate-650 dark:text-slate-350">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white font-sans">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 font-sans">
                      {new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-sans">{inv.customer_plan}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900 dark:text-white font-sans">
                      ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide font-sans border
                        ${inv.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'}
                      `}>
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenPDF(inv.id)}
                        className="p-1 rounded border border-slate-200 hover:border-slate-350 dark:border-slate-700 dark:hover:border-slate-600 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        title="Open PDF Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {customerInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-slate-400 font-sans">
                      No invoices have been generated for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400 border border-slate-150 border-dashed dark:border-slate-700 rounded-xl font-sans">
            Please choose a subscriber from the dropdown selector to load their ledger history.
          </div>
        )}
      </div>

      {/* PDF Modal */}
      <InvoicePDFPreview
        isOpen={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        invoice={selectedInvoice}
        companySettings={companySettings}
      />

    </div>
  );
};
