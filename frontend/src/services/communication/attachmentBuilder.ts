import type { AttachmentMetadata, AttachmentOptions } from './communication.types';

export const attachmentBuilder = {
  buildAttachmentMetadata(invoiceNumber: string, options: AttachmentOptions): AttachmentMetadata {
    return {
      pdfName: `Invoice_${invoiceNumber}.pdf`,
      includePdf: options.pdf,
      includeQR: options.qr,
      includeBrochure: options.brochure,
    };
  }
};
