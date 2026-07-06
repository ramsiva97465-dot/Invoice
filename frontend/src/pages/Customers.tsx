import React, { useState, useEffect } from 'react';
import type { Customer } from '../services/types';
import { dbService } from '../services/db';
import { Search, Plus, Edit2, Trash2, CheckCircle2, XCircle, Phone, MapPin } from 'lucide-react';
import { useToast } from '../components/Toast';


interface CustomersProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (customer: Customer) => void;
  customersUpdated: boolean;
  setCustomersUpdated: (val: boolean) => void;
}

export const Customers: React.FC<CustomersProps> = ({
  onOpenAddModal,
  onOpenEditModal,
  customersUpdated,
  setCustomersUpdated,
}) => {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await dbService.getCustomers(searchQuery, statusFilter);
      setCustomers(data);
    } catch {
      showToast('Error', 'Failed to retrieve customer accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchCustomers uses dbService (requires auth); App mounts this page only after login.
    queueMicrotask(() => fetchCustomers());
    if (customersUpdated) {
      setCustomersUpdated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, customersUpdated]);

  const handleDelete = async (id: string, name: string) => {

    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete all their invoices.`)) {
      try {
        await dbService.deleteCustomer(id);
        showToast('Account Deleted', `${name} and all related invoices have been removed.`, 'success');
        fetchCustomers();
      } catch {
        showToast('Error', 'Failed to delete customer profile.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Customer Database Directory
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Manage your service subscribers, status records, and billing plans.
          </p>
        </div>
        <button
          onClick={async () => {
            // App uses a single-user (auth session) model in dbService.
            // Tenant-based helpers (getCurrentTenantId / getPlanForTenant / getUsageForTenant) can crash.
            // Keep the UI responsive: never block the modal due to plan-limit checks.
            try {
              // Best-effort plan-limit check: if billing helpers are not usable, ignore.
              const [plan, usage] = await Promise.all([
                Promise.resolve({ name: '', limits: { maxCustomers: Number.POSITIVE_INFINITY } }),
                Promise.resolve({ customersCount: 0 })
              ]);

              // If later you re-enable real tenant logic, replace the above placeholders.
              if (usage.customersCount >= plan.limits.maxCustomers) {
                showToast(
                  'Customer limit reached',
                  `Your ${plan.name || 'current'} plan allows up to ${plan.limits.maxCustomers} customers. Upgrade your plan to add more.`,
                  'warning'
                );
                return;
              }

              onOpenAddModal();
            } catch (e: unknown) {
              // Fallback: still allow adding customer.
              const msg = e instanceof Error ? e.message : String(e);
              showToast('Unable to check plan limits', msg || 'Please try again.', 'error');
              onOpenAddModal();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-450" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer ID, Name, or Mobile Number..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-850 dark:text-white font-sans transition-all"
          />
        </div>

        <div className="w-full md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Inactive">Inactive Accounts</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 font-sans tracking-wide">Filtering customers...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5 font-sans">Customer ID</th>
                  <th className="px-6 py-3.5 font-sans">Subscriber Details</th>
                  <th className="px-6 py-3.5 font-sans">Address</th>
                  <th className="px-6 py-3.5 font-sans">Active Subscription Plan</th>
                  <th className="px-6 py-3.5 text-right font-sans">Monthly Rate</th>
                  <th className="px-6 py-3.5 text-center font-sans">Status</th>
                  <th className="px-6 py-3.5 text-center font-sans w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {customers.map((cust) => (
                  <tr 
                    key={cust.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/10 text-xs text-slate-650 dark:text-slate-350"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white font-sans">{cust.customer_id}</td>
                    <td className="px-6 py-4.5 font-sans">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{cust.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{cust.mobile_number}</span>
                      </p>
                    </td>
                    <td className="px-6 py-4.5 font-sans max-w-[200px] truncate" title={cust.address}>
                      {cust.address}
                    </td>
                    <td className="px-6 py-4.5 font-semibold font-sans">{cust.plan_name}</td>
                    <td className="px-6 py-4.5 text-right font-bold text-slate-850 dark:text-slate-200 font-sans">
                      ₹{cust.monthly_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`
                        inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide font-sans border
                        ${cust.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'}
                      `}>
                        {cust.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        <span>{cust.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center space-x-1.5">
                      <button
                        onClick={() => onOpenEditModal(cust)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-350 dark:border-slate-700 dark:hover:border-slate-650 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                        title="Edit Customer Settings"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cust.id, cust.name)}
                        className="p-1.5 rounded-lg border border-red-150 hover:border-red-300 dark:border-red-950/60 dark:hover:border-red-900 text-red-400 hover:text-red-650 dark:hover:text-red-300 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400 font-sans">
                      No customer accounts matching your query were found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid/Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
            {customers.map((cust) => (
              <div 
                key={cust.id}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-sans">{cust.customer_id}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{cust.name}</h4>
                  </div>
                  <span className={`
                    inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold font-sans border
                    ${cust.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                      : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'}
                  `}>
                    <span>{cust.status}</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-650 dark:text-slate-400 font-sans">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{cust.mobile_number}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="truncate">{cust.address}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Monthly Plan</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{cust.plan_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-450 uppercase font-bold">Rate</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{cust.monthly_amount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => onOpenEditModal(cust)}
                    className="flex-1 py-2 rounded-lg border border-slate-200 hover:border-slate-350 dark:border-slate-700 dark:hover:border-slate-650 text-slate-450 hover:text-slate-850 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 font-sans text-xs font-semibold"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id, cust.name)}
                    className="flex-1 py-2 rounded-lg border border-red-150 hover:border-red-300 dark:border-red-950/60 dark:hover:border-red-900 text-red-400 hover:text-red-650 dark:hover:text-red-300 transition-colors flex items-center justify-center gap-1.5 font-sans text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-sans bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl">
                No customer accounts found.
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};
