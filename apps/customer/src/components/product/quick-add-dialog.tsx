import { useState, useMemo } from "react"
import { ShoppingCart, X } from "lucide-react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { OptionSelector } from "./option-selector"
import { QuantitySelector } from "./quantity-selector"
import type { OptionGroupResponse } from "../../api"

interface QuickAddDialogProps {
  open: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    price: string
    isAvailable: boolean
  } | null
  optionGroups: OptionGroupResponse[] | undefined
  onAdd: (data: { quantity: number; selectedOptions: Array<{ optionGroupId: string; optionId: string; optionName: string; additionalPrice: number }> }) => void
  isPending: boolean
}

export function QuickAddDialog({ open, onClose, product, optionGroups, onAdd, isPending }: QuickAddDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { optionId: string; optionName: string; additionalPrice: number }>>({})
  const [quantity, setQuantity] = useState(1)

  const currentPrice = useMemo(() => {
    if (!product) return 0
    const base = Number(product.price)
    const opts = Object.values(selectedOptions).reduce((s, o) => s + o.additionalPrice, 0)
    return (base + opts) * quantity
  }, [product, selectedOptions, quantity])

  const isReady = useMemo(() => {
    if (!optionGroups) return false
    return optionGroups.filter((g) => g.required).every((g) => selectedOptions[g.id]?.optionId)
  }, [optionGroups, selectedOptions])

  const handleAdd = () => {
    if (!product || !isReady) return
    onAdd({
      quantity,
      selectedOptions: Object.entries(selectedOptions).map(([groupId, opt]) => ({
        optionGroupId: groupId,
        ...opt,
      })),
    })
    // Reset state for next use
    setSelectedOptions({})
    setQuantity(1)
  }

  const handleClose = () => {
    setSelectedOptions({})
    setQuantity(1)
    onClose()
  }

  if (!open || !product) return null

  const hasRequiredOptions = optionGroups?.some((g) => g.required)

  // If no required options, add directly without showing dialog
  if (!hasRequiredOptions) {
    onAdd({ quantity: 1, selectedOptions: [] })
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-t-xl border bg-background p-4 shadow-xl animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{product.name}</h3>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        {optionGroups && optionGroups.length > 0 && (
          <div className="space-y-3 mb-3">
            {optionGroups.map((group) => (
              <OptionSelector
                key={group.id}
                group={group}
                selectedOptionId={selectedOptions[group.id]?.optionId ?? null}
                onSelect={(groupId, optionId, optionName, additionalPrice) => {
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [groupId]: { optionId, optionName, additionalPrice: Number(additionalPrice) },
                  }))
                }}
              />
            ))}
          </div>
        )}

        <Separator className="my-3" />

        {/* Bottom bar */}
        <div className="flex items-center gap-3">
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => Math.min(50, q + 1))}
          />
          <Button
            className="flex-1 gap-2"
            size="lg"
            disabled={!isReady || isPending}
            onClick={handleAdd}
          >
            <ShoppingCart className="h-4 w-4" />
            เพิ่มลงตะกร้า — ฿{currentPrice.toLocaleString()}
          </Button>
        </div>
      </div>
    </div>
  )
}
