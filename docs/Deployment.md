# Deployment Guidelines

Steps to configure Vercel and remote Supabase environments.

## Frontend Deployment (Vercel)

1. Configure root build overrides in Vercel settings to target the `frontend` folder context:
   - **Root Directory:** `frontend`
   - **Build Command:** `tsc -b && vite build`
   - **Output Directory:** `dist`
2. Environment Variables:
   - `VITE_SUPABASE_URL`: Supabase Project API URL.
   - `VITE_SUPABASE_ANON_KEY`: Supabase Project Client Anon Key.

## Backend Deployment (Supabase)

1. **SQL Migrations:**
   Run migrations (`migrations/011_*.sql` to `migrations/016_*.sql`) sequentially inside the Supabase SQL editor.
2. **Edge Functions deployment:**
   Deploy function using Supabase CLI:
   ```bash
   supabase functions deploy notify_telegram_reminders --project-ref <project-id>
   ```
3. **Database RLS Policies:**
   RLS is enabled automatically during migrations. Verify tables in the Supabase RLS panel have corresponding scoped rules attached.
