import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from the frontend folder
const envPath = path.join(__dirname, '..', 'frontend', '.env');
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

async function testActualCompany() {
  const email = `test_onboarding_actual_${Math.floor(Math.random() * 1000000)}@test.com`;
  const password = "Password123!";

  console.log(`1. Signing up user: ${email}...`);
  try {
    const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) {
      throw new Error(`Signup Failed: ${JSON.stringify(signupData)}`);
    }
    const token = signupData.access_token;
    const userId = signupData.user.id;

    // Get the company ID created for this user by querying via service role key first
    const serviceRoleKey = env.SUPABASE_SECRET_KEY;
    const tmRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_members?user_id=eq.${userId}`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    const tmData = await tmRes.json();
    const actualCompanyId = tmData[0].company_id;
    console.log("   Actual Company ID created:", actualCompanyId);

    // Query company_settings using the user's token and their ACTUAL company_id
    console.log(`2. Querying company_settings with actual companyId: ${actualCompanyId}...`);
    const csRes = await fetch(`${SUPABASE_URL}/rest/v1/company_settings?select=*&company_id=eq.${actualCompanyId}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("   company_settings status:", csRes.status);
    const csText = await csRes.text();
    console.log("   company_settings response:", csText);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

testActualCompany();
