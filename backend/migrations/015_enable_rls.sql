-- Migration: 015_enable_rls.sql
-- Goal: Configure Row Level Security (RLS) policies for multi-tenancy isolation

BEGIN;

-- 1. Drop old user-scoped RLS policies
DROP POLICY IF EXISTS "company_settings: user scoped" ON company_settings;
DROP POLICY IF EXISTS "customers: user scoped" ON customers;
DROP POLICY IF EXISTS "invoices: user scoped" ON invoices;
DROP POLICY IF EXISTS "invoice_items: user scoped" ON invoice_items;
DROP POLICY IF EXISTS "reminders: user scoped" ON reminders;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON reminders;

-- 2. Create tenant-scoped RLS policies based on tenant_members company mapping
CREATE POLICY "company_settings: tenant isolated" ON company_settings
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "telegram_settings: tenant isolated" ON telegram_settings
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "customers: tenant isolated" ON customers
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "invoices: tenant isolated" ON invoices
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "invoice_items: tenant isolated" ON invoice_items
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "reminders: tenant isolated" ON reminders
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "payments: tenant isolated" ON payments
  FOR ALL TO authenticated
  USING (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM tenant_members WHERE user_id = auth.uid()));

-- Enable RLS on telegram_settings and payments
ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

COMMIT;
