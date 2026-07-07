import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from the frontend folder
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

import { createClient } from '@supabase/supabase-js';

async function testAllTables() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const email = `test_settings_all_${Math.floor(Math.random() * 1000000)}@test.com`;
  const password = "Password123!";

  console.log(`1. Creating and logging in test user: ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) {
    console.error("Signup error:", authError);
    return;
  }
  const user = authData.user;
  console.log("   User ID:", user.id);

  const companyId = '00000000-0000-0000-0000-000000000000';

  const tables = [
    'customers',
    'invoices',
    'invoice_items',
    'company_settings',
    'telegram_settings',
    'reminders',
    'payments'
  ];

  for (const table of tables) {
    console.log(`Querying ${table}...`);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('company_id', companyId);
    if (error) {
      console.error(`❌ Table ${table} Error:`, error.message, error.code, error.details);
    } else {
      console.log(`   Table ${table} succeeded:`, data?.length, "rows");
    }
  }
}

testAllTables();
