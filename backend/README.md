# Xivora Backend

Node.js + Express + TypeScript REST API for Xivora Invoice Studio.

## Setup

```bash
npm install
cp .env.example .env   # fill in values
```

## Development

```bash
npm run dev            # tsx watch — hot reload on port 8000
```

## Build & Start (Production)

```bash
npm run build          # tsc → dist/
npm start              # node dist/server.js
```

## Environment Variables

| Variable                    | Description                         |
|-----------------------------|-------------------------------------|
| `PORT`                      | HTTP port (default: 8000)           |
| `SUPABASE_URL`              | Supabase project URL                |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key           |
| `WHATSAPP_ACCESS_TOKEN`     | WhatsApp Cloud API token (future)   |
| `WHATSAPP_PHONE_NUMBER_ID`  | WhatsApp phone number ID (future)   |

## Health Check

```
GET /health
→ { "status": "healthy", "timestamp": "..." }
```

## Deployment (Render)

- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
