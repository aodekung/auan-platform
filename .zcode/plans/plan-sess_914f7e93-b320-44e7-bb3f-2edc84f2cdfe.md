# Administration Module — Implementation Plan

## Architecture Overview

เพิ่ม Staff Auth system (Email + Password) + Admin backend APIs. ทำตาม pattern ที่มีอยู่ใน codebase ทุกอย่าง.

---

## Step 1: Prisma Schema — เพิ่ม Staff, StaffRole, StaffSession models

**File:** `apps/api/prisma/schema.prisma`

เพิ่ม 3 models:

### Staff (table: `staffs`)
- `id UUID`, `email (unique)`, `passwordHash`, `displayName`, `phoneNumber?`, `avatarUrl?`, `role` (String, default "STAFF"), `isActive` (Boolean, default true), `lastLoginAt?`, `deletedAt?` (soft delete), `createdAt`, `updatedAt`
- Index on: `email`, `role`, `isActive`

### StaffRole (table: `staff_roles`) — enum-like reference
- `id UUID`, `name (unique)`, `description?`, `permissions Json?` (flexible for future), `isActive`, `createdAt`, `updatedAt`
- Seed data: OWNER, ADMINISTRATOR, KITCHEN, STAFF

### StaffSession (table: `staff_sessions`) — สำหรับ track active sessions
- `id UUID`, `staffId (FK)`, `tokenHash (unique)`, `expiresAt`, `ipAddress?`, `userAgent?`, `createdAt`
- Index on: `staffId`, `tokenHash`, `expiresAt`

### Update AuditLog model
- เพิ่ม index `action + createdAt` สำหรับ query audit logs แบบ time-range
- AuditLog repository ยังไม่มี pagination methods — เพิ่ม `findMany()` ที่รองรับ pagination, filter, sort

**Run:** `pnpm --filter @auan/api db:generate`

---

## Step 2: Shared Types — เพิ่ม Staff + Audit types

**File:** `packages/types/src/index.ts`

เพิ่ม:
- `STAFF_ROLE` constant + `StaffRole` type (OWNER, ADMINISTRATOR, MANAGER, KITCHEN, STAFF)
- `STAFF_ROLE_HIERARCHY` — permission level map (สูงกว่า = manage ได้)
- `AUDIT_ACTION` constant + `AuditAction` type

---

## Step 3: Env Config — เพิ่ม staff auth variables

**File:** `apps/api/src/config/env.ts`

เพิ่ม env vars:
- `STAFF_JWT_SECRET` (min 32 chars) — แยก secret จาก customer JWT
- `STAFF_JWT_EXPIRY_HOURS` (default 8h)
- `STAFF_SESSION_EXPIRY_DAYS` (default 30)
- `BCRYPT_SALT_ROUNDS` (default 12)
- `OWNER_EMAIL` — pre-seeded owner email

---

## Step 4: Auth Module — เพิ่ม Staff authentication flow

**Files:** `apps/api/src/modules/auth/`

### 4a. Update `auth.types.ts`
- เพิ่ม `StaffJwtPayload` interface (`userId`, `email`, `role` ใน StaffRole)
- แยกจาก `JwtPayload` ของ LINE auth
- เพิ่ม `StaffLoginRequest`, `StaffLoginResponse`, `CreateStaffRequest`, `UpdateStaffRequest` DTOs

### 4b. Update `auth.middleware.ts`
- เพิ่ม `authenticateStaff()` — verify staff JWT (ใช้ `STAFF_JWT_SECRET` แยก)
- เพิ่ม `authorizeStaff(...roles)` — RBAC สำหรับ staff
- เพิ่ม `authorizeStaffOrOwner()` — ยอมรับทั้ง Owner (LINE JWT) และ Staff (Staff JWT)
- เพิ่ม role hierarchy check: OWNER > ADMIN > KITCHEN > STAFF

### 4c. เพิ่ม `staff-auth.utils.ts`
- `hashPassword(plain: string): Promise<string>` — bcrypt
- `verifyPassword(plain: string, hash: string): Promise<boolean>` — bcrypt compare
- `generateStaffAccessToken()`, `verifyStaffAccessToken()` — ใช้ staff JWT secret
- Staff JWT ใช้ `@fastify/jwt` แยก key ด้วย `app.jwt.sign(payload, { secret: env.STAFF_JWT_SECRET })`

---

## Step 5: Repositories — Staff data access

**Files:** `apps/api/src/database/repositories/`

### `staff.repository.ts`
- `findByEmail(email)`, `findById(id)`, `findAll(options)` (pagination + filter + sort)
- `create(data)`, `update(id, data)`, `softDelete(id)`, `reactivate(id)`
- `countByRole()`, `countActive()`

### `staff-role.repository.ts`
- `findByName(name)`, `findAll()`, `findActive()`

### `staff-session.repository.ts`
- `save(session)`, `findByHash(hash)`, `deleteByHash(hash)`, `deleteAllForStaff(staffId)`, `deleteExpired()`

### Update `audit-log.repository.ts`
- เพิ่ม `findAll(options)` — รองรับ pagination, filter (action, entityType, entityId, actorId), sort, date range
- เพิ่ม `count(options)` — สำหรับ pagination total

### Update `index.ts`
- Export repositories ใหม่ทั้งหมด

---

## Step 6: Admin Module — Dashboard + Customer Management + Staff Management + Audit Log

**Directory:** `apps/api/src/modules/admin/`

### 6a. Dashboard (`admin.dashboard.service.ts`)
- `getDashboardSummary()` — aggregate queries จาก existing models:
  - Today's orders (count by createdAt date)
  - Pending orders (count by orderStatus)
  - Preparing orders
  - Completed orders
  - Cancelled orders
  - Revenue summary (sum total where paymentStatus = PAID, today/this week/this month)
  - Popular products (top 5 by OrderItem quantity)
  - Active customers (count distinct customerId from orders)
- ใช้ existing repositories (Order, Payment, Customer) — ไม่สร้าง repo ใหม่

### 6b. Customer Management (`admin.customer.service.ts`)
- `listCustomers(query)` — pagination, search (name/phone), filter (active/inactive), sort
- `getCustomer(id)` — customer details + order summary (total orders, total spent)
- `getCustomerOrders(id, query)` — order history ของ customer คนนั้น
- `toggleCustomerStatus(id)` — disable/enable customer (soft delete pattern)
- ใช้ `CustomerRepository` + `OrderRepository` (เพิ่ม methods ที่จำเป็น)

### 6c. Staff Management (`admin.staff.service.ts`)
- `listStaff(query)` — pagination, search, filter (role, isActive), sort
- `getStaff(id)` — staff details
- `createStaff(data)` — validate unique email, hash password, create staff + assign role, audit log
- `updateStaff(id, data)` — update profile, change role, audit log
- `toggleStaffStatus(id)` — disable/enable staff, audit log
- `resetStaffPassword(id)` — generate temp password, hash, update, audit log (Future-ready, implement now)
- Business rule: **เฉพาะ OWNER/ADMIN ถึง manage staff**
- Business rule: **ไม่สามารถ disable/ตัวเองเองได้**
- Business rule: **เฉพาะ OWNER ถึง manage ADMIN**

### 6d. Audit Log (`admin.audit.service.ts`)
- `listAuditLogs(query)` — pagination, filter (action, entityType, entityId, actorId), date range, sort
- ใช้ `AuditLogRepository` (ขยายให้รองรับ pagination)

### 6e. Admin Module Files
- `admin.types.ts` — DTOs ทั้งหมด
- `admin.schema.ts` — Zod validation schemas
- `admin.controller.ts` — HTTP handlers
- `admin.routes.ts` — route registration
- `index.ts` — barrel export

---

## Step 7: API Endpoints

### Staff Auth (`auth.routes.ts` — เพิ่มเข้าไปใน auth module)
```
POST /api/v1/auth/staff/login      — Staff login (public)
POST /api/v1/auth/staff/logout     — Staff logout (staff auth)
POST /api/v1/auth/staff/refresh    — Refresh staff token (public)
GET  /api/v1/auth/staff/me          — Current staff profile (staff auth)
```

### Admin APIs (`admin.routes.ts`)
```
GET  /api/v1/admin/dashboard                      — Dashboard summary
GET  /api/v1/admin/customers                      — List customers
GET  /api/v1/admin/customers/:id                  — Customer details
GET  /api/v1/admin/customers/:id/orders           — Customer order history
PATCH /api/v1/admin/customers/:id/status          — Enable/disable customer
GET  /api/v1/admin/staff                          — List staff
POST /api/v1/admin/staff                          — Create staff
GET  /api/v1/admin/staff/:id                      — Staff details
PUT  /api/v1/admin/staff/:id                      — Update staff
PATCH /api/v1/admin/staff/:id/status              — Enable/disable staff
POST /api/v1/admin/staff/:id/reset-password       — Reset password
GET  /api/v1/admin/audit-logs                     — List audit logs
GET  /api/v1/admin/system-activity                 — System activity (alias for audit logs filtered)
```

---

## Step 8: Error Codes — เพิ่ม staff-related errors

**File:** `apps/api/src/common/errors.ts`

เพิ่ม:
- `STAFF_NOT_FOUND`
- `STAFF_ALREADY_EXISTS`
- `STAFF_EMAIL_DUPLICATE`
- `INVALID_STAFF_ROLE`
- `INVALID_CREDENTIALS`
- `STAFF_INACTIVE`
- `CANNOT_MODIFY_SELF`
- `INSUFFICIENT_PRIVILEGE`

---

## Step 9: Register routes in server.ts

**File:** `apps/api/src/server.ts`

- Import + call `await adminRoutes(app)` ใน bootstrap
- Staff auth routes จะถูก register ผ่าน `authRoutes` ที่มีอยู่แล้ว

---

## Step 10: Seed Data — Pre-seed staff roles + owner account

**File:** `apps/api/prisma/seed.ts`

- เพิ่ม seed `StaffRole` records: OWNER, ADMINISTRATOR, KITCHEN, STAFF
- เพิ่ม seed `Staff` record สำหรับ owner (ถ้า `OWNER_EMAIL` env มีค่า)
- Owner password log ออกมาที่ console ใน development เท่านั้น

---

## Step 11: Verify — Build + Type Check + Lint

```bash
pnpm --filter @auan/api db:generate
pnpm --filter @auan/api build
pnpm type-check
pnpm lint
```

แก้ errors จนครบทุกอย่าง ก่อนจบ task.

---

## File Summary (ที่จะสร้าง/แก้ไข)

### แก้ไข (Modify)
| File | Change |
|------|--------|
| `prisma/schema.prisma` | เพิ่ม Staff, StaffRole, StaffSession models |
| `packages/types/src/index.ts` | เพิ่ม StaffRole, AuditAction types |
| `apps/api/src/config/env.ts` | เพิ่ม staff auth env vars |
| `apps/api/src/common/errors.ts` | เพิ่ม staff error codes |
| `apps/api/src/modules/auth/auth.types.ts` | เพิ่ม staff JWT DTOs |
| `apps/api/src/modules/auth/auth.middleware.ts` | เพิ่ม authenticateStaff, authorizeStaff |
| `apps/api/src/modules/auth/auth.routes.ts` | เพิ่ม staff auth endpoints |
| `apps/api/src/modules/auth/auth.service.ts` | เพิ่ม staff login/logout/refresh logic |
| `apps/api/src/modules/auth/index.ts` | export เพิ่ม |
| `apps/api/src/database/repositories/audit-log.repository.ts` | เพิ่ม pagination methods |
| `apps/api/src/database/repositories/customer.repository.ts` | เพิ่ม search/list methods |
| `apps/api/src/database/repositories/index.ts` | export เพิ่ม |
| `apps/api/src/server.ts` | register admin routes |
| `apps/api/prisma/seed.ts` | เพิ่ม staff roles + owner seed |

### สร้าง (New)
| File | Purpose |
|------|---------|
| `apps/api/src/modules/auth/staff-auth.utils.ts` | Staff password hashing, JWT helpers |
| `apps/api/src/database/repositories/staff.repository.ts` | Staff data access |
| `apps/api/src/database/repositories/staff-role.repository.ts` | Staff role data access |
| `apps/api/src/database/repositories/staff-session.repository.ts` | Staff session data access |
| `apps/api/src/modules/admin/index.ts` | Admin module barrel export |
| `apps/api/src/modules/admin/admin.types.ts` | Admin DTOs |
| `apps/api/src/modules/admin/admin.schema.ts` | Zod validation schemas |
| `apps/api/src/modules/admin/admin.controller.ts` | Admin HTTP handlers |
| `apps/api/src/modules/admin/admin.routes.ts` | Admin route registration |
| `apps/api/src/modules/admin/admin.dashboard.service.ts` | Dashboard aggregation |
| `apps/api/src/modules/admin/admin.customer.service.ts` | Customer management |
| `apps/api/src/modules/admin/admin.staff.service.ts` | Staff management |
| `apps/api/src/modules/admin/admin.audit.service.ts` | Audit log queries |

---

## Implementation Order
1. Prisma schema + generate
2. Shared types
3. Env config
4. Error codes
5. Repositories
6. Staff auth utils + auth module updates
7. Admin services
8. Admin schemas + types + controller + routes
9. Server registration
10. Seed data
11. Build verify