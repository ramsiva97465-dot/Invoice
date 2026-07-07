-- Migration: 017_automated_company_onboarding.sql
-- Goal: Automatically provision company, tenant membership, and settings templates when a user signs up

BEGIN;

-- 1. Create onboarding trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS trigger AS $$
DECLARE
  v_company_id uuid;
  v_email_prefix text;
BEGIN
  -- Extract prefix characters before '@' from user's email
  v_email_prefix := split_part(NEW.email, '@', 1);
  v_company_id := gen_random_uuid();

  -- Create company
  INSERT INTO public.companies (id, name, created_at)
  VALUES (v_company_id, v_email_prefix, NOW());

  -- Create tenant membership
  INSERT INTO public.tenant_members (user_id, company_id, role, created_at)
  VALUES (NEW.id, v_company_id, 'owner', NOW());

  -- Create default company settings
  INSERT INTO public.company_settings (user_id, company_id, company_name, email, created_at)
  VALUES (NEW.id, v_company_id, v_email_prefix, NEW.email, NOW());

  -- Create default telegram settings
  INSERT INTO public.telegram_settings (user_id, company_id, bot_token, chat_id, enabled, created_at, updated_at)
  VALUES (NEW.id, v_company_id, '', '', false, NOW(), NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind trigger to auth.users table
DROP TRIGGER IF EXISTS trg_on_user_signup ON auth.users;
CREATE TRIGGER trg_on_user_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_onboarding();

COMMIT;
