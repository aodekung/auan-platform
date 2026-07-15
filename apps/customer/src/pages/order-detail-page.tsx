import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, MapPin, Clock, Trash2 } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { StatusBadge } from "../components/order/status-badge"
import { OrderTimeline } from "../components/order/order-timeline"
import { useOrderDetail, useCancelOrder } from "../hooks/use-orders"
import { ErrorState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { ORDER_STATUS } from "@auan/types"
import type { OrderStatus } from "@auan/types"

/** Statuses that allow customer cancellation */
const CANCELLABLE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.AWAITING_PAYMENT,
  ORDER_STATUS.AWAITING_VERIFICATION,
  ORDER_STATUS.PAID,
]

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading, error, refetch } = useOrderDetail(id ?? "")
  const cancelOrder = useCancelOrder()

  const handleCancel = () => {
    if (!id || !order) return
    if (confirm("คุณต้องการยกเลิกออเดอร์นี้?")) {
      cancelOrder.mutate(
        { orderId: id },
        { onSuccess: () => void refetch() },
      )
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (error || !order) {
    return <ErrorState title="ไม่พบออเดอร์" onRetry={() => void refetch()} />
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus)
  const orderDate = new Date(order.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </button>

        {/* Order Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold">{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground">{orderDate}</p>
          </div>
          <StatusBadge status={order.orderStatus} type="order" />
        </div>

        {/* Status Timeline */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold">สถานะออเดอร์</h2>
            <OrderTimeline currentStatus={order.orderStatus} statusHistory={order.statusHistory} />
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold">รายการสินค้า</h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-muted-foreground">{item.quantity}×</span>{" "}
                    {item.productName}
                    {item.options.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ({item.options.map((o) => o.optionName).join(", ")})
                      </p>
                    )}
                  </div>
                  <span className="font-medium">฿{Number(item.subtotal).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between font-semibold">
              <span>ทั้งหมด</span>
              <span className="text-primary">฿{Number(order.total).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        {order.note && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">หมายเหตุ</p>
                  <p className="text-muted-foreground">{order.note}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleCancel}
            disabled={cancelOrder.isPending}
          >
            <Trash2 className="h-4 w-4" />
            {cancelOrder.isPending ? "กำลังยกเลิก..." : "ยกเลิกออเดอร์"}
          </Button>
        )}

        {cancelOrder.isError && (
          <p className="text-center text-sm text-destructive">
            {cancelOrder.error?.message || "ไม่สามารถยกเลิกได้"}
          </p>
        )}
      </div>
    </ErrorBoundary>
  )
}
