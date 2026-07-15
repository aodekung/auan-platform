# คู่มือ Deploy Vercel + Render + Neon

> วิธี Deploy Auan-Auan Platform ด้วยบริการฟรี 3 ตัว
> Vercel (Frontend) + Render (Backend) + Neon (Database)

---

## ภาพรวม — ระบบทำงานยังไง?

```
ลูกค้าเปิด LINE → เห็นเมนูอ้วนอ้วน → สั่งอาหาร → จ่ายเงิน

ฝั่งระบบ (แยก 3 บริการ):
  ┌──────────────────────────────────────────────────────┐
  │  Vercel (ฟรี)                                        │
  │  ├── https://auan-auan.vercel.app          ← ลูกค้า   │
  │  └── https://auan-auan.vercel.app/admin     ← แอดมิน  │
  └──────────────────────────────────────────────────────┘
              │  API Request (fetch)
              ▼
  ┌──────────────────────────────────────────────────────┐
  │  Render (ฟรี)                                        │
  │  └── https://auan-api.onrender.com/api/v1  ← Backend  │
  └──────────────────────────────────────────────────────┘
              │  Query
              ▼
  ┌──────────────────────────────────────────────────────┐
  │  Neon (ฟรี)                                          │
  │  └── PostgreSQL Serverless               ← ฐานข้อมูล │
  └──────────────────────────────────────────────────────┘
```

---

## ข้อจำกัดของ Free Tier

| บริการ | ฟรี | ข้อจำกัด |
|-------|------|---------|
| **Vercel** | ✅ ตลอด | 100GB bandwidth/เดือน, ไม่ spin-down |
| **Render** | ✅ 750 ชม./เดือน | **Spin-down หลัง 15 นาที** ไม่มี traffic → request แรกช้า ~30-50s |
| **Neon** | ✅ 0.5GB | Auto-suspend หลัง 5 นาที → query แรกช้า ~5s |

> **หมายเหตุ:** Render spin-down หมายความว่าถ้าไม่มีคนใช้ 15 นาที เซิร์ฟเวอร์จะหลับ และ request แรกจะช้า
> แต่พอใช้แล้วจะตื่นขึ้นมาทำงานปกติทันที — ใช้งานได้ แค่ช้าตอนแรก

---

## ขั้นตอนที่ 1: สร้าง Neon Database (ฐานข้อมูล)

### 1.1 สมัคร Neon

1. ไปที่ [neon.tech](https://neon.tech) → **Sign Up**
2. ใช้ GitHub หรือ Google login

### 1.2 สร้าง Project

1. กด **Create Project**
2. Project name: `auan-platform`
3. Region: **Singapore** (ใกล้ไทยที่สุด)
4. กด **Create Project**

### 1.3 คัดลอก Connection String

1. หลังสร้างเสร็จ จะเห็นหน้า Dashboard
2. ในส่วน **Connection Details** คัดลอกค่า **Connection string**
   ```
   postgresql://auan-owner:xxxx@ep-cool-name-123456.ap-southeast-1.aws.neon.tech/auan-platform?sslmode=require
   ```
3. **เก็บไว้** — จะใช้ตอนตั้ง Render

---

## ขั้นตอนที่ 2: Push โค้ดขึ้น GitHub

```bash
# จากเครื่องของคุณ (ถ้ายังไม่ได้ push)
cd /path/to/Mini
git init
git add .
git commit -m "feat: ready for Vercel+Render deployment"
git remote add origin https://github.com/YOUR_USERNAME/auan-platform.git
git push -u origin main
```

---

## ขั้นตอนที่ 3: Deploy บน Render (Backend)

### 3.1 สมัคร Render

1. ไปที่ [render.com](https://render.com) → **Sign Up**
2. ใช้ GitHub login

### 3.2 สร้าง Web Service

1. กด **New** → **Blueprint** (หรือ **Web Service**)
2. เลือก GitHub repo `auan-platform`
3. Render จะอ่าน `render.yaml` อัตโนมัติ
4. กด **Apply**

> ถ้า Render ไม่อ่าน `render.yaml` อัตโนมัติ ให้สร้างเอง:
> - **Name**: `auan-api`
> - **Runtime**: Node.js
> - **Root Directory**: `.` (root)
> - **Build Command**:
>   ```
>   corepack enable && pnpm install --frozen-lockfile && pnpm --filter @auan/api build && cd apps/api && npx prisma migrate deploy
>   ```
> - **Start Command**:
>   ```
>   node apps/api/dist/server.js
>   ```

### 3.3 ตั้ง Environment Variables

ใน Render Dashboard → ของคุณ service → **Environment**:

| Variable | Value | หมายเหตุ |
|----------|-------|---------|
| `NODE_ENV` | `production` | อัตโนมัติจาก render.yaml |
| `PORT` | (auto) | Render กำหนดให้ |
| `DATABASE_URL` | `postgresql://auan-owner:xxxx@ep-xxx.neon.tech/auan-platform?sslmode=require` | **จาก Neon ขั้นตอน 1.3** |
| `JWT_SECRET` | สร้างเอง | `openssl rand -hex 32` |
| `STAFF_JWT_SECRET` | สร้างอีกอัน | ต่างจาก JWT_SECRET |
| `LINE_CHANNEL_ID` | ตัวเลขจาก LINE Developers | |
| `LINE_CHANNEL_SECRET` | คีย์จาก LINE Developers | |
| `LINE_CHANNEL_ACCESS_TOKEN` | โทเคนจาก LINE Developers | optional |
| `LINE_MESSAGING_ACCESS_TOKEN` | โทเคนจาก LINE Developers | ถ้าต่างจากด้านบน |
| `LIFF_ID` | LIFF ID จาก LINE Developers | |
| `OWNER_LINE_USER_IDS` | LINE User ID ของเจ้าของ | คัดลอกจาก string JSON |
| `FRONTEND_URL` | `https://auan-auan.vercel.app` | **จาก Vercel ขั้นตอน 4** (ดูก่อนตั้งนี้) |
| `JWT_COOKIE_SECURE` | `true` | อัตโนมัติจาก render.yaml |

### 3.4 Deploy

กด **Manual Deploy** → **Deploy latest commit**

รอ 2-5 นาที จนเห็น **"Live"** พร้อม URL เช่น:
```
https://auan-api.onrender.com
```

ตรวจสอบ:
```
https://auan-api.onrender.com/api/v1/health
# ถ้าได้: {"success":true,"data":{"status":"ok"}} = สำเร็จ
```

---

## ขั้นตอนที่ 4: Deploy บน Vercel (Frontend)

### 4.1 สมัคร Vercel

1. ไปที่ [vercel.com](https://vercel.com) → **Sign Up**
2. ใช้ GitHub login

### 4.2 สร้าง Project

1. กด **Add New** → **Project**
2. เลือก repo `auan-platform`
3. **Framework Preset**: เลือก **Other**
4. กด **Deploy** (ค่า default อ่านจาก `vercel.json` อัตโนมัติ)

> Vercel จะอ่าน `vercel.json` และรัน `scripts/vercel-build.sh` อัตโนมัติ

### 4.3 ตั้ง Environment Variables

ใน Vercel Dashboard → ของคุณ project → **Settings** → **Environment Variables**:

| Variable | Value | หมายเหตุ |
|----------|-------|---------|
| `VITE_API_BASE_URL` | `https://auan-api.onrender.com/api/v1` | **Render backend URL** |

> ⚠️ **สำคัญ:** `VITE_` prefix ถูก bake เข้า build ตอน build time
> ถ้าเปลี่ยน Render URL ต้อง **Redeploy** ใหม่

### 4.4 ตั้งค่าให้ Admin ทำงาน

Vercel จะอ่าน `vercel.json` อัตโนมัติ:
- `/` → customer app (index.html)
- `/admin` → admin app (admin/index.html)
- `/admin/*` → admin SPA routing

### 4.5 Redeploy หลังตั้ง env var

เพราะ `VITE_API_BASE_URL` เป็น build-time env:
1. Vercel Dashboard → **Deployments**
2. กด `...` → **Redeploy**
3. รอ build 1-2 นาที

ตรวจสอบ:
```
https://auan-auan.vercel.app          → หน้าลูกค้า
https://auan-auan.vercel.app/admin    → หน้าแอดมิน
```

---

## ขั้นตอนที่ 5: กลับไปตั้ง Render ต่อ

ถ้ายังไม่ได้ตั้ง `FRONTEND_URL` ใน Render:

1. Render Dashboard → `auan-api` → **Environment**
2. เพิ่ม `FRONTEND_URL` = `https://auan-auan.vercel.app`
3. กด **Save Changes** → Render จะ redeploy อัตโนมัติ

---

## ขั้นตอนที่ 6: Seed Database

```bash
# วิธี 1: จากเครื่องคุณ (แนะนำ)
# ตั้ง DATABASE_URL ชั่วคราว
export DATABASE_URL="postgres://auan-owner:xxxx@ep-xxx.neon.tech/auan-platform?sslmode=require"
cd apps/api
npx prisma db seed
```

```bash
# วิธี 2: ผ่าน Render Shell
# Render Dashboard → auan-api → Shell
cd apps/api && npx prisma db seed
```

---

## ขั้นตอนที่ 7: ตั้ง LINE LIFF

### 7.1 สร้าง LIFF App

1. ไป [LINE Developers Console](https://developers.line.biz/console/)
2. เข้า Provider → LIFF
3. **Add LIFF app**
4. LIFF name: `Auan-Auan`
5. LIFF URL: `https://auan-auan.vercel.app`
6. เลือก **Web App**

### 7.2 คัดลอก LIFF ID

จากหน้า LIFF → คัดลอก LIFF ID (เช่น `1234567890-xxxxxx`)
แล้วไปตั้งใน Render env var `LIFF_ID`

---

## ขั้นตอนที่ 8: ตั้ง LINE Webhook

### 8.1 Webhook URL

1. LINE Developers Console → Messaging API → Webhook settings
2. Webhook URL: `https://auan-api.onrender.com/api/v1/webhooks/line`
3. เปิด **Use webhook**
4. กด **Verify**

> ⚠️ Render spin-down อาจทำให้ webhook verify ล้มเหลว
> ให้ส่ง request ไปที่ `https://auan-api.onrender.com/api/v1/health` ก่อนเพื่อ wake up server

---

## ขั้นตอนที่ 9: ทดสอบระบบ

```
✅ https://auan-auan.vercel.app              → หน้าลูกค้าโหลด
✅ https://auan-auan.vercel.app/menu          → เห็นเมนูอาหาร
✅ https://auan-auan.vercel.app/admin          → หน้า login แอดมิน
✅ https://auan-auan.vercel.app/admin/dashboard → Dashboard แสดง
```

### ทดสอบ LINE LIFF

1. ใช้ LINE แอปสแกน QR Code จาก LIFF tab
2. เปิด URL → ควรเข้าหน้าลูกค้าผ่าน LINE in-app browser

---

## วิธีอัปเดตระบบ

```bash
# ที่เครื่องของคุณ
git push

# Vercel และ Render จะ auto-deploy อัตโนมัติจาก GitHub push
```

---

## Render Spin-down: เผชิญกับปัญหานี้ยังไง?

### ปัญหา: request แรกหลังเงียบ 15 นาทีจะช้า

**วิธีแก้ (ฟรี):**

1. **UptimeRobot** — [uptimerobot.com](https://uptimerobot.com)
   - สร้าง free monitor สำหรับ `https://auan-api.onrender.com/api/v1/health`
   - ตั้ง ping ทุก 5 นาที → server จะไม่ sleep

2. **Cron-job.org** — [cron-job.org](https://cron-job.org)
   - สร้าง free cron job ทุก 5 นาที
   - URL: `https://auan-api.onrender.com/api/v1/health`

> ⚠️ ทั้งสองวิธีจะใช้ Render hours เร็วขึ้น (750 ชม./เดือน = ~25 ชม./วัน)
> ถ้าใช้หมด → อัปเกรด Render เป็น $7/เดือน หรือย้ายไป OCI เมื่อโควตาว่าง

---

## สรุป — Checklist

- [ ] สร้าง Neon database และคัดลอก connection string
- [ ] Push โค้ดขึ้น GitHub
- [ ] Deploy backend บน Render + ตั้ง env vars ทั้งหมด
- [ ] Health check ผ่าน
- [ ] Deploy frontend บน Vercel + ตั้ง `VITE_API_BASE_URL`
- [ ] Redeploy Vercel
- [ ] กลับไปตั้ง `FRONTEND_URL` ใน Render
- [ ] Seed database
- [ ] สร้าง LIFF app + ตั้ง `LIFF_ID`
- [ ] ตั้ง LINE Webhook
- [ ] ทดสอบทั้ง customer + admin
- [ ] (แนะนำ) ตั้ง UptimeRobot ping ทุก 5 นาที

---

## ถ้าอยากย้ายกลับไป OCI ภายหลัง

เมื่อโควตาสิงคโปร์ว่าง หรือใช้ region อื่นได้:
- ใช้ `docs/DEPLOYMENT.md` (Docker single-server) หรือ `docs/OCI-DEPLOYMENT.md`
- โค้ดเดียวกัน — เปลี่ยนแค่วิธี deploy
- ไม่ต้องแก้โค้ดใดๆ
