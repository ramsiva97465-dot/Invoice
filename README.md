# Xivora Invoice Studio — Monorepo

A production-ready SaaS Invoice Studio built with React + Vite (frontend) and Node.js + Express + TypeScript (backend).

---

## 📁 Project Structure

```
Invoice/
├── frontend/                 # React + Vite + TypeScript (Vercel)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── context/          # React context (tenant, auth)
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # Supabase + communication layer
│   │   └── styles/           # Global CSS
│   ├── public/               # Static assets (logo, favicon)
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                  # Node.js + Express + TypeScript (Render)
│   ├── src/
│   │   ├── app.ts            # Express app setup
│   │   ├── server.ts         # HTTP server entry point
│   │   ├── config/env.ts     # Environment config
│   │   ├── middleware/       # Error handler, auth guards
│   │   ├── routes/           # API route definitions
│   │   ├── controllers/      # Route controllers
│   │   ├── services/         # Business logic
│   │   └── utils/            # Logger, async handler
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── shared/                   # Shared TypeScript types
├── docs/                     # Architecture & deployment docs
├── vercel.json               # Vercel deployment config (frontend)
├── render.yaml               # Render deployment config (backend)
├── package.json              # Monorepo root scripts
└── README.md
```

---

## 🚀 Quick Start

### 1. Install all dependencies

```bash
# From repository root
npm install --prefix frontend
npm install --prefix backend
```

### 2. Configure environment variables

Frontend — copy and fill in values:
```bash
cp frontend/.env.example frontend/.env
```

Backend — copy and fill in values:
```bash
cp backend/.env.example backend/.env
```

### 3. Run in development

```bash
# Run frontend only (Vite dev server on :5173)
npm run dev:frontend

# Run backend only (tsx watch on :8000)
npm run dev:backend

# Run both in parallel (requires npm-run-all)
npm install                   # installs root devDependencies
npm run dev
```

---

## 🏗️ Build for Production

```bash
# Build frontend → frontend/dist/
npm run build:frontend

# Build backend → backend/dist/
npm run build:backend

# Build both
npm run build
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Import the repository in [Vercel](https://vercel.com).
2. **Root Directory**: leave as `/` (vercel.json handles routing).
3. **Build Command**: `npm run build --prefix frontend`
4. **Output Directory**: `frontend/dist`
5. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect this repository and set **Root Directory** to `backend`.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. Add the required environment variables (see `backend/.env.example`).

---

## 🔌 Backend API Endpoints

| Method | Path      | Description         |
|--------|-----------|---------------------|
| GET    | `/`       | Service info        |
| GET    | `/health` | Health check        |

Future endpoints (WhatsApp, Email, AI) will be added under `/api/v1/`.

---

## 🧩 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS |
| Backend  | Node.js, Express 4, TypeScript      |
| Database | Supabase (PostgreSQL + RLS)         |
| Auth     | Supabase Auth                       |
| Deploy   | Vercel (frontend), Render (backend) |
