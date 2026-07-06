-- Migration: Add GST fields to invoices table
-- Run this in your Postgres / Supabase SQL editor

BEGIN;

ALTER TABLE IF EXISTS invoices
  ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Optional: backfill gst_amount from legacy tax column where appropriate
UPDATE invoices
  SET gst_amount = tax
  WHERE (gst_amount IS NULL OR gst_amount = 0) AND COALESCE(tax, 0) > 0;

COMMIT;

-- Notes:
-- 1) This migration keeps the existing `tax` column for backward compatibility.
-- 2) After running this, your application can insert `gst_percentage` and `gst_amount`.
