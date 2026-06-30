# TODO_AUDIT

## Customer creation error fix
- [x] Located crash source: `Customers.tsx` calls `dbService.getCurrentTenantId()` which doesn’t exist.
- [x] Update `src/pages/Customers.tsx` to open Add Customer modal without calling tenant helpers (wrap plan-check in try/catch or remove).
- [ ] Verify by running app and clicking “Add New Customer”.


