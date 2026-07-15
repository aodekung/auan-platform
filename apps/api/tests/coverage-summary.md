# Phase 1: Unit Test — Coverage Summary

> Generated: 2026-07-15
> Test Runner: Vitest v4.1.10
> Coverage Provider: v8

---

## Test Results

| Metric | Value |
|--------|-------|
| **Test Files** | 13 passed, 0 failed |
| **Total Tests** | **226 passed** |
| **Duration** | ~925ms |
| **Statements** | 69.22% |
| **Branches** | 59.70% |
| **Functions** | 75.97% |
| **Lines** | 71.76% |

---

## Coverage Per Module

| Module | Stmts | Branch | Funcs | Lines | Status |
|--------|-------|--------|-------|-------|--------|
| common/errors.ts | 100% | 100% | 100% | 100% | ✅ |
| common/response.ts | 100% | 100% | 100% | 100% | ✅ |
| modules/addresses/addresses.service.ts | 100% | 91.7% | 100% | 100% | ✅ |
| modules/auth/auth.service.ts | 100% | 97.8% | 100% | 100% | ✅ |
| modules/cart/cart.service.ts | 97.5% | 91.7% | 93.3% | 98.7% | ✅ |
| modules/categories/categories.service.ts | 100% | 92.9% | 100% | 100% | ✅ |
| modules/notifications/notification-template.service.ts | 100% | 90% | 100% | 100% | ✅ |
| modules/orders/orders.service.ts | 89.7% | 75.9% | 80% | 91.1% | ✅ |
| modules/payments/payments.service.ts | 66% | 50% | 81.3% | 66.2% | ⚠️ |
| modules/products/products.service.ts | 100% | 76.8% | 100% | 100% | ✅ |
| modules/settings/settings.service.ts | 27.3% | 19.8% | 56.5% | 29.8% | ⚠️ |

---

## Test Cases Summary

| Test File | Tests | Description |
|-----------|-------|-------------|
| common/errors.test.ts | 11 | AppError, notFound, badRequest, unauthorized, forbidden, conflict |
| common/response.test.ts | 7 | successResponse, paginatedResponse, errorResponse |
| modules/cart.helpers.test.ts | 12 | hashOptions, calculateOptionsPrice |
| modules/orders.types.test.ts | 19 | ALLOWED_TRANSITIONS state machine, CANCELLABLE_STATUSES |
| services/addresses.service.test.ts | 11 | CRUD, ownership, default promotion |
| services/auth.service.test.ts | 34 | LINE login, staff login, refresh, logout, role resolution |
| services/cart.service.test.ts | 26 | Add, update, remove, merge, validation, pricing |
| services/categories.service.test.ts | 12 | CRUD, name uniqueness, product link check |
| services/notification-template.service.test.ts | 6 | Template resolution chain, placeholder replacement |
| services/orders.service.test.ts | 38 | Create, list, cancel, status machine, transactions |
| services/payments.service.test.ts | 28 | Create, confirm, verify, reject, lazy expiry |
| services/products.service.test.ts | 14 | CRUD, SKU uniqueness, category validation |
| services/settings.service.test.ts | 8 | Public store settings, cache behavior |

---

## Known Gaps

### Modules NOT yet tested (Phase 2+)
- `modules/admin/` — dashboard, customer, staff, audit services (4 files)
- `modules/line-webhook/` — webhook handler
- `modules/rich-menu/` — rich menu management
- `modules/product-options/` — option group/option CRUD
- `modules/notifications/notification.service.ts` — main notification service

### Auth utilities NOT yet tested (Phase 2+)
- `auth/utils/hash.utils.ts` — hashToken, verifyTokenHash, generateOpaqueToken
- `auth/utils/jwt.utils.ts` — generateAccessToken, verifyAccessToken
- `auth/utils/line.utils.ts` — verifyLineIdToken (HTTP call to LINE API)

### Low coverage modules in Phase 1
- **payments.service.ts** (66%) — `detectImageType()` and `saveSlipImage()` not tested (file system operations)
- **settings.service.ts** (27%) — only getPublicStoreSettings tested; update/reset/upload functions not covered

---

## Files Created

### Test Infrastructure
- `vitest.config.ts` — Vitest configuration with v8 coverage
- `vitest.setup.ts` — Global env var mocking
- `tests/helpers/mocks/prisma.ts` — Mock Prisma Client
- `tests/helpers/factories/` — 7 factory files + index barrel

### Test Files (13)
- `tests/unit/common/errors.test.ts`
- `tests/unit/common/response.test.ts`
- `tests/unit/modules/cart.helpers.test.ts`
- `tests/unit/modules/orders.types.test.ts`
- `tests/unit/services/addresses.service.test.ts`
- `tests/unit/services/auth.service.test.ts`
- `tests/unit/services/cart.service.test.ts`
- `tests/unit/services/categories.service.test.ts`
- `tests/unit/services/notification-template.service.test.ts`
- `tests/unit/services/orders.service.test.ts`
- `tests/unit/services/payments.service.test.ts`
- `tests/unit/services/products.service.test.ts`
- `tests/unit/services/settings.service.test.ts`

### Configuration Changes
- `apps/api/package.json` — Added vitest, @vitest/coverage-v8 deps + test scripts

---

## Remaining Risks

1. **No integration tests yet** — mock-based unit tests verify business logic in isolation but don't test actual DB queries, transaction rollback, or ORM behavior
2. **No E2E tests yet** — complete user flows untested
3. **Settings service low coverage** — update/reset/upload paths need tests before production
4. **Payments slip upload untested** — file system operations (detectImageType, saveSlipImage) need integration testing with actual files
5. **Auth utils untested** — hash and JWT utilities are security-critical and should be tested in Phase 2
