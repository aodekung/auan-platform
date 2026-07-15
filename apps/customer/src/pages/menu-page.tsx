import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Search, ShoppingBag, Store as StoreIcon } from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ProductCard } from "../components/product/product-card"
import { useCategories } from "../hooks/use-categories"
import { useProducts } from "../hooks/use-products"
import { useCartStore } from "../stores"
import { ProductGridSkeleton, ErrorState, EmptyState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { cn } from "../lib/utils"

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get("category") || undefined
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)

  const cartItemCount = useCartStore((s) => s.getItemCount())

  const { data: categories } = useCategories()
  const { data: productsData, isLoading, error, refetch } = useProducts({
    categoryId: selectedCategory,
    search: search || undefined,
    pageSize: 50,
  })

  const handleCategoryClick = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId)
    if (categoryId) {
      setSearchParams({ category: categoryId })
    } else {
      setSearchParams({})
    }
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    // Reset pagination when searching
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">เมนูอาหาร</h1>
          {cartItemCount > 0 && (
            <Link to="/cart">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                {cartItemCount}
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหาเมนู..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Tabs */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => handleCategoryClick(undefined)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              ทั้งหมด
            </button>
            {categories
              .filter((c) => c.isActive)
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {category.name}
                </button>
              ))}
          </div>
        )}

        {/* Products */}
        {error ? (
          <ErrorState message="ไม่สามารถโหลดสินค้าได้" onRetry={() => void refetch()} />
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : productsData && productsData.data.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {productsData.data.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                imageUrl={product.imageUrl}
                price={product.price}
                isAvailable={product.isAvailable}
                description={product.description}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<StoreIcon className="h-10 w-10" />}
            title="ไม่พบสินค้า"
            description={search ? `ไม่พบ "${search}" ในเมนู` : "ยังไม่มีสินค้าในหมวดนี้"}
            action={
              search
                ? { label: "ล้างการค้นหา", onClick: () => handleSearch("") }
                : { label: "ดูทั้งหมด", onClick: () => handleCategoryClick(undefined) }
            }
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
