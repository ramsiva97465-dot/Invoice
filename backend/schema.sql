-- Database Schema for SHAKTHI CABLE NETWORK Billing & Invoice Management System

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANY SETTINGS TABLE (Single row configuration)
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'SHAKTHI CABLE NETWORK',
    address TEXT NOT NULL DEFAULT '5A Satellite Road, Cable Junction, Chennai',
    mobile_number VARCHAR(50) NOT NULL DEFAULT '+91 98765 43210',
    email VARCHAR(255) NOT NULL DEFAULT 'support@shakthicablenetwork.com',
    gst_number VARCHAR(50) DEFAULT '33AAAAA0000A1Z5',
    bank_name VARCHAR(100) DEFAULT 'State Bank of India',
    account_number VARCHAR(100) DEFAULT '1234567890',
    ifsc_code VARCHAR(50) DEFAULT 'SBIN0001234',
    upi_id VARCHAR(255) DEFAULT 'shakthicablenetwork@upi',
    logo_url TEXT,
    signature_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Seed initial default settings if empty
INSERT INTO company_settings (company_name, address, mobile_number, email, gst_number, bank_name, account_number, ifsc_code, upi_id, logo_url, signature_url)
SELECT 'SHAKTHI CABLE NETWORK', '5A Satellite Road, Cable Junction, Chennai', '+91 98765 43210', 'support@shakthicablenetwork.com', '33AAAAA0000A1Z5', 'State Bank of India', '1234567890', 'SBIN0001234', 'shakthicablenetwork@upi', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., SCN-1001
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    monthly_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for searching customers
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers(name, mobile_number, customer_id);

-- 3. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL, -- e.g., INV-202606-001
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    -- Legacy `tax` retained for backward compatibility
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    -- New GST fields
    gst_percentage DECIMAL(5,2) DEFAULT NULL,
    gst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(payment_status);

-- 4. INVOICE ITEMS TABLE (Line items for detailed breakdown)
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. MULTI-TENANCY (SaaS) - Tenant/Workspace + RLS

-- Tenant/workspace table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Memberships: maps users to tenants (roles can be expanded later)
CREATE TABLE IF NOT EXISTS tenant_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- supabase auth.users.id
    role VARCHAR(30) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE (tenant_id, user_id)
);

-- Add tenant_id to tenant-owned tables
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Backfill tenant_id for existing single-tenant setups:
-- If there is exactly one tenant row and all tables are NULL, assign that tenant.
DO $$
DECLARE
  v_tenant_id UUID;
BEGIN
  SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
  IF v_tenant_id IS NOT NULL THEN
    UPDATE company_settings SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
    UPDATE customers SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
    UPDATE invoices SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
    -- invoice_items tenant_id defaults to invoice tenant_id
    UPDATE invoice_items ii
    SET tenant_id = i.tenant_id
    FROM invoices i
    WHERE ii.tenant_id IS NULL AND ii.invoice_id = i.id;
  END IF;
END $$;

-- Ensure invoice_items.tenant_id stays consistent with invoices
CREATE OR REPLACE FUNCTION sync_invoice_items_tenant_id()
RETURNS trigger AS $$
BEGIN
  NEW.tenant_id := (SELECT tenant_id FROM invoices WHERE id = NEW.invoice_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_invoice_items_tenant ON invoice_items;
CREATE TRIGGER trg_sync_invoice_items_tenant
BEFORE INSERT OR UPDATE OF invoice_items
FOR EACH ROW
EXECUTE FUNCTION sync_invoice_items_tenant_id();

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Single-company mode:
-- Enable RLS but allow all authenticated admins to access shared tables without tenant/user scoping.

-- RLS policies (single-company)

-- company_settings: allow authenticated users to read/write the single shared row
CREATE POLICY "company_settings: single-company all access" ON company_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- customers: allow authenticated users to create/read/update/delete customers
CREATE POLICY "customers: single-company all access" ON customers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- invoices: allow authenticated users to create/read/update/delete invoices
CREATE POLICY "invoices: single-company all access" ON invoices
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- invoice_items: allow authenticated users to create/read/update/delete invoice items
CREATE POLICY "invoice_items: single-company all access" ON invoice_items
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);


-- 6. REMINDERS TABLE (in-app reminders for pending invoices)

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- For now: allow authenticated users; in real SaaS tenant isolation we will scope these policies.
CREATE POLICY "Allow all access for authenticated users" ON reminders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_reminders_read_at ON reminders(read_at);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);

- -   M i g r a t i o n   f o r   S a a S   S u b s c r i p t i o n s  
 - -   1 .   C r e a t e   s u b s c r i p t i o n _ r e q u e s t s   t a b l e   f o r   m a n u a l   U P I   p a y m e n t s  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   s u b s c r i p t i o n _ r e q u e s t s   (  
     i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( ) ,  
     c o m p a n y _ i d   U U I D   N O T   N U L L   R E F E R E N C E S   c o m p a n i e s ( i d )   O N   D E L E T E   C A S C A D E ,  
     u s e r _ i d   U U I D   N O T   N U L L   R E F E R E N C E S   a u t h . u s e r s ( i d )   O N   D E L E T E   C A S C A D E ,  
     p l a n   T E X T   N O T   N U L L ,  
     a m o u n t   N U M E R I C   N O T   N U L L ,  
     p a y m e n t _ m e t h o d   T E X T   N O T   N U L L ,  
     u t r _ n u m b e r   T E X T ,  
     s c r e e n s h o t _ u r l   T E X T ,  
     s t a t u s   T E X T   N O T   N U L L   D E F A U L T   ' p e n d i n g ' ,  
     c r e a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( ) ,  
     u p d a t e d _ a t   T I M E S T A M P T Z   D E F A U L T   N O W ( )  
 ) ;  
  
 - -   E n a b l e   R L S  
 A L T E R   T A B L E   s u b s c r i p t i o n _ r e q u e s t s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   P o l i c i e s  
 C R E A T E   P O L I C Y   " U s e r s   c a n   i n s e r t   t h e i r   o w n   r e q u e s t s "  
     O N   s u b s c r i p t i o n _ r e q u e s t s   F O R   I N S E R T  
     W I T H   C H E C K   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
  
 C R E A T E   P O L I C Y   " U s e r s   c a n   v i e w   t h e i r   o w n   r e q u e s t s "  
     O N   s u b s c r i p t i o n _ r e q u e s t s   F O R   S E L E C T  
     U S I N G   ( a u t h . u i d ( )   =   u s e r _ i d ) ;  
  
 C R E A T E   P O L I C Y   " S e r v i c e   r o l e   c a n   m a n a g e   a l l   r e q u e s t s "  
     O N   s u b s c r i p t i o n _ r e q u e s t s   F O R   A L L  
     U S I N G   ( t r u e )  
     W I T H   C H E C K   ( t r u e ) ;  
  
 - -   2 .   A d d   p l a n   a n d   s u b s c r i p t i o n   d e t a i l s   t o   c o m p a n y _ s e t t i n g s   i f   n o t   e x i s t s  
 A L T E R   T A B L E   c o m p a n y _ s e t t i n g s    
 A D D   C O L U M N   I F   N O T   E X I S T S   p l a n   T E X T   D E F A U L T   ' f r e e ' ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   s u b s c r i p t i o n _ s t a t u s   T E X T   D E F A U L T   ' a c t i v e ' ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   s u b s c r i p t i o n _ e x p i r y   T I M E S T A M P T Z ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   r a z o r p a y _ c u s t o m e r _ i d   T E X T ;  
  
 - -   3 .   C r e a t e   S t o r a g e   b u c k e t   f o r   p a y m e n t   p r o o f s  
 I N S E R T   I N T O   s t o r a g e . b u c k e t s   ( i d ,   n a m e ,   p u b l i c )    
 V A L U E S   ( ' p a y m e n t _ p r o o f s ' ,   ' p a y m e n t _ p r o o f s ' ,   f a l s e )  
 O N   C O N F L I C T   ( i d )   D O   N O T H I N G ;  
  
 - -   S t o r a g e   P o l i c i e s   f o r   p a y m e n t _ p r o o f s  
 C R E A T E   P O L I C Y   " U s e r s   c a n   u p l o a d   t h e i r   o w n   p r o o f s "  
     O N   s t o r a g e . o b j e c t s   F O R   I N S E R T  
     W I T H   C H E C K   ( b u c k e t _ i d   =   ' p a y m e n t _ p r o o f s '   A N D   a u t h . u i d ( )   =   o w n e r ) ;  
  
 C R E A T E   P O L I C Y   " S e r v i c e   r o l e   c a n   m a n a g e   p r o o f s "  
     O N   s t o r a g e . o b j e c t s   F O R   A L L  
     U S I N G   ( b u c k e t _ i d   =   ' p a y m e n t _ p r o o f s ' )  
     W I T H   C H E C K   ( b u c k e t _ i d   =   ' p a y m e n t _ p r o o f s ' ) ;  
 