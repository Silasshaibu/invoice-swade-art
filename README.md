# Invoice — swade-art.com

A professional invoicing platform with a **Next.js web app** (Vercel + Neon) and an **Electron desktop app** — both sync in real-time through the shared API.

## Stack

| Layer | Technology |
|-------|-----------|
| Web framework | Next.js 16 (App Router) |
| Deployment | Vercel |
| Database | Neon (PostgreSQL) |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Desktop | Electron 33 + Vite + React 19 |
| Charts | Recharts |
| Styles | Tailwind CSS v4 |

## Features

- **Dashboard** — revenue stats, outstanding/overdue amounts, monthly revenue chart
- **Invoices** — create, edit, filter by status, record payments, auto-mark overdue
- **Clients** — full CRUD with company, email, phone, address, tax ID
- **Reports** — bar chart + pie chart breakdown
- **PDF** — browser-printable invoice template via `/api/invoices/[id]/pdf`
- **Settings** — business profile (company name, address, default currency)
- **Sync** — Electron and web both call the same Vercel API → same Neon DB

## Setup — Web App

```bash
cd invoice.swade-art.com
npm install

# Create .env.local
DATABASE_URL=postgresql://...@....neon.tech/invoicedb?sslmode=require
JWT_SECRET=your-long-random-secret

npm run dev        # http://localhost:3000
npm run build      # production build
```

Deploy to Vercel: connect the `invoice.swade-art.com/` folder as the project root, add the two env vars in Vercel dashboard.

## Setup — Electron App

```bash
cd invoice.swade-art.com/electron-app
npm install

# Dev mode (points to localhost:3000 — start web app first)
npm run dev

# Dev mode against production API
VITE_API_URL=https://invoice.swade-art.com npm run dev:electron

# Build distributable
npm run dist
```

The `.env` file controls which API the Electron app calls:
- `.env.development` → `http://localhost:3000` (dev)
- `.env` → `https://invoice.swade-art.com` (production)

## Database

The schema is auto-created on first API call via `initDB()`. No migration tool needed.

Tables: `users`, `clients`, `invoices`, `invoice_items`, `payments`, `token_blocklist`

Default admin: `admin@invoice.swade-art.com` / `password123` (change immediately).
