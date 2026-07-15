import { Badge, type BadgeVariant } from "@/components/ui/badge"
import type { OrderStatus, PaymentStatus } from "@auan/types"

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  PENDING: "warning",
  AWAITING_PAYMENT: "warning",
  AWAITING_VERIFICATION: "info",
  PAID: "success",
  QUEUED: "info",
  PREPARING: "info",
  READY: "success",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "secondary",
  EXPIRED: "secondary",
  PAYMENT_REJECTED: "error",
}

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "Awaiting Payment",
  AWAITING_VERIFICATION: "Awaiting Verification",
  PAID: "Paid",
  QUEUED: "Queued",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  PAYMENT_REJECTED: "Payment Rejected",
}

const PAYMENT_STATUS_VARIANT: Record<PaymentStatus, BadgeVariant> = {
  PENDING: "warning",
  AWAITING_VERIFICATION: "info",
  PAID: "success",
  REJECTED: "error",
  FAILED: "error",
  EXPIRED: "secondary",
  REFUNDED: "secondary",
}

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  AWAITING_VERIFICATION: "Awaiting Verification",
  PAID: "Paid",
  REJECTED: "Rejected",
  FAILED: "Failed",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
}

// ─────────────────────────────────────────────
// Order Status Badge
// ─────────────────────────────────────────────

interface OrderStatusBadgeProps {
  status: OrderStatus
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status]} className={className}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  )
}

// ─────────────────────────────────────────────
// Payment Status Badge
// ─────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  return (
    <Badge variant={PAYMENT_STATUS_VARIANT[status]} className={className}>
      {PAYMENT_STATUS_LABEL[status]}
    </Badge>
  )
}
