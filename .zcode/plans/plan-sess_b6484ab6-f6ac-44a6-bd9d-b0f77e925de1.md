## Plan: Global Option Groups + Docker Local DB

### ส่วนที่ 1: Docker — เปลี่ยนไปใช้ Local DB (ทำก่อน)

**เปลี่ยน `apps/api/.env`** `DATABASE_URL` จาก Neon → `postgresql://postgres:postgres@localhost:5432/auan_platform`

**สั่ง `docker compose up -d`** (มีไฟล์ `docker-compose.yml` อยู่แล้วที่ root) → PostgreSQL จะขึ้นที่ `localhost:5432`

**สั่ง `pnpm db:migrate`** → รัน migration บน local DB

---

### ส่วนที่ 2: Global Option Groups — Architecture

**Concept**: แยก Option Group ออกเป็น entity 2 ชั้น:
```
OptionGroupTemplate (global) ──1:N──> OptionTemplate
        │
        └── N:M ──> Product (ผ่าน ProductOptionGroupAssignment)
```

#### 2A. Prisma Schema — เพิ่ม 2 model ใหม่

```prisma
// Global option group template (เช่น "ระดับความเผ็ด", "ขนาด")
model OptionGroupTemplate {
  id           String   @id @default(uuid())
  name         String
  required     Boolean  @default(true)
  multiple     Boolean  @default(false)
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  options    OptionTemplate[]
  assignments ProductOptionGroupAssignment[]

  @@map("option_group_templates")
}

// Global option template (เช่น "เผ็ดน้อย", "ใหญ่")
model OptionTemplate {
  id              String  @id @default(uuid())
  optionGroupId   String
  name            String
  additionalPrice Decimal @db.Decimal(10, 2) @default(0)
  displayOrder    Int     @default(0)
  isActive        Boolean @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  optionGroup OptionGroupTemplate @relation(fields: [optionGroupId], references: [id], onDelete: Cascade)
  assignments ProductOptionGroupAssignment[]

  @@unique([optionGroupId, name])
  @@map("option_templates")
}

// Link table: ผูก template กับ product + override ราคา per-product
model ProductOptionGroupAssignment {
  id               String  @id @default(uuid())
  productId        String
  optionGroupId    String
  displayOrder     Int     @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  product      Product              @relation(fields: [productId], references: [id], onDelete: Cascade)
  optionGroup  OptionGroupTemplate  @relation(fields: [optionGroupId], references: [id], onDelete: Cascade)
  priceOverrides ProductPriceOverride[]

  @@unique([productId, optionGroupId])
  @@index([productId])
  @@index([optionGroupId])
  @@map("product_option_group_assignments")
}

// Override ราคาตัวเลือกเฉพาะ product (ถ้าไม่มี = ใช้ราคาจาก template)
model ProductPriceOverride {
  id                String  @id @default(uuid())
  assignmentId      String
  optionId          String
  additionalPrice   Decimal @db.Decimal(10, 2)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  assignment ProductOptionGroupAssignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, optionId])
  @@index([assignmentId])
  @@map("product_price_overrides")
}
```

**Model เก่า `ProductOptionGroup` และ `ProductOption` จะไม่ถูกลบ** — จะ migrate data จากเก่าไปใหม่, แล้วค่อย deprecate ทีหลัง

#### 2B. Backend — เพิ่ม module ใหม่ `option-templates/`

**Routes** (ทั้งหมด Owner/Admin):
| Method | Path | หน้าที่ |
|--------|------|---------|
| GET | `/api/v1/admin/option-groups` | ดูกลุ่มตัวเลือกทั้งหมด (พร้อมตัวเลือก) |
| POST | `/api/v1/admin/option-groups` | สร้างกลุ่มตัวเลือกใหม่ |
| PATCH | `/api/v1/admin/option-groups/:id` | แก้ชื่อ/required/multiple |
| DELETE | `/api/v1/admin/option-groups/:id` | ลบกลุ่มตัวเลือก (ลบออกจาก product ด้วย cascade) |
| POST | `/api/v1/admin/option-groups/:id/options` | เพิ่มตัวเลือกในกลุ่ม |
| PATCH | `/api/v1/admin/option-groups/:groupId/options/:id` | แก้ชื่อ/ราคาตัวเลือก |
| DELETE | `/api/v1/admin/option-groups/:groupId/options/:id` | ลบ/ปิดตัวเลือก |

**Product linking routes**:
| Method | Path | หน้าที่ |
|--------|------|---------|
| GET | `/api/v1/products/:id/option-assignments` | ดูกลุ่มที่ผูกกับ product |
| POST | `/api/v1/products/:id/option-assignments` | ผูกกลุ่มเข้ากับ product |
| DELETE | `/api/v1/products/:id/option-assignments/:groupId` | ถอนกลุ่มออกจาก product |
| PATCH | `/api/v1/products/:id/option-assignments/:groupId/overrides` | override ราคาตัวเลือกเฉพาะ product |

**Public endpoint ยังใช้เดิม**: `GET /api/v1/products/:id/options` — แต่ service จะเปลี่ยนไปอ่านจาก template + assignment + price override แทน เพื่อให้ customer-side ไม่ต้องเปลี่ยน

#### 2C. Frontend Admin — เพิ่มหน้า "ตัวเลือกพิเศษ" ใหม่

**สร้าง `apps/admin/src/pages/option-templates-page.tsx`**:
- แสดงรายการกลุ่มตัวเลือกทั้งหมด (แบบ categories page)
- แต่ละกลุ่ม expand ได้เพื่อแสดง/เพิ่ม/ลบตัวเลือกย่อย + ราคา
- สร้างกลุ่มใหม่ผ่าน dialog

**แก้ `products-page.tsx`** — Product edit dialog:
- เพิ่ม section "เลือกกลุ่มตัวเลือก" ด้านล่าง (แทน `OptionGroupManager` เดิม)
- แสดง dropdown/checkbox list ของ global option groups ที่ยังไม่ผูก
- กดเพิ่ม → ผูกกลุ่มเข้า product ทันที
- กดลบ → ถอนกลุ่มออก
- ถ้าต้องการ override ราคา → กดปุ่ม "ปรับราคา" เปิด dialog ย่อย

**Sidebar**: เพิ่ม nav item "ตัวเลือกพิเศษ" ใต้ Products

#### 2D. Data Migration

สร้าง Prisma migration script:
1. สร้างตารางใหม่ทั้ง 4 ตาราง
2. ย้ายข้อมูลจาก `product_option_groups` + `product_options` เก่าเข้า `option_group_templates` + `option_templates` + `product_option_group_assignments`
3. ยังคง model เก่าไว้ชั่วคราว (soft deprecate)

#### 2E. Frontend ไม่ต้องเปลี่ยน

**Customer app ไม่ต้องแก้** — `GET /api/v1/products/:id/options` response shape เดิม `OptionGroupResponse[]` จะยังเหมือนเดิม เพราะ service ใหม่จะรวม template + assignment + override แล้ว map เป็น response เดิม

---

### Execution Order

1. Docker: เปลี่ยน `.env` + `docker compose up` + `db:migrate` (~2 min)
2. Prisma Schema: เพิ่ม 4 model ใหม่ + migration (~5 min)
3. Backend: สร้าง `option-templates` module (service + routes + controller + schema + types) (~15 min)
4. Backend: ปรับ `products.service.ts` `getOptionGroupsByProductId()` ให้อ่านจาก template system (~5 min)
5. Backend: Data migration script ย้ายข้อมูลเก่า (~5 min)
6. Frontend: สร้าง `option-templates-page.tsx` + hooks + เพิ่ม route + sidebar (~15 min)
7. Frontend: แก้ `products-page.tsx` ให้เลือกกลุ่มจาก dropdown แทนสร้างใหม่ (~10 min)
8. Type-check + Build + QA (~5 min)

**Total: ~60 min**