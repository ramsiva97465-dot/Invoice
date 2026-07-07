// Shared TypeScript types for Xivora Backend
// Extend this file as new API contracts are defined.

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface InvoicePayload {
  invoiceId: string;
  customerId: string;
  amount: number;
  dueDate: string;
  channel: 'whatsapp' | 'email' | 'telegram' | 'sms';
}
