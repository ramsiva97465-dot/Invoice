const fetch = require('node-fetch');
const url = process.env.VITE_SUPABASE_URL || 'https://nywpojhuxuansxuotuii.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_LAY5YYAXxzrGg-xh9sm6Dw_CzOb8F3Y';
(async () => {
  try {
    const res = await fetch(`${url}/rest/v1/invoices`, {
      headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Rows:', data.length);
  } catch (e) { console.error('Error', e); }
})();
