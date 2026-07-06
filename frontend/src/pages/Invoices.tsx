import React, { useState, useEffect } from 'react';
import type { Invoice, CompanySettings } from '../services/types';
import { dbService } from '../services/db';
import { Search, Plus, Eye, Trash2, Check, Clock, Calendar } from 'lucide-react';
import { InvoicePDFPreview } from '../components/InvoicePDFPreview';
import { useToast } from '../components/Toast';

interface InvoicesProps {
  onOpenAddModal: () => void;
  invoicesUpdated: boolean;
  setInvoicesUpdated: (val: boolean) => void;
  companySettings: CompanySettings;
}

export const Invoices: React.FC<InvoicesProps> = ({
  onOpenAddModal,
  invoicesUpdated,
  setInvoicesUpdated,
  companySettings,
}) => {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showGST, setShowGST] = useState(true);

  // PDF Preview State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await dbService.getInvoices(searchQuery, statusFilter);
      setInvoices(data);
    } catch {
      showToast('Error', 'Failed to retrieve invoice logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchInvoices uses dbService (requires auth); App mounts this page only after login.
    queueMicrotask(() => fetchInvoices());
    if (invoicesUpdated) {
      setInvoicesUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, invoicesUpdated]);

  const handleToggleStatus = async (id: string, currentStatus: 'Paid' | 'Pending') => {

    const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
    try {
      await dbService.updateInvoiceStatus(id, nextStatus);
      showToast('Payment Updated', `Invoice status changed to ${nextStatus}`, 'success');
      fetchInvoices();
    } catch {
      showToast('Error', 'Failed to update payment status.', 'error');
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      try {
        await dbService.deleteInvoice(id);
        showToast('Invoice Deleted', `Invoice ${invoiceNumber} has been permanently deleted.`, 'success');
        fetchInvoices();
      } catch {
        showToast('Error', 'Failed to delete invoice.', 'error');
      }
    }
  };

  const handleOpenPDF = async (id: string) => {
    const details = await dbService.getInvoiceDetails(id);
    if (details) {
      setSelectedInvoice(details);
      setPdfPreviewOpen(true);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Billing & Invoices Registry
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Track customer invoices, payment collections, and printing processes.
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Invoice</span>
          </button>
          {/* GST toggle */}
          <button
            onClick={() => setShowGST(!showGST)}
            className="ml-2 px-3 py-1.5 text-xs rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            title="Toggle GST visibility"
          >
            {showGST ? 'Hide GST' : 'Show GST'}
          </button>
        </div>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-450" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice number or Customer Name..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-850 dark:text-white font-sans transition-all"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid Bills</option>
            <option value="Pending">Pending / Unpaid</option>
          </select>
        </div>
      </div>

      {/* Invoices List Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 font-sans tracking-wide">Filtering transaction entries...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5 font-sans">Invoice No</th>
                  <th className="px-6 py-3.5 font-sans">Billing Date</th>
                  <th className="px-6 py-3.5 font-sans">Customer</th>
                  <th className="px-6 py-3.5 font-sans">Active Package Plan</th>
                  <th className="px-6 py-3.5 font-sans">Subtotal (₹)</th>
                  {showGST && <th className="px-6 py-3.5 font-sans">Tax (₹)</th>}
                  <th className="px-6 py-3.5 text-right font-sans">Total (₹)</th>
                  <th className="px-6 py-3.5 text-right font-sans">Total w/o GST (₹)</th>
                  <th className="px-6 py-3.5 text-center font-sans w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {invoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-xs text-slate-650 dark:text-slate-350"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-sans">{inv.invoice_number}</td>
                    <td className="px-6 py-4.5 font-sans">
                      {new Date(inv.invoice_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4.5 font-sans">
                      <p className="font-bold text-slate-800 dark:text-white">{inv.customer_name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{inv.customer_mobile}</p>
                    </td>
                    <td className="px-6 py-4.5 font-sans">{inv.customer_plan}</td>
                    <td className="px-6 py-4.5 font-sans">{inv.subtotal.toFixed(2)}</td>
                    {showGST && <td className="px-6 py-4.5 font-sans">{(inv.tax ?? 0).toFixed(2)}</td>}
                    <td className="px-6 py-4.5 text-right font-bold text-slate-850 dark:text-slate-200 font-sans">
                      ₹{inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4.5 text-right font-sans">
                      ₹{inv.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => handleToggleStatus(inv.id, inv.payment_status)}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide font-sans cursor-pointer border transition-all
                          ${inv.payment_status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                            : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'}
                        `}
                        title="Click to toggle payment status"
                      >
                        {inv.payment_status === 'Paid' ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span>{inv.payment_status}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4.5 text-center space-x-1">
                      <button
                        onClick={() => handleOpenPDF(inv.id)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-350 dark:border-slate-700 dark:hover:border-slate-650 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                        title="View PDF / Print Invoice"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id, inv.invoice_number)}
                        className="p-1.5 rounded-lg border border-red-150 hover:border-red-300 dark:border-red-950/60 dark:hover:border-red-900 text-red-400 hover:text-red-650 dark:hover:text-red-300 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400 font-sans">
                      No customer invoice records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {invoices.map((inv) => (
              <div 
                key={inv.id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-sans">{inv.invoice_number}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{inv.customer_name}</h4>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(inv.id, inv.payment_status)}
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-sans border transition-all cursor-pointer
                      ${inv.payment_status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                        : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'}
                    `}
                  >
                    <span>{inv.payment_status}</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs text-slate-650 dark:text-slate-400 font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Subscription Plan</p>
                      <p className="font-semibold text-slate-850 dark:text-slate-200 mt-0.5">{inv.customer_plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Total (with GST)</p>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">₹{inv.total_amount}</p>
                      {showGST && (
                        <>
                          <p className="text-[10px] text-slate-450 mt-1">Tax (₹): { (inv.tax ?? 0).toFixed(2) }</p>
                          <p className="text-[10px] text-slate-450">Total w/o GST: ₹{inv.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleOpenPDF(inv.id)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 hover:border-slate-350 dark:border-slate-700 dark:hover:border-slate-650 text-slate-450 hover:text-slate-850 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 font-sans text-xs font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleDelete(inv.id, inv.invoice_number)}
                    className="flex-1 py-2 rounded-lg border border-red-150 hover:border-red-300 dark:border-red-950/60 dark:hover:border-red-900 text-red-400 hover:text-red-650 dark:hover:text-red-300 transition-colors flex items-center justify-center gap-1.5 font-sans text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-sans bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl">
                No invoices found.
              </div>
            )}
          </div>
        </>
      )}

      {/* PDF View Panel */}
      <InvoicePDFPreview
        isOpen={pdfPreviewOpen}
        onClose={() => setPdfPreviewOpen(false)}
        invoice={selectedInvoice}
        companySettings={companySettings}
      />
    </div>
  );
};
