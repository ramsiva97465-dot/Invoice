import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';


import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
  TelegramSettings,
} from './types';


// Supabase config (must be base project URL only; no /rest/v1 or /auth/v1)
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '')
  // normalize: accept either base URL or URL ending with /rest/v1
  .replace(/\/(rest\/v1|auth\/v1|v1)\/?$/i, '')
  // remove any accidental trailing slashes
  .replace(/\/+$/g, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';


export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
  );
}


// -------------------------------------------------------------
// LOCAL STORAGE MOCK DB LOGIC (DEMO MODE)
// -------------------------------------------------------------
// Removed localStorage mock DB logic. Using sample data fallback for development.

// No initLocalStorageDb needed.

// If Supabase not configured, use sample data fallback in methods.

// Local storage functions removed.

// -------------------------------------------------------------
// UNIFIED DATABASE SERVICE
// -------------------------------------------------------------

export const dbService = {
  // --- Check Client Status ---
  getSupabaseClient: () => supabase,

  // --- Single-company architecture ---
  // Multi-tenant tenant resolution is removed.



  // Helper to ensure Supabase is configured
  ensureSupabase(): SupabaseClient {
    if (!supabase) {
      throw new Error('Supabase is not configured – please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    return supabase;
  },

  async getTelegramSettings(): Promise<TelegramSettings> {
    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('telegram_settings')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return { bot_token: '', chat_id: '' };
    }
    return data as TelegramSettings;
  },

  async updateTelegramSettings(settings: TelegramSettings): Promise<TelegramSettings> {
    const client = this.ensureSupabase();

    // Get current user for RLS
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const userId = sessionData?.session?.user?.id;

    const { data: existing, error: existingError } = await client
      .from('telegram_settings')
      .select('id')
      .maybeSingle();
    if (existingError) throw existingError;

    const payload: Record<string, unknown> = {
      ...settings,
      user_id: userId,
    };
    if (existing?.id) payload.id = existing.id;

    const { data, error } = await client
      .from('telegram_settings')
      .upsert([payload])
      .select('*')
      .single();
    if (error) throw error;
    return data as TelegramSettings;
  },
  async getCompanySettings(): Promise<CompanySettings> {
    const client = this.ensureSupabase();
    const { data, error } = await client
      .from('company_settings')
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return {
        company_name: '',
        mobile_number: '',
        address: '',
        email: '',
        gst_number: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',
        upi_id: '',
        logo_url: '',
        gst_percentage: 18,
      } as CompanySettings;
    }
    return data as CompanySettings;
  },

  async updateCompanySettings(settings: CompanySettings): Promise<CompanySettings> {
    const client = this.ensureSupabase();

    const { data: existing, error: existingError } = await client
      .from('company_settings')
      .select('id')
      .maybeSingle();
    if (existingError) throw existingError;

    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const userId = sessionData?.session?.user?.id;

    const payload: Record<string, unknown> = {
      ...settings,
      user_id: userId,
    };

    if (existing?.id) payload.id = existing.id;

    const res = await client
      .from('company_settings')
      .upsert([payload])
      .select('*')
      .single();


    if (res.error) throw res.error;
    return res.data as CompanySettings;
  },



  // --- Customers API ---
  async getCustomers(query: string = '', status: string = 'All'): Promise<Customer[]> {
    const client = this.ensureSupabase();

    let q = client.from('customers').select('*');


    if (status !== 'All') {
      q = q.eq('status', status);
    }
    if (query) {
      q = q.or(
        `name.ilike.%${query}%,mobile_number.ilike.%${query}%,customer_id.ilike.%${query}%`
      );
    }

    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return data as Customer[];
  },




  async addCustomer(customer: Omit<Customer, 'id' | 'customer_id' | 'created_at'>): Promise<Customer> {
    const client = this.ensureSupabase();

    // Verify session (auth guard)
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const userId = sessionData?.session?.user?.id;

    // Next numeric suffix (global)
    const countRes = await client
      .from('customers')
      .select('id', { count: 'exact', head: true });

    const nextNum = (countRes.count ?? 0) + 101;
    const customer_id = `SCN-${new Date().getFullYear()}-${nextNum}`;

    // Insert only schema columns – no user_id (single-company schema)
    const payload = {
      name: customer.name,
      mobile_number: customer.mobile_number,
      address: customer.address,
      plan_name: customer.plan_name,
      monthly_amount: customer.monthly_amount,
      status: customer.status,
      customer_id,
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    const { data, error } = await client
      .from('customers')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },



  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const client = this.ensureSupabase();

    // Auth guard
    const { error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;

    // Strip any fields that should never be changed
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, customer_id: _cid, created_at: _ca, ...cleanUpdates } = updates as Record<string, unknown>;

    const { data, error } = await client
      .from('customers')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },



  async deleteCustomer(id: string): Promise<void> {
    const client = this.ensureSupabase();

    // Auth guard – no user_id on customers table (single-company)
    const { error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;

    const { error } = await client
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },



  // --- Invoices API ---
  async getInvoices(query: string = '', status: string = 'All'): Promise<Invoice[]> {
    const client = this.ensureSupabase();

    let q = client
      .from('invoices')

      .select(`
        *,
        customers!inner (
          name,
          mobile_number,
          address,
          plan_name
        )
      `);


    if (status !== 'All') {
      q = q.eq('payment_status', status);
    }
    if (query) {
      q = q.or(`invoice_number.ilike.%${query}%,customers.name.ilike.%${query}%`);
    }

    const { data, error } = await q.order('invoice_date', { ascending: false });
    if (error) throw error;
    return ((data || []).map((inv: Record<string, unknown> & { gst_amount?: number; tax?: number; customers?: { name?: string; mobile_number?: string; address?: string; plan_name?: string } }) => ({
      ...inv,
      tax: inv.gst_amount ?? inv.tax ?? 0,
      customer_name: inv.customers?.name,
      customer_mobile: inv.customers?.mobile_number,
      customer_address: inv.customers?.address,
      customer_plan: inv.customers?.plan_name,
    })) as unknown as import('./types').Invoice[]);
  },



  async getInvoiceDetails(id: string): Promise<Invoice | null> {
    const client = this.ensureSupabase();


    const req = client
      .from('invoices')
      .select(`
        *,
        customers (
          name,
          mobile_number,
          address,
          plan_name
        )
      `)
      .eq('id', id);

    const { data: invoice, error: invError } = await req.single();



    if (invError || !invoice) return null;
    
    const { data: items, error: itemsError } = await client
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);
    if (itemsError) throw itemsError;
    
    const normalizedItems = (items || []).map((item: { rate: number; quantity: number; amount?: number; [key: string]: unknown }) => {
      const expectedAmount = Number((item.rate * item.quantity).toFixed(2));
      return {
        ...item,
        amount: item.amount || expectedAmount,
      };
    });

    return {
      ...invoice,
      tax: invoice.gst_amount ?? invoice.tax ?? 0,
      customer_name: invoice.customers?.name,
      customer_mobile: invoice.customers?.mobile_number,
      customer_address: invoice.customers?.address,
      customer_plan: invoice.customers?.plan_name,
      items: normalizedItems,
    };
  },

  async addInvoice(
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
  ): Promise<Invoice> {

    const subtotal = items.reduce((acc, item) => acc + (item.rate * item.quantity), 0);

    // Prefer explicit gst_percentage if provided; otherwise treat as no GST
    const gstPct = typeof invoiceData.gst_percentage === 'number' ? invoiceData.gst_percentage : 0;
    const gst_amount = Number((subtotal * (gstPct / 100)).toFixed(2));
    const total_amount = Number((subtotal + gst_amount).toFixed(2));

    const client = this.ensureSupabase();
                                                
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const userId = sessionData?.session?.user?.id;

    // Try RPC first; fall back to client-side generation if the DB function is not available
    let invoice_number: string = '';
    try {
      const { data: rpcData, error: rpcError } = await client.rpc(
        'next_invoice_number',
        { p_invoice_date: invoiceData.invoice_date }
      );
      if (!rpcError && rpcData) {
        invoice_number = (rpcData as Record<string, unknown>)?.next_invoice_number as string ?? (rpcData as string) ?? '';
      }
    } catch {
      // RPC not available – fall through to client-side generation
    }

    // Client-side fallback invoice number (uses timestamp for uniqueness)
    if (!invoice_number) {
      const d = invoiceData.invoice_date ? new Date(invoiceData.invoice_date) : new Date();
      const yyyymm = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
      // Count existing invoices this month from the DB
      const { count } = await client
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .like('invoice_number', `INV-${yyyymm}-%`);
      const seq = String((count ?? 0) + 1).padStart(3, '0');
      invoice_number = `INV-${yyyymm}-${seq}`;
    }

    const payload: Record<string, unknown> = {
      ...invoiceData,
      invoice_number,
      subtotal,
      gst_percentage: gstPct > 0 ? gstPct : null,
      gst_amount,
      total_amount,
      // Calculate next recharge date (29 days after invoice_date)
      next_recharge_date: new Date(new Date(invoiceData.invoice_date).getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      user_id: userId,
    };

    

    const { data: newInv, error: invError } = await client
      .from('invoices')
      .insert([payload])
      .select()
      .single();

    if (invError) throw invError;

    const itemsPayload = items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: Number((item.rate * item.quantity).toFixed(2)),
      invoice_id: newInv.id,
      user_id: userId,
    }));



    const { error: itemsError } = await client
      .from('invoice_items')
      .insert(itemsPayload);

    if (itemsError) throw itemsError;

    // Trigger edge function for newly created invoice (all statuses)
    console.log('🛎️ Triggering edge function for invoice_created', { invoiceId: newInv.id });
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify_telegram_reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ event: 'invoice_created', invoice_id: newInv.id }),
      });
    } catch (e) {
      console.error('Failed to trigger invoice creation Telegram notification', e);
    }

    return this.getInvoiceDetails(newInv.id) as unknown as Invoice;
  },


  async updateInvoiceStatus(id: string, payment_status: 'Paid' | 'Pending'): Promise<Invoice> {
    const client = this.ensureSupabase();

    // Auth guard
    const { error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;

    // Fetch current invoice to check previous status
    const currentInvoice = await this.getInvoiceDetails(id);
    const previousStatus = currentInvoice?.payment_status;

    // Prepare updates
    const updates: Record<string, unknown> = { payment_status };
    if (payment_status === 'Paid') {
      const today = new Date();
      updates.next_recharge_date = new Date(today.getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const { error } = await client.from('invoices').update(updates).eq('id', id);
    if (error) throw error;

    const updatedInvoice = await this.getInvoiceDetails(id) as unknown as Invoice;

    // Send Telegram notification if status changed to Paid
    if (payment_status === 'Paid' && previousStatus !== 'Paid') {
      console.log('🛎️ Triggering edge function for payment_received', { invoiceId: id });
      console.log('Sending POST to edge function for payment_received');
      // Invoke edge function for immediate notification
      try {
        const paidResp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify_telegram_reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ event: 'payment_received', invoice_id: id }),
        });
        console.log('✅ Edge function payment_received response status', paidResp?.status);
        const respText = await paidResp.text();
        console.log('Edge function response body:', respText);
      } catch (e) {
        console.error('❌ Edge function payment_received call failed', e);
      }

    }

    return updatedInvoice;
  },


  async deleteInvoice(id: string): Promise<void> {
    const client = this.ensureSupabase();

    // Auth guard – no user_id on invoices table (single-company)
    const { error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;

    const { error } = await client
      .from('invoices')
      .delete()
      .eq('id', id);
    if (error) throw error;

    await client
      .from('invoice_items')
      .delete()
      .eq('invoice_id', id);
  },


  // --- Reports API ---
  async getRevenueReports() {
    const invoices = await this.getInvoices('', 'All');
    
    const totalCustomers = (await this.getCustomers('', 'All')).length;


    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.payment_status === 'Paid');
    const pendingInvoices = invoices.filter(i => i.payment_status === 'Pending');
    
    // Calculate Monthly Revenue (current calendar month)
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const monthlyRevenue = paidInvoices
      .filter(i => i.invoice_date.startsWith(currentYearMonth))
      .reduce((sum, i) => sum + i.total_amount, 0);

    // Group revenue by Month for chart (past 6 months)
    const monthlyData: Record<string, number> = {};
    const dailyData: Record<string, number> = {};
    
    // Setup last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const yearMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[label] = 0;
      
      // Summarize for that month
      paidInvoices.forEach(inv => {
        if (inv.invoice_date.startsWith(yearMonthKey)) {
          monthlyData[label] += inv.total_amount;
        }
      });
    }

    // Setup daily revenue for current month (last 7 active days)
    paidInvoices.forEach(inv => {
      const dateLabel = inv.invoice_date; // YYYY-MM-DD
      if (!dailyData[dateLabel]) {
        dailyData[dateLabel] = 0;
      }
      dailyData[dateLabel] += inv.total_amount;
    });

    const dailyChartData = Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 active revenue days

    const monthlyChartData = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2))
    }));

    return {
      metrics: {
        totalCustomers,
        totalInvoices,
        paidCount: paidInvoices.length,
        pendingCount: pendingInvoices.length,
        monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
        totalRevenue: Number(paidInvoices.reduce((sum, i) => sum + i.total_amount, 0).toFixed(2))
      },
      charts: {
        monthly: monthlyChartData,
        daily: dailyChartData
      }
    };
  }
};

