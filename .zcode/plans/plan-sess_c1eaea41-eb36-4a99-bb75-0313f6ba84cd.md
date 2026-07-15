
# Plan: LINE Platform Full Integration (Messaging API, Rich Menu, Share, Deep Link + Backend Hardening)

## สรุปงานทั้งหมด

งานแบ่งเป็น **4 กลุ่ม** คือ Backend New Modules (3), Backend Hardening (3), Frontend Enhancements (2), และ Config Updates (2)

---

## กลุ่ม 1: Backend — LINE Messaging API Module

### สิ่งที่สร้างใหม่ (7 ไฟล์)

| # | ไฟล์ | หน้าที่ |
|---|------|--------|
| 1 | `apps/api/src/lib/line-messaging.ts` | LINE Messaging API client — push message, multicast, broadcast (pure fetch, ไม่ต้อง npm package) |
| 2 | `apps/api/src/modules/line-webhook/line-webhook.types.ts` | Types สำหรับ webhook events, request/response DTOs |
| 3 | `apps/api/src/modules/line-webhook/line-webhook.schema.ts` | Zod validation สำหรับ webhook routes |
| 4 | `apps/api/src/modules/line-webhook/line-webhook.service.ts` | Webhook event processing: verify signature, dispatch events ตาม type |
| 5 | `apps/api/src/modules/line-webhook/line-webhook.controller.ts` | HTTP handlers สำหรับ webhook endpoints |
| 6 | `apps/api/src/modules/line-webhook/line-webhook.routes.ts` | Route registration: POST /webhooks/line |
| 7 | `apps/api/src/modules/line-webhook/index.ts` | Barrel export |

### Webhook Endpoints

| Method | Path | Auth | หน้าที่ |
|--------|------|------|---------|
| POST | `/api/v1/webhooks/line` | LINE Signature verification | รับ events: message, follow, unfollow, postback |

### LINE Messaging Functions (ใน `lib/line-messaging.ts`)

- `pushMessage(lineUserId, text)` — ส่งข้อความถึงคนเดียว
- `multicast(lineUserIds, text)` — ส่งถึงหลายคน
- `broadcast(text)` — ส่งถึงทุกคนที่เป็น friend
- `verifyWebhookSignature(body, signature)` — verify X-Line-Signature header

### Integration กับ Notification System

เชื่อม LINE Messaging เข้ากับ notification service ที่มีอยู่แล้ว:
- เพิ่ม `sendLineMessage(lineUserId, text)` ใน notification dispatch flow
- เมื่อ `processQueue()` ส่ง LINE channel notification → เรียก LINE Messaging API จริง (ตอนนี้เก็บแค่ DB record)

---

## กลุ่ม 2: Backend — Rich Menu Module

### สิ่งที่สร้างใหม่ (6 ไฟล์)

| # | ไฟล์ | หน้าที่ |
|---|------|--------|
| 8 | `apps/api/src/lib/line-rich-menu.ts` | LINE Rich Menu API client — create, delete, set default |
| 9 | `apps/api/src/modules/rich-menu/rich-menu.types.ts` | Rich menu configuration DTOs |
| 10 | `apps/api/src/modules/rich-menu/rich-menu.schema.ts` | Zod validation |
| 11 | `apps/api/src/modules/rich-menu/rich-menu.service.ts` | Rich menu management: upload, deploy, sync with settings |
| 12 | `apps/api/src/modules/rich-menu/rich-menu.controller.ts` | HTTP handlers |
| 13 | `apps/api/src/modules/rich-menu/rich-menu.routes.ts` | Route registration |

### Rich Menu Endpoints (Owner only)

| Method | Path | Auth | หน้าที่ |
|--------|------|------|---------|
| POST | `/api/v1/admin/rich-menu/deploy` | Owner | สร้างและตั้ง rich menu ผ่าน LINE API |
| GET | `/api/v1/admin/rich-menu/list` | Owner | ดู rich menu ที่ลงทะเบียนไว้ |

### LINE Rich Menu Functions (ใน `lib/line-rich-menu.ts`)

- `createRichMenu(menuConfig)` — สร้าง rich menu บน LINE
- `uploadRichMenuImage(richMenuId, imagePath)` — อัพรูป
- `setDefaultRichMenu(richMenuId)` — set เป็น default
- `deleteRichMenu(richMenuId)` — ลบ
- `listRichMenus()` — ดูรายการ

### Default Rich Menu Config

สร้าง default config พร้อม deploy แรกครั้ง:
- Home → เปิด LIFF
- เมนู → เปิด LIFF?path=/menu
- ออเดอร์ → เปิด LIFF?path=/orders
- โปรไฟล์ → เปิด LIFF?path=/profile

---

## กลุ่ม 3: Backend — Deep Link Handler + LIFF URL Helper

### สิ่งที่สร้าง/แก้ไข

| # | ไฟล์ | การเปลี่ยนแปลง |
|---|------|----------------|
| 14 | `apps/api/src/modules/line-webhook/line-webhook.service.ts` | เพิ่ม postback event handler (deep link routing) |

### Deep Link Flow

```
LINE Chat → ลิงก์ "มาสั่งหม่าล่าทอด" → LIFF URL: liff.line.me/{ID}/product/abc123
→ Customer เปิด → LIFF init → getLiffContext().path → "/product/abc123"
→ React Router จับ path → แสดง Product Detail Page
```

Deep link routing ทำ **ฝั่ง frontend เท่านั้น** — อ่าน `liff.getContext().path` แล้ว redirect
ฝั่ง backend ไม่ต้องเพิ่ม route ใหม่

---

## กลุ่ม 4: Backend Hardening

### สิ่งที่แก้ไข (5 ไฟล์)

| # | ไฟล์ | การเปลี่ยนแปลง |
|---|------|----------------|
| 15 | `apps/api/src/config/env.ts` | เพิ่ม env vars: `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` (แยกจาก LINE_CHANNEL_ACCESS_TOKEN ที่มีอยู่แล้ว), `LINE_WEBHOOK_PATH`, `FRONTEND_URL` |
| 16 | `apps/api/src/plugins/cors.ts` | ใช้ `FRONTEND_URL` env var สำหรับ production origins แทน hardcode |
| 17 | `apps/api/src/plugins/rate-limit.ts` | เพิ่ม specific rate limit สำหรับ `/auth/line` (10 req/min) แยกจาก global rate limit |
| 18 | `apps/api/src/server.ts` | Register `lineWebhookRoutes` และ `richMenuRoutes` |
| 19 | `.env.example` | เพิ่ม env vars ใหม่ทั้งหมด |

### Env Vars ใหม่

```env
# LINE Messaging API (ส่ง push messages)
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=your-messaging-token

# LINE Webhook
LINE_WEBHOOK_PATH=/api/v1/webhooks/line

# Frontend URL (สำหรับ CORS production)
FRONTEND_URL=https://your-domain.com
```

**หมายเหตุ:** `LINE_CHANNEL_ACCESS_TOKEN` ที่มีอยู่แล้วใน env.ts เป็น optional — จะเพิ่ม `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` เป็น optional เพิ่มเติมสำหรับ messaging (แยก concern) หรือจะใช้ตัวเดียวกันก็ได้

---

## กลุ่ม 5: Frontend — Share + Deep Link

### สิ่งที่แก้ไข/สร้าง (3 ไฟล์)

| # | ไฟล์ | การเปลี่ยนแปลง |
|---|------|----------------|
| 20 | `apps/customer/src/lib/liff.ts` | เพิ่ม `shareToLine()`, `shareProduct()`, `shareStore()`, `sharePromotion()` |
| 21 | `apps/customer/src/pages/login-page.tsx` | แก้ `loginMutation.isPending` → `silentLogin is in progress` state (bug fix: silentLogin ไม่ใช้ mutation) |
| 22 | `apps/customer/src/App.tsx` | เพิ่ม deep link routing: อ่าน `liff.getContext().path` ตอน mount แล้ว navigate |

### LINE Share Functions

```ts
shareToLine({ text, url? })        → liff.shareTargetPicker()
shareProduct(productId, name)       → สร้าง share message + LIFF URL
shareStore()                        → แชร์หน้าร้าน
sharePromotion(title, description?) → แชร์โปรโมชัน
```

### Deep Link Routing

ใน `App.tsx`:
```ts
const liffPath = getLiffContext()?.path
useEffect(() => {
  if (liffPath && liffPath !== "/") {
    navigate(liffPath, { replace: true })
  }
}, [liffPath])
```

---

## ไฟล์ทั้งหมดสรุป

| ประเภท | จำนวน | รายละเอียด |
|--------|------|-----------|
| สร้างใหม่ (backend) | 13 ไฟล์ | lib/ 2 ไฟล์, modules/line-webhook/ 5 ไฟล์, modules/rich-menu/ 6 ไฟล์ |
| แก้ไข (backend) | 4 ไฟล์ | env.ts, cors.ts, rate-limit.ts, server.ts |
| แก้ไข (frontend) | 3 ไฟล์ | liff.ts, App.tsx, login-page.tsx |
| แก้ไข (config) | 1 ไฟล์ | .env.example |
| **รวม** | **21 ไฟล์** | |

---

## สิ่งที่ **ไม่ทำ**

| รายการ | เหตุผล |
|--------|---------|
| เปลี่ยน Prisma schema | ไม่ต้องเพิ่ม model ใหม่ — notification/webhook ใช้ model ที่มีอยู่ |
| เปลี่ยน notification module ที่มีอยู่ | เชื่อมผ่าน lib/line-messaging.ts เท่านั้น, ไม่แก้ notification.service.ts โดยตรงใน phase นี้ |
| Production deployment | Spec ห้าม |
| เพิ่ม LIFF package ใหม่ | `@line/liff` ติดตั้งแล้วตอนที่แล้ว |
