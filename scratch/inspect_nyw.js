const url = 'https://nywpojhuxuansxuotuii.supabase.co/rest/v1/';
const apiKey = 'sb_publishable_LAY5YYAXxzrGg-xh9sm6Dw_CzOb8F3Y';

async function main() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!res.ok) {
      console.error('Failed to fetch schema:', res.status, res.statusText);
      return;
    }
    const schema = await res.json();
    console.log('Tables/Definitions found in nywpojhuxuansxuotuii:', schema.definitions ? Object.keys(schema.definitions) : 'none');
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

main();
