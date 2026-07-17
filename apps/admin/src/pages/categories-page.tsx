import { useState, type FormEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Trash2, FolderTree, Flame } from "lucide-react"
import { toast } from "sonner"
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-products"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { AlertDialogBox } from "@/components/ui/dialog"
import { DataTable, type Column } from "@/components/admin/data-table"
import type { CategoryResponse } from "@/api"

// ─────────────────────────────────────────────
// Zod Schema
// ─────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, "ชื่อหมวดหมู่จำเป็นต้องกรอก"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

// ─────────────────────────────────────────────
// CategoriesPage
// ─────────────────────────────────────────────

export function CategoriesPage() {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null)

  const categoriesQuery = useCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const openCreateDialog = () => {
    setEditingCategory(null)
    setCategoryDialogOpen(true)
  }

  const openEditDialog = (category: CategoryResponse) => {
    setEditingCategory(category)
    setCategoryDialogOpen(true)
  }

  const openDeleteDialog = (category: CategoryResponse) => {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    await deleteCategory.mutateAsync(deletingCategory.id)
    setDeleteDialogOpen(false)
    setDeletingCategory(null)
  }

  const columns: Column<CategoryResponse>[] = [
    {
      key: "index",
      header: "#",
      className: "w-12",
      render: (_row, rowIndex) => (
        <span className="text-muted-foreground">{rowIndex + 1}</span>
      ),
    },
    {
      key: "name",
      header: "ชื่อหมวดหมู่",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          {row.description && (
            <p className="text-xs text-muted-foreground">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "productCount",
      header: "จำนวนสินค้า",
      className: "text-center",
      render: (row) => (
        <Badge variant="outline">{row.productCount} สินค้า</Badge>
      ),
    },
    {
      key: "displayOrder",
      header: "ลำดับแสดง",
      className: "text-center",
      render: (row) => (
        <span className="tabular-nums text-muted-foreground">{row.displayOrder}</span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      className: "text-center",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "จัดการ",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(row)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  if (categoriesQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="หมวดหมู่สินค้า" description="จัดการหมวดหมู่สินค้าทั้งหมด" />
        <EmptyState
          icon={<Flame className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลได้"
          description={categoriesQuery.error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => categoriesQuery.refetch()}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  const categories = categoriesQuery.data ?? []
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="space-y-6">
      <PageHeader
        title="หมวดหมู่สินค้า"
        description="จัดการหมวดหมู่สินค้าทั้งหมด"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            เพิ่มหมวดหมู่
          </Button>
        }
      />

      {/* Table */}
      {sortedCategories.length === 0 && !categoriesQuery.isLoading ? (
        <EmptyState
          icon={<FolderTree className="h-12 w-12" />}
          title="ยังไม่มีหมวดหมู่"
          description="เพิ่มหมวดหมู่เพื่อจัดระเบียบสินค้า"
          action={
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              เพิ่มหมวดหมู่
            </Button>
          }
        />
      ) : (
        <DataTable<CategoryResponse>
          columns={columns}
          data={sortedCategories}
          isLoading={categoriesQuery.isLoading}
          emptyMessage="ไม่พบหมวดหมู่"
        />
      )}

      {/* Create/Edit Dialog */}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        editingCategory={editingCategory}
        onSubmit={async (data) => {
          if (editingCategory) {
            await updateCategory.mutateAsync({ id: editingCategory.id, ...data })
            toast.success("แก้ไขหมวดหมู่สำเร็จ")
          } else {
            await createCategory.mutateAsync(data)
            toast.success("เพิ่มหมวดหมู่สำเร็จ")
          }
          setCategoryDialogOpen(false)
        }}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialogBox
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="ลบหมวดหมู่"
        description={`คุณต้องการลบหมวดหมู่ "${deletingCategory?.name}" หรือไม่?`}
        action={
          <Button
            variant="destructive"
            isLoading={deleteCategory.isPending}
            onClick={handleDelete}
          >
            ลบ
          </Button>
        }
        cancel={
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            ยกเลิก
          </Button>
        }
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// Category Form Dialog
// ─────────────────────────────────────────────

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCategory: CategoryResponse | null
  onSubmit: (data: CategoryFormData) => Promise<void>
  isSubmitting: boolean
}

function CategoryFormDialog({
  open,
  onOpenChange,
  editingCategory,
  onSubmit,
  isSubmitting,
}: CategoryFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    values: editingCategory
      ? {
          name: editingCategory.name,
          description: editingCategory.description ?? "",
          displayOrder: editingCategory.displayOrder,
        }
      : undefined,
    defaultValues: {
      name: "",
      description: "",
      displayOrder: 0,
    },
  })

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "แก้ไขรายละเอียดหมวดหมู่ด้านล่าง"
              : "กรอกรายละเอียดหมวดหมู่ด้านล่าง"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault()
            handleSubmit(handleFormSubmit)(e)
          }}
          className="space-y-4"
        >
          <Input
            label="ชื่อหมวดหมู่ *"
            placeholder="เช่น เครื่องดื่ม"
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="category-description"
              className="block text-sm font-medium text-foreground"
            >
              รายละเอียด
            </label>
            <textarea
              id="category-description"
              rows={3}
              placeholder="คำอธิบายหมวดหมู่..."
              {...register("description")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <Input
            label="ลำดับแสดง"
            type="number"
            placeholder="0"
            error={errors.displayOrder?.message}
            {...register("displayOrder")}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCategory ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
