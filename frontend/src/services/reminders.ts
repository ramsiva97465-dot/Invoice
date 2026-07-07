// src/services/reminders.ts

import { dbService } from './db';
import type { Reminder } from './types';

export const remindersService = {
  async getReminders(unreadOnly: boolean = true): Promise<Reminder[]> {
    const client = dbService.ensureSupabase();
    const companyId = await dbService.getCompanyId();
    if (!companyId) {
      return [];
    }

    // reminders table: id, invoice_id, customer_id, phone/mob, remind_at, sent_at, read_at
    let q = client
      .from('reminders')
      .select('*')
      .eq('company_id', companyId)
      .order('remind_at', { ascending: false });

    if (unreadOnly) q = q.is('read_at', null);

    const { data, error } = await q;
    if (error) throw error;
    return data as Reminder[];
  },

  async markReminderRead(id: string): Promise<void> {
    const client = dbService.ensureSupabase();
    const companyId = await dbService.getCompanyId();
    if (!companyId) {
      throw new Error('No active company context');
    }

    const { error } = await client
      .from('reminders')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', companyId);
    if (error) throw error;
  },
};
