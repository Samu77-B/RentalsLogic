# RentalsLogic

Dual-portal property management platform for landlords and tenants — inventories, inspections, meter readings, e-signatures, maintenance, and UK compliance certificates.

## Features

### Landlord portal
- Property, room, and inventory management with photo uploads
- Tenant invites and lease tracking
- Gas, electric, and water meter readings
- Inspection reports (inventory, check-in, interim, check-out) with side-by-side comparison
- Document upload and e-signatures
- Certificate tracking with expiry alerts
- Maintenance request triage
- Stripe subscription tiers (Basic / Premium / Enterprise)

### Tenant portal
- Review inspection reports, add comments and photos
- Approve or dispute and e-sign reports
- Submit maintenance requests
- Sign documents
- Submit meter readings

### Platform
- Clerk authentication with landlord/tenant roles
- PostgreSQL + Prisma
- Vercel Blob file storage
- PWA with offline caching
- Resend email notifications

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Configure required services:
   - `DATABASE_URL` — PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — [Clerk](https://clerk.com)
   - `BLOB_READ_WRITE_TOKEN` — [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
   - `STRIPE_*` — Stripe products/prices for subscription tiers
   - `RESEND_API_KEY` — optional, emails log to console without it

3. Install and migrate:

```bash
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
├── app/
│   ├── dashboard/     # Landlord portal
│   ├── tenant/        # Tenant portal
│   ├── reports/       # Shared report view / PDF export
│   └── api/           # REST API routes
├── components/
├── lib/
└── config/
prisma/schema.prisma
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client and build |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |
