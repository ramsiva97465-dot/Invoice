// src/services/sampleData.ts

import type { CompanySettings, Customer, Invoice, InvoiceItem } from './types';

// Sample company settings (fallback)
export const SAMPLE_COMPANY_SETTINGS: CompanySettings = {
  company_name: 'SHAKTHI CABLE NETWORK',
  address: '5A Satellite Road, Cable Junction, Chennai - 600012',
  mobile_number: '+91 98765 43210',
  email: 'billing@shakthicablenetwork.com',
  gst_number: '33AAAAA1111A1Z5',
  bank_name: 'HDFC Bank Ltd',
  account_number: '50100293847561',
  ifsc_code: 'HDFC0001234',
  upi_id: 'shakthicablenetwork@upi',
  logo_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=150&q=60&ixlib=rb-4.0.3',
  signature_url: ''
};

// Helper to generate recent dates (YYYY-MM-DD)
const dateOffset = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// Sample customers
export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customer_id: 'SCN-2026-101',
    name: 'Rajesh Kumar',
    mobile_number: '9845012345',
    address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bangalore',
    plan_name: 'GigaFiber 150 Mbps + IPTV',
    monthly_amount: 999.0,
    status: 'Active',
    created_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'cust-2',
    customer_id: 'SCN-2026-102',
    name: 'Priyanka Sharma',
    mobile_number: '9731298765',
    address: 'Villa 12, Sobha Primrose, Bellandur, Bangalore',
    plan_name: 'AirFiber Premium 100 Mbps',
    monthly_amount: 799.0,
    status: 'Active',
    created_at: '2026-02-15T11:30:00Z'
  },
  {
    id: 'cust-3',
    customer_id: 'SCN-2026-103',
    name: 'Vikram Malhotra',
    mobile_number: '8861002233',
    address: 'House #57, 4th Main, Sector 3, HSR Layout, Bangalore',
    plan_name: 'AirFiber Max 300 Mbps',
    monthly_amount: 1499.0,
    status: 'Active',
    created_at: '2026-03-01T09:15:00Z'
  },
  {
    id: 'cust-4',
    customer_id: 'SCN-2026-104',
    name: "Anjali D'Souza",
    mobile_number: '9900112233',
    address: 'Flat B3, Ferns Paradise, Marathahalli, Bangalore',
    plan_name: 'Cable TV Gold + 50 Mbps',
    monthly_amount: 599.0,
    status: 'Active',
    created_at: '2026-04-18T14:45:00Z'
  },
  {
    id: 'cust-5',
    customer_id: 'SCN-2026-105',
    name: 'Siddharth Joshi',
    mobile_number: '9611223344',
    address: 'Apartment 7B, Prestige Lakeside, Varthur, Bangalore',
    plan_name: 'Basic Broadband 30 Mbps',
    monthly_amount: 499.0,
    status: 'Inactive',
    created_at: '2026-05-02T16:00:00Z'
  }
];

// Sample invoices
export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: `INV-${new Date().getFullYear()}06-001`,
    invoice_date: dateOffset(2),
    customer_id: 'cust-1',
    notes: 'Thank you for your business. Payment received online.',
    subtotal: 999.0,
    tax: 179.82,
    total_amount: 1178.82,
    payment_status: 'Paid',
    created_at: dateOffset(2) + 'T10:00:00Z'
  },
  {
    id: 'inv-2',
    invoice_number: `INV-${new Date().getFullYear()}06-002`,
    invoice_date: dateOffset(4),
    customer_id: 'cust-2',
    notes: 'Please pay before due date to avoid service interruption.',
    subtotal: 799.0,
    tax: 143.82,
    total_amount: 942.82,
    payment_status: 'Pending',
    created_at: dateOffset(4) + 'T11:00:00Z'
  },
  {
    id: 'inv-3',
    invoice_number: `INV-${new Date().getFullYear()}06-003`,
    invoice_date: dateOffset(6),
    customer_id: 'cust-3',
    notes: 'Annual contract auto-billing.',
    subtotal: 1499.0,
    tax: 269.82,
    total_amount: 1768.82,
    payment_status: 'Paid',
    created_at: dateOffset(6) + 'T09:30:00Z'
  },
  {
    id: 'inv-4',
    invoice_number: `INV-${new Date().getFullYear()}06-004`,
    invoice_date: dateOffset(12),
    customer_id: 'cust-4',
    notes: 'Payment collected in cash.',
    subtotal: 599.0,
    tax: 107.82,
    total_amount: 706.82,
    payment_status: 'Paid',
    created_at: dateOffset(12) + 'T15:20:00Z'
  },
  {
    id: 'inv-5',
    invoice_number: `INV-${new Date().getFullYear()}05-001`,
    invoice_date: dateOffset(25),
    customer_id: 'cust-1',
    notes: 'May bill.',
    subtotal: 999.0,
    tax: 179.82,
    total_amount: 1178.82,
    payment_status: 'Paid',
    created_at: dateOffset(25) + 'T10:15:00Z'
  },
  {
    id: 'inv-6',
    invoice_number: `INV-${new Date().getFullYear()}05-002`,
    invoice_date: dateOffset(28),
    customer_id: 'cust-2',
    notes: 'May bill.',
    subtotal: 799.0,
    tax: 143.82,
    total_amount: 942.82,
    payment_status: 'Paid',
    created_at: dateOffset(28) + 'T11:45:00Z'
  },
  {
    id: 'inv-7',
    invoice_number: `INV-${new Date().getFullYear()}05-003`,
    invoice_date: dateOffset(31),
    customer_id: 'cust-5',
    notes: 'Final outstanding before account suspension.',
    subtotal: 499.0,
    tax: 89.82,
    total_amount: 588.82,
    payment_status: 'Pending',
    created_at: dateOffset(31) + 'T14:00:00Z'
  }
];

// Sample invoice items map
export const SAMPLE_INVOICE_ITEMS: Record<string, InvoiceItem[]> = {
  'inv-1': [
    { description: 'GigaFiber 150 Mbps (Rental June 2026)', quantity: 1, rate: 899.0, amount: 899.0 },
    { description: 'IPTV Premium Subscription Add-on', quantity: 1, rate: 100.0, amount: 100.0 }
  ],
  'inv-2': [
    { description: 'AirFiber Premium 100 Mbps (Rental June 2026)', quantity: 1, rate: 799.0, amount: 799.0 }
  ],
  'inv-3': [
    { description: 'AirFiber Max 300 Mbps (Rental June 2026)', quantity: 1, rate: 1499.0, amount: 1499.0 }
  ],
  'inv-4': [
    { description: 'Cable TV Gold + 50 Mbps Bundle (Rental June 2026)', quantity: 1, rate: 599.0, amount: 599.0 }
  ],
  'inv-5': [
    { description: 'GigaFiber 150 Mbps (Rental May 2026)', quantity: 1, rate: 899.0, amount: 899.0 },
    { description: 'IPTV Premium Subscription Add-on', quantity: 1, rate: 100.0, amount: 100.0 }
  ],
  'inv-6': [
    { description: 'AirFiber Premium 100 Mbps (Rental May 2026)', quantity: 1, rate: 799.0, amount: 799.0 }
  ],
  'inv-7': [
    { description: 'Basic Broadband 30 Mbps (Rental May 2026)', quantity: 1, rate: 499.0, amount: 499.0 }
  ]
};
