-- Fix RLS for telegram_settings table
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Add user_id column if it doesn't exist
ALTER TABLE telegram_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Drop any existing policies (safe to run even if none exist)
DROP POLICY IF EXISTS "Users can view their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can insert their own telegram settings" ON telegram_settings;
DROP POLICY IF EXISTS "Users can update their own telegram settings" ON telegram_settings;

-- 3. Create permissive RLS policies for authenticated users
CREATE POLICY "Users can view their own telegram settings"
  ON telegram_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own telegram settings"
  ON telegram_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own telegram settings"
  ON telegram_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own telegram settings"
  ON telegram_settings FOR DELETE
  TO authenticated
  USING (true);
