const url = 'https://nywpojhuxuansxuotuii.supabase.co/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3Bvamh1eHVhbnN4dW90dWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTMyOTcsImV4cCI6MjA5Nzc4OTI5N30.yGjSFC8eLAseeUmJLAuOs0SkIdjgTQSQ5LkvDllGXjY';

async function checkTable(tableName) {
  try {
    const res = await fetch(`${url}${tableName}?select=*`, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!res.ok) {
      return `Failed to fetch ${tableName}: ${res.status} ${res.statusText} - ${await res.text()}`;
    }
    const data = await res.json();
    return `Table ${tableName} exists. Count: ${data.length}`;
  } catch (err) {
    return `Error for ${tableName}: ${err.message}`;
  }
}

async function main() {
  const tables = ['company_settings', 'customers', 'invoices', 'invoice_items', 'reminders', 'tenants', 'tenant_members'];
  for (const table of tables) {
    console.log(await checkTable(table));
  }
}

main();
