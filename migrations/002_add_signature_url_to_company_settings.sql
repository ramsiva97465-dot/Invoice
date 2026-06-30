-- Add signature URL support to company settings
ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS signature_url TEXT DEFAULT NULL;

-- Existing company settings will keep NULL unless manually updated.