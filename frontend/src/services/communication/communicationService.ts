import type { DeliveryPayload, DeliveryChannel, AttachmentOptions } from './communication.types';
import type { Invoice, CompanySettings } from '../types';
import { messageBuilder } from './messageBuilder';
import { attachmentBuilder } from './attachmentBuilder';

export const communicationService = {
  async prepareDeliveryPayload(
    channel: DeliveryChannel,
    invoice: Invoice,
    companySettings: CompanySettings,
    options: AttachmentOptions,
    customMessage: string
  ): Promise<DeliveryPayload> {
    console.log('Preparing Communication Payload');

    const formattedDueDate = invoice.due_date 
      ? new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : invoice.invoice_date
        ? new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'N/A';

    const placeholders = {
      CustomerName: invoice.customer_name || 'Customer',
      CompanyName: companySettings.company_name || 'Company',
      InvoiceNumber: invoice.invoice_number,
      Amount: invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      DueDate: formattedDueDate,
    };

    const finalMessage = messageBuilder.buildMessage(customMessage, placeholders);
    const attachments = attachmentBuilder.buildAttachmentMetadata(invoice.invoice_number, options);

    const payload: DeliveryPayload = {
      channel,
      customer: {
        name: invoice.customer_name || 'Customer',
        mobile: invoice.customer_mobile || '',
        email: (invoice as any).customer_email || '',
      },
      company: {
        name: companySettings.company_name,
        upiId: companySettings.upi_id || '',
      },
      invoice: {
        id: invoice.id,
        number: invoice.invoice_number,
        amount: invoice.total_amount,
        dueDate: formattedDueDate,
      },
      attachments,
      message: finalMessage,
    };

    console.log('Complete Payload:', payload);
    return payload;
  }
};
