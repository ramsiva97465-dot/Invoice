-- Migration: 011_add_company_id_columns.sql
-- Goal: Add nullable company_id columns to all business tables

BEGIN;

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE telegram_settings ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS company_id UUID;
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS company_id UUID;

COMMIT;
