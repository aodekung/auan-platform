import { Link } from "react-router-dom"
import { Heart, ShoppingCart, Store as StoreIcon } from "lucide-react"

import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  ProductGridSkeleton,
  ErrorState,
  EmptyState,
} from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { useFavorites, useRemoveFavorite } from "../hooks/use-favorites"
import { useAuth } from "../providers/auth-provider"
import { useAddToCart } from "../hooks/use-cart"

export function FavoritesPage() {
  const { isAuthenticated } = useAuth()
  const { data: favorites, isLoading, error, refetch } = useFavorites()
  const removeFavorite = useRemoveFavorite()
  const addToCart = useAddToCart()

  const handleRemove = (productId: string) => {
    removeFavorite.mutate(productId)
  }

  const handleAddToCart = (productId: string) => {
    addToCart.mutate({ productId, quantity: 1 })
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">รายการโปรด</h1>
        <EmptyState
          icon={<Heart className="h-10 w-10" />}
          title="กรุณาเข้าสู่ระบบ"
          description="เข้าสู่ระบบเพื่อดูรายการโปรดของคุณ"
        />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">รายการโปรด</h1>
          {favorites && favorites.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {favorites.length} รายการ
            </span>
          )}
        </div>

        {/* Content */}
        {error ? (
          <ErrorState
            message="ไม่สามารถโหลดรายการโปรดได้"
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {favorites.map((favorite) => {
              const product = favorite.product
              if (!product) return null

              return (
                <Card
                  key={favorite.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    {/* Image */}
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
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

                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${product.id}`}
                        className="line-clamp-2 font-medium leading-tight hover:underline"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemove(product.id)
                        }}
                        className="shrink-0"
                        aria-label="นำออกจากรายการโปรด"
                      >
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </button>
                    </div>
                    {product.description && (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="p-3 pt-0">
                    <p className="text-sm font-semibold text-primary">
                      ฿{Number(product.price).toLocaleString()}
                    </p>
                  </CardContent>

                  <CardFooter className="p-3 pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5"
                      disabled={!product.isAvailable}
                      onClick={() => handleAddToCart(product.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product.isAvailable ? "เพิ่มลงตะกร้า" : "ไม่ว่าง"}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={<StoreIcon className="h-10 w-10" />}
            title="ยังไม่มีรายการโปรด"
            description="เพิ่มเมนูที่ชอบได้จากหน้าเมนูอาหาร"
            action={{
              label: "ดูเมนูอาหาร",
              // Using window.location for simplicity since Link import is already used
              onClick: () => {
                window.location.href = "/menu"
              },
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
