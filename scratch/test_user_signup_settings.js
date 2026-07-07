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

async function testUserFlow() {
  const email = `test_onboarding_${Math.floor(Math.random() * 1000000)}@test.com`;
  const password = "Password123!";

  console.log(`1. Signing up user: ${email}...`);
  try {
    // Auth Signup
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
    console.log("   Signup Succeeded. User ID:", userId);

    // Now, query tenant_members using the user's token
    console.log("2. Querying tenant_members using user token...");
    const tmRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_members?select=company_id&user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("   tenant_members status:", tmRes.status);
    const tmText = await tmRes.text();
    console.log("   tenant_members response:", tmText);

    let companyId = '00000000-0000-0000-0000-000000000000';
    try {
      const tmData = JSON.parse(tmText);
      if (tmData && tmData.length > 0 && tmData[0].company_id) {
        companyId = tmData[0].company_id;
        console.log("   Resolved company ID:", companyId);
      } else {
        console.log("   Could not resolve company ID from tenant_members. Defaulting to fallback.");
      }
    } catch (e) {
      console.log("   Could not parse tenant_members response.");
    }

    // Now, query company_settings using the resolved company ID
    console.log(`3. Querying company_settings with companyId: ${companyId}...`);
    const csRes = await fetch(`${SUPABASE_URL}/rest/v1/company_settings?select=*&company_id=eq.${companyId}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    console.log("   company_settings status:", csRes.status);
    console.log("   company_settings response:", await csRes.text());
  } catch (err) {
    console.error("❌ Error in test user flow:", err.message);
  }
}

testUserFlow();
