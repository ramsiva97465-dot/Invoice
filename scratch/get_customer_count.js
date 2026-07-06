import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from the parent directory
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SECRET_KEY;

(async () => {
  try {
    console.log("Querying customers table directly via Supabase PostgREST...");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?select=id,customer_id,name,mobile_number,status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log(`\n✅ Successfully fetched customers!`);
    console.log(`📊 Total customer records: ${data.length}\n`);
    console.log("List of Customers:");
    data.forEach((cust, index) => {
      console.log(`${index + 1}. [${cust.customer_id}] ${cust.name} (${cust.mobile_number}) - Status: ${cust.status}`);
    });
  } catch (err) {
    console.error("❌ Error fetching customer details:", err.message);
  }
})();
