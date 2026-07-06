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
    console.log("Deleting customers 'siva' and 'guru' from the database...");
    
    // Deleting via Supabase PostgREST
    const response = await fetch(`${SUPABASE_URL}/rest/v1/customers?name=in.(siva,guru)`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log(`\n✅ Deletion complete!`);
    console.log(`📊 Number of customers deleted: ${data.length}\n`);
    data.forEach((cust) => {
      console.log(`Deleted: [${cust.customer_id}] ${cust.name} (${cust.mobile_number})`);
    });
  } catch (err) {
    console.error("❌ Error deleting customers:", err.message);
  }
})();
