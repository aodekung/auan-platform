import { ORDER_STATUS } from "@auan/types"
import type { OrderStatus } from "@auan/types"

import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

// ─────────────────────────────────────────────────────────────
// Status flow for customer-facing timeline
// ─────────────────────────────────────────────────────────────

interface TimelineStep {
  status: OrderStatus
  label: string
}

const TIMELINE_STEPS: TimelineStep[] = [
  { status: ORDER_STATUS.AWAITING_PAYMENT, label: "รอชำระเงิน" },
  { status: ORDER_STATUS.PAID, label: "ชำระแล้ว" },
  { status: ORDER_STATUS.PREPARING, label: "กำลังทำ" },
  { status: ORDER_STATUS.READY, label: "พร้อมรับ" },
  { status: ORDER_STATUS.COMPLETED, label: "สำเร็จ" },
]

/**
 * Map of order statuses to which timeline step they represent.
 * Multiple statuses can map to the same step.
 */
const STATUS_TO_STEP_INDEX: Partial<Record<OrderStatus, number>> = {
  [ORDER_STATUS.PENDING]: 0,
  [ORDER_STATUS.AWAITING_PAYMENT]: 0,
  [ORDER_STATUS.AWAITING_VERIFICATION]: 0,
  [ORDER_STATUS.PAID]: 1,
  [ORDER_STATUS.QUEUED]: 1,
  [ORDER_STATUS.PREPARING]: 2,
  [ORDER_STATUS.READY]: 3,
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 3,
  [ORDER_STATUS.DELIVERED]: 3,
  [ORDER_STATUS.COMPLETED]: 4,
}

// Terminal negative statuses
const TERMINAL_NEGATIVE = new Set<OrderStatus>([
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.EXPIRED,
  ORDER_STATUS.PAYMENT_REJECTED,
])

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus
}

export function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const isNegativeTerminal = TERMINAL_NEGATIVE.has(currentStatus)
  const currentStepIndex = STATUS_TO_STEP_INDEX[currentStatus] ?? 0

  return (
    <div className="space-y-1">
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = !isNegativeTerminal && index <= currentStepIndex
        const isCurrent = !isNegativeTerminal && index === currentStepIndex

        return (
          <div key={step.status} className="flex items-center gap-3">
            {/* Step indicator */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 bg-background text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-sm transition-colors",
                isCompleted ? "font-medium" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>

            {/* Current indicator */}
            {isCurrent && (
              <span className="ml-auto text-xs text-primary animate-pulse">● ปัจจุบัน</span>
            )}
          </div>
        )
      })}

      {/* Negative terminal status */}
      {isNegativeTerminal && (
        <div className="flex items-center gap-3 pt-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground text-xs font-medium">
            ✕
          </div>
          <span className="text-sm font-medium text-destructive">
            {currentStatus === ORDER_STATUS.CANCELLED && "ออเดอร์ถูกยกเลิก"}
            {currentStatus === ORDER_STATUS.EXPIRED && "หมดเวลาชำระเงิน"}
            {currentStatus === ORDER_STATUS.PAYMENT_REJECTED && "การชำระเงินไม่สำเร็จ"}
          </span>
        </div>
      )}
    </div>
  )
}
