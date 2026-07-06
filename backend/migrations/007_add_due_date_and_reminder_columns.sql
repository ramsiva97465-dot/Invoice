-- Migration: Add due_date and last_reminder_sent_at columns to invoices table
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- Backfill due_date for existing invoices (default 30 days if payment_terms not present)
UPDATE invoices
SET due_date = CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_terms')
      THEN invoice_date + (SELECT payment_terms FROM invoices WHERE invoices.id = id) * INTERVAL '1 day'
    ELSE invoice_date + INTERVAL '30 days'
  END
WHERE due_date IS NULL;
