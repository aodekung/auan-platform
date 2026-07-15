import { ORDER_STATUS } from "@auan/types"
import type { OrderStatus, OrderStatusHistoryResponse } from "@auan/types"

import { Check, Clock, XCircle } from "lucide-react"
import { cn } from "../../lib/utils"

// ─────────────────────────────────────────────────────────────
// Status metadata — Thai labels for timeline
// ─────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: "สั่งซื้อแล้ว",
  [ORDER_STATUS.AWAITING_PAYMENT]: "รอชำระเงิน",
  [ORDER_STATUS.AWAITING_VERIFICATION]: "ตรวจสอบการชำระเงิน",
  [ORDER_STATUS.PAID]: "ชำระแล้ว",
  [ORDER_STATUS.QUEUED]: "อยู่ในคิว",
  [ORDER_STATUS.PREPARING]: "กำลังทำ",
  [ORDER_STATUS.READY]: "พร้อมรับ",
  [ORDER_STATUS.OUT_FOR_DELIVERY]: "กำลังจัดส่ง",
  [ORDER_STATUS.DELIVERED]: "จัดส่งแล้ว",
  [ORDER_STATUS.COMPLETED]: "สำเร็จ",
  [ORDER_STATUS.CANCELLED]: "ยกเลิก",
  [ORDER_STATUS.EXPIRED]: "หมดเวลาชำระเงิน",
  [ORDER_STATUS.PAYMENT_REJECTED]: "การชำระเงินไม่สำเร็จ",
}

/** Positive flow statuses (the happy path). */
const POSITIVE_FLOW: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.QUEUED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
]

/** Terminal negative statuses. */
const TERMINAL_NEGATIVE = new Set<OrderStatus>([
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.EXPIRED,
  ORDER_STATUS.PAYMENT_REJECTED,
])

/**
 * Determine the index of the current status in the positive flow.
 * Some statuses (e.g. AWAITING_PAYMENT) map to the same step.
 */
function getFlowIndex(status: OrderStatus): number {
  const mapping: Partial<Record<OrderStatus, number>> = {
    [ORDER_STATUS.PENDING]: 0,
    [ORDER_STATUS.AWAITING_PAYMENT]: 0,
    [ORDER_STATUS.AWAITING_VERIFICATION]: 0,
    [ORDER_STATUS.PAID]: 0,
    [ORDER_STATUS.QUEUED]: 1,
    [ORDER_STATUS.PREPARING]: 2,
    [ORDER_STATUS.READY]: 3,
    [ORDER_STATUS.OUT_FOR_DELIVERY]: 4,
    [ORDER_STATUS.DELIVERED]: 5,
    [ORDER_STATUS.COMPLETED]: 5,
  }
  return mapping[status] ?? 0
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface OrderTimelineProps {
  currentStatus: OrderStatus
  statusHistory: OrderStatusHistoryResponse[]
}

export function OrderTimeline({ currentStatus, statusHistory }: OrderTimelineProps) {
  const isNegativeTerminal = TERMINAL_NEGATIVE.has(currentStatus)

  // Build a map of status -> history entry (with timestamp)
  const historyMap = new Map<string, OrderStatusHistoryResponse>()
  for (const entry of statusHistory) {
    historyMap.set(entry.toStatus, entry)
  }

  const currentFlowIndex = getFlowIndex(currentStatus)

  // Find the cancel/terminal history entry
  const terminalEntry = isNegativeTerminal
    ? historyMap.get(currentStatus)
    : null

  return (
    <div className="relative space-y-0">
      {POSITIVE_FLOW.map((stepStatus, index) => {
        const isCompleted = !isNegativeTerminal && index <= currentFlowIndex
        const isCurrent = !isNegativeTerminal && index === currentFlowIndex
        const historyEntry = historyMap.get(stepStatus)
        const isLast = index === POSITIVE_FLOW.length - 1

        return (
          <div key={stepStatus} className="flex gap-3">
            {/* Left: Dot + Line */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 bg-background text-muted-foreground",
                  isCurrent && "ring-4 ring-primary/20",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 min-h-[2rem] flex-1",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20",
                  )}
                />
              )}
            </div>

            {/* Right: Label + Timestamp */}
            <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  isCompleted ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[stepStatus] ?? stepStatus}
              </p>

              {/* Timestamp from history */}
              {historyEntry && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(historyEntry.createdAt)}
                </div>
              )}

              {/* Current pulse indicator */}
              {isCurrent && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  ปัจจุบัน
                </span>
              )}
            </div>
          </div>
        )
      })}

      {/* Negative terminal status (e.g. CANCELLED) */}
      {isNegativeTerminal && terminalEntry && (
        <div className="flex gap-3">
          {/* Red dot */}
          <div className="flex items-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground ring-4 ring-destructive/20">
              <XCircle className="h-4 w-4" />
            </div>
          </div>

          {/* Label + reason + timestamp */}
          <div className="flex-1 pb-2">
            <p className="text-sm font-medium text-destructive">
              {STATUS_LABELS[currentStatus] ?? currentStatus}
            </p>

            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimestamp(terminalEntry.createdAt)}
            </div>

            {/* Reason */}
            {terminalEntry.reason && (
              <p className="mt-1 text-xs text-muted-foreground">
                เหตุผล: {terminalEntry.reason}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
