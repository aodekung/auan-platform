import { Trash2 } from "lucide-react"

import { Button } from "../ui/button"
import { QuantitySelector } from "../product/quantity-selector"
import type { CartItemResponse } from "../../api"

interface CartItemProps {
  item: CartItemResponse
  onUpdateQuantity: (quantity: number) => void
  onRemove: () => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      {/* Image */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            ไม่มีรูป
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-tight">{item.productName}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            aria-label="ลบรายการ"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected options */}
        {item.selectedOptions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {item.selectedOptions.map((opt) => opt.optionName).join(", ")}
          </p>
        )}

        {item.note && (
          <p className="text-xs italic text-muted-foreground">📝 {item.note}</p>
        )}

        {/* Bottom: quantity + price */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <QuantitySelector
            quantity={item.quantity}
            onDecrease={() => onUpdateQuantity(item.quantity - 1)}
            onIncrease={() => onUpdateQuantity(item.quantity + 1)}
          />
          <span className="text-sm font-semibold">
            ฿{Number(item.subtotal).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
