-- Single-company conversion: ownership by auth user id (user_id UUID)
-- Adds user_id columns and enforces RLS so each user sees only their own rows.

-- Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Add user_id columns
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2) Backfill user_id for existing rows (best-effort)
-- If your old data was created before this change, you must set user_id explicitly.
-- Here we leave NULLs; RLS will hide them until you backfill.

-- 3) Ensure invoice_items.user_id matches invoices.user_id
CREATE OR REPLACE FUNCTION public.sync_invoice_items_user_id()
RETURNS trigger AS $$
BEGIN
  NEW.user_id := (SELECT user_id FROM invoices WHERE id = NEW.invoice_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_items_user_id ON invoice_items;
CREATE TRIGGER trg_sync_invoice_items_user_id
BEFORE INSERT OR UPDATE OF invoice_items
FOR EACH ROW
EXECUTE FUNCTION public.sync_invoice_items_user_id();

-- 4) RLS enable
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- 5) Remove/neutralize tenant-based policies (if they exist)
-- We cannot drop by name reliably without knowing exact names in each environment,
-- so we just create user_id policies with higher clarity. If tenant policies still exist,
-- they may conflict. Prefer running with a fresh schema or also dropping tenant policies.

-- 6) User-scoped policies
CREATE POLICY "company_settings: user scoped" ON company_settings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "customers: user scoped" ON customers
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices: user scoped" ON invoices
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoice_items: user scoped" ON invoice_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7) Reminders should also be user scoped via joins.
-- Reminders table currently has permissive policy (true). Tighten it to user_id ownership.
-- This requires reminders to access invoice/user_id via invoice_items join or invoices join.
-- We'll scope reminders by invoices.user_id.

CREATE POLICY "reminders: user scoped" ON reminders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM invoices i
      WHERE i.id = reminders.invoice_id
        AND i.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM invoices i
      WHERE i.id = reminders.invoice_id
        AND i.user_id = auth.uid()
    )
  );

-- 8) Make sure reminders read_at filter still works.
-- Indexes are already present in schema.sql.

