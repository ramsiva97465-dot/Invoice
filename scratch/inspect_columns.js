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

async function inspectColumns() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/tenant_members?limit=1`, { headers });
    const data = await res.json();
    console.log("tenant_members row:", data[0]);

    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/company_settings?limit=1`, { headers });
    const data2 = await res2.json();
    console.log("company_settings row:", data2[0]);
  } catch (err) {
    console.error(err);
  }
}

inspectColumns();
