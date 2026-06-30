    # AUDIT_REPORT.md

## Scope
- Scan and harden invoice application: remove runtime errors and productionize.
- Focus areas: intermittent invoice creation, Supabase 404s, company_settings update failures, invoice_number RPC failures, schema cache/RLS issues.

## Database schema reference
- `schema.sql` (provided):
  - `company_settings`, `customers`, `invoices`, `invoice_items`, `reminders`
  - Multi-tenant structures: `tenants`, `tenant_members`
  - RLS policies: tenant-scoped for most billing tables; reminders currently allow `FOR ALL authenticated ... USING (true)`.
  - RPC: `public.next_invoice_number(date)`.

## Code reference (files read)
- `src/services/db.ts`
- `src/pages/Settings.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/Invoices.tsx`
- `src/components/InvoiceModal.tsx`
- `src/components/CustomerModal.tsx`
- `src/components/RemindersPanel.tsx`
- `src/services/reminders.ts`
- `src/services/types.ts`
- `src/services/billing.ts`
- `migrations/003_next_invoice_number_function.sql`

## Findings (mismatches / production risks)

### 1) Multi-tenant vs Single-company mismatch
- **Schema** includes tenant_id + RLS requiring membership in `tenant_members` for:
  - `company_settings`
  - `customers`
  - `invoices`
  - `invoice_items`
- **Code** currently *does not* implement tenant membership resolution, and most queries are unscoped.
- Result: intermittent Supabase errors / empty results / 404s depending on RLS and how tables are exposed.

### 2) `company_settings` update failure masking
- In `src/services/db.ts`:
  - `updateCompanySettings()` catches any DB error and silently persists settings to `localStorage`.
- This prevents UI from surfacing the real failure cause (RLS/permissions/schema mismatch) and causes production drift.

### 3) Invoice creation: tax/GST column mapping risk
- Schema defines:
  - `tax` (legacy column)
  - `gst_percentage`, `gst_amount`
- Code in `addInvoice()` sets:
  - `gst_percentage: gstPct > 0 ? gstPct : null`
  - `gst_amount`
  - `tax: gst_amount`
- If schema/expectations differ (e.g., older migrations), this can cause runtime inserts to fail.

### 4) Invoice number RPC parsing risk
- `addInvoice()` calls `client.rpc('next_invoice_number', { p_invoice_date: invoiceData.invoice_date })`.
- It expects RPC to return either `{ next_invoice_number: string }` or raw scalar.
- If RPC returns a different shape or if RPC naming differs by schema (`public` vs not), invoice generation can fail intermittently.

### 5) Payments table not present in schema/code
- User requested `payments` references audit.
- In scanned code, there are no `payments` table references.
- Invoice “payments” are represented by `invoices.payment_status`.

## Columns referenced in code but potentially missing in DB (needs verification)
- `customers`: code uses `name`, `mobile_number`, `address`, `plan_name`, `monthly_amount`, `status`, `customer_id`, `created_at`.
- `invoices`: code uses `invoice_number`, `invoice_date`, `notes`, `subtotal`, `tax`, `gst_percentage`, `gst_amount`, `total_amount`, `payment_status`, `created_at`.
- `invoice_items`: code uses `description`, `quantity`, `rate`, `amount`, `invoice_id`.
- `company_settings`: code uses all columns in schema.
- `reminders`: code uses `read_at`.

## Columns present in DB but unused in code
- From provided schema.sql:
  - `tenants` / `tenant_members` tables appear unused in code.
  - `reminders.sent_at`, `invoice_id`, `customer_id` fields are present; code uses them for reading/marking but not fully denormalized.

## Summary of required code fixes (target)
1. Remove tenant-based logic from app code (single-company only):
   - Remove tenant-scoped function params and any tenant id filtering.
2. Make `company_settings` save directly to DB; stop localStorage fallback.
3. Make invoice number RPC parsing robust to returned scalar vs object.
4. Ensure invoice creation uses correct column mapping (`tax` vs `gst_amount`).
5. Add handling for unique constraint conflicts on `invoices.invoice_number`.
6. Remove/neutralize anything causing RLS to deny operations.

## Status
- This report is initial after scanning.
- Code changes to implement items 1-6 must be applied next.

