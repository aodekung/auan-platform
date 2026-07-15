import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag } from "lucide-react"

import { useCart } from "../hooks/use-cart"
import { useUpdateCartItem, useRemoveCartItem } from "../hooks/use-cart"
import { CartItem } from "../components/cart/cart-item"
import { CartSummary } from "../components/cart/cart-summary"
import { EmptyState, ErrorState, CartSkeleton } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"

export function CartPage() {
  const { data: cart, isLoading, error, refetch } = useCart()
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const navigate = useNavigate()

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateItem.mutate({ id: itemId, body: { quantity } })
  }

  const handleRemove = (itemId: string) => {
    removeItem.mutate(itemId)
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">🛒 ตะกร้าสินค้า</h1>

        {error ? (
          <ErrorState
            message="ไม่สามารถโหลดตะกร้าได้"
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <CartSkeleton />
        ) : !cart || cart.items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-12 w-12" />}
            title="ตะกร้าว่าง"
            description="ยังไม่มีสินค้าในตะกร้า เลือกเมนูที่คุณชอบ!"
            action={{ label: "ดูเมนู", onClick: () => navigate("/menu") }}
          />
        ) : (
          <div className="space-y-3">
            {/* Cart Items */}
            <div className="space-y-2">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={(quantity) => handleUpdateQuantity(item.id, quantity)}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>

            {/* Summary */}
            <CartSummary
              subtotal={cart.subtotal}
              total={cart.total}
              itemCount={cart.itemCount}
            />
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
