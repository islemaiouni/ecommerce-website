# SULTAN - Algerian Men's Perfume Store

A production-oriented Next.js 15 storefront and admin dashboard for a men's perfume brand operating in Algeria.

## Features

- Luxury French/Arabic RTL storefront
- Mobile sticky order button
- 58 Algerian wilayas
- Home and bureau delivery types
- Cash-on-delivery orders
- Server-side price, shipping, stock, phone, and anti-spam validation
- Supabase authentication and Row Level Security
- Realtime admin order table
- Order status events and CSV export
- Mock delivery provider for local development
- Supabase migration and seed files
- Domain unit tests with Vitest

## Stack

- Next.js 15, App Router, React 19, TypeScript
- Tailwind CSS v4
- Supabase (Postgres, Auth, Realtime)
- Zod
- Framer Motion
- TanStack Query
- React Hook Form
- Vitest

## Requirements

- Windows 10/11
- Node.js 20 or newer
- npm
- A Supabase account

To verify Node.js and npm:

```powershell
node --version
npm --version
```

## 1. Clone and install

```powershell
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
```

If the project is already downloaded, open PowerShell in the project folder and run:

```powershell
cd C:\Users\is\Desktop\ecommerce-website
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and set:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_DEFAULT_LOCALE=fr
```

Optional environment variables:

```dotenv
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
SHIPPING_MOCK_PROVIDER=true
YALIDINE_API_KEY=
YALIDINE_API_TOKEN=
ZR_EXPRESS_API_KEY=
ECOTRACK_API_KEY=
```

Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.

## 3. Create the Supabase database

1. Create a project in [Supabase](https://supabase.com/).
2. Open **SQL Editor**.
3. Run the migration files in this order:
   - `supabase/migrations/202611190001_phase1_schema.sql`
   - `supabase/migrations/202611190002_stock_and_profile.sql`
4. Run `supabase/seed.sql`.

The migration creates products, variants, wilayas, communes, shipping rates, orders, order items, status events, delivery providers, admin profiles, RLS policies, Realtime publication, and atomic stock reservation.

## 4. Create the first admin

1. Open **Authentication > Users** in Supabase.
2. Create a user.
3. Copy the user's UUID.
4. Run this in Supabase SQL Editor:

```sql
insert into public.admin_profiles (id, role, full_name)
values ('USER_UUID_HERE', 'admin', 'Owner');
```

The supported roles are:

- `admin`: full administration
- `agent`: order operations

## 5. Run locally

Development server:

```powershell
npm run dev
```

Open:

- Storefront: http://127.0.0.1:3000
- Admin login: http://127.0.0.1:3000/admin/login
- Orders dashboard: http://127.0.0.1:3000/admin
- KPI dashboard: http://127.0.0.1:3000/admin/dashboard
- README page: http://127.0.0.1:3000/readme

Use `Ctrl+C` in PowerShell to stop the server.

## 6. Verify the project

Run unit tests:

```powershell
npm test
```

Run lint:

```powershell
npm run lint
```

Create a production build:

```powershell
npm run build
```

Run the production build locally:

```powershell
npm start
```

## 7. Push to GitHub

Initialize and create a repository if needed:

```powershell
git init
git add .
git commit -m "feat: add SULTAN ecommerce storefront and admin"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If the repository already has commits:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git add .
git commit -m "feat: update storefront and admin"
git push -u origin main
```

Confirm secrets are excluded before pushing:

```powershell
git status
git check-ignore .env.local
```

## 8. Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository at [Vercel](https://vercel.com/new).
3. Choose the repository root.
4. Add the environment variables from `.env.example`.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
6. Deploy.

Keep `SUPABASE_SERVICE_ROLE_KEY` as a server-only environment variable.

## 9. Delivery providers

The default `MockProvider` allows the shipment flow to work locally.

Production providers must implement `DeliveryProvider` in `src/features/delivery/providers/types.ts`.

See [docs/delivery-providers.md](docs/delivery-providers.md) for the integration contract.

Official Yalidine, ZR Express, and Ecotrack API fields must be verified against each provider's current official API documentation before production use.

## Project structure

```text
src/
  app/
  components/ui/
  domain/
  features/
  infrastructure/
  lib/
supabase/
  migrations/
  seed.sql
docs/
```

## Troubleshooting

### Port 3000 is already in use

```powershell
npm run dev -- --port 3001
```

### Supabase connection error

- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Confirm migrations and seed SQL were executed.
- Restart `npm run dev` after changing `.env.local`.

### Admin login cannot access the dashboard

- Confirm the auth user exists.
- Confirm the matching UUID exists in `public.admin_profiles`.
- Confirm the role is `admin` or `agent`.
