import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { X } from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Separator } from "../components/ui/separator"
import { cn } from "../lib/utils"
import { useCreateAddress, useUpdateAddress } from "../hooks/use-addresses"
import type { AddressResponse, Building } from "../api"

// ─────────────────────────────────────────────────────────────
// Form Schema
// ─────────────────────────────────────────────────────────────

const addressFormSchema = z.object({
  building: z.enum(["A", "B", "C", "D"], { required_error: "กรุณาเลือกตึก" }),
  roomNumber: z.string().min(1, "กรุณากรอกห้องเลขที่"),
  note: z
    .string()
    .max(500, "หมายเหตุไม่เกิน 500 ตัวอักษร")
    .optional(),
  isDefault: z.boolean().optional(),
})

type AddressFormData = z.infer<typeof addressFormSchema>

const BUILDINGS = ["A", "B", "C", "D"] as const

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface AddressFormProps {
  address?: AddressResponse | null
  onSuccess: () => void
  onCancel: () => void
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const isEditing = !!address
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      building: address?.building as Building | undefined,
      roomNumber: address?.roomNumber ?? "",
      note: address?.note ?? "",
      isDefault: address?.isDefault ?? false,
    },
  })

  const selectedBuilding = watch("building")
  const isDefault = watch("isDefault")

  const onSubmit = (data: AddressFormData) => {
    if (isEditing) {
      updateAddress.mutate(
        {
          id: address!.id,
          body: {
            building: data.building,
            roomNumber: data.roomNumber,
            note: data.note,
          },
        },
        { onSuccess },
      )
    } else {
      createAddress.mutate(
        {
          building: data.building,
          roomNumber: data.roomNumber,
          note: data.note,
          isDefault: data.isDefault,
        },
        { onSuccess },
      )
    }
  }

  const isPending = createAddress.isPending || updateAddress.isPending

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ยกเลิก
        </button>
        <h2 className="text-sm font-semibold">
          {isEditing ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-y-auto">
        <div className="space-y-4 p-4">
          {/* Building Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ตึก <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              {BUILDINGS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setValue("building", b, { shouldValidate: true })}
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg border text-lg font-semibold transition-colors",
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
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ห้องเลขที่ <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="เช่น 1501"
              {...register("roomNumber")}
            />
            {errors.roomNumber && (
              <p className="text-xs text-destructive">{errors.roomNumber.message}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">หมายเหตุ</label>
            <Textarea
              placeholder="เช่น มอบให้รปภ. ชื่อพี่ต้า"
              {...register("note")}
              className="min-h-[80px]"
            />
            {errors.note && (
              <p className="text-xs text-destructive">{errors.note.message}</p>
            )}
          </div>

          {/* Default toggle (only on create) */}
          {!isEditing && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">ตั้งเป็นที่อยู่เริ่มต้น</p>
                <p className="text-xs text-muted-foreground">ใช้เป็นที่อยู่สำหรับการสั่งออเดอร์โดยอัตโนมัติ</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isDefault}
                onClick={() => setValue("isDefault", !isDefault)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  isDefault ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    isDefault ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="border-t p-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || !isValid}
          >
            {isPending
              ? isEditing
                ? "กำลังบันทึก..."
                : "กำลังเพิ่ม..."
              : isEditing
                ? "บันทึกการแก้ไข"
                : "เพิ่มที่อยู่"}
          </Button>

          {(createAddress.isError || updateAddress.isError) && (
            <p className="mt-2 text-center text-sm text-destructive">
              {createAddress.error?.message || updateAddress.error?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่"}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
