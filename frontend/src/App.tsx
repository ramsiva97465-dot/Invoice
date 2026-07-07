import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { useTenant } from './hooks/useTenant';
import { ToastProvider, useToast } from './components/Toast';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Invoices } from './pages/Invoices';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { TelegramSettingsPage } from './pages/TelegramSettings';
import type { TelegramSettings } from './services/types';

import { CustomerModal } from './components/CustomerModal';
import { InvoiceModal } from './components/InvoiceModal';
import { dbService } from './services/db';
import { SAMPLE_COMPANY_SETTINGS } from './services/sampleData';
import type { Customer, CompanySettings, InvoiceItem } from './services/types';

// Main Application shell that handles state, tab navigation, theme modes
const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { companyId, loading: tenantLoading } = useTenant();
  const { showToast } = useToast();

  const loading = authLoading || (!!user && tenantLoading);

  // Navigation / UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('aitel_dark_mode') === 'true';
  });

  // Settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings>(SAMPLE_COMPANY_SETTINGS);
  const [telegramSettings, setTelegramSettings] = useState<TelegramSettings | null>(null);

  // Sync update notifications between screens
  const [customersUpdated, setCustomersUpdated] = useState(false);
  const [invoicesUpdated, setInvoicesUpdated] = useState(false);

  // Modals visibility states
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Customers listing cached for quick selection inside the invoice modal
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);

  // Fetch company configurations ONLY after auth succeeds
  useEffect(() => {
    const loadSettings = async () => {
      if (!user || !companyId) return;
      try {
        const settings = await dbService.getCompanySettings();
        setCompanySettings(settings);
      } catch {
        // keep silent: no authenticated user -> dbService.getCompanySettings() is gated
      }
    };
    loadSettings();
  }, [user, companyId]);

  // Fetch Telegram settings ONLY after auth succeeds
  useEffect(() => {
    const loadTelegram = async () => {
      if (!user || !companyId) return;
      try {
        const tg = await dbService.getTelegramSettings();
        setTelegramSettings(tg);
      } catch {
        // ignore errors silently
      }
    };
    loadTelegram();
  }, [user, companyId]);

  // Sync dark mode style class with root document
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('aitel_dark_mode', String(darkMode));
  }, [darkMode]);

  // Fetch lists when user signs in or when updates trigger
  useEffect(() => {
    if (user && companyId) {
      dbService.getCustomers('', 'Active').then((data) => {
        setAllCustomers(data);
      }).catch(console.error);
    }
  }, [user, companyId, customersUpdated]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSaveCustomer = async (custData: Omit<Customer, 'id' | 'customer_id' | 'created_at'> & { id?: string }) => {
    try {
      if (custData.id) {
        // Edit Customer
        await dbService.updateCustomer(custData.id, {
          name: custData.name,
          mobile_number: custData.mobile_number,
          address: custData.address,
          plan_name: custData.plan_name,
          monthly_amount: custData.monthly_amount,
          status: custData.status
        });
        showToast('Profile Updated', `${custData.name}'s details were saved.`, 'success');
      } else {
        // Add Customer
        const newCust = await dbService.addCustomer(custData);
        showToast('Customer Added', `Account ${newCust.customer_id} created successfully.`, 'success');
      }
      setCustomersUpdated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (typeof (err as Record<string, unknown>)?.message === 'string' ? (err as Record<string, unknown>).message as string : String(err)) || 'Operation failed.';
      showToast('Error', msg, 'error');
      throw err;
    }
  };

  const handleSaveInvoice = async (
    invoiceData: {
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
  ) => {
    try {
      const newInv = await dbService.addInvoice(invoiceData, items);
      showToast('Invoice Created', `Invoice ${newInv.invoice_number} generated successfully.`, 'success');
      setInvoicesUpdated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (typeof (err as Record<string, unknown>)?.message === 'string' ? (err as Record<string, unknown>).message as string : String(err)) || 'Failed to generate invoice.';
      showToast('Error', msg, 'error');
      throw err;
    }
  };

  // Save Telegram settings
  const saveTelegramSettings = async (settings: TelegramSettings): Promise<void> => {
    const updated = await dbService.updateTelegramSettings(settings);
    setTelegramSettings(updated);
  };

  // Render Spin indicator during loading check
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 font-sans tracking-wide">Starting Xivora Invoice Studio...</p>
      </div>
    );
  }

  // Auth Portal if session is absent
  if (!user) {
    return <Login />;
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {/* Dynamic Main Views Selector */}
      {activeTab === 'dashboard' && (
        <Dashboard
          onNavigate={setActiveTab}
          openCustomerModal={() => {
            setEditingCustomer(null);
            setCustomerModalOpen(true);
          }}
          openInvoiceModal={() => setInvoiceModalOpen(true)}
          invoicesUpdated={invoicesUpdated}
          setInvoicesUpdated={setInvoicesUpdated}
          companySettings={companySettings}
        />
      )}

      {activeTab === 'customers' && (
        <Customers
          onOpenAddModal={() => {
            setEditingCustomer(null);
            setCustomerModalOpen(true);
          }}
          onOpenEditModal={(cust) => {
            setEditingCustomer(cust);
            setCustomerModalOpen(true);
          }}
          customersUpdated={customersUpdated}
          setCustomersUpdated={setCustomersUpdated}
        />
      )}

      {activeTab === 'invoices' && (
        <Invoices
          onOpenAddModal={() => setInvoiceModalOpen(true)}
          invoicesUpdated={invoicesUpdated}
          setInvoicesUpdated={setInvoicesUpdated}
          companySettings={companySettings}
        />
      )}

      {activeTab === 'reports' && <Reports companySettings={companySettings} />}

      {activeTab === 'settings' && (
        <Settings companySettings={companySettings} setCompanySettings={setCompanySettings} />
      )}

      {activeTab === 'telegram' && (
        telegramSettings ? (
          <TelegramSettingsPage
            telegramSettings={telegramSettings}
            setTelegramSettings={setTelegramSettings}
            onSave={saveTelegramSettings}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-slate-500">Loading Telegram settings...</div>
        )
      )}

      {/* Customer Modals */}

      <CustomerModal
        isOpen={customerModalOpen}
        onClose={() => {
          setCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      {/* Invoice Modals */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        customers={allCustomers}
      />
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
