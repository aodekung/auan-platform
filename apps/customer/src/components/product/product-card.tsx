import { Link } from "react-router-dom"
import { ShoppingCart } from "lucide-react"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../ui/card"

function getUploadUrl(relativePath: string): string {
  if (!relativePath) return ""
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  return `${baseUrl}/uploads/${relativePath}`
}

interface ProductCardProps {
  id: string
  name: string
  imageUrl: string | null
  price: string
  quantity: number
  isAvailable: boolean
  description?: string | null
}

export function ProductCard({ id, name, imageUrl, price, quantity, isAvailable, description }: ProductCardProps) {
  // Product is out of stock when:
  // - Admin explicitly disabled it (isAvailable = false), OR
  // - Stock tracking is enabled (quantity was set > 0) but stock has been depleted to 0
  // quantity = 0 (default) means unlimited / no stock tracking
  const outOfStock = !isAvailable
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/product/${id}`} className="block">
        {/* Image */}
        <div className="aspect-square w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={getUploadUrl(imageUrl)}
              alt={name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              ไม่มีรูปภาพ
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="p-2 pb-0.5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/product/${id}`} className="line-clamp-2 font-medium leading-tight hover:underline">
            {name}
          </Link>
          {outOfStock && (
            <Badge variant="destructive" className="shrink-0 text-xs">
              หมด
            </Badge>
          )}
        </div>
        {description && (
          <p className="line-clamp-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      <CardContent className="p-2 pt-0">
        <p className="text-sm font-semibold text-primary">
          ฿{Number(price).toLocaleString()}
        </p>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Link to={`/product/${id}`} className="w-full">
          <Button
            size="sm"
            variant="outline"
            className="w-full gap-1.5"
            disabled={outOfStock}
          >
            <ShoppingCart className="h-4 w-4" />
            {outOfStock ? "สินค้าหมดชั่วคราว" : "เลือก"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
