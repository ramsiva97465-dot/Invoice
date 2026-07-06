import React, { useState, useEffect } from 'react';
import type { Customer } from '../services/types';
import { X } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'customer_id' | 'created_at'> & { id?: string }) => Promise<void>;
  customer?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  customer 
}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [planName, setPlanName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    queueMicrotask(() => {
      if (customer) {
        setName(customer.name);
        setMobile(customer.mobile_number);
        setAddress(customer.address);
        setPlanName(customer.plan_name);
        setMonthlyAmount(customer.monthly_amount.toString());
        setStatus(customer.status);
      } else {
        setName('');
        setMobile('');
        setAddress('');
        setPlanName('GigaFiber 100 Mbps');
        setMonthlyAmount('799');
        setStatus('Active');
      }
      setError('');
    });
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !address || !planName || !monthlyAmount) {
      setError('Please fill in all required fields.');
      return;
    }

    const amt = parseFloat(monthlyAmount);
    if (isNaN(amt) || amt < 0) {
      setError('Please enter a valid monthly plan amount.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: customer?.id,
        name,
        mobile_number: mobile,
        address,
        plan_name: planName,
        monthly_amount: amt,
        status
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || 'Failed to save customer data.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {customer ? 'Edit Customer Settings' : 'Add New Customer'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg font-sans">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Customer Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              placeholder="e.g. Rajesh Kumar"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Mobile Number *</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={12}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                placeholder="e.g. 9876543210"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Address / Installation Location *</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              placeholder="Full Address"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Plan Name *</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                placeholder="e.g. AirFiber 100 Mbps"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 font-sans">Monthly Rate (₹) *</label>
              <input
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
                placeholder="e.g. 799"
                required
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
              {loading ? 'Saving...' : customer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
