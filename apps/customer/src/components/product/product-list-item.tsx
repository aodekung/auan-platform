import { ShoppingCart } from "lucide-react"
import { Button } from "../ui/button"

function getUploadUrl(relativePath: string): string {
  if (!relativePath) return ""
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  return `${baseUrl}/uploads/${relativePath}`
}

interface ProductListItemProps {
  id: string
  name: string
  imageUrl: string | null
  price: string
  description?: string | null
  isAvailable: boolean
  onQuickAdd: () => void
}

export function ProductListItem({ id, name, imageUrl, price, description, isAvailable, onQuickAdd }: ProductListItemProps) {
  const outOfStock = !isAvailable
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-2">
      <a href={`/product/${id}`} className="block shrink-0">
        <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
          {imageUrl ? (
            <img src={getUploadUrl(imageUrl)} alt={name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg text-muted-foreground">🍢</div>
          )}
        </div>
      </a>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
        <p className="text-sm font-semibold text-primary">฿{Number(price).toLocaleString()}</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 gap-1"
        disabled={outOfStock}
        onClick={onQuickAdd}
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        {outOfStock ? "หมด" : "เพิ่ม"}
      </Button>
    </div>
  )
}
