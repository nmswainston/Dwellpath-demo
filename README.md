# dwellpath
Dwellpath - Precision residency tracking for modern wealth

## Quick Start

### Demo Mode (Netlify-ready)

This repo is configured to run as a **static SPA** (Vite) with **no backend required**.

- **Local dev**: `npm run dev` (client-only)
- **Build**: `npm run build` outputs to `dist/`
- **Netlify**: `netlify.toml` includes SPA redirects so refresh works on any route

#### Demo Mode flag

Demo mode is controlled via Vite env:

- `VITE_DEMO_MODE=true` → uses in-browser mock data (no `/api` calls)
- `VITE_DEMO_MODE=false` → uses real `/api/...` endpoints (only if you run the optional server)

Copy `.env.example` to `.env` if you want to override defaults.

### Running in Preview Mode (legacy server, no DB)

The app can run locally without a database for preview and development purposes. Simply run:

```bash
npm install
npm run dev
```

The app will automatically detect that no `DATABASE_URL` is set and run in **NO_DB mode**:
- Uses in-memory session storage (sessions cleared on server restart)
- API endpoints return mock/demo data
- Perfect for exploring the UI and features
- No database setup required

The server will start on port 5000 (or the port specified in the `PORT` environment variable).

### Running with Database

To use the full application with data persistence:

1. Set up a PostgreSQL database (e.g., using Neon, Supabase, or local PostgreSQL)
2. Copy `.env.example` to `.env`
3. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
4. Run the database migrations:
   ```bash
   npm run db:push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

See `.env.example` for all available configuration options:
- `DATABASE_URL` - PostgreSQL connection string (optional for preview mode)
- `SESSION_SECRET` - Secret for session encryption (auto-generated in preview mode)
- `OPENAI_API_KEY` - Required for AI features (optional, features will fail gracefully if not set)

### Development Scripts

- `npm run dev` - Start the development server (single server with Vite middleware)
- `npm run dev:client` - Start Vite dev server only (optional)
- `npm run dev:server` - Start Express server only (optional)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run db:push` - Push database schema changes
