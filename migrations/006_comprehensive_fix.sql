-- 1) Ensure the user_id columns exist on all tables
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2) Enable RLS on all tables
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 3) Drop ANY old conflicting permissive policies
DROP POLICY IF EXISTS "company_settings: single-company all access" ON company_settings;
DROP POLICY IF EXISTS "customers: single-company all access" ON customers;
DROP POLICY IF EXISTS "invoices: single-company all access" ON invoices;
DROP POLICY IF EXISTS "invoice_items: single-company all access" ON invoice_items;

-- 4) Recreate the correct user-scoped RLS policies
DROP POLICY IF EXISTS "company_settings: user scoped" ON company_settings;
CREATE POLICY "company_settings: user scoped" ON company_settings
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "customers: user scoped" ON customers;
CREATE POLICY "customers: user scoped" ON customers
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "invoices: user scoped" ON invoices;
CREATE POLICY "invoices: user scoped" ON invoices
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "invoice_items: user scoped" ON invoice_items;
CREATE POLICY "invoice_items: user scoped" ON invoice_items
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5) Also ensure GST columns exist just in case they failed earlier
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- 6) Create the RPC function for sequential invoice numbers
CREATE OR REPLACE FUNCTION public.next_invoice_number(p_invoice_date date)
RETURNS text AS $$
DECLARE
    v_yyyymm text;
    v_count integer;
    v_next_seq text;
BEGIN
    v_yyyymm := to_char(p_invoice_date, 'YYYYMM');
    
    SELECT COUNT(*) INTO v_count
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || v_yyyymm || '-%';
    
    v_next_seq := lpad((v_count + 1)::text, 3, '0');
    RETURN 'INV-' || v_yyyymm || '-' || v_next_seq;
END;
$$ LANGUAGE plpgsql;
