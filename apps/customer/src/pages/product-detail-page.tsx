import { useMemo, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, ShoppingCart, ChevronRight } from "lucide-react"

import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { OptionSelector } from "../components/product/option-selector"
import { QuantitySelector } from "../components/product/quantity-selector"
import { useProductDetail, useProductOptions } from "../hooks/use-products"
import { useAddToCart } from "../hooks/use-cart"
import { useIsStoreOpen } from "../hooks/use-settings"
import { ProductDetailSkeleton, ErrorState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { cn } from "../lib/utils"

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading, error, refetch } = useProductDetail(id ?? "")
  const { data: optionGroups } = useProductOptions(id ?? "")
  const { isOpen } = useIsStoreOpen()

  // State: selected options per group, quantity, note
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { optionId: string; optionName: string; additionalPrice: number }>>({})
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const addToCartMutation = useAddToCart()

  // Calculate current price
  const currentPrice = useMemo(() => {
    if (!product) return 0
    const basePrice = Number(product.price)
    const optionsPrice = Object.values(selectedOptions).reduce((sum, opt) => sum + opt.additionalPrice, 0)
    return (basePrice + optionsPrice) * quantity
  }, [product, selectedOptions, quantity])

  // Validate all required options are selected
  const isReadyToAdd = useMemo(() => {
    if (!optionGroups) return false
    return optionGroups
      .filter((g) => g.required)
      .every((g) => selectedOptions[g.id]?.optionId)
  }, [optionGroups, selectedOptions])

  const handleSelectOption = (
    groupId: string,
    optionId: string,
    optionName: string,
    additionalPrice: number,
  ) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: { optionId, optionName, additionalPrice },
    }))
  }

  const handleAddToCart = () => {
    if (!product || !isReadyToAdd) return

    addToCartMutation.mutate(
      {
        productId: product.id,
        quantity,
        selectedOptions: Object.entries(selectedOptions).map(([, opt]) => ({
          optionGroupId: Object.keys(selectedOptions).find(
            (k) => selectedOptions[k].optionId === opt.optionId,
          ) ?? "",
          optionId: opt.optionId,
          optionName: opt.optionName,
          additionalPrice: opt.additionalPrice,
        })),
        note: note || undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true)
          setTimeout(() => navigate("/cart"), 800)
        },
      },
    )
  }

  if (error) {
    return <ErrorState title="ไม่พบสินค้า" onRetry={() => void refetch()} />
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return <ErrorState title="ไม่พบสินค้า" />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Back button */}
        <Link
          to={-1 as unknown as string}
          onClick={(e) => {
            e.preventDefault()
            navigate(-1)
          }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ
        </Link>

        {/* Product Image */}
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              🍢
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}
          <p className="text-2xl font-bold text-primary">
            ฿{currentPrice.toLocaleString()}
          </p>
          {!product.isAvailable && (
            <p className="text-sm text-destructive font-medium">สินค้าหมดชั่วคราว</p>
          )}
        </div>

        <Separator />

        {/* Product Options */}
        {optionGroups && optionGroups.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold">เลือกตัวเลือก</h2>
            {optionGroups.map((group) => (
              <OptionSelector
                key={group.id}
                group={group}
                selectedOptionId={selectedOptions[group.id]?.optionId ?? null}
                onSelect={handleSelectOption}
              />
            ))}
          </div>
        )}

        {/* Note */}
        <div className="space-y-2">
          <h2 className="text-base font-semibold">หมายเหตุ (ถ้ามี)</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ไม่ใส่ผัก, น้ำจิ้มแยก"
            className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={500}
          />
        </div>

        <Separator />

        {/* Quantity + Add to Cart */}
        <div className="sticky bottom-20 flex items-center gap-3 bg-background pt-2">
          <QuantitySelector
            quantity={quantity}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrease={() => setQuantity((q) => Math.min(50, q + 1))}
          />
          <Button
            className="flex-1 gap-2"
            size="lg"
            disabled={!product.isAvailable || !isOpen || !isReadyToAdd || addToCartMutation.isPending}
            onClick={handleAddToCart}
          >
            {showSuccess ? (
              "✓ เพิ่มลงตะกร้าแล้ว"
            ) : addToCartMutation.isPending ? (
              "กำลังเพิ่ม..."
            ) : !product.isAvailable ? (
              "สินค้าหมด"
            ) : !isOpen ? (
              "ร้านปิด"
            ) : !isReadyToAdd ? (
              "กรุณาเลือกตัวเลือกให้ครบ"
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                เพิ่มลงตะกร้า — ฿{currentPrice.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  )
}
