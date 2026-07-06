# Multi-Tenant SaaS Development Roadmap

Development is partitioned into progressive phases prioritizing zero-downtime security validation.

## Roadmap Phase Sequence

1. **Phase 1: Code Scoping & Context Resolution (Done)**
   - Setup client contexts, hook systems, and DB query mapping transparently without modifying production schemas.
2. **Phase 2: Add Nullable Columns (Done)**
   - Create migration scripts appending `company_id` columns to database tables. Keep columns nullable to prevent service interruption.
3. **Phase 3: Production Client Data Backfilling (Done)**
   - Map existing users and historical records to a default/fallback company.
4. **Phase 4: Constraint Enforcement (Next)**
   - Lock database values: enforce `NOT NULL` rules, establish foreign keys, index database rows, and switch to composite uniqueness parameters.
5. **Phase 5: Secure RLS Security Policies (Future)**
   - Transition all database-level security policies to strict company scopes.
6. **Phase 6: Scoped Notifications Engine (Future)**
   - Update Edge Functions to inspect invoice company ownership contexts and direct notifications to appropriate recipient Bot Chat IDs.
