-- Add GST Compliance fields to the database

-- 1. Add fields to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- 2. Add fields to invoice_items table
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS hsn_code TEXT;

-- 3. Add fields to company_settings table
ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Tamil Nadu';
