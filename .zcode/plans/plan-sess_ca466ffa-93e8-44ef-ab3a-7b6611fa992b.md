# แผนแก้ไขทั้งหมด 10 ประเด็น

## 1. 🛒 Fixed Cart FAB ทุกหน้า Customer (ยกเว้น payment/checkout)
**ไฟล์:** `apps/customer/src/layouts/root-layout.tsx`
- เพิ่ม Floating Action Button (FAB) ที่มุมล่างขวา แสดง icon 🛒 + จำนวนสินค้าในตะกร้า
- กดแล้วไป `/cart`
- ซ่อนเมื่อ path อยู่ใน `HIDE_NAV_PATHS` หรือเมื่อ cartItemCount = 0
- ยกตำแหน่ง bottom-nav ขึ้นมาเล็กน้อยเพื่อไม่ให้ FAB บัง

## 2. ⚡ สั่งออเดอร์ → Auto สร้าง Payment + ไปหน้าชำระเงินทันที
**ไฟล์:** `apps/customer/src/pages/payment-page.tsx`
- เอาปุ่ม "เริ่มชำระเงิน" ออก
- เปลี่ยนเป็น auto-create payment ด้วย `useEffect` เมื่อ `!payment && orderId && !createPayment.isPending`
- แสดง loading state "กำลังเตรียมข้อมูลการชำระเงิน..." ตลอดเวลา
- **อัปเดต:** เพิ่ม `createPayment.isError` handling ให้แสดง error + ปุ่มลองใหม่

## 3. 🖼️ QR Code ชำระเงินไม่ขึ้น (BUG: Setting key mismatch)
**ไฟล์:** `apps/api/src/modules/payments/payments.service.ts:324-326`
- **Root cause:** `createPayment` ค้นหา key `payment.promptpay.number` / `payment.promptpay.qrcode` (ใช้ dot) แต่ key จริงใน DB คือ `payment.promptpay_number` / `payment.promptpay_qr` (ใช้ underscore)
- **Fix:** ใช้ `SETTING_KEYS.PAYMENT.PROMPTPAY_NUMBER` / `SETTING_KEYS.PAYMENT.PROMPTPAY_QR` จาก constants
- QR ที่แสดงอาจมาจาก `storeSettings` (GET /settings/store) ซึ่งใช้ key ถูกต้องแล้ว แต่ payment response จะคืนค่า null เสมอ

## 4. 📎 หลักฐานสลิปเป็น Optional (Optional label)
**ไฟล์:** `apps/customer/src/pages/payment-page.tsx`
- เปลี่ยน header จาก "อัปโหลดสลิปการโอนเงิน" → "อัปโหลดสลิปการโอนเงิน (Optional)"
- เพิ่มข้อความช่วยเหลือเล็กน้อย "คุณสามารถอัปโหลดสลิปเพื่อช่วยยืนยันการชำระเงินได้"
- API confirm ไม่ต้องแก้ (ยืนยันได้โดยไม่ต้องมี slip อยู่แล้ว)

## 5. ⚠️ อัปโหลดรูปมั่วๆ → ไม่แจ้ง Error (BUG: upload-slip 400 null body)
**ไฟล์:** `apps/customer/src/hooks/use-payments.ts` (`useUploadSlip`)
- **Root cause:** `useUploadSlip` ส่ง `FormData` แต่ endpoint `/payments/:id/upload-slip` คาดหวัง JSON body `{ slipBase64: string }` (ตาม schema) → ทำให้ Fastify parse เป็น null → Zod  reject "Expected object, received null"
- **Fix:** เปลี่ยนให้แปลง file → base64 แล้วส่งเป็น JSON `{ slipBase64, fileName }` ผ่าน `apiClient.post`
- เพิ่ม `onError` callback ใน mutation เพื่อแสดง error message ให้ผู้ใช้เห็น
- เพิ่ม error display บน `payment-page.tsx` สำหรับ upload error

## 6. ✅ Admin กดยืนยันชำระเงินไม่ได้ (BUG: verifyPayment crash null userId)
**ไฟล์:** `apps/api/src/modules/payments/payments.controller.ts:32-34,111-122`
- **Root cause:** Admin verify endpoint อยู่ใน `admin.routes.ts:204` ใช้ `authenticateOrStaff` (ไม่ใช่ `authenticate`). `authenticateOrStaff` ตั้งค่า `request.user` สำหรับ Owner แต่ตั้งค่า `request.staff` สำหรับ Staff. `getUserId()` อ่าน `request.user` ซึ่งเป็น `undefined` เมื่อ login เป็น Staff → crash `Cannot read properties of null`
- **Fix:** สร้าง helper ใหม่ `getVerifierId()` ที่อ่านจาก `request.user` หรือ `request.staff` โดย `authenticateOrStaff` ตั้งค่าทั้งสอง
- แก้ทั้ง `verifyPaymentHandler` และ `rejectPaymentHandler` ให้ใช้ helper ใหม่

## 7. 🤖 Admin Verify อัตโนมัติ? — ข้อจำกัด
**ไม่มีการเปลี่ยนแปลงโค้ด** — จะอธิบายข้อจำกัดให้:
- **OCR Slip Verification** ต้องใช้ AI/ML service ภายนอก (เช่น Google Vision, AWS Textract) ซึ่งมีค่าใช้จ่าย
- **Bank API** ต้องเป็นลูกค้าธุรกิจของแต่ละธนาคาร ขอ API key ยุ่งยาก
- **ทางเลือก:** ทำได้แค่ semi-auto (แสดง slip ให้ admin ดู + ปุ่ม verify 1 คลิก) ซึ่งระบบทำอยู่แล้ว

## 8. 📋 Order History หน้า Customer — ไม่ขึ้นประวัติ + รูปไม่แสดง
**ไฟล์ Backend:** `apps/api/src/modules/payments/payments.service.ts` (order items mapper)
- เพิ่ม `imageUrl` ใน `OrderItemResponse` โดย join กับ Product table
- อัปเดต shared types `packages/types/src/index.ts` ให้ `OrderItemResponse` มี `imageUrl?: string | null`

**ไฟล์ Frontend:**
- `apps/customer/src/pages/order-detail-page.tsx` — แสดงรูปย่อยของแต่ละ item
- `apps/customer/src/components/order/order-card.tsx` — แสดงรูป item แรกเป็น preview
- `apps/customer/src/auan-types.d.ts` — อัปเดต type ให้ตรง

## 9. 🔐 ตัวเลือกพิเศษ Owner 403 (BUG: wrong auth middleware)
**ไฟล์:** `apps/api/src/modules/option-templates/option-template.routes.ts`
- **Root cause:** ทุก route ใช้ `authenticateStaff + authorizeStaff(...)` ซึ่งยอมรับเฉพาะ Staff JWT → Owner (LINE JWT) ถูกปฏิเสธ
- **Fix:** เปลี่ยนทุก admin route ในไฟล์นี้ให้ใช้ `authenticateOrStaff + authorizeOwnerOrAdmin(...)` เหมือน admin.routes.ts
- GET `/admin/option-groups` → `authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER", "STAFF")`
- POST/PATCH/DELETE → `authorizeOwnerOrAdmin("OWNER", "ADMINISTRATOR", "MANAGER")`

## 10. 📱 ลดขนาดเมนู + List/Grid Toggle + Quick-Add Popup
**ไฟล์ที่แก้:**
- `apps/customer/src/pages/home-page.tsx` — ลดขนาด category boxes จาก h-20 w-20 → h-16 w-16, product cards ให้เล็กลง
- `apps/customer/src/pages/menu-page.tsx` — เพิ่ม Toggle List/Grid View, ส่ง viewMode prop ให้ component
- `apps/customer/src/components/product/product-card.tsx` — ลดขนาด card (ลด padding, font), ปรับรูปให้เล็กลง
- **สร้างใหม่:** `apps/customer/src/components/product/product-list-item.tsx` — List view item (รูปเล็ก + ชื่อ + ราคา + ปุ่มเพิ่ม)
- **สร้างใหม่:** `apps/customer/src/components/product/quick-add-dialog.tsx` — Popup สำหรับเลือก Required Options เมื่อกด Quick-Add
- **สร้างใหม่:** `apps/customer/src/components/product/view-toggle.tsx` — ปุ่มสลับ List/Grid
- `apps/customer/src/pages/product-detail-page.tsx` — ลดขนาดรูป `aspect-square` และ price font
- `apps/customer/src/hooks/use-cart.ts` หรือ `useAddToCart` — เพิ่ม `addToCartQuick` สำหรับสินค้าที่ไม่มี required options

---

## สรุปลำดับการทำงาน (Priority Order)
1. **Critical bugs ก่อน:** #3 (QR key mismatch), #5 (upload-slip 400), #6 (admin verify crash), #9 (option-groups 403)
2. **Flow improvements:** #1 (Cart FAB), #2 (auto payment), #4 (slip optional label)
3. **Feature additions:** #8 (order images), #10 (UI list/grid + quick-add)
4. **ไม่แก้ (อธิบายเท่านั้น):** #7 (auto verify limitations)