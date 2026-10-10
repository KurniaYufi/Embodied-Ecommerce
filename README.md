# Embodied (Next.js)

Independent React/Next.js rebuild of the Embodied storefront — same look, same flows, own database and own
deployment. This project shares no infrastructure with the original Laravel app: no Supabase, no shared
Postgres, no shared Vercel project.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma ORM + PostgreSQL
- Auth.js (NextAuth v5) with credentials login, role-based access (`admin` / `customer`)
- Uploads (product photos, payment method images, payment proofs): Vercel Blob when deployed, `public/uploads` locally
- Server Actions for all mutations (checkout, reviews, admin CRUD, settings)

## First-time setup

1. **Create a database.** Any Postgres instance works (local, DBeaver-managed, Neon, Supabase, RDS, etc.) —
   just make sure it's a *new* database, not the old project's.
2. **Copy the env file** and fill in your own values:
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — your Postgres connection string
   - `AUTH_SECRET` — any random 32-byte secret (`openssl rand -base64 32`)
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Run migrations**
   ```bash
   npm run db:migrate
   ```
5. **Seed demo data** (categories, sizes, 6 products, payment methods, a customer + an admin user)
   ```bash
   npm run db:seed
   ```
6. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000.

## Seeded accounts

| Role     | Email                          | Password     |
|----------|---------------------------------|--------------|
| Customer | test@example.com                | password     |
| Admin    | admin-emboied@embodied.com      | embodied123  |

(The "emboied" typo in the admin email is intentional — carried over from the original seed data.)

## Project structure

- `src/app/` — storefront pages (`/`, `/collection`, `/product/[slug]`, `/checkout`, `/orders/[token]`,
  `/account/orders`, `/help`), auth pages, `/settings/*`, and the admin area (`/dashboard`, `/seller/*`)
- `src/app/actions/` — Server Actions (checkout, auth, orders, settings, products/categories/payment-methods/transactions CRUD)
- `src/components/` — shared UI; `src/components/admin/` — seller/admin CRUD managers
- `src/contexts/` — client-side cart (`localStorage` key `embodied-cart`) and wishlist state
- `prisma/schema.prisma` — data model mirroring the original app (users, categories, sizes, products,
  orders, order items, payment methods, reviews)
- `prisma/seed.ts` — demo data seeder

## Notes

- Without `BLOB_READ_WRITE_TOKEN`, uploads are stored locally under
  `public/uploads/{products,payment-methods,payment-proofs}` — no external storage needed for development.
- Password reset doesn't send real email; `/forgot-password` generates a token and shows the reset link
  directly on the page (dev-friendly stand-in for an email provider).

## Deploying to Vercel

The Vercel project `embodied-ecommerce` builds from the `main` branch of the GitHub repo. Every build runs
`npm run vercel-build` (`prisma migrate deploy && next build`), so pending migrations are applied automatically.

Required project environment variables:

| Variable                | Source                                                                 |
|-------------------------|------------------------------------------------------------------------|
| `DATABASE_URL`          | Neon integration (Storage → Neon), pooled connection                    |
| `DATABASE_URL_UNPOOLED` | Neon integration, direct connection used by migrations                  |
| `AUTH_SECRET`           | Set manually (`npx auth secret`)                                        |
| `BLOB_READ_WRITE_TOKEN` | Blob store `embodied-ecommerce-blob`, connected to the project          |
| `NEXT_PUBLIC_APP_NAME`  | Set manually (`Embodied`)                                               |

`NEXTAUTH_URL` is not needed on Vercel — Auth.js detects the host automatically.

To seed a fresh production database once, pull the env and run the seeder locally:

```bash
npx vercel env pull .env.production.local --environment=production
npx dotenv-cli -e .env.production.local -- npm run db:seed
```
