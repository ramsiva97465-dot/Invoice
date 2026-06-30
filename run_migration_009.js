
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
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
const sql = fs.readFileSync('migrations/009_add_next_recharge_date.sql', 'utf8');

fetch(SUPABASE_URL + '/rest/v1/rpc/exec_sql', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_ROLE_KEY
  },
  body: JSON.stringify({ query: sql })
}).then(res => {
  if (!res.ok) {
    return res.text().then(err => { throw new Error(err) });
  }
  return res.text();
}).then(text => {
  console.log('Success:', text);
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

