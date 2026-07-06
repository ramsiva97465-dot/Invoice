-- Migration: 016_invoice_number_per_company.sql
-- Goal: Enforce automatic invoice_items company syncing and company-scoped monthly sequence numbering

BEGIN;

-- 1. Create a trigger function to automatically sync company_id from parent invoice
CREATE OR REPLACE FUNCTION public.sync_invoice_items_company_id()
RETURNS trigger AS $$
BEGIN
  NEW.company_id := (SELECT company_id FROM invoices WHERE id = NEW.invoice_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Bind the trigger to invoice_items
DROP TRIGGER IF EXISTS trg_sync_invoice_items_company ON invoice_items;
CREATE TRIGGER trg_sync_invoice_items_company
BEFORE INSERT OR UPDATE OF invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_invoice_items_company_id();

-- 3. Scoped function to calculate sequential invoice numbers per company
DROP FUNCTION IF EXISTS public.next_invoice_number(date);
CREATE OR REPLACE FUNCTION public.next_invoice_number(p_invoice_date date, p_company_id uuid)
RETURNS text AS $$
DECLARE
    v_yyyymm text;
    v_count integer;
    v_next_seq text;
BEGIN
    v_yyyymm := to_char(p_invoice_date, 'YYYYMM');
    
    SELECT COUNT(*) INTO v_count
    FROM invoices
    WHERE company_id = p_company_id
      AND invoice_number LIKE 'INV-' || v_yyyymm || '-%';
    
    v_next_seq := lpad((v_count + 1)::text, 3, '0');
    RETURN 'INV-' || v_yyyymm || '-' || v_next_seq;
END;
$$ LANGUAGE plpgsql;

COMMIT;
