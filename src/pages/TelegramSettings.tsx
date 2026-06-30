// src/pages/TelegramSettings.tsx
import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import type { TelegramSettings } from '../services/types';
import { sendTelegramMessage } from '../lib/telegram';

interface TelegramSettingsProps {
  telegramSettings: TelegramSettings;
  setTelegramSettings: (settings: TelegramSettings) => void;
  onSave: (settings: TelegramSettings) => Promise<void>;
}

export const TelegramSettingsPage: React.FC<TelegramSettingsProps> = ({
  telegramSettings,
  setTelegramSettings,
  onSave,
}) => {
  const { showToast } = useToast();
  const [botToken, setBotToken] = useState<string>(telegramSettings.bot_token ?? '');
  const [chatId, setChatId] = useState<string>(telegramSettings.chat_id ?? '');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);



  const handleSave = async () => {
    setSaving(true);
    try {
      const newSettings: TelegramSettings = { bot_token: botToken, chat_id: chatId };
      await onSave(newSettings);
      setTelegramSettings(newSettings);
      showToast('Success', 'Telegram settings saved.', 'success');
    } catch (e) {
      showToast('Error', (e as Error).message ?? 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!botToken || !chatId) {
      showToast('Error', 'Bot token and Chat ID must be set before testing.', 'error');
      return;
    }
    setTesting(true);
    try {
      const message = `🔔 Xivora Invoice Studio\nTelegram is connected successfully.\nYou will receive invoice reminders here.`;
      await sendTelegramMessage(botToken, chatId, message);
      showToast('Success', 'Test notification sent.', 'success');
    } catch (e) {
      showToast('Error', (e as Error).message ?? 'Failed to send test notification.', 'error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
          Telegram Notifications
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Configure Telegram bot to receive invoice due reminders.
        </p>
      </div>

      {/* Current Connection Status */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Current Connection</p>
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold min-w-[80px]">Bot Token:</span>
          <span className="font-mono text-xs">{botToken ? `${botToken.slice(0, 8)}••••••••` : '(not set)'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold min-w-[80px]">Chat ID:</span>
          <span className="font-mono text-xs">{chatId || '(not set)'}</span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">
              Bot Token *
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="e.g. 123456:ABC-DEF..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-sans">
              Chat ID *
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 1968519920"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:border-emerald-500 outline-none text-slate-800 dark:text-white font-sans"
              required
            />
          </div>
        </div>
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
          >
            {testing ? 'Testing...' : 'Test Notification'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition-all"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};
