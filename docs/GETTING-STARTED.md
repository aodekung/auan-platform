# คู่มือ Deployment สำหรับมือใหม่

> คู่มือนี้อธิบายทุกขั้นตอนตั้งแต่วันแรกจนระบบออนไลน์
> ออกแบบสำหรับคนที่ไม่เคย deploy มาก่อน

---

## ภาพรวม — ระบบทำงานยังไง?

```
ลูกค้าเปิด LINE → เห็นเมนูอ้วนอ้วน → สั่งอาหาร → จ่ายเงิน

ฝั่งเซิร์ฟเวอร์ (ที่คุณต้องจัดการ):
  1. Cloudflare รับ HTTPS แล้วส่งต่อเป็น HTTP ไปที่เซิร์ฟเวอร์ของคุณ (ฟรี)
  2. Nginx รับ request → ส่งหน้าเว็บไปแสดง หรือส่ง API ไปหา backend
  3. Fastify (backend) ประมวลผล logic และเก็บข้อมูลใน PostgreSQL
```

คุณต้องมี **เซิร์ฟเวอร์ (VPS)** ที่เปิดอยู่ 24 ชม. — แนะนำ:
- **Hetzner** (เริ่มต้น ~€3.50/เดือน) — [hetzner.com](https://www.hetzner.com)
- **DigitalOcean** (เริ่มต้น ~$4/เดือน) — [digitalocean.com](https://www.digitalocean.com)
- **Vultr** (เริ่มต้น ~$3.50/เดือน) — [vultr.com](https://www.vultr.com)

---

## ขั้นตอนที่ 1: ซื้อเซิร์ฟเวอร์ (VPS) + ตั้งค่าเบื้องต้น

### 1.1 ซื้อ VPS

เลือก plan ที่ถูกที่สุด (เพียงพอสำหรับ MVP):
- OS: **Ubuntu 24.04 LTS** (สำคัญ — เลือกเป็น Ubuntu อย่างเดียว)
- Region: สิงคโปร์หรือญี่ปุ่น (ใกล้ไทยที่สุด)
- RAM: 最低 1GB (แนะนำ 2GB)
- CPU: 1 core ก็พอ

### 1.2 เข้าเซิร์ฟเวอร์ครั้งแรก

หลังซื้อเสร็จ คุณจะได้ IP address และ password ผ่านอีเมล

```bash
# จากคอมพิวเตอร์ของคุณ (ใช้ Terminal บน Mac/Linux หรือ PowerShell บน Windows)
ssh root@YOUR_SERVER_IP
```

มันจะถาม password — ใส่รหัสที่ได้จากอีเมล แล้วกด Enter

### 1.3 ตั้งรหัสใหม่ (จำเป็น)

```bash
passwd
```

พิมพ์รหัสใหม่ 2 ครั้ง (ตัวอักษรจะไม่แสดง — ปกติ)

### 1.4 สร้าง user ใหม่ (ไม่ควรใช้ root ตลอดเวลา)

```bash
adduser deploy
# ตั้งรหัสผ่านให้ user นี้
usermod -aG sudo deploy
```

### 1.5 ติดตั้ง Docker

```bash
# อัปเดตระบบ
apt update && apt upgrade -y

# ติดตั้ง Docker (อย่าลืม — ถ้าไม่มี Docker ระบบจะไม่ทำงาน)
curl -fsSL https://get.docker.com | sh

# ให้ user deploy ใช้ docker ได้
usermod -aG docker deploy
```

### 1.6 ติดตั้ง Node.js + pnpm

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# pnpm
npm install -g pnpm@9
```

### 1.7 ติดตั้ง Git

```bash
apt install -y git
```

---

## ขั้นตอนที่ 2: อัปโหลดโค้ดไปเซิร์ฟเวอร์

### 2.1 จากเครื่องของคุณ — push โค้ดขึ้น GitHub

```bash
# ถ้ายังไม่มี GitHub repo
git init
git add .
git commit -m "feat: initial release"
git remote add origin https://github.com/YOUR_USERNAME/auan-platform.git
git push -u origin main
```

### 2.2 จากเซิร์ฟเวอร์ — clone โค้ดลงมา

```bash
su - deploy
cd ~
git clone https://github.com/YOUR_USERNAME/auan-platform.git
cd auan-platform
```

---

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

นี่คือสิ่งที่สำคัญที่สุด — ถ้าผิดระบบจะไม่ทำงาน

```bash
cd ~/auan-platform

# คัดลอก template
cp .env.production.example .env.production

# แก้ไขไฟล์
nano .env.production
```

ใน nano editor ให้แก้ค่าเหล่านี้:

```
# สรุดต้องแก้ (ถ้าไม่แก้ระบบ crash):
DATABASE_URL=postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/auan_platform
JWT_SECRET=<วางค่าจาก step ด้านล่าง>
STAFF_JWT_SECRET=<วางค่าอีกอัน>
LINE_CHANNEL_ID=ตัวเลขจาก LINE Developers Console
LINE_CHANNEL_SECRET=คีย์จาก LINE Developers Console
LINE_CHANNEL_ACCESS_TOKEN=โทเคนจาก LINE Developers Console
FRONTEND_URL=https://yourdomain.com
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD
```

### สร้าง secret key (ใช้เครื่องของคุณหรือเซิร์ฟเวอร์ก็ได้):

```bash
openssl rand -hex 32
# จะได้ string ยาวๆ ประมาณนี้: a1b2c3d4e5f6...
# คัดลอกไปวางใน JWT_SECRET และ STAFF_JWT_SECRET (คนละอัน)
```

บันทึกไฟล์: `Ctrl+O` → `Enter` → `Ctrl+X`

### วิธีหา LINE credentials:

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เข้า Provider → สร้าง Messaging API channel
3. คัดลอก Channel ID, Channel Secret
4. ไปที่ Messaging API tab → กด Issue Access Token → คัดลอก

---

## ขั้นตอนที่ 4: Deploy

**หนึ่งคำสั่งเดียว:**

```bash
cd ~/auan-platform
chmod +x scripts/*.sh
./scripts/deploy.sh
```

script นี้จะ:
1. ตรวจสอบ .env.production ว่าครบหรือยัง
2. ติดตั้ง dependencies
3. Build customer app, admin app, และ API
4. Build Docker images
5. เปิด containers ทั้งหมด
6. ตรวจสอบว่าระบบทำงาน

**รอสักครู่** ครั้งแรกอาจใช้เวลา 5-10 นาที

### ตรวจสอบว่าทำงาน:

```bash
curl http://localhost/api/v1/health
# ถ้าได้: {"success":true,"data":{"status":"ok",...}} = สำเร็จ
```

### ถ้ามีปัญหา — ดู logs:

```bash
./scripts/logs.sh api        # ดู logs ของ backend
./scripts/logs.sh nginx      # ดู logs ของ nginx
./scripts/logs.sh postgres   # ดู logs ของ database
```

---

## ขั้นตอนที่ 5: ตั้ง Cloudflare (HTTPS ฟรี)

Cloudflare ทำหน้าที่:
- รับ HTTPS จากผู้ใช้ → ส่ง HTTP ไปที่เซิร์ฟเวอร์คุณ
- DDoS protection ฟรี
- CDN เร่งความเร็วหน้าเว็บ
- Rate limiting (ป้องกันคน spam)

### 5.1 สมัคร Cloudflare

ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com) → สมัครฟรี

### 5.2 เพิ่ม domain

ถ้ามี domain แล้ว → Add site → พิมพ์ domain → วาง nameserver ที่ Cloudflare ให้
ไปที่ที่ซื้อ domain → เปลี่ยน nameserver เป็นของ Cloudflare

**ถ้ายังไม่มี domain:**
- ซื้อที่ Cloudflare Registrar (ถูก) หรือ Namecheap, Godaddy
- ราคา ~$10-15/ปีสำหรับ .com

### 5.3 ตั้ง DNS Record

ใน Cloudflare Dashboard → ของคุณ domain → DNS → Add record:

| Type | Name | IPv4 | Proxy |
|------|------|------|-------|
| A | `@` | `YOUR_SERVER_IP` | ☑️ On (ส้ม) |

ถ้าอยากให้เข้าผ่าน `app.yourdomain.com` แทน:

| Type | Name | IPv4 | Proxy |
|------|------|------|-------|
| A | `app` | `YOUR_SERVER_IP` | ☑️ On (ส้ม) |

### 5.4 ตั้ง SSL

ใน Cloudflare → SSL/TLS → Overview:
- เลือก **Full** (ไม่ใช่ Flexible, ไม่ใช่ Strict)

### 5.5 เปิด Security features

- Security → WAF → เปิด
- Security → Bots → เปิด Bot Fight Mode
- Security → Settings → Security Level: Medium

### 5.6 ตั้ง Cache Rules (เร่งความเร็ว)

Caching → Cache Rules → Create Rule:

**Rule 1: Static assets**
- Expression: `URI Path contains "/assets/"`
- Browser Cache TTL: 1 year
- Edge Cache TTL: 1 year
- Cache Everything

**Rule 2: API (ไม่ cache)**
- Expression: `URI Path starts with "/api/"`
- Browser Cache TTL: 0 seconds
- Bypass Cache

---

## ขั้นตอนที่ 6: Firewall (ป้องกันเข้าถึงเซิร์ฟเวอร์โดยตรง)

ตั้งค่า firewall ให้เฉพาะ Cloudflare ที่เข้าถึง port 80 ได้

```bash
# อนุญาต SSH
ufw allow 22/tcp

# อนุญาตเฉพาะ Cloudflare IP เข้า port 80
for ip in \
  173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 \
  141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 \
  197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 \
  104.24.0.0/14 172.64.0.0/13 131.0.72.0/22; do
  ufw allow from $ip to any port 80
done

# เปิด firewall
ufw enable
```

ตอนนี้ใครพยายามเข้า IP ของคุณโดยตรง → จะถูก block
ต้องเข้าผ่าน domain ที่ Cloudflare proxy เท่านั้น

---

## ขั้นตอนที่ 7: ตั้ง Database Backup อัตโนมัติ

```bash
crontab -e
```

เพิ่มบรรทัดนี้ (backup ทุกวันตี 3):

```
0 3 * * * /home/deploy/auan-platform/scripts/backup.sh
```

---

## ขั้นตอนที่ 8: Seed Database (ครั้งแรก)

ถ้ายังไม่มีข้อมูลใน database:

```bash
cd ~/auan-platform
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

---

## ขั้นตอนที่ 9: ตั้ง LINE Webhook

1. ไป LINE Developers Console → Messaging API → Webhook settings
2. Webhook URL: `https://yourdomain.com/api/v1/webhooks/line`
3. เปิด Use webhook
4. กด Verify

---

## ขั้นตอนที่ 10: ทดสอบระบบ

เปิด browser → ไปที่ `https://yourdomain.com`

- [ ] หน้าแรกโหลดขึ้น
- [ ] เห็นหมวดหมู่อาหาร
- [ ] กดสินค้า → เห็นรายละเอียด
- [ ] เพิ่มลงตะกร้า
- [ ] สั่งซื้อได้
- [ ] Admin dashboard: `https://yourdomain.com/admin`
- [ ] Admin login ได้

---

## วิธีอัปเดตระบบ (เมื่อมีโค้ดใหม่)

```bash
# ที่เครื่องของคุณ
git push

# ที่เซิร์ฟเวอร์
cd ~/auan-platform
git pull
./scripts/deploy.sh
```

---

## สรุป — Checklist

- [ ] ซื้อ VPS (Ubuntu 24.04)
- [ ] ติดตั้ง Docker, Node.js, pnpm, Git
- [ ] Clone โค้ดจาก GitHub
- [ ] ตั้ง .env.production
- [ ] Run `./scripts/deploy.sh`
- [ ] Health check ผ่าน
- [ ] ตั้ง Cloudflare (DNS, SSL/TLS Full, WAF)
- [ ] ตั้ง Firewall (Cloudflare IPs only)
- [ ] ตั้ง Database backup (cron)
- [ ] Seed database
- [ ] ตั้ง LINE Webhook
- [ ] ทดสอบระบบ

---

## ถ้ามีปัญหา

ดู `docs/DEPLOYMENT.md` สำหรับ troubleshooting table แบบละเอียด
