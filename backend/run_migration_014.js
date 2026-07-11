const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'migrations', '014_gst_compliance.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log("Running migration 014_gst_compliance.sql...");
    
    console.log("Please run this SQL directly in your Supabase SQL Editor:");
    console.log("---");
    console.log(sqlContent);
    console.log("---");
    
    console.log("NOTE: We cannot run raw SQL via the JS client easily without a Postgres connection string. Please run it in the Supabase Dashboard.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runMigration();
