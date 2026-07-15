import { useState } from "react"
import { Link } from "react-router-dom"
import { ClipboardList } from "lucide-react"

import { useOrders } from "../hooks/use-orders"
import { OrderCard } from "../components/order/order-card"
import { EmptyState, ErrorState, OrderListSkeleton } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { cn } from "../lib/utils"
import { ORDER_STATUS } from "@auan/types"
import type { OrderStatus } from "@auan/types"

const STATUS_FILTERS: { label: string; value?: string }[] = [
  { label: "ทั้งหมด" },
  { label: "รอชำระ", value: ORDER_STATUS.AWAITING_PAYMENT },
  { label: "กำลังทำ", value: ORDER_STATUS.PREPARING },
  { label: "พร้อมรับ", value: ORDER_STATUS.READY },
  { label: "สำเร็จ", value: ORDER_STATUS.COMPLETED },
  { label: "ยกเลิก", value: ORDER_STATUS.CANCELLED },
]

export function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<string | undefined>(undefined)
  const { data, isLoading, error, refetch } = useOrders({
    status: activeFilter,
    pageSize: 20,
  })

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">📦 ออเดอร์ของฉัน</h1>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value ?? "all"}
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                activeFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {error ? (
          <ErrorState
            message="ไม่สามารถโหลดออเดอร์ได้"
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <OrderListSkeleton />
        ) : data && data.data.length > 0 ? (
          <div className="space-y-3">
            {data.data.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="h-10 w-10" />}
            title="ยังไม่มีออเดอร์"
            description={activeFilter ? `ไม่มีออเดอร์ที่มีสถานะนี้` : "สั่งออเดอร์แรกของคุณเลย!"}
            action={{ label: "ดูเมนู", onClick: () => {} }}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
