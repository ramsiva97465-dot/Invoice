import { Router, Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET',
  });
};

router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { amount, currency } = req.body;
    
    const options = {
      amount: amount * 100, // amount in paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET';
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");
      
    if (expectedSignature === razorpay_signature) {
      // Payment is valid! Update the database.
      const companyId = req.body.company_id; // Frontend needs to pass this
      
      if (companyId) {
        await supabase
          .from('company_settings')
          .update({ 
            plan: 'pro',
            subscription_status: 'active',
            razorpay_customer_id: razorpay_payment_id // Storing payment ID temporarily as reference
          })
          .eq('company_id', companyId);
      }
      
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
});

export default router;
