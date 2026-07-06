-- Migration: 013_add_foreign_keys_indexes.sql
-- Goal: Enforce NOT NULL constraints, add foreign keys, composite unique constraints, and indexes

BEGIN;

-- 1. Enforce NOT NULL constraints on company_id
ALTER TABLE company_settings ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE telegram_settings ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE customers ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE invoice_items ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE reminders ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE payments ALTER COLUMN company_id SET NOT NULL;

-- 2. Add foreign key constraints referencing companies(id)
ALTER TABLE company_settings ADD CONSTRAINT fk_company_settings_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE telegram_settings ADD CONSTRAINT fk_telegram_settings_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE customers ADD CONSTRAINT fk_customers_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE invoice_items ADD CONSTRAINT fk_invoice_items_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE payments ADD CONSTRAINT fk_payments_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE reminders ADD CONSTRAINT fk_reminders_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- 3. Transition global unique constraints to composite constraints (scoped to company)
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_customer_id_key;
ALTER TABLE customers ADD CONSTRAINT customers_company_customer_id_key UNIQUE (company_id, customer_id);

ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;
ALTER TABLE invoices ADD CONSTRAINT invoices_company_invoice_number_key UNIQUE (company_id, invoice_number);

-- 4. Create indexes on company_id columns for performance
CREATE INDEX IF NOT EXISTS idx_company_settings_company ON company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_telegram_settings_company ON telegram_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_company ON invoice_items(company_id);
CREATE INDEX IF NOT EXISTS idx_reminders_company ON reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_company ON payments(company_id);

COMMIT;
