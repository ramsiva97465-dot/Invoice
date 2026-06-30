const url = process.env.VITE_SUPABASE_URL || 'https://nywpojhuxuansxuotuii.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LAY5YYAXxzrGg-x9sm6Dw_CzOb8F3Y';
(async () => {
  try {
    const res = await fetch(`${url}/rest/v1/invoices`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (e) {
    console.error('Error:', e);
  }
})();
