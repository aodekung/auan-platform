import { useState, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  ShoppingCart,
  User,
  MapPin,
  StickyNote,
  Package,
  Clock,
  CheckCircle2,
  Ban,
  Loader2,
} from "lucide-react"
import { useOrderDetail, useUpdateOrderStatus, useCancelOrder } from "@/hooks/use-orders"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/admin/status-badge"
import { AlertDialogBox } from "@/components/ui/dialog"
import type { OrderStatus } from "@/api"
import { cn } from "@auan/ui"

// ─────────────────────────────────────────────
// Status machine: current -> allowed next transitions
// ─────────────────────────────────────────────

type StatusTransition = {
  from: OrderStatus
  to: OrderStatus
  label: string
}

const STATUS_TRANSITIONS: StatusTransition[] = [
  { from: "PENDING", to: "AWAITING_PAYMENT", label: "ยืนยันออเดอร์" },
  { from: "AWAITING_PAYMENT", to: "AWAITING_VERIFICATION", label: "ยืนยนชำระเงิน" },
  { from: "AWAITING_VERIFICATION", to: "PAID", label: "ยืนยันชำระเงิน" },
  { from: "PAID", to: "QUEUED", label: "เริ่มทำ" },
  { from: "QUEUED", to: "PREPARING", label: "กำลังทำ" },
  { from: "PREPARING", to: "READY", label: "พร้อมส่ง" },
  { from: "READY", to: "OUT_FOR_DELIVERY", label: "กำลังส่ง" },
  { from: "OUT_FOR_DELIVERY", to: "DELIVERED", label: "ส่งแล้ว" },
  { from: "DELIVERED", to: "COMPLETED", label: "เสร็จสิ้น" },
]

const CANCELLABLE_STATUSES: OrderStatus[] = [
  "PENDING",
  "AWAITING_PAYMENT",
  "AWAITING_VERIFICATION",
  "PAID",
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatThaiDate(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(dateString))
}

function formatThaiShortDate(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function formatCurrency(amount: number): string {
  return `฿${amount.toFixed(2)}`
}

// ─────────────────────────────────────────────
// OrderDetailPage
// ─────────────────────────────────────────────

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError, error, refetch } = useOrderDetail(id ?? "")
  const updateStatusMutation = useUpdateOrderStatus()
  const cancelOrderMutation = useCancelOrder()

  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [confirmTransitionOpen, setConfirmTransitionOpen] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<StatusTransition | null>(null)

  const currentStatus = data?.orderStatus as OrderStatus | undefined
  const allowedTransitions = useMemo(
    () => STATUS_TRANSITIONS.filter((t) => t.from === currentStatus),
    [currentStatus],
  )
  const canCancel = currentStatus ? CANCELLABLE_STATUSES.includes(currentStatus) : false

  const handleUpdateStatus = (transition: StatusTransition) => {
    if (!id) return
    setPendingTransition(transition)
    setConfirmTransitionOpen(true)
  }

  const confirmUpdateStatus = () => {
    if (!id || !pendingTransition) return
    updateStatusMutation.mutate(
      { orderId: id, status: pendingTransition.to },
      {
        onSuccess: () => {
          setConfirmTransitionOpen(false)
          setPendingTransition(null)
        },
      },
    )
  }

  const handleCancelOrder = () => {
    if (!id) return
    cancelOrderMutation.mutate(
      { orderId: id, reason: cancelReason || undefined },
      {
        onSuccess: () => {
          setCancelOpen(false)
          setCancelReason("")
        },
      },
    )
  }

  if (isLoading) {
    return <OrderDetailLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="รายละเอียดออเดอร์" description="ดูรายละเอียดและจัดการออเดอร์" />
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลได้"
          description={error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  if (!data) return null

  const sortedHistory = [...data.statusHistory].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader
        title={data.orderNumber}
        description={`สร้างเมื่อ ${formatThaiDate(data.createdAt)}`}
        actions={
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={data.orderStatus as OrderStatus} />
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
              กลับ
            </Button>
          </div>
        }
      />

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Customer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              ลูกค้า
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {data.customerId ? `ID: ${data.customerId}` : "—"}
            </p>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              ที่อยู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {data.addressId ? `ID: ${data.addressId}` : "ไม่ระบุที่อยู่"}
            </p>
          </CardContent>
        </Card>

        {/* Note */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <StickyNote className="h-4 w-4" />
              หมายเหตุ
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.note ? (
              <p className="text-sm text-foreground">{data.note}</p>
            ) : (
              <p className="text-sm text-muted-foreground">ไม่มีหมายเหตุ</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            รายการสินค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">สินค้า</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">จำนวน</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">ราคา/หน่วย</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">รวม</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{item.productName}</p>
                        {item.options && item.options.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.options.map((opt) => (
                              <Badge key={opt.id} variant="outline" className="text-xs">
                                {opt.optionName}
                                {Number(opt.additionalPrice) > 0 && ` +${formatCurrency(Number(opt.additionalPrice))}`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{item.quantity}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(Number(item.unitPrice))}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">
                      {formatCurrency(Number(item.subtotal))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-end gap-4">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                ย่อย: <span className="tabular-nums">{formatCurrency(Number(data.subtotal))}</span>
              </p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(Number(data.total))}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            ประวัติสถานะ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเปลี่ยนสถานะ</p>
          ) : (
            <div className="relative space-y-0">
              {sortedHistory.map((entry, index) => (
                <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                        index === 0
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-background",
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {index < sortedHistory.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2">
                      <OrderStatusBadge status={entry.toStatus as OrderStatus} />
                      {entry.fromStatus && (
                        <span className="text-xs text-muted-foreground">
                          from{" "}
                          <Badge variant="outline" className="text-xs">
                            {entry.fromStatus}
                          </Badge>
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatThaiShortDate(entry.createdAt)}</span>
                      {entry.changedBy && <span>by {entry.changedBy}</span>}
                    </div>
                    {entry.reason && (
                      <p className="mt-1 text-sm text-muted-foreground italic">
                        {entry.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      {(allowedTransitions.length > 0 || canCancel) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">จัดการออเดอร์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((transition) => (
                <Button
                  key={transition.to}
                  onClick={() => handleUpdateStatus(transition)}
                  disabled={updateStatusMutation.isPending}
                  isLoading={
                    updateStatusMutation.isPending &&
                    pendingTransition?.to === transition.to
                  }
                >
                  {transition.label}
                </Button>
              ))}
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setCancelOpen(true)}
                  disabled={cancelOrderMutation.isPending}
                >
                  <Ban className="h-4 w-4" />
                  ยกเลิกออเดอร์
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm status transition */}
      <AlertDialogBox
        open={confirmTransitionOpen}
        onOpenChange={setConfirmTransitionOpen}
        title="เปลี่ยนสถานะออเดอร์"
        description={
          pendingTransition
            ? `ต้องการเปลี่ยนสถานะออเดอร์ ${data.orderNumber} เป็น "${pendingTransition.label}" (${pendingTransition.to})?`
            : ""
        }
        cancel={
          <Button variant="outline" onClick={() => setConfirmTransitionOpen(false)}>
            ยกเลิก
          </Button>
        }
        action={
          <Button onClick={confirmUpdateStatus} isLoading={updateStatusMutation.isPending}>
            ยืนยัน
          </Button>
        }
      />

      {/* Cancel confirmation */}
      <AlertDialogBox
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open)
          if (!open) setCancelReason("")
        }}
        title="ยกเลิกออเดอร์"
        description={`ต้องการยกเลิกออเดอร์ ${data.orderNumber}?`}
        children={
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="เหตุผลในการยกเลิก (ไม่จำเป็น)"
            className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
          />
        }
        cancel={
          <Button variant="outline" onClick={() => setCancelOpen(false)}>
            ยกเลิก
          </Button>
        }
        action={
          <Button
            variant="destructive"
            onClick={handleCancelOrder}
            isLoading={cancelOrderMutation.isPending}
          >
            ยืนยันยกเลิก
          </Button>
        }
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────

function OrderDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
