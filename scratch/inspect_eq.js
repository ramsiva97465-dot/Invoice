const url = 'https://nywpojhuxuansxuotuii.supabase.co/rest/v1/company_settings?select=*';
const apiKey = 'sb_publishable_LAY5YYAXxzrGg=xh9sm6Dw_CzOb8F3Y';

async function main() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!res.ok) {
      console.error('Failed to fetch:', res.status, res.statusText);
      return;
    }
    const data = await res.json();
    console.log('Success with =, data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
