import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';
import { useToast } from './Toast';
import { Zap } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const UpgradeButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      // Create order for ₹499
      const data = await paymentService.createOrder(499, 'INR');
      
      if (!data.success || !data.order) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID', // Should match backend or be passed
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
              // Optionally trigger a re-fetch of user plan status
            }
          } catch (error) {
            showToast('Error', 'Payment verification failed', 'error');
          }
        },
        prefill: {
          name: "Company Owner",
          email: "owner@company.com",
        },
        theme: {
          color: "#10b981"
        }
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

  return (
    <button 
      onClick={handleUpgrade}
      disabled={loading}
      className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5 disabled:opacity-70 disabled:hover:scale-100"
    >
      <Zap className="h-4 w-4" />
      {loading ? 'Processing...' : 'Upgrade to Pro'}
    </button>
  );
};
