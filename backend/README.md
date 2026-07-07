# Xivora Backend Service

Production-ready backend API service for Xivora Invoice Studio.

## Project Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required Supabase and WhatsApp credentials:
   ```bash
   cp .env.example .env
   ```

3. **Development Mode**:
   Run the local Express server with hot-reload:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   Compile the TypeScript code:
   ```bash
   npm run build
   ```

5. **Start Production Server**:
   Start the compiled Node.js application:
   ```bash
   npm start
   ```

## Environment Variables

- `PORT`: Service port (defaults to `5000` or `8000`).
- `SUPABASE_URL`: Supabase Project API URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret service-role key for backend queries bypassing RLS.
- `WHATSAPP_ACCESS_TOKEN`: Meta WhatsApp Cloud API access token.
- `WHATSAPP_PHONE_NUMBER_ID`: Meta WhatsApp sender phone ID.
