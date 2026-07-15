
# Phase 1: Unit Test — Backend API

## สรุป Deployment Strategy ที่ตัดสินใจแล้ว
- **Frontend**: Cloudflare Pages (ฟรี)
- **Backend**: Render free tier (ฟรี)
- **Database**: Neon PostgreSQL (0.5GB ฟรี)
- **Images**: Cloudflare R2 (10GB ฟรี)
- **Code changes ที่จำเป็น**: เฉพาะ `node:fs` → R2 API (สำหรับ slip upload)

---

## Step 1: Install Test Dependencies

ติดตั้งใน `apps/api`:
```
vitest @vitest/coverage-v8
```

อัปเดต `apps/api/package.json` เพิ่ม scripts:
- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:coverage": "vitest run --coverage"`

## Step 2: Configure Vitest

สร้าง `apps/api/vitest.config.ts`:
- ใช้ path aliases `@/*` → `./src/*` (ตรงกับ tsconfig)
- ใช้ ESM (`type: "module"`)
- ใช้ environment `node`
- Coverage config: ผ่านทุก file ยกเว้น `server.ts`, `*.routes.ts`, `*.controller.ts`, `prisma/`
- Global setup สำหรับ mock env variables

สร้าง `apps/api/vitest.setup.ts`:
- Mock `process.env` ด้วยค่าที่จำเป็น (DATABASE_URL mock, JWT_SECRET, ฯลฯ)

## Step 3: Create Test Helpers

สร้าง `apps/api/tests/helpers/`:
- `mocks/prisma.ts` — Mock Prisma Client factory พร้อม helper สำหรับ reset mock state
- `mocks/env.ts` — Mock environment config ที่ใช้ใน service
- `factories/` — Test data factories ใช้ `@faker-js/faker` (ติดตั้งแล้ว) สร้าง mock objects:
  - `customer.factory.ts`
  - `product.factory.ts`
  - `cart.factory.ts`
  - `order.factory.ts`
  - `payment.factory.ts`
  - `category.factory.ts`
  - `staff.factory.ts`

## Step 4: Create Test Directory Structure

```
apps/api/tests/
├── helpers/
│   ├── factories/
│   └── mocks/
├── unit/
│   ├── services/
│   │   ├── cart.service.test.ts
│   │   ├── orders.service.test.ts
│   │   ├── payments.service.test.ts
│   │   ├── auth.service.test.ts
│   │   ├── products.service.test.ts
│   │   ├── categories.service.test.ts
│   │   ├── settings.service.test.ts
│   │   ├── addresses.service.test.ts
│   │   └── notification-template.service.test.ts
│   ├── common/
│   │   ├── errors.test.ts
│   │   └── response.test.ts
│   └── modules/
│       ├── auth/
│       │   └── orders.types.test.ts (ALLOWED_TRANSITIONS, CANCELLABLE_STATUSES)
│       └── cart/
│           └── helpers.test.ts (hashOptions, calculateOptionsPrice)
```

## Step 5: Write Unit Tests

### 5.1 Cart Service (สำคัญที่สุด — business logic เยอะ)
- `getCart` — auto-create empty cart, load items with product data
- `addToCart` — validate product exists/active/available, validate options, merge detection (same product+options), unit price calculation (base+options), max quantity 50, create vs merge
- `updateCartItem` — ownership validation, subtotal recalculation
- `removeCartItem` — ownership validation, delete item
- `clearCart` — clear all items, keep cart record
- **Helper tests:** `hashOptions()` deterministic output, `calculateOptionsPrice()` sum correctness

### 5.2 Orders Service (สำคัญมาก — state machine + transaction)
- `createOrder` — validate store open, validate cart not empty, validate products exist/available, price snapshot from DB, order number generation (ORD-YYYYMMDD-XXXXXX), transaction creates order+items+options+history+clear cart
- `listOrders` — pagination, status filter
- `getOrder` — ownership check
- `cancelOrder` — allowed statuses only (PENDING, AWAITING_PAYMENT, AWAITING_VERIFICATION, PAID), transaction creates history
- `updateOrderStatus` — ALLOWED_TRANSITIONS state machine validation, all 12 statuses, each valid transition, invalid transitions throw error, terminal states reject all
- **Type tests:** ALLOWED_TRANSITIONS matrix correctness, CANCELLABLE_STATUSES list

### 5.3 Payments Service
- `createPayment` — validate order exists + ownership, order must be AWAITING_PAYMENT, no duplicate payment, create PENDING payment, fetch PromptPay settings
- `getPaymentByOrderId` — ownership check, lazy timeout expiry (PENDING + expired → EXPIRED)
- `confirmPayment` — PENDING → AWAITING_VERIFICATION, idempotent if already AWAITING_VERIFICATION
- `verifyPayment` — AWAITING_VERIFICATION → PAID, updates order + creates history
- `rejectPayment` — AWAITING_VERIFICATION → REJECTED, updates order + creates history
- **Helper tests:** `detectImageType()` JPEG/PNG/WebP magic bytes, data URL parsing

### 5.4 Auth Service
- `resolveRole` — owner IDs match → OWNER, non-owner → CUSTOMER
- `loginWithLine` — verify LINE token, find/create customer, update profile, generate token pair
- `refreshTokens` — hash + lookup, expired → delete + throw, user deleted → cleanup + throw, rotate old token
- `logout` — specific token vs all tokens
- `getMe` — resolve role dynamically, customer not found → 404
- `loginWithStaff` — find by email, disabled → throw, password verify, generate access + session tokens
- `refreshStaffToken` — session rotation, expired → delete + throw
- `staffLogout` — specific session vs all sessions
- `getStaffMe` — staff not found → 404
- **Utils tests:** `hashToken()` + `verifyTokenHash()`, `generateAccessToken()` + `verifyAccessToken()`, `generateOpaqueToken()` uniqueness

### 5.5 Products & Categories Service
- Products: getAllProducts (active only, filters), getProductById, createProduct (validate category, SKU uniqueness), updateProduct, deleteProduct (soft disable)
- Categories: getAllCategories, createCategory (name uniqueness, case-insensitive), deleteCategory (reject if products linked)

### 5.6 Settings Service
- `getPublicStoreSettings` — computed `isOpen` field
- `getPaymentTimeout` — parse setting, default 300
- Cache behavior — 60s TTL

### 5.7 Addresses Service
- `createAddress` — first address auto-default, isDefault=true unsets others (transaction)
- `deleteAddress` — deleted was default → promote oldest (transaction)
- `setDefaultAddress` — unset all, set target (transaction)

### 5.8 Notification Template Service
- `renderTemplate` — template resolution chain (DB by type+channel → DB by type → hardcoded default → fallback), placeholder replacement

### 5.9 Common — Error & Response
- `AppError` construction, `serialize()`, status codes
- `successResponse()`, `paginatedResponse()`, `errorResponse()` format
- Helper functions: `notFound()`, `badRequest()`, `unauthorized()`, `forbidden()`, `conflict()`

## Step 6: Run Tests & Fix Defects

1. วิ่ง `pnpm --filter @auan/api test` ดูผล
2. แก้ defects ที่พบ (ถ้ามี)
3. วิ่ง `pnpm --filter @auan/api test:coverage` ดู coverage
4. ยืนยันว่า business logic และ API services ผ่านทั้งหมด

## Step 7: Generate Coverage Report

สร้าง `apps/api/tests/coverage-summary.md` รายงาน:
- Coverage per service (statements, branches, functions, lines)
- สรุป test cases ที่เขียนแล้ว
- Known gaps (ถ้ามี)
- Files modified/created

---

## ขอบเขตที่จะทำ
✅ Unit tests สำหรับ backend services ทั้งหมด
✅ Test infrastructure (vitest config, helpers, factories)
✅ Mock Prisma Client
✅ Coverage report

## ขอบเขตที่จะยังไม่ทำ
❌ Integration tests (Phase 2)
❌ E2E tests (Phase 3)
❌ Performance tests (ข้ามไปก่อนจนมี production)
❌ Frontend tests
❌ Deployment config (เรื่อง Render/Neon/R2)
❌ Refactor node:fs → R2 (ทำอีก phase หนึ่ง)
