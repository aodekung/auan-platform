
# Settings Module — Implementation Plan

## Overview
Settings Module สำหรับ Auan-Auan-Platform — key-value store, 6 categories, 12 admin endpoints, 2 public endpoints, file upload, audit logging via existing `AuditLog` model.

---

## Step 1: Prisma Schema Changes

**File:** `apps/api/prisma/schema.prisma`

เพิ่ม `category` field + index ใน Setting model:
```prisma
model Setting {
  id          String   @id @default(uuid())
  key         String   @unique
  value       String
  category    String                    // NEW: "store" | "business_hours" | "payment" | "delivery" | "notification" | "system"
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])                   // NEW
  @@map("settings")
}
```

จากนั้น generate migration.

---

## Step 2: Environment Configuration

**File:** `apps/api/src/config/env.ts`

เพิ่ม:
- `UPLOAD_PATH` — path to store uploaded files (default: `./uploads`)
- `UPLOAD_MAX_SIZE` — max file size in bytes (default: 5242880 = 5MB)
- `ALLOWED_IMAGE_MIMETYPES` — allowed MIME types for uploads

---

## Step 3: Install Dependencies

```bash
pnpm --filter @auan/api add @fastify/multipart
```

---

## Step 4: Error Codes

**File:** `apps/api/src/common/errors.ts`

เพิ่มใน `ErrorCode` enum:
- `SETTING_NOT_FOUND`
- `INVALID_SETTING_VALUE`
- `SETTING_KEY_REQUIRED`
- `INVALID_FILE_TYPE`
- `FILE_TOO_LARGE`
- `SETTING_DELETE_FORBIDDEN`

---

## Step 5: AuditLogRepository

**New File:** `apps/api/src/database/repositories/audit-log.repository.ts`

Repository สำหรับเขียน audit log — reusable สำหรับทุก module:
```typescript
class AuditLogRepository {
  async log(data: { action, entityType, entityId, actorId, actorName, details })
}
```

เพิ่ม barrel export ใน `src/database/repositories/index.ts`

---

## Step 6: SettingRepository

**New File:** `apps/api/src/database/repositories/setting.repository.ts`

Methods:
- `findByKey(key: string)` — get single setting
- `findByCategory(category: string)` — get all settings in category
- `findAll()` — get all settings
- `upsert(key, value, category, description)` — create or update (idempotent)
- `upsertMany(entries[])` — batch update (transactional)
- `exists(key: string)` — check existence

เพิ่ม barrel export

---

## Step 7: Settings Constants & Types

**New File:** `apps/api/src/modules/settings/settings.constants.ts`

Setting keys organized by category:
```typescript
export const SETTING_KEYS = {
  STORE: {
    NAME: "store.name",
    LOGO: "store.logo",
    DESCRIPTION: "store.description",
    PHONE: "store.phone",
    ADDRESS: "store.address",
    STATUS: "store.status",
  },
  BUSINESS_HOURS: {
    // Per-day schedule: "business_hours.monday.open", "business_hours.monday.close"
    // Temporary closure: "business_hours.temporary_closure.enabled"
    // Holiday schedule (future ready)
  },
  PAYMENT: {
    PROMPTPAY_NUMBER: "payment.promptpay_number",
    ACCOUNT_NAME: "payment.account_name",
    PROMPTPAY_QR: "payment.promptpay_qr",
    TIMEOUT: "payment.timeout",
  },
  DELIVERY: {
    AREAS: "delivery.areas",           // JSON array
    BUILDINGS: "delivery.buildings",   // JSON array
    FEE: "delivery.fee",
    MIN_ORDER: "delivery.min_order",
    ESTIMATED_TIME: "delivery.estimated_time",
    PICKUP_ENABLED: "delivery.pickup_enabled",
    DELIVERY_ENABLED: "delivery.enabled",
  },
  NOTIFICATION: {
    ENABLED: "notification.enabled",
    LINE_ENABLED: "notification.line_enabled",
    EMAIL_ENABLED: "notification.email_enabled",
    SMS_ENABLED: "notification.sms_enabled",
    PUSH_ENABLED: "notification.push_enabled",
  },
  SYSTEM: {
    LANGUAGE: "system.language",
    TIMEZONE: "system.timezone",
    CURRENCY: "system.currency",
    DATE_FORMAT: "system.date_format",
    MAINTENANCE_MODE: "system.maintenance_mode",
    APP_VERSION: "system.app_version",
  },
} as const

export const SETTING_CATEGORIES = ["store", "business_hours", "payment", "delivery", "notification", "system"] as const
export type SettingCategory = (typeof SETTING_CATEGORIES)[number]
```

**New File:** `apps/api/src/modules/settings/settings.types.ts`

Response DTOs ตาม category — structured objects ไม่ใช่ raw key-value:
```typescript
interface StoreSettingsResponse { name, logo, description, phone, address, status, isOpen }
interface BusinessHoursResponse { schedule: DaySchedule[], isTemporarilyClosed }
interface PaymentSettingsResponse { promptpayNumber, accountName, promptpayQr, timeout }
// ... etc ตามแต่ละ category
```

---

## Step 8: Validation Schemas (Zod)

**New File:** `apps/api/src/modules/settings/settings.schema.ts`

Zod schemas สำหรับแต่ละ category update:
- `updateStoreSettingsSchema` — name (min 1, max 100), phone (Thai mobile regex), etc.
- `updateBusinessHoursSchema` — per-day open/close (HH:mm format), temporary closure
- `updatePaymentSettingsSchema` — promptpay number (10 digits), timeout (seconds), etc.
- `updateDeliverySettingsSchema` — fee (integer >= 0), min order, estimated time, boolean flags
- `updateNotificationSettingsSchema` — boolean flags
- `updateSystemSettingsSchema` — language, timezone (IANA), currency, date format, maintenance mode
- `uploadImageSchema` — MIME validation
- Route schemas สำหรับ Fastify (Swagger docs)

---

## Step 9: Settings Service

**New File:** `apps/api/src/modules/settings/settings.service.ts`

Business logic:
- `getAllSettings()` — return all settings as structured object
- `getSettingsByCategory(category)` — return category as structured DTO
- `getPublicStoreSettings()` — store info for public (name, logo, phone, address, status, isOpen)
- `getPublicBusinessHours()` — business hours for public
- `updateStoreSettings(data, userId)` — update store settings + audit log
- `updateBusinessHours(data, userId)` — update business hours + audit log
- `updatePaymentSettings(data, userId)` — update payment settings + audit log
- `updateDeliverySettings(data, userId)` — update delivery settings + audit log
- `updateNotificationSettings(data, userId)` — update notification settings + audit log
- `updateSystemSettings(data, userId)` — update system settings + audit log
- `resetToDefaults(category)` — reset category to seed defaults
- `uploadStoreLogo(file, userId)` — validate + save file + update setting
- `uploadPromptPayQr(file, userId)` — validate + save file + update setting
- Helper: `parseValue(key, value)` — parse string to correct type (boolean, number, JSON)
- Helper: `serializeValue(key, value)` — serialize value back to string for DB

**ใช้ in-memory cache** ด้วย Map + TTL (เพราะ settings อ่านบ่อย เขียนนาน):
```typescript
const cache = new Map<string, { value: unknown; expiry: number }>()
const CACHE_TTL_MS = 60_000 // 1 minute
```
ทุกครั้งที่ update settings = clear cache สำหรับ category นั้น

---

## Step 10: Settings Controller

**New File:** `apps/api/src/modules/settings/settings.controller.ts`

Handlers:
- `getAllSettingsHandler` — GET /admin/settings
- `updateAllSettingsHandler` — PUT /admin/settings (updates all categories at once)
- `getStoreSettingsHandler` — GET /admin/settings/store
- `updateStoreSettingsHandler` — PUT /admin/settings/store
- `getBusinessHoursHandler` — GET /admin/settings/business-hours
- `updateBusinessHoursHandler` — PUT /admin/settings/business-hours
- `getPaymentSettingsHandler` — GET /admin/settings/payment
- `updatePaymentSettingsHandler` — PUT /admin/settings/payment
- `getDeliverySettingsHandler` — GET /admin/settings/delivery
- `updateDeliverySettingsHandler` — PUT /admin/settings/delivery
- `getNotificationSettingsHandler` — GET /admin/settings/notifications
- `updateNotificationSettingsHandler` — PUT /admin/settings/notifications
- `getSystemSettingsHandler` — GET /admin/settings/system
- `updateSystemSettingsHandler` — PUT /admin/settings/system
- `resetSettingsHandler` — POST /admin/settings/reset (reset to defaults)
- `uploadStoreLogoHandler` — POST /admin/settings/store/logo
- `uploadPromptPayQrHandler` — POST /admin/settings/payment/qrcode
- `getPublicStoreHandler` — GET /settings/store
- `getPublicBusinessHoursHandler` — GET /settings/business-hours

---

## Step 11: Settings Routes

**New File:** `apps/api/src/modules/settings/settings.routes.ts`

Route registration:
- Public (no auth): GET /api/v1/settings/store, GET /api/v1/settings/business-hours
- Admin (authenticate + authorize OWNER): All /api/v1/admin/settings/* endpoints
- File upload endpoints ใช้ `preHandler: [authenticate, authorize("OWNER")]`

---

## Step 12: Module Registration

**File:** `apps/api/src/modules/settings/index.ts`

Barrel export: `settingsRoutes`

**File:** `apps/api/src/server.ts`

Import + register `settingsRoutes` ใน bootstrap

**File:** `apps/api/src/plugins/swagger.ts`

เพิ่ม tag `"Settings"` ใน tags array

---

## Step 13: Seed Default Settings

**File:** `apps/api/prisma/seed.ts` (หรือสร้าง settings seed function)

Default values ตาม business rules:
- Store: name = "Auan Auan Mala Tod", phone, address, status = "open"
- Business hours: 15:00-22:30 every day (Mon-Sun)
- Payment: PromptPay number, timeout = 300 seconds
- Delivery: fee = 0, min order = 0, enabled = true, pickup = false
- Notification: enabled = true, LINE = true, email/sms/push = false
- System: language = "th", timezone = "Asia/Bangkok", currency = "THB"

---

## Step 14: Verify

- `pnpm --filter @auan/api type-check`
- `pnpm --filter @auan/api lint`
- `pnpm --filter @auan/api build`

---

## Files Summary

| # | Action | File |
|---|--------|------|
| 1 | Modify | `apps/api/prisma/schema.prisma` |
| 2 | Modify | `apps/api/src/config/env.ts` |
| 3 | Install | `@fastify/multipart` dependency |
| 4 | Modify | `apps/api/src/common/errors.ts` |
| 5 | Create | `apps/api/src/database/repositories/audit-log.repository.ts` |
| 6 | Modify | `apps/api/src/database/repositories/index.ts` |
| 7 | Create | `apps/api/src/database/repositories/setting.repository.ts` |
| 8 | Create | `apps/api/src/modules/settings/settings.constants.ts` |
| 9 | Create | `apps/api/src/modules/settings/settings.types.ts` |
| 10 | Create | `apps/api/src/modules/settings/settings.schema.ts` |
| 11 | Create | `apps/api/src/modules/settings/settings.service.ts` |
| 12 | Create | `apps/api/src/modules/settings/settings.controller.ts` |
| 13 | Create | `apps/api/src/modules/settings/settings.routes.ts` |
| 14 | Create | `apps/api/src/modules/settings/index.ts` |
| 15 | Modify | `apps/api/src/server.ts` |
| 16 | Modify | `apps/api/src/plugins/swagger.ts` |

Total: 8 new files, 8 modified files

---

## API Endpoints (16 total)

### Public (2)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/settings/store | Store info (name, logo, phone, address, isOpen) |
| GET | /api/v1/settings/business-hours | Business hours schedule |

### Admin (14)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/admin/settings | All settings (all categories) |
| PUT | /api/v1/admin/settings | Update all settings |
| GET | /api/v1/admin/settings/store | Store settings |
| PUT | /api/v1/admin/settings/store | Update store settings |
| POST | /api/v1/admin/settings/store/logo | Upload store logo |
| GET | /api/v1/admin/settings/business-hours | Business hours |
| PUT | /api/v1/admin/settings/business-hours | Update business hours |
| GET | /api/v1/admin/settings/payment | Payment settings |
| PUT | /api/v1/admin/settings/payment | Update payment settings |
| POST | /api/v1/admin/settings/payment/qrcode | Upload PromptPay QR |
| GET | /api/v1/admin/settings/delivery | Delivery settings |
| PUT | /api/v1/admin/settings/delivery | Update delivery settings |
| GET | /api/v1/admin/settings/notifications | Notification settings |
| PUT | /api/v1/admin/settings/notifications | Update notification settings |
| GET | /api/v1/admin/settings/system | System settings |
| PUT | /api/v1/admin/settings/system | Update system settings |
| POST | /api/v1/admin/settings/reset | Reset to defaults |
