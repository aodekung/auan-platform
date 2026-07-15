import { Link } from "react-router-dom"

import { Card, CardContent, CardHeader } from "../ui/card"
import { StatusBadge } from "./status-badge"
import type { OrderResponse } from "../../api"

interface OrderCardProps {
  order: OrderResponse
}

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Link to={`/orders/${order.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <p className="text-sm font-medium">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
          <StatusBadge status={order.orderStatus} type="order" />
        </CardHeader>
        <CardContent className="pb-3">
          {/* Items preview */}
          <p className="text-xs text-muted-foreground">
            {order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}
          </p>

          {/* Total */}
          <p className="mt-1 text-sm font-semibold text-primary">
            ฿{Number(order.total).toLocaleString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
