# TODO - Single-company conversion (Xivora Invoice Studio)

## Customer insert 403 fix (RLS)
- [x] Update `src/services/db.ts` to remove all `user_id`/tenant filters and payload fields (customer/invoice/company_settings paths).
- [ ] Update `schema.sql` and/or SQL migrations to remove tenant_id/user_id RLS policies for `customers`/`invoices`/`invoice_items`/`company_settings`.
- [ ] Ensure `customers` INSERT policy allows authenticated admins without `tenant_id`.
- [ ] Ensure `company_settings` INSERT/UPDATE policy allows authenticated admins without `tenant_id`.
- [ ] Remove tenant_members/tenants tables and tenant_id columns (or leave them but disable RLS constraints) per single-company requirement.
- [ ] Re-run the customer creation request to confirm 403 is gone.


## Codebase cleanup
- [ ] Search/Remove any remaining references to `tenant_id`, `tenant_members`, `resolveTenant()`, `getTenant()`, `tenantService()`.

## Lint cleanup (if required)
- [ ] Fix remaining TypeScript/React lint errors (setState-in-effect, explicit any, react-refresh rule).

