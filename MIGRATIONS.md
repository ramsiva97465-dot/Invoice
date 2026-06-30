# Migrations

This repository includes simple SQL migrations you can run to update the database schema.

## 001_add_gst_columns.sql
Adds `gst_percentage` and `gst_amount` columns to the `invoices` table and backfills `gst_amount` from the legacy `tax` column where applicable.

Location: `migrations/001_add_gst_columns.sql`

How to run (Supabase SQL Editor)
1. Open your Supabase project.
2. Go to "SQL" in the left menu and choose "New query".
3. Paste the contents of `migrations/001_add_gst_columns.sql` and run it.

How to run (psql)
1. Get your Postgres connection string from Supabase project settings (Database -> Connection string).
2. Run:

```bash
psql "postgres://<user>:<password>@<host>:<port>/<db>" -f migrations/001_add_gst_columns.sql
```

Notes
- The migration is idempotent: `IF NOT EXISTS` prevents errors on repeated runs.
- The file also contains an `UPDATE` to backfill `gst_amount` from the existing `tax` column so older rows keep consistent values.
- After applying the migration, your app (already updated) will be able to insert invoices with `gst_percentage` and `gst_amount`.

If you'd like, I can:
- Run this migration for you if you provide a Postgres connection string (or grant me permission to use project settings).  
- Add a small Node script to run migrations using a Postgres connection string.
