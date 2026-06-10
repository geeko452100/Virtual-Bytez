# Virtual Bytez

A full-stack vintage tech storefront with **user-customizable product options**, powered by **React + Vite** on the frontend and **Supabase** on the backend.

Browse restored classics — Commodore 64, Macintosh SE, Walkman, Game Boy, Model M — configure finishes, mods, and extras with live pricing, save builds, and place orders.

## Features

| Area | What's included |
|------|-----------------|
| **Shop** | Category filters, product images, condition grades (1–10), stock status |
| **Customization** | Select, checkbox, and text (engraving) options with live price updates |
| **Cart & checkout** | Persistent cart UI, Supabase order creation with line items |
| **Auth** | Email/password sign-up and sign-in via Supabase Auth |
| **Saved builds** | Logged-in users save and reload custom configurations |
| **Admin** | Manage catalog, stock, order statuses, and shipment tracking (admin role required) |
| **Routing** | Shareable URLs — `/shop`, `/shop/c64`, `/checkout`, `/account`, `/admin` |

Without Supabase credentials the app falls back to the local seed catalog; auth, checkout, and saved builds require a configured backend.

## Quick start

### 1. Install and run the frontend

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order (or use `npm run migrate` with `DATABASE_URL` set):
   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_fix_admin_rls_recursion.sql
   supabase/migrations/003_add_order_tracking.sql
   ```
3. In **Project Settings → API**, copy the **Project URL** and **anon public** key into `.env`:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

4. Seed the product catalog (pick one):
   - **Admin UI:** sign up, promote yourself to admin (step 5), open `/admin` → **Upload seed catalog**
   - **CLI:** `npm run seed` (uses `SUPABASE_SERVICE_ROLE_KEY` from `.env` if set)

5. **Promote your account to admin** (SQL Editor):

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com';
   ```

6. Enable **Email** auth under **Authentication → Providers** (enabled by default).

Restart `npm run dev` after changing `.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run seed` | Upload local catalog to Supabase |

## Project structure

```
├── supabase/migrations/     # Database schema + RLS policies
├── scripts/seed-catalog.mjs # CLI seed helper
├── src/
│   ├── api/                 # Supabase queries (products, orders, tracking, saved builds)
│   ├── context/             # Auth, products, cart providers
│   ├── hooks/
│   ├── lib/                 # Supabase client, config, mappers
│   ├── data/products.js     # Local seed catalog (offline fallback)
│   ├── components/
│   └── pages/
└── .env.example
```

## Database schema

| Table | Purpose |
|-------|---------|
| `profiles` | User metadata + `customer` / `admin` role |
| `products` | Catalog, customization JSON, images, stock, condition grade |
| `saved_builds` | User-named configuration snapshots |
| `orders` | Checkout records with shipping address, carrier, tracking number, and cached shipment status |
| `order_items` | Line items with selections and pricing |

Row Level Security is enabled on all tables. Products are publicly readable when `active = true`; admins have full catalog access.

## Customization model

Each product stores a `customization_options` JSON array:

| Type | Purpose |
|------|---------|
| `select` | Single choice (finish, RAM tier, etc.) |
| `checkbox` | Multiple add-ons |
| `text` | Optional engraving — charged when non-empty |

Each choice may include `priceModifier` (USD). Logic lives in `src/utils/pricing.js`.

## Checkout & payment

Virtual Bytez uses an **invoice-after-review** flow — common for custom and restoration shops where builds are verified before billing.

1. User signs in and adds customized items to the cart.
2. `/checkout` collects a shipping address and submits the order.
3. An `orders` row and related `order_items` are created with status **`pending`**.
4. The shop reviews the configuration (admin marks **`paid`** once payment is received via invoice, wire, etc.).
5. Admin moves the order through **`processing`** → **`shipped`** with a tracking number.

No card data is collected in the app. Payment happens outside the storefront (email invoice, bank transfer, or POS). The order status workflow reflects that handoff.

## Admin panel

At `/admin` (admin role only):

- Create, edit, and delete products
- Edit customization options as JSON
- Upload the seed catalog in one click
- View all orders and update status
- Enter a carrier + tracking number and mark orders shipped (simulated tracking timeline for portfolio demos)

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | For backend features | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | For backend features | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | For `npm run seed` only — never expose in frontend |
| `DATABASE_URL` | Optional | Postgres URI for `npm run migrate` |

## Deploy to Cloudflare Pages

The frontend is a static Vite build. Supabase stays your backend — Cloudflare only hosts the React app.

### 1. Connect the repo

1. Push to GitHub.
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select this repository and use these build settings:

| Setting | Value |
|---------|--------|
| Root directory | `/` (repo root) |
| Build command | `npm run build` |
| Build output directory | `dist` |

4. Add environment variables for **Production** (same as local `.env`):

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

5. Set **Node.js version** — add variable `NODE_VERSION` = `20` if the build fails.

6. Deploy. Your site will be at `https://<project-name>.pages.dev`.

Client-side routing is handled by `public/_redirects` (copied into `dist/` on build).

### 2. Configure Supabase auth

In **Supabase → Authentication → URL Configuration**, set:

- **Site URL:** `https://<project-name>.pages.dev`
- **Redirect URLs:** `https://<project-name>.pages.dev/**`

Update these again if you add a custom domain on Cloudflare.

### 3. Post-deploy checklist

- Home page loads
- Refresh on `/shop/c64` and `/account` works (no 404)
- Sign in / sign up works
- Checkout creates an order
- Admin panel works for your admin account

### CLI deploy (optional)

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=virtual-bytez
```

Set `VITE_SUPABASE_*` in your shell before `npm run build`, or use dashboard env vars with Git-connected deploys instead.

**Do not** put `SUPABASE_SERVICE_ROLE_KEY` in Cloudflare — use it locally only for `npm run seed` and `npm run migrate`.

## Next steps

- Automated invoice emails on new orders (Supabase triggers + Resend/SendGrid)
- Upload product photos to the `product-images` storage bucket
- Email notifications on new orders (Supabase triggers + Resend/SendGrid)
- Load saved build selections from URL query params

## License

Private project — see repository owner for terms.
