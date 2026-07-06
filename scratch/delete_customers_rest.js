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

const headers = {
  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'apikey': SUPABASE_SERVICE_ROLE_KEY,
  'Content-Type': 'application/json'
};

async function apiRequest(url, method = 'GET', body = null) {
  const options = {
    method,
    headers
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status} on ${method} ${url}: ${errText}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

(async () => {
  try {
    console.log("1. Finding customer IDs for 'siva' and 'guru'...");
    headers['Prefer'] = 'return=representation';

    const customers = await apiRequest(`${SUPABASE_URL}/rest/v1/customers?name=in.(siva,guru)`);
    if (!customers || customers.length === 0) {
      console.log("No customers named 'siva' or 'guru' found in the database.");
      return;
    }

    const customerIds = customers.map(c => c.id);
    console.log(`Found ${customers.length} customer(s):`, customers.map(c => `${c.name} (${c.id})`).join(', '));

    console.log("\n2. Finding invoices linked to these customers...");
    const invoices = await apiRequest(`${SUPABASE_URL}/rest/v1/invoices?customer_id=in.(${customerIds.join(',')})&select=id`);
    const invoiceIds = invoices ? invoices.map(i => i.id) : [];

    if (invoiceIds.length > 0) {
      console.log(`Found ${invoiceIds.length} invoice(s) linked to these customers.`);
      
      console.log("\n3. Deleting invoice items...");
      const deletedItems = await apiRequest(`${SUPABASE_URL}/rest/v1/invoice_items?invoice_id=in.(${invoiceIds.join(',')})`, 'DELETE');
      console.log(`Deleted ${deletedItems ? deletedItems.length : 0} invoice items.`);
      
      console.log("\n4. Deleting reminders linked to these invoices...");
      const deletedReminders = await apiRequest(`${SUPABASE_URL}/rest/v1/reminders?invoice_id=in.(${invoiceIds.join(',')})`, 'DELETE');
      console.log(`Deleted ${deletedReminders ? deletedReminders.length : 0} reminders.`);

      console.log("\n5. Deleting invoices...");
      const deletedInvoices = await apiRequest(`${SUPABASE_URL}/rest/v1/invoices?customer_id=in.(${customerIds.join(',')})`, 'DELETE');
      console.log(`Deleted ${deletedInvoices ? deletedInvoices.length : 0} invoices.`);
    } else {
      console.log("No invoices found for these customers. Skipping invoice-related deletions.");
    }

    // Delete customers
    console.log("\n6. Deleting customers from customers table...");
    const deletedCustomers = await apiRequest(`${SUPABASE_URL}/rest/v1/customers?id=in.(${customerIds.join(',')})`, 'DELETE');
    console.log(`Deleted ${deletedCustomers ? deletedCustomers.length : 0} customers.`);

    console.log("\n🎉 Operation completed successfully!");
  } catch (err) {
    console.error("\n❌ Error running deletion workflow:", err.message);
  }
})();
