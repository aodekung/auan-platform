import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MapPin } from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Separator } from "../components/ui/separator"
import { useCart } from "../hooks/use-cart"
import { useCreateOrder } from "../hooks/use-orders"
import { useAddresses } from "../hooks/use-addresses"
import { useAuth } from "../providers/auth-provider"
import { CartSkeleton, ErrorState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { SubPageHeader } from "../components/layout/sub-page-header"
import { cn } from "../lib/utils"

// ─────────────────────────────────────────────────────────────
// Form Schema
// ─────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  building: z.enum(["A", "B", "C", "D"], { required_error: "กรุณาเลือกตึก" }),
  roomNumber: z.string().min(1, "กรุณากรอกห้องเลขที่"),
  note: z.string().max(500, "หมายเหตุไม่เกิน 500 ตัวอักษร").optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

const BUILDINGS = ["A", "B", "C", "D"] as const

export function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated, displayName } = useAuth()
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: addresses } = useAddresses()
  const createOrder = useCreateOrder()

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const selectedAddress = addresses?.find((a) => a.id === selectedAddressId)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      building: undefined,
      roomNumber: "",
      note: "",
    },
  })

  const selectedBuilding = watch("building")

  // When selecting a saved address, fill the form
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId)
    const addr = addresses?.find((a) => a.id === addressId)
    if (addr) {
      setValue("building", addr.building)
      setValue("roomNumber", addr.roomNumber ?? "")
    }
  }

  // Deselect saved address when manually changing form
  const handleFormChange = () => {
    setSelectedAddressId(null)
  }

  const onSubmit = (data: CheckoutFormData) => {
    createOrder.mutate(
      {
        addressId: selectedAddressId ?? undefined,
        note: data.note || undefined,
      },
      {
        onSuccess: (order) => {
          navigate(`/payment/${order.id}`)
        },
      },
    )
  }

  if (cartLoading) {
    return <CartSkeleton />
  }

  // Navigate to cart if empty (useEffect to avoid side-effect during render)
  useEffect(() => {
    if (!cartLoading && (!cart || cart.items.length === 0)) {
      navigate("/cart", { replace: true })
    }
  }, [cart, cartLoading, navigate])

  if (!cart || cart.items.length === 0) {
    return null
  }

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SubPageHeader title="📋 ยืนยันออเดอร์" onBack={() => navigate("/cart")} />

        {/* Saved Addresses */}
        {addresses && addresses.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">ที่อยู่ที่บันทึกไว้</h2>
            <div className="space-y-1.5">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectAddress(addr.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                    selectedAddressId === addr.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex-1">
                    <span className="font-medium">ตึก {addr.building} ห้อง {addr.roomNumber}</span>
                    {addr.note && <span className="ml-2 text-muted-foreground">{addr.note}</span>}
                  </div>
                  {addr.isDefault && (
                    <span className="text-xs text-muted-foreground">ค่าเริ่มต้น</span>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleFormChange()}
              className="text-xs text-primary hover:underline"
            >
              หรือกรอกที่อยู่ใหม่
            </button>
          </div>
        )}

        {/* Delivery Info */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-sm font-semibold">📍 ข้อมูลจัดส่ง</h2>

          <div>
            <label className="text-sm text-muted-foreground">ผู้สั่ง</label>
            <p className="text-sm font-medium">{displayName || "ผู้ใช้"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Building Select */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">ตึก <span className="text-destructive">*</span></label>
              <div className="flex gap-2">
                {BUILDINGS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setValue("building", b, { shouldValidate: true })
                      handleFormChange()
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                      selectedBuilding === b
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {errors.building && (
                <p className="text-xs text-destructive">{errors.building.message}</p>
              )}
            </div>

            {/* Room Number */}
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">ห้องเลขที่ <span className="text-destructive">*</span></label>
              <Input
                placeholder="เช่น 1501"
                {...register("roomNumber", { onChange: handleFormChange })}
              />
              {errors.roomNumber && (
                <p className="text-xs text-destructive">{errors.roomNumber.message}</p>
              )}
            </div>
          </div>

          {/* Delivery Note */}
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">หมายเหตุสำหรับจัดส่ง</label>
            <Textarea
              placeholder="เช่น มอบให้รปภ. ชื่อพี่ต้า"
              {...register("note")}
              className="min-h-[60px]"
            />
          </div>
        </div>

        <Separator />

        {/* Order Summary (read-only) */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-sm font-semibold">🧾 สรุปรายการ</h2>
          <div className="space-y-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="text-muted-foreground">{item.quantity}×</span>{" "}
                  {item.productName}
                  {item.selectedOptions.length > 0 && (
                    <span className="text-muted-foreground">
                      ({item.selectedOptions.map((o) => o.optionName).join(", ")})
                    </span>
                  )}
                </div>
                <span className="font-medium">฿{Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">รวม</span>
              <span>฿{Number(cart.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ค่าจัดส่ง</span>
              <span className="text-green-600">ฟรี</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>ทั้งหมด</span>
            <span className="text-primary">฿{Number(cart.total).toLocaleString()}</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={createOrder.isPending || !isValid}
        >
          {createOrder.isPending ? "กำลังสร้างออเดอร์..." : "ยืนยันสั่งออเดอร์"}
        </Button>

        {createOrder.isError && (
          <p className="text-center text-sm text-destructive">
            {createOrder.error?.message || "ไม่สามารถสร้างออเดอร์ได้ กรุณาลองใหม่"}
          </p>
        )}
      </form>
    </ErrorBoundary>
  )
}
