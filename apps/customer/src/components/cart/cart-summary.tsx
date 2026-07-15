import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { useCartStore } from "../../stores"

interface CartSummaryProps {
  subtotal: string
  total: string
  itemCount: number
}

export function CartSummary({ subtotal, total, itemCount }: CartSummaryProps) {
  const localCount = useCartStore((s) => s.getItemCount())

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <h3 className="text-sm font-medium">สรุปรายการ</h3>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">รายการทั้งหมด</span>
          <span>{localCount || itemCount} รายการ</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">รวม</span>
          <span>฿{Number(subtotal).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">ค่าจัดส่ง</span>
          <span className="text-green-600">ฟรี</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>ทั้งหมด</span>
        <span className="text-primary">฿{Number(total).toLocaleString()}</span>
      </div>

      <Link to="/checkout">
        <Button className="w-full" size="lg" disabled={itemCount === 0}>
          สั่งออเดอร์
        </Button>
      </Link>
    </div>
  )
}
