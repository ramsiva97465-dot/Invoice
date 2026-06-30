# Tenant/RLS & Reminder Notes

## Current state
- App currently uses Supabase tables: `company_settings`, `customers`, `invoices`, `invoice_items`.
- RLS policies currently allow all authenticated users.

## Reminder feature
- Added DB table: `reminders` (in-app reminders for pending invoices).
- Frontend will show reminder badge in `Layout`.

## Next (SaaS proper)
- Add tenant/workspace tables and `workspace_id` columns.
- Update RLS policies to restrict rows by workspace.
- Ensure reminder job and queries are also tenant scoped.

