/**
 * Notification Template Service — manages notification templates.
 *
 * Responsibilities:
 * - Load template from database by type + channel
 * - Replace placeholders with actual data
 * - Provide default templates when DB template is missing
 *
 * Template placeholders use {{key}} syntax:
 *   {{customerName}}, {{orderNumber}}, {{orderTotal}},
 *   {{orderStatus}}, {{building}}, {{roomNumber}}, {{paymentAmount}}
 *
 * Per 159-notification-rules.md: notification content must contain
 * order number, customer name, current status, timestamp.
 */

import { NotificationTemplateRepository } from "../../database/repositories/notification-template.repository.js"

import type { TemplatePlaceholderData } from "./notification.types.js"

// ─────────────────────────────────────────────────────────────
// Singleton
// ─────────────────────────────────────────────────────────────

const templateRepo = new NotificationTemplateRepository()

// ─────────────────────────────────────────────────────────────
// Default Templates (fallback when DB template not found)
// ─────────────────────────────────────────────────────────────
// These ensure the system works even without DB-stored templates.
// Per 159-notification-rules.md notification examples.

interface DefaultTemplate {
  title: string
  body: string
}

const DEFAULT_TEMPLATES: Record<string, DefaultTemplate> = {
  ORDER_CREATED: {
    title: "สร้างออเดอร์แล้ว",
    body: "ออเดอร์ {{orderNumber}} ของคุณถูกสร้างเรียบร้อยแล้ว กรุณาชำระเงินภายใน 5 นาที",
  },
  PAYMENT_SUBMITTED: {
    title: "ยืนยันการชำระเงิน",
    body: "ได้รับการยืนยันการชำระเงินสำหรับออเดอร์ {{orderNumber}} กำลังรอการตรวจสอบ",
  },
  PAYMENT_VERIFIED: {
    title: "ชำระเงินสำเร็จ",
    body: "การชำระเงินสำหรับออเดอร์ {{orderNumber}} ได้รับการยืนยันแล้ว กำลังเตรียมอาหาร",
  },
  PAYMENT_REJECTED: {
    title: "การชำระเงินไม่สำเร็จ",
    body: "การชำระเงินสำหรับออเดอร์ {{orderNumber}} ไม่ผ่านการตรวจสอบ กรุณาลองใหม่อีกครั้ง",
  },
  PAYMENT_EXPIRED: {
    title: "หมดเวลาชำระเงิน",
    body: "หมดเวลาชำระเงินสำหรับออเดอร์ {{orderNumber}} กรุณาสร้างออเดอร์ใหม่",
  },
  KITCHEN_STARTED: {
    title: "กำลังเตรียมอาหาร",
    body: "ออเดอร์ {{orderNumber}} ของคุณกำลังเตรียมอาหาร ระยะเวลาโดยประมาณ 20 นาที",
  },
  ORDER_READY: {
    title: "อาหารพร้อมส่ง",
    body: "ออเดอร์ {{orderNumber}} ของคุณพร้อมส่งแล้ว",
  },
  ORDER_OUT_FOR_DELIVERY: {
    title: "กำลังส่งออเดอร์",
    body: "ออเดอร์ {{orderNumber}} ของคุณกำลังอยู่ระหว่างการจัดส่ง",
  },
  ORDER_DELIVERED: {
    title: "จัดส่งออเดอร์สำเร็จ",
    body: "ออเดอร์ {{orderNumber}} ของคุณถูกจัดส่งเรียบร้อยแล้ว ขอให้เพลิดเพลินกับอาหาร!",
  },
  ORDER_COMPLETED: {
    title: "ออเดอร์เสร็จสิ้น",
    body: "ออเดอร์ {{orderNumber}} เสร็จสิ้นแล้ว ขอบคุณที่ใช้บริการ",
  },
  ORDER_CANCELLED: {
    title: "ยกเลิกออเดอร์",
    body: "ออเดอร์ {{orderNumber}} ถูกยกเลิกแล้ว",
  },
  SYSTEM_ANNOUNCEMENT: {
    title: "ประกาศ",
    body: "",
  },
}

// ─────────────────────────────────────────────────────────────
// Placeholder replacement
// ─────────────────────────────────────────────────────────────

/**
 * Replace {{key}} placeholders in a template string with actual values.
 * Keys that are not found in data are left as-is.
 */
function replacePlaceholders(
  template: string,
  data: TemplatePlaceholderData,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = data[key]
    return value !== undefined ? value : match
  })
}

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Render a notification title and body from template.
 *
 * Flow:
 *   1. Try to load template from DB (by type + channel).
 *   2. If not found, use default fallback template.
 *   3. Replace placeholders with provided data.
 *
 * Returns { title, body } ready for notification creation.
 */
export async function renderTemplate(
  type: string,
  channel: string,
  data: TemplatePlaceholderData,
): Promise<{ title: string; body: string }> {
  // Try DB template first
  const dbTemplate = await templateRepo.findByTypeAndChannel(type, channel)

  if (dbTemplate) {
    return {
      title: replacePlaceholders(dbTemplate.title, data),
      body: replacePlaceholders(dbTemplate.body, data),
    }
  }

  // Try DB template by type only (any channel)
  const dbTemplateByType = await templateRepo.findByType(type)
  if (dbTemplateByType) {
    return {
      title: replacePlaceholders(dbTemplateByType.title, data),
      body: replacePlaceholders(dbTemplateByType.body, data),
    }
  }

  // Fallback to hardcoded defaults
  const defaultTemplate = DEFAULT_TEMPLATES[type]
  if (defaultTemplate) {
    return {
      title: replacePlaceholders(defaultTemplate.title, data),
      body: replacePlaceholders(defaultTemplate.body, data),
    }
  }

  // Ultimate fallback for unknown types
  return {
    title: `Notification: ${type}`,
    body: `เหตุการณ์ ${type} เกิดขึ้นกับออเดอร์ ${data.orderNumber ?? ""}`.trim(),
  }
}
