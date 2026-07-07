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
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SECRET_KEY;

const headers = {
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
};

async function checkTrigger() {
  const userId = 'd4d54e0f-7fd2-4eaa-8d3e-2d37235a93a4';
  
  try {
    const tmRes = await fetch(`${SUPABASE_URL}/rest/v1/tenant_members?user_id=eq.${userId}`, { headers });
    console.log("tenant_members:", await tmRes.json());

    const csRes = await fetch(`${SUPABASE_URL}/rest/v1/company_settings?user_id=eq.${userId}`, { headers });
    console.log("company_settings:", await csRes.json());

    const tsRes = await fetch(`${SUPABASE_URL}/rest/v1/telegram_settings?user_id=eq.${userId}`, { headers });
    console.log("telegram_settings:", await tsRes.json());
  } catch (err) {
    console.error(err);
  }
}

checkTrigger();
