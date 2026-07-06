# Architecture Overview

This application is built as a single-page application (SPA) with a multi-tenant client-side database layer connecting to a Supabase backend database.

## System Architecture

```
                       +-------------------------+
                       |       Client Browser     |
                       +------------+------------+
                                    |
                                    v (React UI Router)
                       +------------+------------+
                       |      Page Routing       |
                       | (Dashboard, Invoices,  |
                       | Settings, Customers)    |
                       +------------+------------+
                                    |
                                    v (Tenant Isolation Scoping Hook)
                       +------------+------------+
                       |      Tenant Context     |
                       | (resolves active member)|
                       +------------+------------+
                                    |
                                    v (Unified Database Service)
                       +------------+------------+
                       |     dbService client    |
                       +------------+------------+
                                    |
                    +---------------+---------------+
                    | (PostgREST / JSON RPC API)    | (Supabase Auth Client)
                    v                               v
         +----------+----------+         +----------+----------+
         | Supabase PostgreSQL |         |  Supabase Auth      |
         +---------------------+         +---------------------+
```

## Core Layers

1. **Frontend Layer (React + TSX + Vite):**
   - Core router and layout states.
   - Dynamic settings hydration using hooks.
   - Fully client-side PDF invoice rendering utilizing jsPDF canvas rendering.
2. **Scoping Layer (Tenant Context & Hook):**
   - `TenantContext` evaluates and validates the logged-in Supabase session.
   - Resolves the matching `company_id` membership records.
3. **Database Client Layer (`db.ts`):**
   - Centralizes connections and transparently intercepts queries to append `company_id` scopes.
4. **Backend Layer (Supabase):**
   - User database schemas, triggers, constraints, RLS policies, and background scheduler edge functions.
