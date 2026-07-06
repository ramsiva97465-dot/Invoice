# Invoice Studio Monorepo

Welcome to the Invoice Studio repository, structured for production-grade multi-tenant SaaS development.

## Project Structure

This project follows a clean, decoupled directory structure separating the frontend application, the backend database resources, shared items, and documentation:

```
/
├── frontend/                     # React + TypeScript + Vite SPA client
│   ├── src/                      # Source code (pages, components, context)
│   ├── public/                   # Static public assets
│   ├── test/                     # Frontend test files
│   └── vite.config.ts            # Vite bundle configurations
│
├── backend/                      # Supabase Database configurations
│   ├── migrations/               # Sequential migration SQL files
│   ├── supabase/                 # Edge functions, powershell tests, local setups
│   └── schema.sql                # Original unified schema sql
│
├── shared/                       # Workspace shared code (types, shared functions)
│
├── docs/                         # Project architecture & development manuals
│   ├── Architecture.md           # Application design patterns & layout flow
│   ├── Database.md               # Multi-tenant scoping & constraints schemas
│   ├── SaaS-Roadmap.md           # Deployment roadmap sequence
│   └── Deployment.md             # Vercel & Supabase release manual
│
├── package.json                  # Root Monorepo workspaces manager
├── .gitignore                    # Global git ignore criteria
└── README.md                     # This documentation
```

## Running Commands

All developer commands can be run directly from the repository **root folder**. The root `package.json` will automatically delegate execution to the `frontend/` directory context:

### 1. Install Dependencies
```bash
npm install --prefix frontend
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```
