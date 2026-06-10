# Virtual Bytez

A vintage tech storefront with **user-customizable product options** — **React + Vite** frontend backed entirely by **Supabase** (Auth, Postgres, RLS, and Storage).

Browse restored classics — Commodore 64, Macintosh SE, Walkman, Game Boy, Model M — configure finishes, mods, and extras with live pricing, save builds, and place orders.

## Features

| Area | What's included |
|------|-----------------|
| **Shop** | Category filters, product images, condition grades (1–10), stock status |
| **Customization** | Select, checkbox, and text (engraving) options with live price updates |
| **Cart & checkout** | Persistent cart UI, order creation with line items via Supabase |
| **Auth** | Email/password sign-up and sign-in via Supabase Auth |
| **Saved builds** | Logged-in users save and reload custom configurations |
| **Admin** | Manage catalog, stock, order statuses, and shipment tracking (admin role required) |
| **Routing** | Shareable URLs — `/shop`, `/shop/c64`, `/checkout`, `/account`, `/admin` |

Without Supabase credentials the app falls back to the local seed catalog; auth, checkout, and saved builds require a configured Supabase project.

## Quick start

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the **Project URL** and **anon public** key into `.env`:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

3. Run database migrations (see below).
4. Seed the catalog via **Admin UI** → **Upload seed catalog** (after promoting your account to admin).
5. Promote your account to admin (SQL Editor):

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

### 2. Run migrations

Add your database connection string to `.env` (Supabase Dashboard → Project Settings → Database → URI), then:

```bash
npm install
cp .env.example .env   # add Supabase credentials + DATABASE_URL
npm run migrate
```

Alternatively, paste the SQL files from `supabase/migrations/` into the Supabase SQL Editor in order.

### 3. Start the frontend

```bash
npm run dev            # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run migrate` | Apply Supabase SQL migrations |
| `npm run download-images` | Download product image assets |

## Project structure

```
├── src/
│   ├── api/                 # Supabase data access (products, orders, builds, tracking)
│   ├── context/             # Auth, products, cart providers
│   ├── hooks/
│   ├── lib/                 # Supabase client, config, validation
│   ├── data/products.js     # Local seed catalog (offline fallback)
│   ├── components/
│   └── pages/
├── supabase/migrations/     # Postgres schema, RLS policies, triggers
└── .env.example
```

## Architecture

```
Browser (React)
  └─ Supabase JS client
        ├─ Auth (sign-in / sign-up / session)
        ├─ Postgres + RLS (products, orders, saved builds, profiles)
        └─ Storage (product images bucket)
```

All catalog, checkout, admin, and tracking operations talk directly to Supabase. Row Level Security enforces customer vs admin access; no separate Express API is required.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | For auth + data | Supabase project URL (browser) |
| `VITE_SUPABASE_ANON_KEY` | For auth + data | Supabase anon key (browser) |
| `DATABASE_URL` | For migrations only | Postgres connection string (`npm run migrate`) |

## Deploy to Cloudflare Pages

The frontend is a static Vite build. Point it at your Supabase project with the env vars above.

### Build settings

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Build output directory | `dist` |

### Production env vars

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Configure Supabase auth redirect URLs to match your Pages domain.

## License

Private project — see repository owner for terms.
