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
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json'
};

const DEFAULT_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

async function request(url, method = 'GET', body = null) {
  const options = {
    method,
    headers
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function runBackfill() {
  try {
    console.log("1. Ensuring default company exists...");
    try {
      await request(`${SUPABASE_URL}/rest/v1/companies`, 'POST', {
        id: DEFAULT_COMPANY_ID,
        name: 'Default Company'
      });
      console.log("   Default company created.");
    } catch (err) {
      if (err.message.includes("409") || err.message.includes("conflict")) {
        console.log("   Default company already exists.");
      } else {
        throw err;
      }
    }

    console.log("2. Fetching distinct user_ids...");
    const userIds = new Set();
    const tables = ['customers', 'invoices', 'company_settings', 'telegram_settings'];
    for (const table of tables) {
      const records = await request(`${SUPABASE_URL}/rest/v1/${table}?select=user_id`);
      for (const r of records) {
        if (r.user_id) userIds.add(r.user_id);
      }
    }
    console.log("   Found user_ids:", Array.from(userIds));

    console.log("3. Mapping user_ids to tenant_members...");
    for (const userId of userIds) {
      try {
        await request(`${SUPABASE_URL}/rest/v1/tenant_members`, 'POST', {
          user_id: userId,
          company_id: DEFAULT_COMPANY_ID,
          role: 'owner'
        });
        console.log(`   Mapped user_id ${userId} to default company.`);
      } catch (err) {
        if (err.message.includes("409") || err.message.includes("conflict")) {
          console.log(`   user_id ${userId} already mapped.`);
        } else {
          throw err;
        }
      }
    }

    console.log("4. Updating parent tables company_id...");
    for (const table of tables) {
      // PostgREST update: set company_id for all rows
      // (Since it's a migration, we set company_id = DEFAULT_COMPANY_ID for all rows where it is NULL)
      await request(`${SUPABASE_URL}/rest/v1/${table}?company_id=is.null`, 'PATCH', {
        company_id: DEFAULT_COMPANY_ID
      });
      console.log(`   Updated ${table} company_id.`);
    }

    console.log("5. Updating child tables company_id...");
    const childTables = ['invoice_items', 'reminders', 'payments'];
    for (const table of childTables) {
      await request(`${SUPABASE_URL}/rest/v1/${table}?company_id=is.null`, 'PATCH', {
        company_id: DEFAULT_COMPANY_ID
      });
      console.log(`   Updated ${table} company_id.`);
    }

    console.log("✅ Backfill completed successfully!");
  } catch (err) {
    console.error("❌ Backfill failed:", err.message);
  }
}

runBackfill();
