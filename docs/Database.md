# Database Scoping & Schema

The system uses a multi-tenant schema model sharing tables while filtering access through Row Level Security (RLS) policies scoped by `company_id`.

## Schema Diagram

```
 +------------------+           +----------------------+
 |    companies     | <-------+ |    tenant_members    |
 +------------------+           +----------------------+
 | id (PK)          |           | id (PK)              |
 | name             |           | company_id (FK)      |
 | created_at       |           | user_id (auth.users) |
 +--------+---------+           | role                 |
          |                     +----------------------+
          |
          +-----+-------------------+---------------------+
                |                   |                     |
                v                   v                     v
       +--------+-------+  +--------+-------+    +--------+-------+
       |   customers    |  |    invoices    |    |payments/remind |
       +----------------+  +----------------+    +----------------+
       | id (PK)        |  | id (PK)        |    | id (PK)        |
       | company_id(FK) |  | company_id(FK) |    | company_id(FK) |
       | customer_id    |  | invoice_number |    | invoice_id(FK) |
       +----------------+  +----------------+    +----------------+
```

## Scoping Strategy

1. **Row Level Security (RLS):**
   Every table checks that the record's `company_id` exists in the `tenant_members` mapping matching the logged-in user:
   ```sql
   company_id IN (
     SELECT company_id 
     FROM tenant_members 
     WHERE user_id = auth.uid()
   )
   ```
2. **Numbering Isolation:**
   Uniqueness is scoped per-company via composite constraints:
   - `UNIQUE (company_id, customer_id)` on `customers`.
   - `UNIQUE (company_id, invoice_number)` on `invoices`.
3. **Database-level Synced Triggers:**
   - Triggers automatically sync the `company_id` for dependent child items (e.g. `invoice_items` inherit parent invoice's `company_id`).
