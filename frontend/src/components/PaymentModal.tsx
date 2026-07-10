import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';
import { useToast } from './Toast';
import { X, Zap, CreditCard, QrCode, Upload, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const [method, setMethod] = useState<'razorpay' | 'manual' | null>(null);
  const [loading, setLoading] = useState(false);
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleRazorpay = async () => {
    try {
      setLoading(true);
      const data = await paymentService.createOrder(499, 'INR');
      
      if (!data.success || !data.order) throw new Error('Failed to create order');

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Xivora Invoice Studio',
        description: 'Pro Plan Subscription',
        order_id: data.order.id,
        handler: async function (response: any) {
          try {
            const verification = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            if (verification.success) {
              showToast('Success', 'Welcome to the Pro Plan!', 'success');
              onClose();
              window.location.reload(); // Refresh to apply Pro status
            }
          } catch (error) {
            showToast('Error', 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: "Company Owner",
          email: "owner@company.com",
        },
        theme: { color: "#10b981" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        showToast('Error', response.error.description || 'Payment Failed', 'error');
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      showToast('Error', 'Could not initiate payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || !file) {
      showToast('Validation Error', 'Please provide both UTR number and a screenshot.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Logic for supabase storage & inserting row will go here
      // For now we mock success until db is ready
      await new Promise(r => setTimeout(r, 1500));
      setSubmitted(true);
    } catch (error) {
      showToast('Error', 'Failed to submit payment request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-sans">Upgrade to Pro</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Choose your preferred payment method for the ₹499/month plan.</p>
          </div>

          {!method && (
            <div className="space-y-4">
              <button 
                onClick={handleRazorpay}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white">Pay Online (Instant)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cards, UPI, Netbanking (via Razorpay)</p>
                  </div>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  &rarr;
                </div>
              </button>

              <button 
                onClick={() => setMethod('manual')}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white">Manual UPI Transfer</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">0% Fee. Upload screenshot to verify.</p>
                  </div>
                </div>
                <div className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  &rarr;
                </div>
              </button>
            </div>
          )}

          {method === 'manual' && !submitted && (
            <form onSubmit={handleManualSubmit} className="space-y-6 animate-in slide-in-from-right-4">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Scan & Pay ₹499 to:</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mb-4">yourname@okicici</p>
                {/* Mock QR Code space */}
                <div className="w-48 h-48 bg-white border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl mx-auto flex items-center justify-center text-slate-400">
                  <QrCode className="h-12 w-12 opacity-50" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    UPI Reference No. (UTR)
                  </label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={e => setUtr(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="e.g. 312345678901"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Screenshot
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="screenshot-upload"
                    />
                    <label 
                      htmlFor="screenshot-upload"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {file ? file.name : 'Upload Screenshot (JPG/PNG)'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setMethod(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-4 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          )}

          {submitted && (
            <div className="text-center py-8 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Submitted!</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Your payment screenshot has been sent for verification. We will activate your Pro plan shortly.
              </p>
              <button 
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
