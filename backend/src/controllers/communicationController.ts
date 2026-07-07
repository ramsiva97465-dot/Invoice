import { Request, Response } from 'express';

/**
 * POST /api/v1/communication/send
 * Expected body: { to: string; subject?: string; message: string; invoiceId?: string }
 * For now we simply echo back the payload with a success status.
 */
export const sendCommunication = (req: Request, res: Response): void => {
  const { to, subject = 'Invoice', message, invoiceId } = req.body as {
    to: string;
    subject?: string;
    message: string;
    invoiceId?: string;
  };

  if (!to || !message) {
    res.status(400).json({
      status: 'error',
      message: 'Missing required fields: to and message',
    });
    return;
  }

  // TODO: integrate with real email/SMS service or Supabase functions.
  // For now we just respond with the received data.
  res.status(200).json({
    status: 'success',
    data: { to, subject, message, invoiceId },
    timestamp: new Date().toISOString(),
  });
};
