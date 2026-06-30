import React, { useState, useEffect } from 'react';
import type { Customer, InvoiceItem } from '../services/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    invoice: {
      customer_id: string;
      invoice_date: string;
      notes: string;
      payment_status: 'Paid' | 'Pending';
      subtotal?: number;
      gst_percentage?: number | null;
      gst_amount?: number;
      total_amount?: number;
    },
    items: Omit<InvoiceItem, 'id' | 'invoice_id'>[]
  ) => Promise<void>;
  customers: Customer[];
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customers,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [notes, setNotes] = useState('Please pay on or before the due date to avoid network speed reduction or suspension.');
  const [items, setItems] = useState<Omit<InvoiceItem, 'id' | 'invoice_id'>[]>([]);
  const [gstMode, setGstMode] = useState<'Without' | 'With'>('With');
  const [gstPercentage, setGstPercentage] = useState<number>(18);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup defaults on open
  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setSelectedCustomerId('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setPaymentStatus('Pending');
        setNotes('Please pay on or before the due date to avoid network speed reduction or suspension.');
        setItems([]);
        setGstMode('With');
        setGstPercentage(18);
        setError('');
      });
    }
  }, [isOpen]);

  // Autofill plan item when customer changes
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) {
      setItems([]);
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      // Seed first line item with customer's default plan
      setItems([
        {
          description: `${customer.plan_name} - Rental Month`,
          quantity: 1,
          rate: customer.monthly_amount,
          amount: customer.monthly_amount,
        },
      ]);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemFieldChange = (index: number, field: keyof Omit<InvoiceItem, 'id' | 'invoice_id'>, value: string | number) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(String(value)) || 1);
    } else if (field === 'rate') {
      item.rate = Math.max(0, parseFloat(String(value)) || 0);
    } else {
      item.description = String(value);
    }

    item.amount = Number((item.quantity * item.rate).toFixed(2));
    updated[index] = item;
    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.amount, 0);
  };

  const calculateTax = () => {
    if (gstMode === 'Without') return 0;
    const pct = Number((gstPercentage || 0) / 100);
    return Number((calculateSubtotal() * pct).toFixed(2));
  };

  const calculateTotal = () => {
    return Number((calculateSubtotal() + calculateTax()).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    if (!invoiceDate) {
      setError('Please specify an invoice date.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one line item.');
      return;
    }

    const emptyDesc = items.some((item) => !item.description.trim());
    if (emptyDesc) {
      setError('All items must have a description.');
      return;
    }

    setLoading(true);
    try {
      const subtotal = Number(calculateSubtotal().toFixed(2));
      const gst_amount = Number(calculateTax().toFixed(2));
      const total_amount = Number(calculateTotal().toFixed(2));
      await onSave(
        {
          customer_id: selectedCustomerId,
          invoice_date: invoiceDate,
          notes,
          payment_status: paymentStatus,
          subtotal,
          gst_percentage: gstMode === 'With' ? gstPercentage : null,
          gst_amount,
          total_amount,
        },
        items
      );
      onClose();
    } catch (err: unknown) {
      // Supabase errors are PostgREST objects {message, code, details, hint}, not Error instances
      let errMsg = 'Failed to generate invoice.';
      if (err instanceof Error) {
        errMsg = err.message;
      } else if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        errMsg = String(e.message || e.details || e.hint || JSON.stringify(err));
      } else {
        errMsg = String(err);
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 max-h-[90vh] flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Create Bill / New Invoice
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg font-sans">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Select Customer *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                required
              >
                <option value="">-- Select Active Customer --</option>
                {customers
                  .filter((c) => c.status === 'Active')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customer_id}) - ₹{c.monthly_amount}/mo
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Invoice Date *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                required
              />
            </div>
          </div>

          {/* GST Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">GST Mode</label>
              <select
                value={gstMode}
                onChange={(e) => setGstMode(e.target.value as 'Without' | 'With')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              >
                <option value="Without">Without GST</option>
                <option value="With">With GST</option>
              </select>
            </div>

            {gstMode === 'With' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">GST %</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                />
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-slate-400 font-sans">Bill Line Items *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-2 w-3/5 font-sans">Description</th>
                    <th className="px-3 py-2 w-16 text-center font-sans">Qty</th>
                    <th className="px-3 py-2 w-24 text-right font-sans">Rate (₹)</th>
                    <th className="px-3 py-2 w-24 text-right font-sans">Amount</th>
                    <th className="px-4 py-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {items.map((item, index) => (
                    <tr key={index} className="text-slate-700 dark:text-slate-300">
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemFieldChange(index, 'description', e.target.value)}
                          placeholder="e.g. BroadBand Monthly Rental"
                          className="w-full px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg text-sm outline-none text-slate-850 dark:text-white font-sans transition-all"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          onChange={(e) => handleItemFieldChange(index, 'quantity', e.target.value)}
                          className="w-full text-center px-1 py-1.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg text-sm outline-none text-slate-850 dark:text-white font-sans transition-all"
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={item.rate || ''}
                          onChange={(e) => handleItemFieldChange(index, 'rate', e.target.value)}
                          className="w-full text-right px-2 py-1.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg text-sm outline-none text-slate-850 dark:text-white font-sans transition-all"
                          placeholder="0"
                          required
                        />
                      </td>
                      <td className="p-2 text-right text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans">
                        ₹{item.amount.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                          title="Delete row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-slate-400 font-sans">
                        No items added yet. Choose a customer or click 'Add Item'.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Calculations Panel */}
          {items.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col items-end gap-2 ml-auto max-w-xs w-full">
              <div className="flex justify-between w-full text-xs text-slate-500 dark:text-slate-400 font-sans">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-full text-xs text-slate-500 dark:text-slate-400 font-sans">
                {gstMode === 'With' ? (
                  <>
                    <span>GST ({gstPercentage}%):</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{calculateTax().toFixed(2)}</span>
                  </>
                ) : (
                  <>
                    <span>GST:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹0.00</span>
                  </>
                )}
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700 w-full my-1"></div>
              <div className="flex justify-between w-full text-sm font-bold text-slate-900 dark:text-white font-sans">
                <span>Total Amount:</span>
                <span className="text-emerald-500">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Status and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'Paid' | 'Pending')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              >
                <option value="Pending">Pending / Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Notes / Payment Terms</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                placeholder="Additional details..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/10 disabled:opacity-50 transition-all"
            >
              {loading ? 'Generating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
