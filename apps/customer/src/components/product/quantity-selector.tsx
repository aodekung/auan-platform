import { Minus, Plus } from "lucide-react"
import { Button } from "../ui/button"

interface QuantitySelectorProps {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  min?: number
  max?: number
}

export function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 50,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onDecrease}
        disabled={quantity <= min}
        aria-label="ลดจำนวน"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <span className="w-8 text-center text-sm font-medium" aria-live="polite">
        {quantity}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onIncrease}
        disabled={quantity >= max}
        aria-label="เพิ่มจำนวน"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
