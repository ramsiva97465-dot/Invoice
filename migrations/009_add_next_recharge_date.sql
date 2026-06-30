-- Migration: Add next_recharge_date column to invoices table
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS next_recharge_date DATE;
