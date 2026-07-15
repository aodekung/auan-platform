import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, Plus, Pencil, Trash2, Star, ChevronLeft } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { AddressForm } from "../components/address-form"
import { EmptyState, ErrorState, ErrorBoundary } from "../components/feedback"
import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../hooks/use-addresses"
import type { AddressResponse } from "../api"
import { cn } from "../lib/utils"

// ─────────────────────────────────────────────────────────────
// Delete Confirmation Dialog
// ─────────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  address,
  onConfirm,
  onCancel,
  isPending,
}: {
  address: AddressResponse
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-t-2xl bg-background p-6 shadow-lg">
        <h3 className="text-lg font-semibold">ลบที่อยู่</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          คุณต้องการลบที่อยู่{" "}
          <span className="font-medium text-foreground">
            ตึก {address.building} ห้อง {address.roomNumber}
          </span>{" "}
          หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "กำลังลบ..." : "ลบ"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Address Card
// ─────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
}: {
  address: AddressResponse
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
  isSettingDefault: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold",
              address.isDefault
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {address.building}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                ตึก {address.building} ห้อง {address.roomNumber}
              </span>
              {address.isDefault && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Star className="h-3 w-3 fill-current" />
                  เริ่มต้น
                </span>
              )}
            </div>
            {address.note && (
              <p className="text-xs text-muted-foreground">{address.note}</p>
            )}
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
            แก้ไข
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            ลบ
          </Button>
          {!address.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={onSetDefault}
              disabled={isSettingDefault}
            >
              <Star className="h-3.5 w-3.5" />
              {isSettingDefault ? "..." : "ตั้งเริ่มต้น"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
// Addresses Page
// ─────────────────────────────────────────────────────────────

export function AddressesPage() {
  const navigate = useNavigate()
  const { data: addresses, isLoading, isError, error } = useAddresses()
  const deleteAddress = useDeleteAddress()
  const setDefaultAddress = useSetDefaultAddress()

  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingAddress, setDeletingAddress] = useState<AddressResponse | null>(null)

  const handleCreate = () => {
    setEditingAddress(null)
    setIsCreating(true)
  }

  const handleEdit = (address: AddressResponse) => {
    setIsCreating(false)
    setEditingAddress(address)
  }

  const handleDeleteConfirm = () => {
    if (!deletingAddress) return
    deleteAddress.mutate(deletingAddress.id, {
      onSuccess: () => setDeletingAddress(null),
    })
  }

  const handleSetDefault = (id: string) => {
    setDefaultAddress.mutate(id)
  }

  const handleFormSuccess = () => {
    setIsCreating(false)
    setEditingAddress(null)
  }

  const handleFormCancel = () => {
    setIsCreating(false)
    setEditingAddress(null)
  }

  // Show form as full-screen overlay
  if (isCreating || editingAddress) {
    return (
      <AddressForm
        address={editingAddress}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">ที่อยู่ของฉัน</h1>
        </div>

        {/* Add button */}
        <Button
          className="w-full gap-2"
          onClick={handleCreate}
        >
          <Plus className="h-4 w-4" />
          เพิ่มที่อยู่ใหม่
        </Button>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-lg border bg-muted/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <ErrorState
            message={error?.message || "ไม่สามารถโหลดที่อยู่ได้"}
          />
        )}

        {/* Empty state */}
        {addresses && addresses.length === 0 && (
          <EmptyState
            icon={<MapPin className="h-12 w-12" />}
            title="ยังไม่มีที่อยู่บันทึกไว้"
            description="เพิ่มที่อยู่เพื่อให้สะดวกในการสั่งออเดอร์"
            action={{
              label: "เพิ่มที่อยู่",
              onClick: handleCreate,
            }}
          />
        )}

        {/* Address list */}
        {addresses && addresses.length > 0 && (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <AddressCard
                key={addr.id}
                address={addr}
                onEdit={() => handleEdit(addr)}
                onDelete={() => setDeletingAddress(addr)}
                onSetDefault={() => handleSetDefault(addr.id)}
                isSettingDefault={
                  setDefaultAddress.isPending && setDefaultAddress.variables === addr.id
                }
              />
            ))}
          </div>
        )}

        {/* Delete confirmation dialog */}
        {deletingAddress && (
          <DeleteConfirmDialog
            address={deletingAddress}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeletingAddress(null)}
            isPending={deleteAddress.isPending}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}
