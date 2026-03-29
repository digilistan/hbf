# HBF Foods — Online Ordering Platform

## Overview

Full-stack online ordering website for **Haq Bahoo Foods (HBF)**, a fast-food restaurant in Lahore, Pakistan. Built as a pnpm monorepo with React + Vite frontend, Express + MongoDB backend, and a generated OpenAPI client.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: Custom JWT (customer + admin, single `JWT_SECRET`)
- **API codegen**: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- **Frontend**: React + Vite (Tailwind CSS, shadcn/ui, Framer Motion, Zustand, React Query)
- **Build**: esbuild (for API server)

## Structure

```text
├── artifacts/
│   ├── api-server/         # Express API server (port 8080, proxied via /api)
│   └── hbf-web/            # React + Vite customer-facing + admin site (port 20227, root /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks + TypeScript types
│   └── api-zod/            # Generated Zod schemas from OpenAPI
```

## Key Features

### Customer Side
- Menu browsing by category with **food photos** (Unsplash CDN), Best Seller + Spicy badges
- **Size variants**: Pizzas (Small 7"/Medium 10"/Large 14"), Fries (Small/Medium/Large), Wings (6/12 pcs), Rolls (Single/Double)
- Shopping cart (Zustand, persisted to `localStorage` key `hbf_cart`)
- Customer signup/login, order history at `/account/orders`
- WhatsApp order confirmation with pre-filled full order details
- "Powered by Digilistan" credit in footer

### Admin Side (at `/admin/login`)
- Manage orders with status updates (NEW → IN_KITCHEN → OUT_FOR_DELIVERY → COMPLETED/CANCELLED)
- Manage menu items with image URL support
- Manage categories
- View customer list

## Environment Variables Required

| Variable | Where Used |
|---|---|
| `MONGO_URI` | API server DB connection |
| `JWT_SECRET` | Customer + Admin JWT signing |
| `ADMIN_EMAIL` | Seeded admin account email |
| `ADMIN_PASSWORD` | Seeded admin account password |
| `VITE_WHATSAPP_NUMBER` | Frontend WhatsApp redirect button (format: 923XXXXXXXXX) |

## Development

```bash
# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend
pnpm --filter @workspace/hbf-web run dev

# Re-seed database (wipes + recreates all items)
pnpm --filter @workspace/api-server run seed

# Re-run OpenAPI codegen after editing lib/api-spec/openapi.yaml
pnpm --filter @workspace/api-spec run codegen
```

## Auth Design

- **Admin token**: `{ id, email, role: "admin" }` — stored in Zustand + localStorage key `hbf_auth`
- **Customer token**: `{ id, email, name }` — stored in Zustand + localStorage key `hbf_auth`
- Guest checkout: email is optional; orders placed without a JWT are stored anonymously (no customerId)
- To view order history, customers must register via `/account` and log in

## API Routing

Requests to `/api/*` are proxied by Replit from the frontend's path to `localhost:8080/api/*`.

## Seeded Data

7 categories, 35+ menu items with Unsplash photo URLs:
- **Burgers**: 4 items
- **Pizzas**: 6 items (3 size variants × 2 pizza types + 1 bonus)
- **Fries & Sides**: 7 items (3 size variants × 2 fry types + coleslaw)
- **Wings & Chicken**: 5 items (6-pc and 12-pc variants)
- **Rolls & Sandwiches**: 4 items
- **BBQ & Special**: 3 items
- **Drinks**: 5 items

## Credits

Built by [Digilistan](https://digilistan.com)
