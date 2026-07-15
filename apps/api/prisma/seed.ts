import { PrismaClient, Prisma, ProductStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const SETTINGS: Array<{ key: string; value: string; category: string; description?: string }> = [
  // Store
  { key: 'store.name', value: 'อ้วนอ้วนหม่าล่าทอด', category: 'store', description: 'Thai store name' },
  { key: 'store.name_en', value: 'Auan Auan Mala Fried', category: 'store', description: 'English store name' },
  { key: 'store.logo', value: '', category: 'store', description: 'Store logo image URL' },
  { key: 'store.description', value: 'Mala skewers restaurant at Regent Home Bangson', category: 'store', description: 'Store description' },
  { key: 'store.phone', value: '', category: 'store', description: 'Store contact phone' },
  { key: 'store.address', value: 'Regent Home Bangson', category: 'store', description: 'Store address' },
  { key: 'store.status', value: 'open', category: 'store', description: 'Store status' },

  // Business Hours (15:00-22:30 daily per 150-business-rules.md)
  { key: 'business_hours.monday.open', value: '15:00', category: 'business_hours', description: 'Monday opening time' },
  { key: 'business_hours.monday.close', value: '22:30', category: 'business_hours', description: 'Monday closing time' },
  { key: 'business_hours.tuesday.open', value: '15:00', category: 'business_hours', description: 'Tuesday opening time' },
  { key: 'business_hours.tuesday.close', value: '22:30', category: 'business_hours', description: 'Tuesday closing time' },
  { key: 'business_hours.wednesday.open', value: '15:00', category: 'business_hours', description: 'Wednesday opening time' },
  { key: 'business_hours.wednesday.close', value: '22:30', category: 'business_hours', description: 'Wednesday closing time' },
  { key: 'business_hours.thursday.open', value: '15:00', category: 'business_hours', description: 'Thursday opening time' },
  { key: 'business_hours.thursday.close', value: '22:30', category: 'business_hours', description: 'Thursday closing time' },
  { key: 'business_hours.friday.open', value: '15:00', category: 'business_hours', description: 'Friday opening time' },
  { key: 'business_hours.friday.close', value: '22:30', category: 'business_hours', description: 'Friday closing time' },
  { key: 'business_hours.saturday.open', value: '15:00', category: 'business_hours', description: 'Saturday opening time' },
  { key: 'business_hours.saturday.close', value: '22:30', category: 'business_hours', description: 'Saturday closing time' },
  { key: 'business_hours.sunday.open', value: '15:00', category: 'business_hours', description: 'Sunday opening time' },
  { key: 'business_hours.sunday.close', value: '22:30', category: 'business_hours', description: 'Sunday closing time' },
  { key: 'business_hours.temporary_closure.enabled', value: 'false', category: 'business_hours', description: 'Temporary closure enabled' },
  { key: 'business_hours.temporary_closure.reason', value: '', category: 'business_hours', description: 'Temporary closure reason' },
  { key: 'business_hours.temporary_closure.start', value: '', category: 'business_hours', description: 'Temporary closure start' },
  { key: 'business_hours.temporary_closure.end', value: '', category: 'business_hours', description: 'Temporary closure end' },

  // Payment
  { key: 'payment.promptpay_number', value: '0987654321', category: 'payment', description: 'PromptPay number (placeholder)' },
  { key: 'payment.account_name', value: 'Auan Auan Shop', category: 'payment', description: 'PromptPay account holder name (placeholder)' },
  { key: 'payment.promptpay_qr', value: '', category: 'payment', description: 'PromptPay QR image URL' },
  { key: 'payment.timeout', value: '300', category: 'payment', description: 'Payment timeout in seconds' },

  // Delivery
  { key: 'delivery.areas', value: '["Regent Home Bangson Phase 27","Regent Home Bangson Phase 28"]', category: 'delivery', description: 'Delivery areas' },
  { key: 'delivery.buildings', value: '["A","B","C","D"]', category: 'delivery', description: 'Delivery buildings' },
  { key: 'delivery.fee', value: '0', category: 'delivery', description: 'Delivery fee in THB' },
  { key: 'delivery.min_order', value: '0', category: 'delivery', description: 'Minimum order amount in THB' },
  { key: 'delivery.estimated_time', value: '20', category: 'delivery', description: 'Estimated delivery time in minutes' },
  { key: 'delivery.pickup_enabled', value: 'false', category: 'delivery', description: 'Pickup option enabled' },
  { key: 'delivery.enabled', value: 'true', category: 'delivery', description: 'Delivery enabled' },

  // Notification
  { key: 'notification.enabled', value: 'true', category: 'notification', description: 'Master notification toggle' },
  { key: 'notification.line_enabled', value: 'true', category: 'notification', description: 'LINE notifications enabled' },
  { key: 'notification.email_enabled', value: 'false', category: 'notification', description: 'Email notifications enabled' },
  { key: 'notification.sms_enabled', value: 'false', category: 'notification', description: 'SMS notifications enabled' },
  { key: 'notification.push_enabled', value: 'false', category: 'notification', description: 'Push notifications enabled' },

  // System
  { key: 'system.language', value: 'th', category: 'system', description: 'System language' },
  { key: 'system.timezone', value: 'Asia/Bangkok', category: 'system', description: 'System timezone' },
  { key: 'system.currency', value: 'THB', category: 'system', description: 'Currency code' },
  { key: 'system.date_format', value: 'DD/MM/YYYY', category: 'system', description: 'Date display format' },
  { key: 'system.maintenance_mode', value: 'false', category: 'system', description: 'Maintenance mode enabled' },
  { key: 'system.app_version', value: '1.0.0', category: 'system', description: 'Application version' },
];

const CATEGORIES = [
  { name: 'Mala Skewers', displayOrder: 1 },
  { name: 'Sauce', displayOrder: 2 },
];

interface ProductSeed {
  name: string;
  nameEn: string;
  description: string;
  price: number;
  displayOrder: number;
  sku: string;
  hasOptions: boolean;
}

const PRODUCTS: Record<string, ProductSeed[]> = {
  'Mala Skewers': [
    { name: 'ซี่โครงหมู', nameEn: 'Pork Skewer', description: 'ซี่โครงหมูย่างรสมะล่า', price: 25.0, displayOrder: 1, sku: 'MS-001', hasOptions: true },
    { name: 'ซี่โครงไก่', nameEn: 'Chicken Skewer', description: 'ซี่โครงไก่ย่างรสมะล่า', price: 25.0, displayOrder: 2, sku: 'MS-002', hasOptions: true },
    { name: 'ซี่โครงหมูสับ', nameEn: 'Minced Pork Skewer', description: 'ซี่โครงหมูสับย่างรสมะล่า', price: 30.0, displayOrder: 3, sku: 'MS-003', hasOptions: true },
    { name: 'ปีกไก่ย่าง', nameEn: 'Grilled Chicken Wing', description: 'ปีกไก่ย่างรสมะล่าเข้มข้น', price: 35.0, displayOrder: 4, sku: 'MS-004', hasOptions: true },
    { name: 'ไส้กระกอรั่น', nameEn: 'Sausage', description: 'ไส้กระกอรั่นย่างสูตรพิเศษ', price: 20.0, displayOrder: 5, sku: 'MS-005', hasOptions: true },
  ],
  Sauce: [
    { name: 'น้ำจิ้มราด', nameEn: 'Dipping Sauce', description: 'น้ำจิ้มราดสูตรมะล่า', price: 10.0, displayOrder: 1, sku: 'SC-001', hasOptions: false },
  ],
};

const SPICE_LEVEL_OPTIONS = [
  { name: 'ไม่เผ็ด (None)', displayOrder: 1 },
  { name: 'เผ็ดน้อย (Mild)', displayOrder: 2 },
  { name: 'เผ็ดปานกลาง (Medium)', displayOrder: 3 },
  { name: 'เผ็ด (Hot)', displayOrder: 4 },
  { name: 'เผ็ดมาก (Extra Hot)', displayOrder: 5 },
];

const SAUCE_OPTIONS = [
  { name: 'มะล่าผง (Mala Powder)', displayOrder: 1 },
  { name: 'น้ำส้มซี่อุ่น (Sesame Sauce)', displayOrder: 2 },
  { name: 'น้ำมะล่างม่วง (Sesame Mala Sauce)', displayOrder: 3 },
  { name: 'น้ำมะล่าถั่วลิสง (Sesame Peanut Sauce)', displayOrder: 4 },
  { name: 'น้ำจิ้มมะล่า (Mala Dipping Sauce)', displayOrder: 5 },
];

// ────────────────────────────────────────────────────────────────────────────
// Staff Roles
// ────────────────────────────────────────────────────────────────────────────

const STAFF_ROLES = [
  { name: 'OWNER', description: 'ระดับเจ้าของร้าน — เข้าถึงได้ทุกอย่าง', isActive: true },
  { name: 'ADMINISTRATOR', description: 'ระดับผู้ดูแลระบบ — จัดการ Staff, Settings, ดู Dashboard', isActive: true },
  { name: 'MANAGER', description: 'ระดับผู้จัดการ — จัดการรายการอาหาร, ดูออเดอร์', isActive: true },
  { name: 'KITCHEN', description: 'ระดับครัว — ดูและอัปเดตสถานะออเดอร์', isActive: true },
  { name: 'STAFF', description: 'ระดับพนักงานทั่วไป', isActive: true },
];

// ────────────────────────────────────────────────────────────────────────────
// Notification Templates
// ────────────────────────────────────────────────────────────────────────────

const NOTIFICATION_TEMPLATES = [
  {
    type: 'ORDER_CREATED',
    channel: 'LINE',
    title: 'สั่งอาหารใหม่! 🍢',
    body: 'มีออเดอร์ใหม่ {{orderNumber}}\nยอดรวม ฿{{total}}',
    description: 'แจ้งเจ้าของร้านเมื่อมีออเดอร์ใหม่',
  },
  {
    type: 'PAYMENT_VERIFIED',
    channel: 'LINE',
    title: 'ยืนยันการชำระเงินแล้ว ✅',
    body: 'ออเดอร์ {{orderNumber}} ชำระเงินแล้ว\nกำลังเตรียมอาหารให้คุณ',
    description: 'แจ้งลูกค้าเมื่อยืนยันการชำระเงิน',
  },
  {
    type: 'ORDER_READY',
    channel: 'LINE',
    title: 'อาหารพร้อมแล้ว! 🎉',
    body: 'ออเดอร์ {{orderNumber}} พร้อมส่งมาให้แล้ว\nกำลังนำส่งให้คุณ',
    description: 'แจ้งลูกค้าเมื่ออาหารพร้อมส่ง',
  },
  {
    type: 'ORDER_DELIVERED',
    channel: 'LINE',
    title: 'ส่งอาหารเรียบร้อยแล้ว 📦',
    body: 'ออเดอร์ {{orderNumber}} จัดส่งแล้ว\nขอบคุณที่สั่งอาหารกับเรา!',
    description: 'แจ้งลูกค้าเมื่อจัดส่งเสร็จ',
  },
  {
    type: 'ORDER_CANCELLED',
    channel: 'LINE',
    title: 'ออเดอร์ถูกยกเลิก ❌',
    body: 'ออเดอร์ {{orderNumber}} ถูกยกเลิก\nเหตุผล: {{reason}}',
    description: 'แจ้งลูกค้าเมื่อออเดอร์ถูกยกเลิก',
  },
  {
    type: 'PAYMENT_REJECTED',
    channel: 'LINE',
    title: 'การชำระเงินไม่สำเร็จ ❌',
    body: 'ออเดอร์ {{orderNumber}} การชำระเงินไม่ผ่าน\nกรุณาลองใหม่หรือติดต่อร้าน',
    description: 'แจ้งลูกค้าเมื่อสลิปไม่ถูกต้อง',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Demo data (fake LINE customer + sample completed order)
// ────────────────────────────────────────────────────────────────────────────
// This data simulates a realistic order flow so you can see how
// orders, payments, and notifications look in the database.
// Replace with real data after deploy.

const DEMO_CUSTOMER = {
  lineUserId: 'U_DEMO_LINE_USER_001',
  displayName: 'สมชาย ทดสอบ',
  pictureUrl: 'https://profile.line-scdn.net/demo-avatar.jpg',
};

const DEMO_ADDRESS = {
  building: 'A',
  roomNumber: '1201',
  note: 'หน้าประตูหลัง ของตึก A',
};

// ---------------------------------------------------------------------------
// Owner seed config
// ---------------------------------------------------------------------------

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@auanauan.com';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'Owner1234!';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Auan Auan Mala Fried — Database Seed ===');
  console.log('');

  // Split into multiple small transactions to avoid Neon serverless P2028 timeout
  // (Neon free tier has ~5s transaction timeout for interactive transactions)

  // ── 1. Settings ───────────────────────────────────────────────────
  console.log('[1/10] Seeding Settings...');
  for (const setting of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, category: setting.category, description: setting.description ?? null },
      create: { key: setting.key, value: setting.value, category: setting.category, description: setting.description ?? null },
    });
  }
  console.log(`        ${SETTINGS.length} settings upserted.`);

  // ── 2. Staff Roles ────────────────────────────────────────────────
  console.log('[2/10] Seeding Staff Roles...');
  for (const role of STAFF_ROLES) {
    await prisma.staffRole.upsert({
      where: { name: role.name },
      update: { description: role.description, isActive: role.isActive },
      create: { name: role.name, description: role.description, isActive: role.isActive },
    });
  }
  console.log(`        ${STAFF_ROLES.length} staff roles upserted.`);

  // ── 3. Owner Staff Account ───────────────────────────────────────
  console.log('[3/10] Seeding Owner account...');
  const passwordHash = await hash(OWNER_PASSWORD, BCRYPT_ROUNDS);
  await prisma.staff.upsert({
    where: { email: OWNER_EMAIL },
    update: { displayName: 'Owner', role: 'OWNER', isActive: true, deletedAt: null },
    create: { email: OWNER_EMAIL, passwordHash, displayName: 'Owner', role: 'OWNER' },
  });
  console.log(`        Owner account created (${OWNER_EMAIL}).`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`        ⚠️  Default owner password: ${OWNER_PASSWORD}`);
  }

  // ── 4. Notification Templates ──────────────────────────────────
  console.log('[4/10] Seeding Notification Templates...');
  for (const tmpl of NOTIFICATION_TEMPLATES) {
    await prisma.notificationTemplate.upsert({
      where: { type: tmpl.type },
      update: { channel: tmpl.channel, title: tmpl.title, body: tmpl.body, description: tmpl.description },
      create: { type: tmpl.type, channel: tmpl.channel, title: tmpl.title, body: tmpl.body, description: tmpl.description },
    });
  }
  console.log(`        ${NOTIFICATION_TEMPLATES.length} templates upserted.`);

  // ── 5. Categories ───────────────────────────────────────────────
  console.log('[5/10] Seeding Categories...');
  // Delete in FK-safe order: options → optionGroups → products → categories
  await prisma.productOption.deleteMany();
  await prisma.productOptionGroup.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  const categoryRecords = await Promise.all(
    CATEGORIES.map((cat) =>
      prisma.category.create({
        data: { name: cat.name, displayOrder: cat.displayOrder },
      }),
    ),
  );
  const categoryMap = new Map(categoryRecords.map((c) => [c.name, c.id]));
  console.log(`        ${categoryRecords.length} categories created.`);

  // ── 6. Products ──────────────────────────────────────────────────
  console.log('[6/10] Seeding Products...');

  const productRecords: Array<{ id: string; hasOptions: boolean; name: string; price: number }> = [];
  for (const [catName, products] of Object.entries(PRODUCTS)) {
    const categoryId = categoryMap.get(catName)!;
    for (const p of products) {
      const created = await prisma.product.create({
        data: {
          categoryId,
          name: p.name,
          nameEn: p.nameEn,
          description: p.description,
          price: p.price,
          status: ProductStatus.ACTIVE,
          displayOrder: p.displayOrder,
          isAvailable: true,
          sku: p.sku,
        },
      });
      productRecords.push({ id: created.id, hasOptions: p.hasOptions, name: p.name, price: p.price });
    }
  }
  console.log(`        ${productRecords.length} products created.`);

  // ── 7. ProductOptionGroups & ProductOptions ────────────────────
  console.log('[7/10] Seeding ProductOptionGroups & ProductOptions...');
  let groupCount = 0;
  let optionCount = 0;

  for (const { id: productId, hasOptions } of productRecords) {
    if (!hasOptions) continue;

    // Spice Level group
    const spiceGroup = await prisma.productOptionGroup.create({
      data: {
        productId,
        name: 'Spice Level',
        required: true,
        multiple: false,
        displayOrder: 1,
      },
    });
    groupCount++;

    for (const opt of SPICE_LEVEL_OPTIONS) {
      await prisma.productOption.create({
        data: {
          optionGroupId: spiceGroup.id,
          name: opt.name,
          additionalPrice: 0,
          displayOrder: opt.displayOrder,
          isActive: true,
        },
      });
      optionCount++;
    }

    // Sauce Selection group
    const sauceGroup = await prisma.productOptionGroup.create({
      data: {
        productId,
        name: 'Sauce Selection',
        required: true,
        multiple: false,
        displayOrder: 2,
      },
    });
    groupCount++;

    for (const opt of SAUCE_OPTIONS) {
      await prisma.productOption.create({
        data: {
          optionGroupId: sauceGroup.id,
          name: opt.name,
          additionalPrice: 0,
          displayOrder: opt.displayOrder,
          isActive: true,
        },
      });
      optionCount++;
    }
  }

  console.log(`        ${groupCount} option groups created.`);
  console.log(`        ${optionCount} options created.`);

  // ── 8. Demo Customer + Address ─────────────────────────────────
  console.log('[8/10] Seeding Demo Customer...');

  // Clean up existing demo order for idempotency (re-runnable seed)
  const existingOrder = await prisma.order.findFirst({
    where: { orderNumber: 'ORD-DEMO-000001' },
  });
  if (existingOrder) {
    await prisma.orderItemOption.deleteMany({ where: { orderItem: { orderId: existingOrder.id } } });
    await prisma.orderItem.deleteMany({ where: { orderId: existingOrder.id } });
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: existingOrder.id } });
    await prisma.notification.deleteMany({ where: { orderId: existingOrder.id } });
    await prisma.payment.deleteMany({ where: { orderId: existingOrder.id } });
    await prisma.auditLog.deleteMany({ where: { entityType: 'Order', entityId: existingOrder.id } });
    await prisma.order.delete({ where: { id: existingOrder.id } });
  }

  const demoCustomer = await prisma.customer.upsert({
    where: { lineUserId: DEMO_CUSTOMER.lineUserId },
    update: { displayName: DEMO_CUSTOMER.displayName, pictureUrl: DEMO_CUSTOMER.pictureUrl },
    create: DEMO_CUSTOMER,
  });

  // Address: deleteMany + create (schema has no composite unique for upsert)
  await prisma.customerAddress.deleteMany({
    where: { customerId: demoCustomer.id, building: DEMO_ADDRESS.building, roomNumber: DEMO_ADDRESS.roomNumber },
  });
  const demoAddress = await prisma.customerAddress.create({
    data: {
      customerId: demoCustomer.id,
      building: DEMO_ADDRESS.building,
      roomNumber: DEMO_ADDRESS.roomNumber,
      note: DEMO_ADDRESS.note,
      isDefault: true,
    },
  });

  // Create demo cart
  await prisma.cart.upsert({
    where: { customerId: demoCustomer.id },
    update: {},
    create: { customerId: demoCustomer.id },
  });
  console.log(`        Demo customer: ${DEMO_CUSTOMER.displayName}`);
  console.log(`        Demo address: ตึก ${DEMO_ADDRESS.building} ห้อง ${DEMO_ADDRESS.roomNumber}`);

  // ── 9. Demo Order (completed flow) ─────────────────────────────
  console.log('[9/10] Seeding Demo Order...');
  const orderNumber = 'ORD-DEMO-000001';
  const now = Date.now();

  // Use first 2 products for the demo order
  const demoProducts = productRecords.slice(0, 2);
  const unitPrice1 = new Prisma.Decimal(demoProducts[0].price);
  const unitPrice2 = new Prisma.Decimal(demoProducts[1].price);
  const qty1 = 3;
  const qty2 = 2;
  const subtotal = unitPrice1.mul(qty1).plus(unitPrice2.mul(qty2));

  const demoOrder = await prisma.order.create({
    data: {
      customerId: demoCustomer.id,
      addressId: demoAddress.id,
      orderNumber,
      subtotal,
      total: subtotal,
      orderStatus: 'COMPLETED',
      paymentStatus: 'PAID',
      note: 'ไม่เผ็ด ใช้น้ำจิ้มมะล่า',
    },
  });

  // Order items
  await prisma.orderItem.create({
    data: {
      orderId: demoOrder.id,
      productId: demoProducts[0].id,
      productName: demoProducts[0].name,
      quantity: qty1,
      unitPrice: unitPrice1,
      subtotal: unitPrice1.mul(qty1),
    },
  });

  const item2 = await prisma.orderItem.create({
    data: {
      orderId: demoOrder.id,
      productId: demoProducts[1].id,
      productName: demoProducts[1].name,
      quantity: qty2,
      unitPrice: unitPrice2,
      subtotal: unitPrice2.mul(qty2),
    },
  });

  // Selected option for item 2
  await prisma.orderItemOption.create({
    data: {
      orderItemId: item2.id,
      optionName: 'เผ็ดน้อย (Mild)',
      additionalPrice: 0,
    },
  });

  // Demo payment
  await prisma.payment.create({
    data: {
      orderId: demoOrder.id,
      method: 'PROMPTPAY',
      amount: subtotal,
      paymentStatus: 'PAID',
      paidAt: new Date(now - 30 * 60 * 1000), // 30 min ago
      verifiedAt: new Date(now - 29 * 60 * 1000),
      verifiedBy: 'system',
    },
  });

  // Order status history (showing full lifecycle)
  const statusTransitions = [
    { to: 'PENDING', offset: -45 },
    { to: 'AWAITING_PAYMENT', offset: -44 },
    { to: 'AWAITING_VERIFICATION', offset: -35 },
    { to: 'PAID', offset: -30 },
    { to: 'QUEUED', offset: -28 },
    { to: 'PREPARING', offset: -20 },
    { to: 'READY', offset: -10 },
    { to: 'OUT_FOR_DELIVERY', offset: -5 },
    { to: 'DELIVERED', offset: -2 },
    { to: 'COMPLETED', offset: -1 },
  ];

  for (const { to, offset } of statusTransitions) {
    await prisma.orderStatusHistory.create({
      data: {
        orderId: demoOrder.id,
        toStatus: to,
        changedBy: to === 'AWAITING_VERIFICATION' ? DEMO_CUSTOMER.lineUserId : 'system',
        createdAt: new Date(now + offset * 60 * 1000),
      },
    });
  }

  // Demo notification
  await prisma.notification.create({
    data: {
      orderId: demoOrder.id,
      recipientLineUserId: DEMO_CUSTOMER.lineUserId,
      type: 'ORDER_DELIVERED',
      channel: 'LINE',
      status: 'SENT',
      title: 'ส่งอาหารเรียบร้อยแล้ว 📦',
      body: `ออเดอร์ ${orderNumber} จัดส่งแล้ว`,
      sentAt: new Date(now - 2 * 60 * 1000),
      readAt: new Date(now - 1 * 60 * 1000),
    },
  });

  console.log(`        Demo order: ${orderNumber}`);
  console.log(`        Total: ฿${subtotal.toFixed(2)} (${qty1}x ${demoProducts[0].name} + ${qty2}x ${demoProducts[1].name})`);

  // ── 10. Demo Audit Log ──────────────────────────────────────────
  console.log('[10/10] Seeding Demo Audit Log...');
  await prisma.auditLog.create({
    data: {
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: demoOrder.id,
      actorId: DEMO_CUSTOMER.lineUserId,
      actorName: DEMO_CUSTOMER.displayName,
      details: { orderNumber },
    },
  });
  console.log('        1 audit log created.');

  console.log('');
  console.log('=== Seed completed successfully! ===');
  console.log('');
  console.log('Demo credentials:');
  console.log(`  Admin login:  ${OWNER_EMAIL}`);
  console.log(`  Password:     ${OWNER_PASSWORD}`);
  console.log('');
  console.log('Demo customer:');
  console.log(`  Name:         ${DEMO_CUSTOMER.displayName}`);
  console.log(`  LINE User ID:  ${DEMO_CUSTOMER.lineUserId}`);
  console.log(`  Address:       ตึก ${DEMO_ADDRESS.building} ห้อง ${DEMO_ADDRESS.roomNumber}`);
  console.log('');
  console.log('⚠️  This is demo data. Replace with real data after deploy.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
