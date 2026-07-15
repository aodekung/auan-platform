import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ChefHat, Clock, UtensilsCrossed } from "lucide-react"
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@auan/ui"
import type { OrderStatus } from "@auan/types"

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const KITCHEN_STATUSES: OrderStatus[] = ["QUEUED", "PREPARING", "READY"]
const STATUS_PRIORITY: Record<OrderStatus, number> = {
  QUEUED: 0,
  PREPARING: 1,
  READY: 2,
  PENDING: 3,
  AWAITING_PAYMENT: 3,
  AWAITING_VERIFICATION: 3,
  PAID: 3,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 3,
  COMPLETED: 3,
  CANCELLED: 3,
  EXPIRED: 3,
  PAYMENT_REJECTED: 3,
}

const STATUS_BORDER_CLASS: Record<OrderStatus, string> = {
  QUEUED: "border-info",
  PREPARING: "border-warning",
  READY: "border-success",
  PENDING: "",
  AWAITING_PAYMENT: "",
  AWAITING_VERIFICATION: "",
  PAID: "",
  OUT_FOR_DELIVERY: "",
  DELIVERED: "",
  COMPLETED: "",
  CANCELLED: "",
  EXPIRED: "",
  PAYMENT_REJECTED: "",
}

interface NextAction {
  label: string
  nextStatus: OrderStatus
}

const NEXT_ACTION: Record<OrderStatus, NextAction> = {
  QUEUED: { label: "เริ่มทำ", nextStatus: "PREPARING" },
  PREPARING: { label: "พร้อมส่ง", nextStatus: "READY" },
  READY: { label: "กำลังส่ง", nextStatus: "OUT_FOR_DELIVERY" },
  PENDING: { label: "", nextStatus: "PENDING" },
  AWAITING_PAYMENT: { label: "", nextStatus: "AWAITING_PAYMENT" },
  AWAITING_VERIFICATION: { label: "", nextStatus: "AWAITING_VERIFICATION" },
  PAID: { label: "", nextStatus: "PAID" },
  OUT_FOR_DELIVERY: { label: "", nextStatus: "OUT_FOR_DELIVERY" },
  DELIVERED: { label: "", nextStatus: "DELIVERED" },
  COMPLETED: { label: "", nextStatus: "COMPLETED" },
  CANCELLED: { label: "", nextStatus: "CANCELLED" },
  EXPIRED: { label: "", nextStatus: "EXPIRED" },
  PAYMENT_REJECTED: { label: "", nextStatus: "PAYMENT_REJECTED" },
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getElapsedMinutes(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = Date.now()
  return Math.floor((now - created) / 1000 / 60)
}

function formatElapsed(minutes: number): string {
  if (minutes < 1) return "เมื่อกี้"
  if (minutes < 60) return `${minutes} นาที`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  return `${hours} ชม. ${remaining} นาที`
}

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────

export function KitchenPage() {
  const queryClient = useQueryClient()

  const queued = useOrders({ status: "QUEUED", pageSize: 100 })
  const preparing = useOrders({ status: "PREPARING", pageSize: 100 })
  const ready = useOrders({ status: "READY", pageSize: 100 })

  const updateStatus = useUpdateOrderStatus()

  const isLoading =
    queued.isLoading || preparing.isLoading || ready.isLoading
  const isError =
    queued.isError || preparing.isError || ready.isError
  const error = queued.error || preparing.error || ready.error

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
    }, 10_000)
    return () => clearInterval(interval)
  }, [queryClient])

  // Merge and sort orders
  const orders = useMemo(() => {
    const all = [
      ...(queued.data?.data ?? []),
      ...(preparing.data?.data ?? []),
      ...(ready.data?.data ?? []),
    ]
    return all.sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.orderStatus as OrderStatus] ?? 99
      const priorityB = STATUS_PRIORITY[b.orderStatus as OrderStatus] ?? 99
      if (priorityA !== priorityB) return priorityA - priorityB
      // Within same status: oldest first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  }, [queued.data, preparing.data, ready.data])

  if (isLoading) {
    return <KitchenLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="ครัว" description="ออเดอร์ที่ต้องทำ" />
        <EmptyState
          icon={<UtensilsCrossed className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลได้"
          description={error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="ครัว" description="ออเดอร์ที่ต้องทำ" />

      {orders.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="h-12 w-12" />}
          title="ไม่มีออเดอร์ที่ต้องทำ"
          description="ออเดอร์ใหม่จะแสดงที่นี่อัตโนมัติ"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              orderId={order.id}
              orderNumber={order.orderNumber}
              orderStatus={order.orderStatus as OrderStatus}
              itemCount={order.itemCount}
              note={order.note}
              createdAt={order.createdAt}
              onUpdateStatus={updateStatus.mutateAsync}
              isUpdating={updateStatus.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Order Card
// ─────────────────────────────────────────────

interface OrderCardProps {
  orderId: string
  orderNumber: string
  orderStatus: OrderStatus
  itemCount: number
  note: string | null
  createdAt: string
  onUpdateStatus: (vars: { orderId: string; status: OrderStatus }) => Promise<unknown>
  isUpdating: boolean
}

function OrderCard({
  orderId,
  orderNumber,
  orderStatus,
  itemCount,
  note,
  createdAt,
  onUpdateStatus,
  isUpdating,
}: OrderCardProps) {
  const elapsed = getElapsedMinutes(createdAt)
  const action = NEXT_ACTION[orderStatus]

  const handleAction = () => {
    if (action) {
      onUpdateStatus({ orderId, status: action.nextStatus })
    }
  }

  return (
    <Card className={cn("border-l-4", STATUS_BORDER_CLASS[orderStatus])}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">{orderNumber}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={elapsed > 15 ? "error" : "outline"}>
              <Clock className="mr-1 h-3 w-3" />
              {formatElapsed(elapsed)}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {itemCount} รายการ
        </p>
      </CardHeader>

      <CardContent className="pb-3">
        {note && (
          <div className="mb-2 rounded-md bg-warning/10 border border-warning/20 px-3 py-2">
            <p className="text-sm font-medium text-warning">หมายเหตุ</p>
            <p className="text-sm text-muted-foreground">{note}</p>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="pt-3">
        {action && action.label && (
          <Button
            className="w-full"
            size="md"
            disabled={isUpdating}
            onClick={handleAction}
          >
            {action.label}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Loading Skeleton
// ─────────────────────────────────────────────

function KitchenLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-12 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
