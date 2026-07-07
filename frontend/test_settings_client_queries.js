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

async function testFrontendQueries() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const email = `test_settings_client_${Math.floor(Math.random() * 1000000)}@test.com`;
  const password = "Password123!";

  console.log(`1. Creating and logging in test user: ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) {
    console.error("Signup error:", authError);
    return;
  }
  const user = authData.user;
  console.log("   Logged in as user:", user.id);

  // Query 1: Get tenant member
  console.log("2. Querying tenant_members...");
  const { data: member, error: memberError } = await supabase
    .from('tenant_members')
    .select('company_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (memberError) {
    console.error("❌ tenant_members Query Error:", memberError);
  } else {
    console.log("   tenant_members resolved to:", member);
  }

  const companyId = member?.company_id || '00000000-0000-0000-0000-000000000000';
  console.log("   Using company ID for next queries:", companyId);

  // Query 2: Get company settings
  console.log("3. Querying company_settings...");
  const { data: csData, error: csError } = await supabase
    .from('company_settings')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (csError) {
    console.error("❌ company_settings Query Error:", csError);
  } else {
    console.log("   company_settings resolved to:", csData);
  }

  // Query 3: Get telegram settings
  console.log("4. Querying telegram_settings...");
  const { data: tsData, error: tsError } = await supabase
    .from('telegram_settings')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (tsError) {
    console.error("❌ telegram_settings Query Error:", tsError);
  } else {
    console.log("   telegram_settings resolved to:", tsData);
  }
}

testFrontendQueries();
