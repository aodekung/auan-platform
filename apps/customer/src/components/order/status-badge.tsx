import { ORDER_STATUS, PAYMENT_STATUS } from "@auan/types"
import type { OrderStatus, PaymentStatus } from "@auan/types"

import { Badge } from "../ui/badge"
import { cn } from "../../lib/utils"

// ─────────────────────────────────────────────────────────────
// Order Status Colors (per 189-design-tokens.md status colors)
// ─────────────────────────────────────────────────────────────

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [ORDER_STATUS.AWAITING_PAYMENT]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  [ORDER_STATUS.AWAITING_VERIFICATION]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [ORDER_STATUS.PAID]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [ORDER_STATUS.QUEUED]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  [ORDER_STATUS.PREPARING]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [ORDER_STATUS.READY]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [ORDER_STATUS.COMPLETED]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  [ORDER_STATUS.CANCELLED]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  [ORDER_STATUS.EXPIRED]: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200",
  [ORDER_STATUS.PAYMENT_REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "รอดำเนินการ",
  [ORDER_STATUS.AWAITING_PAYMENT]: "รอชำระเงิน",
  [ORDER_STATUS.AWAITING_VERIFICATION]: "รอตรวจสอบ",
  [ORDER_STATUS.PAID]: "ชำระแล้ว",
  [ORDER_STATUS.QUEUED]: "อยู่ในคิว",
  [ORDER_STATUS.PREPARING]: "กำลังทำ",
  [ORDER_STATUS.READY]: "พร้อมส่ง",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "กำลังส่ง",
  [ORDER_STATUS.DELIVERED]: "ส่งแล้ว",
  [ORDER_STATUS.COMPLETED]: "สำเร็จ",
  [ORDER_STATUS.CANCELLED]: "ยกเลิก",
  [ORDER_STATUS.EXPIRED]: "หมดเวลา",
  [ORDER_STATUS.PAYMENT_REJECTED]: "ชำระเงินไม่สำเร็จ",
}

// ─────────────────────────────────────────────────────────────
// Payment Status Colors
// ─────────────────────────────────────────────────────────────

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [PAYMENT_STATUS.AWAITING_VERIFICATION]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [PAYMENT_STATUS.PAID]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [PAYMENT_STATUS.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [PAYMENT_STATUS.FAILED]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  [PAYMENT_STATUS.EXPIRED]: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  [PAYMENT_STATUS.REFUNDED]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUS.PENDING]: "รอชำระ",
  [PAYMENT_STATUS.AWAITING_VERIFICATION]: "รอตรวจสอบ",
  [PAYMENT_STATUS.PAID]: "ชำระแล้ว",
  [PAYMENT_STATUS.REJECTED]: "ไม่อนุมัติ",
  [PAYMENT_STATUS.FAILED]: "ล้มเหลว",
  [PAYMENT_STATUS.EXPIRED]: "หมดเวลา",
  [PAYMENT_STATUS.REFUNDED]: "คืนเงินแล้ว",
}

// ─────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus
  type: "order" | "payment"
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const isOrder = type === "order"
  const styles = isOrder ? ORDER_STATUS_STYLES[status as OrderStatus] : PAYMENT_STATUS_STYLES[status as PaymentStatus]
  const labels = isOrder ? ORDER_STATUS_LABELS[status as OrderStatus] : PAYMENT_STATUS_LABELS[status as PaymentStatus]

  return (
    <Badge className={cn("border-0 font-medium", styles)} variant="outline">
      {labels}
    </Badge>
  )
}
