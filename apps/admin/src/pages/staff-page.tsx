import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  UserPlus,
  Pencil,
  KeyRound,
  UserX,
  Trash2,
  Power,
  PowerOff,
  Users,
  AlertCircle,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import { useStaffList, useCreateStaff, useUpdateStaff, useToggleStaffStatus, useDeleteStaff, useResetPassword } from "@/hooks/use-staff"
import type { StaffDetailResponse, StaffRole } from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge, type BadgeVariant } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { DataTable, type Column } from "@/components/admin/data-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertDialogBox } from "@/components/ui/dialog"

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const ROLE_BADGE_VARIANT: Record<StaffRole, BadgeVariant> = {
  OWNER: "info",
  ADMINISTRATOR: "default",
  MANAGER: "warning",
  KITCHEN: "secondary",
  STAFF: "outline",
}

const ROLE_LABELS: Record<StaffRole, string> = {
  OWNER: "เจ้าของ",
  ADMINISTRATOR: "ผู้ดูแลระบบ",
  MANAGER: "ผู้จัดการ",
  KITCHEN: "ครัว",
  STAFF: "พนักงาน",
}

const STAFF_ROLES: StaffRole[] = [
  "OWNER",
  "ADMINISTRATOR",
  "MANAGER",
  "KITCHEN",
  "STAFF",
]

// ─────────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────────

const createStaffSchema = z.object({
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  displayName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  role: z.enum(["OWNER", "ADMINISTRATOR", "MANAGER", "KITCHEN", "STAFF"]),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  phoneNumber: z.string().optional(),
})

type CreateStaffFormValues = z.infer<typeof createStaffSchema>

const editStaffSchema = z.object({
  displayName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  role: z.enum(["OWNER", "ADMINISTRATOR", "MANAGER", "KITCHEN", "STAFF"]),
  isActive: z.boolean(),
  phoneNumber: z.string().optional(),
})

type EditStaffFormValues = z.infer<typeof editStaffSchema>

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-"
  const date = new Date(dateStr)
  return date.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─────────────────────────────────────────────
// Staff Loading Skeleton
// ─────────────────────────────────────────────

function StaffLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}

// ─────────────────────────────────────────────
// Create Staff Dialog
// ─────────────────────────────────────────────

function CreateStaffDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createStaff = useCreateStaff()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStaffFormValues>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      email: "",
      displayName: "",
      role: "STAFF",
      password: "",
      phoneNumber: "",
    },
  })

  const onSubmit = (values: CreateStaffFormValues) => {
    createStaff.mutate(values, {
      onSuccess: () => {
        toast.success("เพิ่มพนักงานสำเร็จ")
        reset()
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err?.message ?? "ไม่สามารถเพิ่มพนักงานได้")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เพิ่มพนักงาน</DialogTitle>
          <DialogDescription>กรอกข้อมูลเพื่อสร้างบัญชีพนักงานใหม่</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="อีเมล"
            type="email"
            placeholder="staff@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="ชื่อที่แสดง"
            placeholder="ชื่อ-นามสกุล"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              ตำแหน่ง
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("role")}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role} — {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>
          <Input
            label="รหัสผ่าน"
            type="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="เบอร์โทร (optional)"
            placeholder="0XX-XXX-XXXX"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          {createStaff.isError && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {createStaff.error?.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              ยกเลิก
            </Button>
            <Button type="submit" isLoading={createStaff.isPending}>
              สร้างพนักงาน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Edit Staff Dialog
// ─────────────────────────────────────────────

function EditStaffDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: StaffDetailResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateStaff = useUpdateStaff()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStaffFormValues>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      displayName: "",
      role: "STAFF",
      isActive: true,
      phoneNumber: "",
    },
  })

  // Reset form when staff changes
  const handleDialogChange = (nextOpen: boolean) => {
    if (nextOpen && staff) {
      reset({
        displayName: staff.displayName,
        role: staff.role as StaffRole,
        isActive: staff.isActive,
        phoneNumber: staff.phoneNumber ?? "",
      })
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = (values: EditStaffFormValues) => {
    if (!staff) return
    updateStaff.mutate(
      {
        id: staff.id,
        displayName: values.displayName,
        role: values.role as StaffRole,
        isActive: values.isActive,
        phoneNumber: values.phoneNumber || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      },
    )
  }

  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขพนักงาน</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลของ {staff.displayName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="ชื่อที่แสดง"
            placeholder="ชื่อ-นามสกุล"
            error={errors.displayName?.message}
            {...register("displayName")}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              ตำแหน่ง
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("role")}
            >
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role} — {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              id="edit-is-active"
              type="checkbox"
              className="h-4 w-4 rounded border-input"
              {...register("isActive")}
            />
            <label htmlFor="edit-is-active" className="text-sm font-medium text-foreground">
              เปิดใช้งาน (Active)
            </label>
          </div>
          <Input
            label="เบอร์โทร (optional)"
            placeholder="0XX-XXX-XXXX"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />

          {updateStaff.isError && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {updateStaff.error?.message}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" isLoading={updateStaff.isPending}>
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Reset Password Dialog
// ─────────────────────────────────────────────

function ResetPasswordDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: StaffDetailResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const resetPassword = useResetPassword()
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleReset = () => {
    if (!staff) return
    resetPassword.mutate(staff.id, {
      onSuccess: (data) => {
        setTempPassword(data.tempPassword)
        setCopied(false)
      },
    })
  }

  const handleCopy = async () => {
    if (tempPassword) {
      await navigator.clipboard.writeText(tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setTempPassword(null)
      setCopied(false)
    }
    onOpenChange(nextOpen)
  }

  if (!staff) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
          <DialogDescription>
            รีเซ็ตรหัสผ่านของ {staff.displayName}
          </DialogDescription>
        </DialogHeader>

        {!tempPassword ? (
          <>
            <p className="text-sm text-muted-foreground">
              การรีเซ็ตจะสร้างรหัสผ่านชั่วคราวใหม่ พนักงานจะต้องเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ
            </p>
            {resetPassword.isError && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {resetPassword.error?.message}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                isLoading={resetPassword.isPending}
              >
                <KeyRound className="h-4 w-4" />
                รีเซ็ตรหัสผ่าน
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="rounded-md border bg-muted/50 p-4">
              <p className="mb-2 text-sm font-medium text-foreground">
                รหัสผ่านชั่วคราว:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono">
                  {tempPassword}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>
                ปิด
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export function StaffPage() {
  const { data, isLoading, isError, error, refetch } = useStaffList()
  const toggleStaffStatus = useToggleStaffStatus()
  const deleteStaff = useDeleteStaff()

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffDetailResponse | null>(null)
  const [resettingStaff, setResettingStaff] = useState<StaffDetailResponse | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<StaffDetailResponse | null>(null)

  const handleDelete = async () => {
    if (!deletingStaff) return
    const staffId = deletingStaff.id
    try {
      await deleteStaff.mutateAsync(staffId)
      toast.success(`ลบ ${deletingStaff.displayName} สำเร็จ`)
      setDeletingStaff(null)
    } catch (err: any) {
      toast.error(err?.message ?? "ไม่สามารถลบพนักงานได้")
    }
  }

  const handleToggleStatus = () => {
    if (!deletingStaff) return
    const newIsActive = !deletingStaff.isActive
    toggleStaffStatus.mutate(
      { id: deletingStaff.id, isActive: newIsActive },
      {
        onSuccess: () => {
          toast.success(newIsActive
            ? `เปิดใช้งาน ${deletingStaff.displayName} สำเร็จ`
            : `ปิดใช้งาน ${deletingStaff.displayName} สำเร็จ`)
          setDeletingStaff(null)
        },
        onError: (err) => {
          toast.error(err?.message ?? "ไม่สามารถเปลี่ยนสถานะพนักงานได้")
        },
      },
    )
  }

  if (isLoading) {
    return <StaffLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="จัดการพนักงาน"
          description="เพิ่ม แก้ไข และจัดการบัญชีพนักงาน"
        />
        <EmptyState
          icon={<ShieldAlert className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลพนักงานได้"
          description={error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  const staffList = data ?? []

  const columns: Column<StaffDetailResponse>[] = [
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <span className="text-sm text-foreground">{row.email}</span>
      ),
    },
    {
      key: "displayName",
      header: "ชื่อ",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
            {row.avatarUrl ? (
              <img
                src={row.avatarUrl}
                alt={row.displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              row.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-sm font-medium text-foreground">
            {row.displayName}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      header: "ตำแหน่ง",
      render: (row) => (
        <Badge variant={ROLE_BADGE_VARIANT[row.role as StaffRole]}>
          {ROLE_LABELS[row.role as StaffRole]}
        </Badge>
      ),
    },
    {
      key: "isActive",
      header: "สถานะ",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "outline"}>
          {row.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
        </Badge>
      ),
    },
    {
      key: "lastLoginAt",
      header: "เข้าล่าสุด",
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.lastLoginAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingStaff(row)}
          >
            <Pencil className="h-3.5 w-3.5" />
            แก้ไข
          </Button>
          {(row.role as StaffRole) !== "OWNER" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResettingStaff(row)}
              >
                <KeyRound className="h-3.5 w-3.5" />
                รีเซ็ตรหัส
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeletingStaff(row)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                ลบ
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  toggleStaffStatus.mutate(
                    { id: row.id, isActive: !row.isActive },
                    {
                      onSuccess: () => {
                        toast.success(!row.isActive
                          ? `เปิดใช้งาน ${row.displayName} สำเร็จ`
                          : `ปิดใช้งาน ${row.displayName} สำเร็จ`)
                      },
                      onError: (err) => {
                        toast.error(err?.message ?? "ไม่สามารถเปลี่ยนสถานะพนักงานได้")
                      },
                    },
                  )
                }}
              >
                {row.isActive ? (
                  <PowerOff className="h-3.5 w-3.5" />
                ) : (
                  <Power className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการพนักงาน"
        description="เพิ่ม แก้ไข และจัดการบัญชีพนักงาน"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            เพิ่มพนักงาน
          </Button>
        }
      />

      {staffList.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="ยังไม่มีพนักงาน"
          description="เริ่มต้นเพิ่มพนักงานคนแรก"
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-4 w-4" />
              เพิ่มพนักงาน
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={staffList} />
      )}

      {/* Dialogs */}
      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditStaffDialog
        staff={editingStaff}
        open={!!editingStaff}
        onOpenChange={(open) => {
          if (!open) setEditingStaff(null)
        }}
      />
      <ResetPasswordDialog
        staff={resettingStaff}
        open={!!resettingStaff}
        onOpenChange={(open) => {
          if (!open) setResettingStaff(null)
        }}
      />

      {/* Delete confirmation */}
      <AlertDialogBox
        open={!!deletingStaff}
        onOpenChange={(open) => {
          if (!open) setDeletingStaff(null)
        }}
        title="ยืนยันการลบ"
        description={`คุณต้องการลบบัญชี ${deletingStaff?.displayName ?? "พนักงาน"} หรือไม่? การลบนี้จะเป็นการลบถาวรและไม่สามารถกู้คืนได้`}
        cancel={
          <Button variant="outline" onClick={() => setDeletingStaff(null)}>
            ยกเลิก
          </Button>
        }
        action={
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleteStaff.isPending}
          >
            <Trash2 className="h-4 w-4" />
            ลบ
          </Button>
        }
      />
    </div>
  )
}
