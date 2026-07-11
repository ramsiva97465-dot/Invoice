-- Migration for SaaS Subscriptions
-- 1. Create subscription_requests table for manual UPI payments
CREATE TABLE IF NOT EXISTS subscription_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  utr_number TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own requests"
  ON subscription_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests"
  ON subscription_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all requests"
  ON subscription_requests FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Add plan and subscription details to company_settings if not exists
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

-- 3. Create Storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment_proofs', 'payment_proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for payment_proofs
CREATE POLICY "Users can upload their own proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment_proofs' AND auth.uid() = owner);

CREATE POLICY "Service role can manage proofs"
  ON storage.objects FOR ALL
  USING (bucket_id = 'payment_proofs')
  WITH CHECK (bucket_id = 'payment_proofs');
