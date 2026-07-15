# OCI Free Tier (Singapore) — คู่มือตั้งค่าตั้งแต่แรก

> สำหรับ OCI Always Free: Arm Ampere A1 (4 OCPU / 24GB RAM) + 200GB Block Storage
> เลือก Singapore region เพราะใกล้ไทยและมี Always Free capacity

---

## สิ่งที่คุณจะได้ฟรี (Always Free)

| Resource | สิ่งที่ได้ | เพียงพอ? |
|----------|-----------|----------|
| Compute | Arm Ampere A1: 4 OCPU + 24GB RAM | ✅ เกินพอ (MVP ใช้ ~1GB RAM) |
| Block Storage | 200 GB total (2 volumes x 100GB) | ✅ เกินพอ |
| Bandwidth | 10 TB/month out | ✅ เกินพอ |
| Object Storage | 20 GB | ✅ สำหรับ backup |

⚠️ **สำคัญ**: Arm Ampere A1 เป็น Arm architecture — ต้องใช้ Docker image สำหรับ Arm64
โชคดีที่ Docker Hub official images (nginx, node, postgres) รองรับ Arm64 ทั้งหมด

---

## ขั้นตอนที่ 1: สมัคร OCI

1. ไปที่ [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. กด **Start for free**
3. กรอกอีเมล, ชื่อ, ที่อยู่, เบอร์โทร
4. **ต้องกรอกข้อมูลจริง** — OCI จะตรวจ billing address
   - ใช้บัตรประชาชน/ข้อมูลจริง
   - เบอร์โทรที่รับ OTP ได้
5. ยืนยันอีเมล → กรอก password → เลือก **Home Region: Singapore**
6. กรอกข้อมูลบัตรเครดิต/เดบิต (จะไม่หักเงิน — Always Free ไม่เรียกเก็บ)
7. รอ 5-15 นาที ให้ OCI provision tenant เสร็จ

> 💡 **Home Region = Singapore** คือสิ่งที่เลือกครั้งเดียวแล้วเปลี่ยนไม่ได้
> ถ้าอยู่ไทย → Singapore คือตัวเลือกที่ดีที่สุด (ping ~30ms)

---

## ขั้นตอนที่ 2: สร้าง VPS (Compute Instance)

### 2.1 เข้า OCI Console

1. ไปที่ [cloud.oracle.com](https://cloud.oracle.com)
2. Login → เลือก compartment ของคุณ (ชื่อเดียวกับเมล)

### 2.2 เปิด Virtual Cloud Network (VCN)

ถ้ายังไม่มี VCN:

1. เมนู ☰ → **Networking** → **Virtual Cloud Networks**
2. เลือก Compartment ของคุณ
3. กด **Create VCN**
4. ตั้งค่า:
   - **Name**: `auan-vcn`
   - **CIDR Block**: `10.0.0.0/16` (default แล้ว)
   - Create in **Oracle Cloud Infrastructure Networking** (ไม่ใช่ Networking with FastConnect)
5. กด **Create VCN**
6. เข้าไปใน VCN ที่สร้าง → เห็น **Public Subnet** และ **Private Subnet** อยู่แล้ว

#### ตรวจสอบ Security List (เปิด port ที่จำเป็น):

1. ใน VCN → กด **auan-vcn** → ด้านซ้าย **Subnets** → กด **Public Subnet**
2. ดู **Security List** → กดเข้าไป
3. ตรวจสอบว่ามี Ingress Rules:
   - Port 22 (SSH) ✅ มีอยู่แล้ว (source: 0.0.0.0/0)
   - Port 80 (HTTP) ❌ ต้องเพิ่ม
   - Port 443 (HTTPS) — **ไม่ต้องเปิด** เพราะใช้ Cloudflare

4. **เพิ่ม Ingress Rule สำหรับ port 80:**
   - กด **Add Ingress Rules**
   - Source Type: `CIDR`
   - Source CIDR: `0.0.0.0/0`
   - Destination Port: `80`
   - Protocol: `TCP`
   - กด **Add Ingress Rules**

> ⚠️ ชั่วคราวเปิด 0.0.0.0/0 ก่อน ตอนที่ตั้ง Cloudflare + firewall เสร็จแล้ว
> จะย้อนกลับมาจำกัดเฉพาะ Cloudflare IP

#### ตรวจสอบ Route Table (สำคัญ!):

1. ใน VCN → **Route Tables** → กด route table ของ Public Subnet
2. ต้องมี rule: `0.0.0.0/0 → Internet Gateway`
3. ถ้าไม่มี Internet Gateway:
   - ด้านซ้าย **Internet Gateways** → **Create Internet Gateway**
   - Name: `auan-ig`
   - กลับไป Route Tables → Add route: `0.0.0.0/0` → เลือก `auan-ig`

### 2.3 สร้าง Compute Instance

1. ☰ → **Compute** → **Instances**
2. เลือก Compartment → กด **Create Instance**
3. **ตั้งค่าแต่ละช่อง:**

| ช่อง | ค่าที่ตั้ง |
|------|-----------|
| **Name** | `auan-server` |
| **Compartment** | (compartment ของคุณ) |
| **Placement** | AD1 หรือ Availability Domain ที่มี |
| **Image** | Canonical Ubuntu 24.04 (aarch64) — **ต้องเป็น aarch64** |
| **Shape** | Ampere A1 (1 OCPU, 6GB RAM) — แนะนำ 1/4 เผื่อเหลือ quota สร้างอย่างอื่น |
| **Boot volume size** | 50 GB (default 47GB, เพิ่มหน่อย) |
| **Primary VNIC** | Public Subnet ของ auan-vcn |
| **Assign a public IP** | ✅ เปิด |
| **SSH Key** | ต้องเลือกอย่างใดอย่างหนึ่งด้านล่าง ⬇️ |

#### SSH Key — เลือกวิธีที่สะดวก:

**วิธีที่ 1: สร้างให้ (แนะนำถ้ามี Git Bash อยู่แล้ว):**
```bash
# ที่เครื่องของคุณ (Git Bash / Terminal)
ssh-keygen -t ed25519 -f ~/.ssh/oci_auan
# กด Enter 3 ครั้ง (ไม่ต้องตั้ง passphrase ก็ได้)
cat ~/.ssh/oci_auan.pub
# คัดลอก output ทั้งหมด
```
ใน OCI console → SSH Key → เลือก **Paste SSH Key(s)** → วาง public key → กด Create Instance

**วิธีที่ 2: ให้ OCI สร้างให้:**
- เลือก **Generate a key pair for me**
- กด **Save Private Key** → เซฟไฟล์ `.key` ที่เครื่อง
- กด **Save Public Key** → เซฟไฟล์ `.pub` ที่เครื่อง

4. กด **Create** → รอ 2-3 นาที
5. Instance จะมีสถานะ **Running** + แสดง **Public IP Address** → **จด IP ไว้**

### 2.4 เข้าเซิร์ฟเวอร์ SSH

```bash
# วิธีที่ 1: ใช้ private key (ถ้าสร้างเอง)
ssh -i ~/.ssh/oci_auan ubuntu@YOUR_PUBLIC_IP

# วิธีที่ 2: ใช้ private key ที่ OCI สร้างให้
ssh -i /path/to/private.key ubuntu@YOUR_PUBLIC_IP
```

> ⚠️ OCI Ubuntu image ใช้ username `ubuntu` ไม่ใช่ `root`
> ต้องใช้ `sudo` สำหรับคำสั่ง admin

---

## ขั้นตอนที่ 3: ตั้งค่าเซิร์ฟเวอร์เบื้องต้น

### 3.1 อัปเดตระบบ

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2 ตั้ง timezone เป็น Bangkok

```bash
sudo timedatectl set-timezone Asia/Bangkok
```

### 3.3 สร้าง swap (เผื่อ RAM น้อย)

Arm A1 1 OCPU ได้ 6GB RAM แต่ PostgreSQL + Docker กินเยอะ:

```bash
# สร้าง swap 4GB
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# ทำให้เปิด swap ทุกครั้งที่ reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# ตรวจสอบ
free -h
# ควรเห็น Swap: 4.0G
```

### 3.4 ติดตั้ง Docker

```bash
# ติดตั้ง Docker (official)
curl -fsSL https://get.docker.com | sudo sh

# ให้ ubuntu user ใช้ docker ได้ (ไม่ต้อง sudo)
sudo usermod -aG docker ubuntu

# ออกจาก SSH แล้วเข้าใหม่เพื่อให้ group เริ่มทำงาน
exit
ssh -i ~/.ssh/oci_auan ubuntu@YOUR_PUBLIC_IP

# ตรวจสอบ
docker --version
docker compose version
```

> ⚠️ OCI Arm instance จะติดตั้ง Docker สำหรับ `arm64` อัตโนมัติ
> Docker Hub official images รองรับ `arm64` ทั้ง nginx, node, postgres, alpine

### 3.5 ติดตั้ง Node.js + pnpm + Git

```bash
# Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git

# pnpm
npm install -g pnpm@9

# ตรวจสอบ
node --version   # v22.x
pnpm --version   # 9.x
git --version
```

---

## ขั้นตอนที่ 4: อัปโหลดโค้ดไปเซิร์ฟเวอร์

### 4.1 จากเครื่อง — push โค้ดขึ้น GitHub

```bash
# ถ้ายังไม่มี GitHub repo
cd C:\Users\aode_\Desktop\Work\Mini
git init
git add .
git commit -m "feat: initial release — MVP ready for deploy"
git remote add origin https://github.com/YOUR_USERNAME/auan-platform.git
git branch -M main
git push -u origin main
```

### 4.2 จากเซิร์ฟเวอร์ — clone โค้ด

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/auan-platform.git
cd auan-platform
```

---

## ขั้นตอนที่ 5: ตั้งค่า Environment Variables

```bash
cd ~/auan-platform

# คัดลอก template
cp .env.production.example .env.production

# แก้ไข
nano .env.production
```

**ค่าที่ต้องแก้ (จำเป็น ระบบจะ crash ถ้าไม่มี):**

```
# Database — POSTGRES_PASSWORD ใน DATABASE_URL และด้านล่างต้องตรงกัน
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD_HERE@postgres:5432/auan_platform
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# JWT Secrets — สร้างแยกกัน 2 อัน
JWT_SECRET=<ใช้คำสั่ง openssl ด้านล่าง>
STAFF_JWT_SECRET=<ใช้คำสั่ง openssl อีกรอบ>

# LINE credentials — จาก LINE Developers Console
LINE_CHANNEL_ID=your-channel-id
LINE_CHANNEL_SECRET=your-channel-secret
LINE_CHANNEL_ACCESS_TOKEN=your-access-token

# Domain ของคุณ (ต้องมี https://)
FRONTEND_URL=https://yourdomain.com

# Cookie settings (Cloudflare = HTTPS)
JWT_COOKIE_SECURE=true
JWT_COOKIE_HTTP_ONLY=true
JWT_COOKIE_SAME_SITE=lax
```

**สร้าง secret key (รัน 2 ครั้ง ได้ 2 อัน):**

```bash
openssl rand -hex 32
# คัดลอกไปวางใน JWT_SECRET
openssl rand -hex 32
# คัดลอกไปวางใน STAFF_JWT_SECRET (ต่างอันกัน)
```

บันทึก: `Ctrl+O` → `Enter` → `Ctrl+X`

---

## ขั้นตอนที่ 6: Deploy

```bash
cd ~/auan-platform
chmod +x scripts/*.sh
./scripts/deploy.sh
```

ครั้งแรกใช้เวลา 5-10 นาที (build + download Docker images สำหรับ arm64)

### ตรวจสอบ:

```bash
curl http://localhost/api/v1/health
# ถ้าได้: {"status":"ok",...} = สำเร็จ ✅
```

### ถ้ามีปัญหา:

```bash
./scripts/logs.sh api       # ดู backend logs
./scripts/logs.sh postgres  # ดู database logs
./scripts/logs.sh nginx     # ดู nginx logs
```

---

## ขั้นตอนที่ 7: Seed Database

```bash
cd ~/auan-platform
docker compose -f docker-compose.prod.yml exec api npx prisma db seed
```

จะเห็น output ประมาณ:
```
=== Auan Auan Mala Fried — Database Seed ===
[1/10] Seeding Settings...
[2/10] Seeding Staff Roles...
...
=== Seed completed successfully! ===

Demo credentials:
  Admin login:  owner@auanauan.com
  Password:     Owner1234!
```

---

## ขั้นตอนที่ 8: ตั้ง Cloudflare (HTTPS ฟรี)

(เช่นเดียวกับ GETTING-STARTED.md ขั้นตอน 5 — ไม่ขึ้นกับ VPS provider)

1. สมัคร [dash.cloudflare.com](https://dash.cloudflare.com) → เพิ่ม domain
2. DNS → Add record:

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | `@` | `OCI_PUBLIC_IP` | ☑️ On (ส้ม) |

3. SSL/TLS → **Full** (ไม่ใช่ Flexible)
4. Security → เปิด WAF + Bot Fight Mode
5. Cache Rules:
   - `/assets/` → Cache 1 year
   - `/api/` → Bypass cache

---

## ขั้นตอนที่ 9: OCI Firewall (Security List) — จำกัดเฉพาะ Cloudflare

**เมื่อ Cloudflare ทำงานแล้ว** → จำกัด port 80 ไม่ให้ใครเข้าเซิร์ฟเวอร์โดยตรง:

1. OCI Console → Networking → Virtual Cloud Networks → `auan-vcn`
2. Subnets → Public Subnet → Security List
3. ลบ Ingress Rule ของ port 80 (0.0.0.0/0)
4. เพิ่ม Ingress Rules ใหม่สำหรับแต่ละ Cloudflare IP range:

```
# Cloudflare IPv4 — เพิ่มเป็น Ingress Rule แยกกัน
Source CIDR: 173.245.48.0/20     Port: 80  TCP
Source CIDR: 103.21.244.0/22    Port: 80  TCP
Source CIDR: 103.22.200.0/22    Port: 80  TCP
Source CIDR: 103.31.4.0/22       Port: 80  TCP
Source CIDR: 141.101.64.0/18     Port: 80  TCP
Source CIDR: 108.162.192.0/18    Port: 80  TCP
Source CIDR: 190.93.240.0/20     Port: 80  TCP
Source CIDR: 188.114.96.0/20     Port: 80  TCP
Source CIDR: 197.234.240.0/22    Port: 80  TCP
Source CIDR: 198.41.128.0/17     Port: 80  TCP
Source CIDR: 162.158.0.0/15      Port: 80  TCP
Source CIDR: 104.16.0.0/13       Port: 80  TCP
Source CIDR: 104.24.0.0/14       Port: 80  TCP
Source CIDR: 172.64.0.0/13       Port: 80  TCP
Source CIDR: 131.0.72.0/22       Port: 80  TCP
```

5. เก็บ Ingress Rule ของ port 22 (SSH) ไว้ — หรือจำกัดเฉพาะ IP ของคุณ

---

## ขั้นตอนที่ 10: Backup อัตโนมัติ

```bash
crontab -e
```

เพิ่ม:

```
0 3 * * * /home/ubuntu/auan-platform/scripts/backup.sh
```

(backup ทุกวันตี 3 เก็บไว้ 30 วันล่าสุด)

---

## ขั้นตอนที่ 11: LINE Webhook

1. [LINE Developers Console](https://developers.line.biz/console/)
2. Messaging API → Webhook settings
3. Webhook URL: `https://yourdomain.com/api/v1/webhooks/line`
4. เปิด Use webhook → กด Verify

---

## ขั้นตอนที่ 12: ทดสอบ

- `https://yourdomain.com` → หน้า Customer app
- `https://yourdomain.com/admin` → Admin dashboard
- `https://yourdomain.com/api/v1/health` → API health check

Admin login:
- Email: `owner@auanauan.com`
- Password: `Owner1234!`

---

## OCI เฉพาะ — สิ่งที่ต่างจาก VPS ทั่วไป

| หัวข้อ | OCI | VPS ทั่วไป (Hetzner/DO) |
|--------|-----|------------------------|
| Architecture | **Arm64** (aarch64) | x86_64 |
| Docker | official images รองรับ arm64 ✅ | x86_64 ทั้งหมด |
| OS image | Canonical Ubuntu 24.04 **aarch64** | Ubuntu x86_64 |
| Firewall | Security List (in OCI Console) | ufw (ในเซิร์ฟเวอร์) |
| SSH user | `ubuntu` | `root` |
| Public IP | คงที่ (Reserved Public IP) | คงที่ตั้งแต่สร้าง |
| Swap | ต้องสร้างเอง | มีอยู่แล้วบาง provider |
| Always Free | 4 OCPU / 24GB / 200GB | ไม่มี |

---

## วิธีอัปเดตระบบ

```bash
# ที่เครื่อง
git push

# ที่เซิร์ฟเวอร์
cd ~/auan-platform
git pull
./scripts/deploy.sh
```

---

## วิธีดู resource usage

```bash
# CPU + RAM
docker stats

# Disk
df -h

# ดู Always Free usage
# OCI Console → Billing → Usage
```

---

## ถ้า OCI ไม่มี Always Free capacity

Arm A1 quota จำกัด — ถ้าสร้างไม่ได้ (capacity full):

1. ลอง **Availability Domain อื่น** (AD1, AD2, AD3)
2. ลอง **region อื่น** เช่น Tokyo, Osaka, Seoul (แต่ ping จากไทยสูงขึ้น)
3. รอสักพักแล้วลองใหม่ (คนอื่นปล่อย quota)
4. ถ้าจริงจัง → ใช้ **AMD Always Free** (1/8 OCPU / 1GB) — แต่ต้องปรับ PostgreSQL memory limit ลง
   ```
   # ใน docker-compose.prod.yml เพิ่ม environment:
   POSTGRES_SHARED_BUFFERS=128MB
   POSTGRES_EFFECTIVE_CACHE_SIZE=256MB
   ```
