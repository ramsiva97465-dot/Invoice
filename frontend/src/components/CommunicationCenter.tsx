import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  Send, 
  Paperclip, 
  FileText, 
  QrCode, 
  BookOpen, 
  Lock,
  User,
  Phone,
  Hash,
  Calendar,
  DollarSign
} from 'lucide-react';
import type { Invoice, CompanySettings } from '../services/types';

interface CommunicationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  companySettings: CompanySettings;
}

export const CommunicationCenter: React.FC<CommunicationCenterProps> = ({
  isOpen,
  onClose,
  invoice,
  companySettings
}) => {
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp'>('whatsapp');
  const [attachPdf, setAttachPdf] = useState(true);
  const [attachQR, setAttachQR] = useState(true);
  
  // Format due date in local format
  const formattedDueDate = invoice.due_date 
    ? new Date(invoice.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : invoice.invoice_date
      ? new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

  const defaultMessage = `Hello ${invoice.customer_name || 'Customer'} 👋

Your invoice for ${companySettings.company_name || 'our company'} is ready.

🧾 Invoice No : ${invoice.invoice_number}

💰 Amount : ₹${invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

📅 Due Date : ${formattedDueDate}

Thank you for choosing ${companySettings.company_name || 'our company'}.

Powered by Xivora`;

  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [invoice, companySettings]);

  if (!isOpen) return null;

  const handleSend = () => {
    console.log('📤 Communication Center - Send Options:', {
      channel: selectedChannel,
      attachPdf,
      attachQR,
      message
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📤</span>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white font-sans">
              Send Invoice
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Customer Details */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
              Customer Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {invoice.customer_name || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{invoice.customer_mobile || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{(invoice as any).customer_email || 'Email Not Available'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                <Hash className="h-4 w-4 text-slate-400" />
                <span>Invoice: <strong className="text-slate-900 dark:text-white">{invoice.invoice_number}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <span>Amount: <strong className="text-slate-900 dark:text-white">₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-650 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Due Date: {formattedDueDate}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Channel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
              Delivery Channel
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* WhatsApp (Selected) */}
              <div 
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20`}
                onClick={() => setSelectedChannel('whatsapp')}
              >
                <MessageSquare className="h-5 w-5 fill-current" />
                <span className="text-xs font-bold">WhatsApp</span>
              </div>

              {/* Email (Locked/Disabled) */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 flex flex-col items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                <Mail className="h-5 w-5" />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">Email</span>
                  <Lock className="h-3 w-3" />
                </div>
              </div>

              {/* Telegram (Coming Soon) */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 flex flex-col items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                <span className="text-lg font-bold">💬</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">Telegram</span>
                  <Lock className="h-3 w-3" />
                </div>
              </div>

              {/* SMS (Coming Soon) */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 flex flex-col items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                <span className="text-lg font-bold">📱</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold">SMS</span>
                  <Lock className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Attachments */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
              <Paperclip className="h-3.5 w-3.5" />
              <span>Attachments</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Invoice PDF */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={attachPdf}
                  onChange={(e) => setAttachPdf(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
                />
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Invoice PDF</span>
                </div>
              </label>

              {/* Payment QR */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={attachQR}
                  onChange={(e) => setAttachQR(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" 
                />
                <div className="flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Payment QR</span>
                </div>
              </label>

              {/* Company Brochure */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/20 opacity-50 cursor-not-allowed">
                <input 
                  type="checkbox" 
                  disabled
                  checked={false}
                  className="rounded text-slate-400 h-4.5 w-4.5 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800" 
                />
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-650">Brochure (Locked)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Message Preview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
                Message Preview
              </h4>
              <span className="text-xs text-slate-400">
                {message.length} characters
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-slate-100 transition-all font-sans"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-650 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/15 transition-all duration-200"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>

      </div>
    </div>
  );
};
