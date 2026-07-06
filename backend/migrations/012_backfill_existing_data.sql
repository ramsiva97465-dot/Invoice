-- Migration: 012_backfill_existing_data.sql
-- Goal: Create a default fallback company, map existing users to it, and backfill company_id fields

BEGIN;

-- 1. Ensure a default fallback company exists for the current production client
INSERT INTO companies (id, name, created_at)
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Company', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Map existing active users to the default company if they don't have a membership
INSERT INTO tenant_members (user_id, company_id, role, created_at)
SELECT DISTINCT user_id, '00000000-0000-0000-0000-000000000000', 'owner', NOW()
FROM (
    SELECT user_id FROM customers WHERE user_id IS NOT NULL
    UNION
    SELECT user_id FROM invoices WHERE user_id IS NOT NULL
    UNION
    SELECT user_id FROM company_settings WHERE user_id IS NOT NULL
    UNION
    SELECT user_id FROM telegram_settings WHERE user_id IS NOT NULL
) u
WHERE NOT EXISTS (
    SELECT 1 FROM tenant_members tm WHERE tm.user_id = u.user_id
) AND u.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Backfill company_id on parent tables from tenant_members based on user_id
UPDATE company_settings cs
SET company_id = (SELECT company_id FROM tenant_members tm WHERE tm.user_id = cs.user_id LIMIT 1)
WHERE company_id IS NULL;

UPDATE telegram_settings ts
SET company_id = (SELECT company_id FROM tenant_members tm WHERE tm.user_id = ts.user_id LIMIT 1)
WHERE company_id IS NULL;

UPDATE customers c
SET company_id = (SELECT company_id FROM tenant_members tm WHERE tm.user_id = c.user_id LIMIT 1)
WHERE company_id IS NULL;

UPDATE invoices i
SET company_id = (SELECT company_id FROM tenant_members tm WHERE tm.user_id = i.user_id LIMIT 1)
WHERE company_id IS NULL;

-- 4. Leftover record fallback to default company (for orphaned records or rows without user_id)
UPDATE company_settings SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;
UPDATE telegram_settings SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;
UPDATE customers SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;
UPDATE invoices SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;

-- 5. Backfill child tables from parent tables
UPDATE invoice_items ii
SET company_id = i.company_id
FROM invoices i
WHERE ii.invoice_id = i.id AND ii.company_id IS NULL;

UPDATE reminders r
SET company_id = i.company_id
FROM invoices i
WHERE r.invoice_id = i.id AND r.company_id IS NULL;

UPDATE payments p
SET company_id = i.company_id
FROM invoices i
WHERE p.invoice_id = i.id AND p.company_id IS NULL;

-- 6. Leftover child fallback to default company
UPDATE invoice_items SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;
UPDATE reminders SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;
UPDATE payments SET company_id = '00000000-0000-0000-0000-000000000000' WHERE company_id IS NULL;

COMMIT;
