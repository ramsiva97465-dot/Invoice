// src/services/reminderJob.ts

import { dbService } from './db';
import { sendTelegramMessage } from '../lib/telegram';
import type { Invoice, TelegramSettings } from './types';

/**
 * Sends Telegram notifications for invoices that are near their due date (within 3 days)
 * or are overdue. Uses the stored bot token and chat ID.
 *
 * The function is safe to run repeatedly – it records sent notifications in the
 * `telegram_notifications` table to avoid duplicate alerts.
 */
export async function runTelegramReminders(): Promise<void> {
  // Ensure Supabase client is available
  const client = dbService.ensureSupabase();

  // Load Telegram settings (bot token & chat id). If not configured, exit silently.
  const settings: TelegramSettings = await dbService.getTelegramSettings();
  if (!settings.bot_token || !settings.chat_id) return;

  // Fetch all pending invoices (payment_status === 'Pending')
  const { data: invoices, error } = await client
    .from('invoices')
    .select('*')
    .eq('payment_status', 'Pending');
  if (error) throw error;
  if (!invoices || invoices.length === 0) return;

  const now = new Date();
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(now.getDate() + 3);

  // Helper to format dates nicely for the message
  const fmt = (d: Date) => d.toLocaleDateString('en-IN');

  for (const inv of invoices as Invoice[]) {
    // NOTE: The schema currently does not store a dedicated `due_date` column.
    // We treat `invoice_date` as the due date placeholder. Adjust this logic
    // if a proper due date field is added later.
    const dueDate = new Date(inv.invoice_date);
    let status: 'due_soon' | 'overdue' | null = null;
    if (dueDate < now) {
      status = 'overdue';
    } else if (dueDate <= threeDaysLater) {
      status = 'due_soon';
    }
    if (!status) continue; // Not within the notification window

    // Avoid duplicate alerts – check telegram_notifications table
    const { data: existing, error: existErr } = await client
      .from('telegram_notifications')
      .select('id')
      .eq('invoice_id', inv.id)
      .maybeSingle();
    if (existErr) throw existErr;
    if (existing) continue; // Already notified

    const message =
      status === 'overdue'
        ? `❗ *Invoice ${inv.invoice_number}* is OVERDUE!\nDue date: ${fmt(dueDate)}\nPlease take action.\n`
        : `⚠️ *Invoice ${inv.invoice_number}* is due soon.\nDue date: ${fmt(dueDate)} (within 3 days)\n`;

    // Send Telegram message
    await sendTelegramMessage(settings.bot_token, settings.chat_id, message);

    // Record that we have sent a notification
    await client.from('telegram_notifications').insert({
      invoice_id: inv.id,
      sent_at: new Date().toISOString(),
    });
  }
}
