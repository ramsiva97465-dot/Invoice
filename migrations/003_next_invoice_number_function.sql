-- Generates the next unique invoice number in format: INV-YYYYMM-XXX
-- Example: INV-202606-0001
--
-- Usage (Supabase RPC):
--   select next_invoice_number('2026-06-01');

-- NOTE:
-- This function guarantees uniqueness for a given month even under concurrency
-- by using a dedicated sequence per YYYYMM month stored in an invoices_sequence table.

CREATE TABLE IF NOT EXISTS public.invoices_sequence (
  year_month text PRIMARY KEY,
  next_val integer NOT NULL
);

CREATE OR REPLACE FUNCTION public.next_invoice_number(p_invoice_date date)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_year_month text;
  v_next_suffix integer;
BEGIN
  v_year_month := to_char(p_invoice_date, 'YYYYMM');

  -- Serialize per-month generation via row lock on invoices_sequence
  INSERT INTO public.invoices_sequence(year_month, next_val)
  VALUES (v_year_month, 1)
  ON CONFLICT (year_month)
  DO NOTHING;

  SELECT next_val
    INTO v_next_suffix
  FROM public.invoices_sequence
  WHERE year_month = v_year_month
  FOR UPDATE;

  UPDATE public.invoices_sequence
  SET next_val = v_next_suffix + 1
  WHERE year_month = v_year_month;

  RETURN 'INV-' || v_year_month || '-' || LPAD(v_next_suffix::text, 4, '0');
END;
$$;


