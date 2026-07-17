# AGENTS.md — Auan-Auan Platform

> AI coding agent reference. Code is source of truth — this doc captures only context that doesn't exist in code.

## Project Overview

**Auan-Auan Mala Tod** — Thai mala (northeastern snack) food ordering platform. LINE OA + LIFF for customers, web admin dashboard for staff. Single store, single condo delivery.

**Stack:** pnpm monorepo + Turborepo, Fastify (Node), PostgreSQL + Prisma, React 19 + Vite 6, TanStack Query 5, Zustand 5, Tailwind CSS v4, CVA (class-variance-authority), Radix UI primitives.

## Monorepo Structure

```
apps/customer/    — LINE LIFF customer app (port 5173)
apps/admin/      — Staff admin dashboard (port 5174, Phase 1 scaffold)
apps/api/         — Fastify REST API (port 3000, prefix /api/v1)
packages/types/   — @auan/types — shared TypeScript types (single source of truth)
packages/ui/      — @auan/ui — shared cn() utility
packages/tsconfig/ — @auan/tsconfig — base + react JSON configs
packages/eslint-config/ — @auan/eslint-config
packages/utils/   — EMPTY (referenced in root tsconfig but does not exist yet)
packages/tailwind-config/ — EMPTY (referenced in root tsconfig but does not exist yet)
```

**Key scripts (root):** `pnpm dev`, `pnpm build`, `pnpm type-check`, `pnpm db:migrate`, `pnpm db:studio`

## Architecture Decisions

- **moduleResolution: "bundler"** in all tsconfig — requires `auan-types.d.ts` ambient declarations in each app for workspace package resolution (no project references)
- **API envelope:** `{ success: true, data: T, message?: string }`, paginated: `{ success, data: T[], pagination: { page, pageSize, totalItems, totalPages } }`
- **Decimal fields from API are strings** — e.g. `price: "150.00"`, `subtotal: "300.00"` (Prisma Decimal→JSON serialization)
- **No shadcn/ui** — uses CVA + Radix primitives directly (docs incorrectly reference shadcn)
- **Font:** Noto Sans Thai (not Inter)
- **Customer JWT** uses `@fastify/jwt` / **Staff JWT** uses `jsonwebtoken` directly (separate secrets)
- **Refresh tokens are opaque** (128-char hex, SHA-256 hashed in DB) — NOT JWTs
- **LINE SDK:** `@line/liff` for customer auth; LINE Messaging API is pure fetch (no npm dependency)
- **Slip upload:** base64 body parsed server-side with magic-byte detection (not multipart for slips); product images use multipart
- **Token refresh coalescing:** api-client.ts uses singleton `isRefreshing` + `refreshPromise` to prevent parallel refresh calls

## Business Rules (NOT in code)

| Rule | Value |
|------|-------|
| Operating hours | 15:00–22:30 daily (configurable via settings) |
| Delivery area | Regent Home Bangson, Phase 27 & 28, Buildings A–D only |
| Delivery fee | Free (THB 0) |
| Min order | None |
| Payment method | PromptPay QR only |
| Payment timeout | 300s (5 min, configurable via `payment.timeout` setting) |
| Payment verification | Manual by owner (not automatic) |
| Store name | Auan Auan Mala Tod |
| Currency | THB |
| Timezone | Asia/Bangkok |

## Order Status State Machine

```
PENDING → AWAITING_PAYMENT → AWAITING_VERIFICATION → PAID → QUEUED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED → COMPLETED
  │            │                      │                 │
  └→ CANCELLED └→ EXPIRED             ├→ PAYMENT_REJECTED └→ CANCELLED
               └→ CANCELLED           └→ EXPIRED
                                     └→ CANCELLED
```

**Customer-cancellable:** PENDING, AWAITING_PAYMENT, AWAITING_VERIFICATION, PAID
**Terminal states:** COMPLETED, CANCELLED, EXPIRED, PAYMENT_REJECTED

## Order Number Format

`ORD-YYYYMMDD-NNNNNN` — counter resets daily, generated from last order of the day.

## Auth Architecture

### Customer/LINE Auth
- Login: LIFF ID Token → `POST /auth/line` → access token (JWT, 24h) + refresh token (opaque, 30d)
- Owner detection: `OWNER_LINE_USER_IDS` env var (comma-separated LINE User IDs)
- Customer model has NO role field — role computed at runtime
- Token delivery: Bearer header, cookie, or both (`AUTH_TOKEN_SOURCE` env)

### Staff Auth
- Login: email+password → `POST /auth/staff/login` → access token (JWT, 8h, separate `STAFF_JWT_SECRET`) + session token (opaque, 30d)
- Admin localStorage keys prefixed with `admin_` (e.g. `admin_access_token`)
- Staff roles: OWNER, ADMINISTRATOR, MANAGER, KITCHEN, STAFF (hierarchy in `@auan/types`)
- Role hierarchy prevents promotion to equal/higher role

### Middleware
- `authenticate` — customer JWT (Bearer or cookie)
- `authenticateStaff` — staff JWT (Bearer only)
- `authenticateOrStaff` — tries customer first, falls back to staff
- `authorize(roles)` — customer role check
- `authorizeStaff(roles)` — staff role check
- `authorizeOwnerOrAdmin(staffRoles)` — allows LINE OWNER or staff with specified roles

## Database (Prisma, PostgreSQL)

- **23 models**, **2 enums** (ProductStatus only; OrderStatus/PaymentStatus are strings for flexibility)
- **18 repositories** with generic BaseRepository<T>
- Key models: Customer, Staff, Product, Category, Cart, CartItem, Order, OrderItem, Payment, Notification, Setting, AuditLog, StaffSession, RefreshToken
- Soft deletes: Staff (`deletedAt`), Notification (`deletedAt`)
- Cascade deletes: CartItem→Cart, Favorite→Customer/Product
- Cart merge: SHA-256 hash of sorted JSON selectedOptions → `optionsHash` unique constraint `[cartId, productId, optionsHash]`

## API Route Summary

**Public:** health, products list/detail/options, settings/store & business-hours, LINE webhook, uploads
**Customer auth:** auth/line, auth/refresh, auth/logout, auth/me, orders CRUD, payments, cart CRUD, addresses CRUD, notifications CRUD, favorites CRUD
**Owner-only:** order status update, payment verify/reject, product CRUD, option CRUD
**Admin (Owner+Staff ADMIN):** dashboard stats, customer list, staff CRUD, order list/status, payment list/verify/reject, product/option/category CRUD, settings CRUD, audit logs
**Owner-only admin:** notifications broadcast, rich-menu deploy

## Shared Types (`packages/types/src/index.ts`)

Single source of truth for: ORDER_STATUS (13 values), PAYMENT_STATUS (7), NOTIFICATION_STATUS/TYPE/CHANNEL, PRODUCT_STATUS, STAFF_ROLE, STAFF_ROLE_HIERARCHY, AUDIT_ACTION, all API response interfaces (30+), request interfaces, and admin-specific types.

## Coding Conventions

- **Imports order:** Node → external libs → @auan/* → relative
- **File naming:** kebab-case files, PascalCase component exports
- **Component max:** 300 lines, **Hook max:** 200 lines
- **No `any`** — use `unknown`
- **Business logic in hooks/services** — never in JSX
- **API calls via TanStack Query hooks** — never raw fetch from components
- **Barrel exports:** every directory has `index.ts`
- **Thai UI text:** all user-facing strings in Thai
- **Error messages from API** displayed to user directly

## Admin App (Phase 1 — Scaffold)

- Same patterns as customer: React Context auth, TanStack Query, Zustand, CVA components
- Dashboard: 6 stat cards, 3 revenue cards, popular products, auto-refresh 30s
- Sidebar: 11 nav items, only Dashboard active (rest disabled for future phases)
- Protected/Public route guards

## Deployment

- **Production:** Docker + Nginx (Dockerfile, docker-compose, nginx.conf in `apps/api/`)
- **Alternative:** Vercel (frontends) + Render (API) + Neon (DB)
- **Vercel build:** `pnpm vercel:build` — builds both frontends, merges with `scripts/merge-vercel-dist.mjs`
- **Uploads:** Local filesystem (`UPLOAD_PATH`, default `./uploads`), served as static files with 24h cache

## Important Gotchas

1. `packages/utils/` and `packages/tailwind-config/` are referenced in root `tsconfig.json` paths but **do not exist** — do not try to import from them
2. Customer app `getUploadUrl()` helper is **duplicated** across 4+ files (not centralized)
3. Product image URLs from API are relative paths (e.g. `/api/v1/uploads/products/uuid.jpg`) — must prepend API base in browser
4. `CartItemResponse.imageUrl` is populated server-side via product join but not in `cart.store.ts` local state
5. `pages/index.ts` barrel does NOT export `FavoritesPage` (imported directly in routes)
6. Admin hooks for orders/payments accept filter objects matching backend query params
