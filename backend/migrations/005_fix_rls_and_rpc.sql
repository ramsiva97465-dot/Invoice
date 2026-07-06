-- Fix conflicting RLS policies on invoices and other tables
-- The earlier migration added 'user scoped' policies with auth.uid() which conflict 
-- with the permissive single-company policies from schema.sql.
DROP POLICY IF EXISTS "company_settings: single-company all access" ON company_settings;
DROP POLICY IF EXISTS "customers: single-company all access" ON customers;
DROP POLICY IF EXISTS "invoices: single-company all access" ON invoices;
DROP POLICY IF EXISTS "invoice_items: single-company all access" ON invoice_items;

-- Recreate the RPC function for next_invoice_number which was returning 404
CREATE OR REPLACE FUNCTION public.next_invoice_number(p_invoice_date date)
RETURNS text AS $$
DECLARE
    v_yyyymm text;
    v_count integer;
    v_next_seq text;
BEGIN
    -- Format date as YYYYMM (e.g., 202606)
    v_yyyymm := to_char(p_invoice_date, 'YYYYMM');
    
    -- Count existing invoices for this month
    SELECT COUNT(*) INTO v_count
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || v_yyyymm || '-%';
    
    -- Generate next sequence (e.g., 001, 002)
    v_next_seq := lpad((v_count + 1)::text, 3, '0');
    
    -- Return the formatted invoice number
    RETURN 'INV-' || v_yyyymm || '-' || v_next_seq;
END;
$$ LANGUAGE plpgsql;
