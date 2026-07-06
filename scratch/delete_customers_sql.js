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

const deleteSQL = `
BEGIN;

-- Check details of what we are deleting first
CREATE TEMP TABLE deleted_customers_temp AS
SELECT id, name, customer_id FROM customers WHERE name IN ('siva', 'guru');

-- Select details to print
-- (We'll query these tables in our Node script or output via select in SQL if needed, but since it's an RPC exec_sql, we'll just run the deletes and count)

-- Delete invoice items linked to these customers' invoices
DELETE FROM invoice_items 
WHERE invoice_id IN (
  SELECT id FROM invoices WHERE customer_id IN (SELECT id FROM deleted_customers_temp)
);

-- Delete reminders linked to these customers
DELETE FROM reminders 
WHERE customer_id IN (SELECT id FROM deleted_customers_temp);

-- Delete invoices linked to these customers
DELETE FROM invoices 
WHERE customer_id IN (SELECT id FROM deleted_customers_temp);

-- Finally delete the customers
DELETE FROM customers 
WHERE id IN (SELECT id FROM deleted_customers_temp);

-- Return details
SELECT name, customer_id FROM deleted_customers_temp;

COMMIT;
`;

(async () => {
  try {
    console.log("Running transaction to delete customers and all their related records...");
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ query: deleteSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    // exec_sql might return dynamic format depending on implementation, let's see:
    const data = await response.json();
    console.log("✅ Deletion completed successfully!");
    console.log("Response:", data);
  } catch (err) {
    console.error("❌ SQL Deletion failed:", err.message);
  }
})();
