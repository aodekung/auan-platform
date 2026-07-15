import { Link } from "react-router-dom"
import { ChevronRight, ShoppingBag, Store as StoreIcon, Clock } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { useCategories } from "../hooks/use-categories"
import { useProducts } from "../hooks/use-products"
import { useIsStoreOpen } from "../hooks/use-settings"
import { useCartStore } from "../stores"
import { ProductGridSkeleton, ErrorState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { cn } from "../lib/utils"

export function HomePage() {
  const { data: categories, isLoading: catLoading, error: catError, refetch: refetchCat } = useCategories()
  const { data: productsData, isLoading: prodLoading, error: prodError, refetch: refetchProd } = useProducts({ pageSize: 8 })
  const { isOpen, nextOpenTime } = useIsStoreOpen()
  const cartItemCount = useCartStore((s) => s.getItemCount())

  const isClosed = isOpen === false

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Store closed banner */}
        {isClosed && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-center">
            <Clock className="mx-auto mb-1 h-5 w-5 text-destructive" />
            <p className="text-sm font-medium text-destructive">ร้านปิดอยู่</p>
            <p className="text-xs text-muted-foreground">
              {nextOpenTime
                ? `เปิดอีกครั้ง ${new Date(nextOpenTime).toLocaleDateString("th-TH", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}`
                : "กรุณากลับมาใหม่ในเวลาทำการ"}
            </p>
          </div>
        )}

        {/* Hero */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🥢 อ้วนอ้วนหม่าล่าทอด</h1>
              <p className="text-sm text-muted-foreground">Regent Home Bangson Phase 27 & 28</p>
            </div>
            {cartItemCount > 0 && (
              <Link to="/cart">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ShoppingBag className="h-4 w-4" />
                  {cartItemCount}
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">หมวดหมู่</h2>
            <Link to="/menu" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
              ดูทั้งหมด <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {catError ? (
            <ErrorState message="ไม่สามารถโหลดหมวดหมู่ได้" onRetry={() => void refetchCat()} />
          ) : catLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories
                .filter((c) => c.isActive)
                .map((category) => (
                  <Link
                    key={category.id}
                    to={`/menu?category=${category.id}`}
                    className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border bg-card text-center transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="text-2xl">🍗</span>
                    <span className="line-clamp-1 text-xs font-medium">{category.name}</span>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">ยังไม่มีหมวดหมู่</p>
          )}
        </section>

        {/* Popular Products */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">สินค้ายอดนิยม</h2>
            <Link to="/menu" className="flex items-center gap-0.5 text-xs text-primary hover:underline">
              ดูทั้งหมด <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {prodError ? (
            <ErrorState message="ไม่สามารถโหลดสินค้าได้" onRetry={() => void refetchProd()} />
          ) : prodLoading ? (
            <ProductGridSkeleton />
          ) : productsData && productsData.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {productsData.data.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🍢
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2.5">
                      <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
                      <p className={cn(
                        "text-sm font-semibold",
                        !product.isAvailable && "text-muted-foreground line-through",
                      )}>
                        ฿{Number(product.price).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <StoreIcon className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">ยังไม่มีสินค้า</p>
            </div>
          )}
        </section>
      </div>
    </ErrorBoundary>
  )
}
