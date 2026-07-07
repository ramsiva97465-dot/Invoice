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

async function testPostgrest400() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const email = `test_400_${Math.floor(Math.random() * 1000000)}@test.com`;
  const password = "Password123!";

  console.log(`1. Signing up user: ${email}...`);
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) {
    console.error("Signup error:", authError);
    return;
  }
  const user = authData.user;
  console.log("   User ID:", user.id);

  // Read company ID via service role key
  const serviceRoleKey = env.SUPABASE_SECRET_KEY;
  const adminSupabase = createClient(SUPABASE_URL, serviceRoleKey);
  const { data: tmData } = await adminSupabase
    .from('tenant_members')
    .select('company_id')
    .eq('user_id', user.id)
    .single();
  const companyId = tmData.company_id;
  console.log("   Company ID from DB:", companyId);

  // Let's run the exact SELECT query on company_settings using the user's client
  console.log("2. Running getCompanySettings query...");
  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) {
    console.error("❌ getCompanySettings Error:", error);
  } else {
    console.log("   getCompanySettings Succeeded:", data);
  }
}

testPostgrest400();
