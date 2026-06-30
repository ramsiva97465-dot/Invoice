#!/usr/bin/env node
/**
 * Migration runner: Adds GST columns to invoices table
 * Usage: node migrate.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

// Read migration SQL
const migrationSQL = `
BEGIN;

ALTER TABLE IF EXISTS invoices
  ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

UPDATE invoices
  SET gst_amount = tax
  WHERE (gst_amount IS NULL OR gst_amount = 0) AND COALESCE(tax, 0) > 0;

COMMIT;
`;

// Execute migration via REST API
(async () => {
  try {
    console.log('🚀 Starting GST migration...');
    console.log(`📍 Target: ${SUPABASE_URL}`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log('📊 New columns created:');
    console.log('   - gst_percentage (DECIMAL)');
    console.log('   - gst_amount (DECIMAL)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.log('\n📌 Fallback: Run this SQL in Supabase SQL editor:');
    console.log(migrationSQL);
    process.exit(1);
  }
})();
