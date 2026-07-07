import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * POST /api/v1/communication/send
 * Accepts a full DeliveryPayload from the frontend Communication Center.
 */
export const sendCommunication = (req: Request, res: Response): void => {
  const { channel, customer, company, invoice, attachments, message } = req.body;

  // Validate required fields
  if (!channel || !customer || !invoice || !message) {
    res.status(400).json({
      status: 'error',
      message: 'Missing required fields: channel, customer, invoice, and message are required.',
    });
    return;
  }

  if (!customer.mobile && !customer.email) {
    res.status(400).json({
      status: 'error',
      message: 'Customer must have at least a mobile number or email address.',
    });
    return;
  }

  logger.info(`[Communication] Sending ${channel} message to ${customer.name} for invoice ${invoice.number}`);

  // TODO: Integrate with actual delivery providers (WhatsApp API, SMTP, Telegram Bot, SMS gateway).
  // For now, log and acknowledge the payload.

  const deliveryId = `DEL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

  res.status(200).json({
    status: 'success',
    message: `Invoice ${invoice.number} queued for delivery via ${channel}`,
    data: {
      deliveryId,
      channel,
      recipient: customer.name,
      invoiceNumber: invoice.number,
      amount: invoice.amount,
      attachments: {
        pdf: attachments?.includePdf ?? false,
        qr: attachments?.includeQR ?? false,
        brochure: attachments?.includeBrochure ?? false,
      },
    },
    timestamp: new Date().toISOString(),
  });
};
