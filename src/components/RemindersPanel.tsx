import React, { useEffect, useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import type { Reminder } from '../services/types';
import { remindersService } from '../services/reminders';

export const RemindersPanel: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await remindersService.getReminders(true);
      setReminders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const unreadCount = reminders.length;

  const markAllRead = async () => {
    await Promise.all(reminders.map((r) => remindersService.markReminderRead(r.id)));
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Bell className="h-3.5 w-3.5" />
        <span>Checking reminders...</span>
      </div>
    );
  }

  if (unreadCount === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Bell className="h-3.5 w-3.5" />
        <span>No reminders</span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Reminders</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
            {unreadCount} due
          </span>
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400"
        >
          <Check className="h-3.5 w-3.5" />
          Mark read
        </button>
      </div>

      <div className="space-y-2">
        {reminders.slice(0, 5).map((r) => (
          <div key={r.id} className="flex items-start gap-3 text-xs">
            <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-500" />
            <div className="flex-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {r.customer_name} • {r.invoice_number}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                {r.message}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">
                Due: {new Date(r.remind_at).toLocaleDateString('en-IN')}
              </div>
            </div>
            <button
              onClick={() => remindersService.markReminderRead(r.id).then(refresh)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"
              title="Mark read"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {reminders.length > 5 && (
        <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-500">
          Showing 5 of {reminders.length} reminders
        </div>
      )}
    </div>
  );
};

