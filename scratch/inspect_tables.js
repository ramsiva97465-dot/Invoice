const url = 'https://nywpojhuxuansxuotuii.supabase.co/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55d3Bvamh1eHVhbnN4dW90dWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMTMyOTcsImV4cCI6MjA5Nzc4OTI5N30.yGjSFC8eLAseeUmJLAuOs0SkIdjgTQSQ5LkvDllGXjY';

async function main() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const data = await res.json();
    console.log('Root response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
