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
  // Legacy `tax` kept for backwards compatibility. New fields for GST:
  tax?: number;
  gst_percentage?: number | null;
  gst_amount?: number;
  total_amount: number;
  payment_status: 'Paid' | 'Pending';
  created_at: string;
  // UI join helper fields
  customer_name?: string;
  customer_mobile?: string;
  customer_address?: string;
  customer_plan?: string;
  items?: InvoiceItem[];
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  company_name: '',
  address: '',
  mobile_number: '',
  email: '',
  gst_number: '',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  upi_id: '',
  logo_url: '',
  signature_url: ''
};

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customer_id: 'SCN-2026-101',
    name: 'Rajesh Kumar',
    mobile_number: '9845012345',
    address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bangalore',
    plan_name: 'GigaFiber 150 Mbps + IPTV',
    monthly_amount: 999.00,
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
    monthly_amount: 799.00,
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
    monthly_amount: 1499.00,
    status: 'Active',
    created_at: '2026-03-01T09:15:00Z'
  },
  {
    id: 'cust-4',
    customer_id: 'SCN-2026-104',
    name: 'Anjali D’Souza',
    mobile_number: '9900112233',
    address: 'Flat B3, Ferns Paradise, Marathahalli, Bangalore',
    plan_name: 'Cable TV Gold + 50 Mbps',
    monthly_amount: 599.00,
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
    monthly_amount: 499.00,
    status: 'Inactive',
    created_at: '2026-05-02T16:00:00Z'
  }
];

// Generate dynamic historical dates in June/May 2026 for charts
const dateOffset = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoice_number: 'INV-202606-001',
    invoice_date: dateOffset(2),
    customer_id: 'cust-1',
    notes: 'Thank you for your business. Payment received online.',
    subtotal: 999.00,
    tax: 179.82, // 18% GST
    gst_percentage: 18,
    gst_amount: 179.82,
    total_amount: 1178.82,
    payment_status: 'Paid',
    created_at: dateOffset(2) + 'T10:00:00Z'
  },
  {
    id: 'inv-2',
    invoice_number: 'INV-202606-002',
    invoice_date: dateOffset(4),
    customer_id: 'cust-2',
    notes: 'Please pay before due date to avoid service interruption.',
    subtotal: 799.00,
    tax: 143.82,
    gst_percentage: 18,
    gst_amount: 143.82,
    total_amount: 942.82,
    payment_status: 'Pending',
    created_at: dateOffset(4) + 'T11:00:00Z'
  },
  {
    id: 'inv-3',
    invoice_number: 'INV-202606-003',
    invoice_date: dateOffset(6),
    customer_id: 'cust-3',
    notes: 'Annual contract auto-billing.',
    subtotal: 1499.00,
    tax: 269.82,
    gst_percentage: 18,
    gst_amount: 269.82,
    total_amount: 1768.82,
    payment_status: 'Paid',
    created_at: dateOffset(6) + 'T09:30:00Z'
  },
  {
    id: 'inv-4',
    invoice_number: 'INV-202606-004',
    invoice_date: dateOffset(12),
    customer_id: 'cust-4',
    notes: 'Payment collected in cash.',
    subtotal: 599.00,
    tax: 107.82,
    gst_percentage: 18,
    gst_amount: 107.82,
    total_amount: 706.82,
    payment_status: 'Paid',
    created_at: dateOffset(12) + 'T15:20:00Z'
  },
  {
    id: 'inv-5',
    invoice_number: 'INV-202605-001',
    invoice_date: dateOffset(25),
    customer_id: 'cust-1',
    notes: 'May bill.',
    subtotal: 999.00,
    tax: 179.82,
    gst_percentage: 18,
    gst_amount: 179.82,
    total_amount: 1178.82,
    payment_status: 'Paid',
    created_at: dateOffset(25) + 'T10:15:00Z'
  },
  {
    id: 'inv-6',
    invoice_number: 'INV-202605-002',
    invoice_date: dateOffset(28),
    customer_id: 'cust-2',
    notes: 'May bill.',
    subtotal: 799.00,
    tax: 143.82,
    gst_percentage: 18,
    gst_amount: 143.82,
    total_amount: 942.82,
    payment_status: 'Paid',
    created_at: dateOffset(28) + 'T11:45:00Z'
  },
  {
    id: 'inv-7',
    invoice_number: 'INV-202605-003',
    invoice_date: dateOffset(31),
    customer_id: 'cust-5',
    notes: 'Final outstanding before account suspension.',
    subtotal: 499.00,
    tax: 89.82,
    gst_percentage: 18,
    gst_amount: 89.82,
    total_amount: 588.82,
    payment_status: 'Pending',
    created_at: dateOffset(31) + 'T14:00:00Z'
  }
];

export const MOCK_INVOICE_ITEMS: Record<string, InvoiceItem[]> = {
  'inv-1': [
    { description: 'GigaFiber 150 Mbps (Rental June 2026)', quantity: 1, rate: 899.00, amount: 899.00 },
    { description: 'IPTV Premium Subscription Add-on', quantity: 1, rate: 100.00, amount: 100.00 }
  ],
  'inv-2': [
    { description: 'AirFiber Premium 100 Mbps (Rental June 2026)', quantity: 1, rate: 799.00, amount: 799.00 }
  ],
  'inv-3': [
    { description: 'AirFiber Max 300 Mbps (Rental June 2026)', quantity: 1, rate: 1499.00, amount: 1499.00 }
  ],
  'inv-4': [
    { description: 'Cable TV Gold + 50 Mbps Bundle (Rental June 2026)', quantity: 1, rate: 599.00, amount: 599.00 }
  ],
  'inv-5': [
    { description: 'GigaFiber 150 Mbps (Rental May 2026)', quantity: 1, rate: 899.00, amount: 899.00 },
    { description: 'IPTV Premium Subscription Add-on', quantity: 1, rate: 100.00, amount: 100.00 }
  ],
  'inv-6': [
    { description: 'AirFiber Premium 100 Mbps (Rental May 2026)', quantity: 1, rate: 799.00, amount: 799.00 }
  ],
  'inv-7': [
    { description: 'Basic Broadband 30 Mbps (Rental May 2026)', quantity: 1, rate: 499.00, amount: 499.00 }
  ]
};
