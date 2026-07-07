import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.');
}

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseServiceRoleKey || 'placeholder-key'
);
