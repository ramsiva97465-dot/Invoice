export type DeliveryChannel = 'whatsapp' | 'email' | 'telegram' | 'sms';

export type DeliveryStatus = 'pending' | 'success' | 'failed';

export interface AttachmentOptions {
  pdf: boolean;
  qr: boolean;
  brochure: boolean;
}

export interface AttachmentMetadata {
  pdfName: string;
  includePdf: boolean;
  includeQR: boolean;
  includeBrochure: boolean;
}

export interface DeliveryPayload {
  channel: DeliveryChannel;
  customer: {
    name: string;
    mobile: string;
    email: string;
  };
  company: {
    name: string;
    upiId: string;
  };
  invoice: {
    id: string;
    number: string;
    amount: number;
    dueDate: string;
  };
  attachments: AttachmentMetadata;
  message: string;
}
