// src/services/types.ts

export interface CompanySettings {
  id?: string;
  company_name: string;
  address: string;
  mobile_number: string;
  email: string;
  gst_number: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
  logo_url: string;
  signature_url?: string;
}

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  mobile_number: string;
  address: string;
  plan_name: string;
  monthly_amount: number;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_id: string;
  notes: string;
  subtotal: number;
  tax?: number;
  gst_percentage?: number | null;
  gst_amount?: number;
  total_amount: number;
  payment_status: 'Paid' | 'Pending';
  created_at: string;
  // UI helper – total without GST (subtotal) if needed
  total_without_gst?: number;
  // UI join helper fields
  customer_name?: string;
  customer_mobile?: string;
  customer_address?: string;
  customer_plan?: string;
  items?: InvoiceItem[];
}

export interface Reminder {
  id: string;
  invoice_id: string;
  customer_id: string;
  remind_at: string; // when reminder should trigger
  sent_at: string | null;
  // in-app tracking
  read_at: string | null;
  message: string;
  // denormalized convenience for UI
  invoice_number: string;
  customer_name: string;
  customer_mobile: string;
}

