import { useState, useCallback, type FormEvent } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Package,
  Flame,
} from "lucide-react"
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
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
import { SearchBar } from "@/components/admin/search-bar"
import { cn } from "@auan/ui"
import type { ProductResponse, CategoryResponse } from "@/api"

// ─────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, "ชื่อสินค้าจำเป็นต้องกรอก"),
  nameEn: z.string().optional(),
  categoryId: z.string().min(1, "หมวดหมู่จำเป็นต้องเลือก"),
  price: z.string().min(1, "ราคาจำเป็นต้องกรอก"),
  sku: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
  isAvailable: z.boolean().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

const categorySchema = z.object({
  name: z.string().min(1, "ชื่อหมวดหมู่จำเป็นต้องกรอก"),
  description: z.string().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

// ─────────────────────────────────────────────
// Tab type
// ─────────────────────────────────────────────

type Tab = "products" | "categories"

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products")

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการสินค้า"
        description="เพิ่ม แก้ไข และจัดการเมนูอาหาร"
      />

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg border p-1">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "products"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          สินค้า
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "categories"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          หมวดหมู่
        </button>
      </div>

      {activeTab === "products" ? <ProductsTab /> : <CategoriesTab />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Products Tab
// ─────────────────────────────────────────────

function ProductsTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<ProductResponse | null>(null)

  const productsQuery = useProducts({
    page,
    pageSize: 20,
    search: search || undefined,
    categoryId: categoryId || undefined,
  })
  const categoriesQuery = useCategories()

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const openCreateDialog = () => {
    setEditingProduct(null)
    setProductDialogOpen(true)
  }

  const openEditDialog = (product: ProductResponse) => {
    setEditingProduct(product)
    setProductDialogOpen(true)
  }

  const openDeleteDialog = (product: ProductResponse) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deletingProduct) return
    await deleteProduct.mutateAsync(deletingProduct.id)
    setDeleteDialogOpen(false)
    setDeletingProduct(null)
  }

  const handleToggleStatus = async (product: ProductResponse) => {
    const newStatus = product.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
    await updateProduct.mutateAsync({ id: product.id, status: newStatus })
  }

  // Table columns
  const columns: Column<ProductResponse>[] = [
    {
      key: "index",
      header: "#",
      className: "w-12",
      render: (_product, rowIndex) => (
        <span className="text-muted-foreground">
          {((productsQuery.data?.pagination.page ?? 1) - 1) * 20 + rowIndex + 1}
        </span>
      ),
    },
    {
      key: "image",
      header: "รูป",
      className: "w-16",
      render: (product) => (
        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: "ชื่อ",
      render: (product) => (
        <div>
          <p className="font-medium text-foreground">{product.name}</p>
          {product.nameEn && (
            <p className="text-xs text-muted-foreground">{product.nameEn}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "หมวดหมู่",
      render: (product) => (
        <span className="text-sm text-muted-foreground">
          {product.category?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "price",
      header: "ราคา",
      className: "text-right",
      render: (product) => (
        <span className="font-medium tabular-nums">
          ฿{Number(product.price).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "สถานะ",
      render: (product) => (
        <Badge
          variant={
            product.status === "ACTIVE"
              ? "success"
              : "secondary"
          }
        >
          {product.status === "ACTIVE" ? "ใช้งาน" : "ปิดใช้งาน"}
        </Badge>
      ),
    },
    {
      key: "order",
      header: "ลำดับ",
      className: "text-center",
      render: (product) => (
        <span className="tabular-nums text-muted-foreground">
          {product.displayOrder}
        </span>
      ),
    },
    {
      key: "actions",
      header: "จัดการ",
      className: "text-right",
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(product)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(product)}
          >
            {product.status === "ACTIVE" ? (
              <PowerOff className="h-3.5 w-3.5" />
            ) : (
              <Power className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(product)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  if (productsQuery.isError) {
    return (
      <EmptyState
        icon={<Flame className="h-12 w-12" />}
        title="ไม่สามารถโหลดข้อมูลได้"
        description={productsQuery.error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
        action={
          <Button variant="outline" onClick={() => productsQuery.refetch()}>
            ลองอีกครั้ง
          </Button>
        }
      />
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Category filter dropdown */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categoriesQuery.data?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            placeholder="ค้นหาสินค้า..."
            className="w-64"
          />
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          เพิ่มสินค้า
        </Button>
      </div>

      {/* Table */}
      <DataTable<ProductResponse>
        columns={columns}
        data={productsQuery.data?.data ?? []}
        pagination={productsQuery.data?.pagination}
        onPageChange={setPage}
        isLoading={productsQuery.isLoading}
        emptyMessage="ไม่พบสินค้า"
      />

      {/* Create/Edit Dialog */}
      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        editingProduct={editingProduct}
        categories={categoriesQuery.data ?? []}
        onSubmit={async (data) => {
          if (editingProduct) {
            await updateProduct.mutateAsync({ id: editingProduct.id, ...data })
          } else {
            await createProduct.mutateAsync(data)
          }
          setProductDialogOpen(false)
        }}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialogBox
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="ลบสินค้า"
        description={`คุณต้องการลบ "${deletingProduct?.name}" หรือไม่? สินค้าจะถูกปิดใช้งาน`}
        action={
          <Button
            variant="destructive"
            isLoading={deleteProduct.isPending}
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
    </>
  )
}

// ─────────────────────────────────────────────
// Product Form Dialog
// ─────────────────────────────────────────────

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: ProductResponse | null
  categories: CategoryResponse[]
  onSubmit: (data: ProductFormData) => Promise<void>
  isSubmitting: boolean
}

function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  categories,
  onSubmit,
  isSubmitting,
}: ProductFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: editingProduct
      ? {
          name: editingProduct.name,
          nameEn: editingProduct.nameEn ?? "",
          categoryId: editingProduct.categoryId,
          price: editingProduct.price,
          sku: editingProduct.sku ?? "",
          description: editingProduct.description ?? "",
          displayOrder: editingProduct.displayOrder,
          status: editingProduct.status as "ACTIVE" | "DISABLED",
          isAvailable: editingProduct.isAvailable,
        }
      : {
          name: "",
          nameEn: "",
          categoryId: "",
          price: "",
          sku: "",
          description: "",
          displayOrder: 0,
          status: "ACTIVE" as const,
          isAvailable: true,
        },
    values: editingProduct
      ? {
          name: editingProduct.name,
          nameEn: editingProduct.nameEn ?? "",
          categoryId: editingProduct.categoryId,
          price: editingProduct.price,
          sku: editingProduct.sku ?? "",
          description: editingProduct.description ?? "",
          displayOrder: editingProduct.displayOrder,
          status: editingProduct.status as "ACTIVE" | "DISABLED",
          isAvailable: editingProduct.isAvailable,
        }
      : undefined,
  })

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "แก้ไขรายละเอียดสินค้าด้านล่าง"
              : "กรอกรายละเอียดสินค้าด้านล่าง"}
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
            label="ชื่อสินค้า *"
            placeholder="เช่น ชาเย็น"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="ชื่อภาษาอังกฤษ"
            placeholder="เช่น Iced Tea"
            error={errors.nameEn?.message}
            {...register("nameEn")}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="product-category"
              className="block text-sm font-medium text-foreground"
            >
              หมวดหมู่ *
            </label>
            <select
              id="product-category"
              {...register("categoryId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <Input
            label="ราคา (฿) *"
            type="text"
            inputMode="decimal"
            placeholder="0"
            error={errors.price?.message}
            {...register("price")}
          />

          <Input
            label="SKU"
            placeholder="เช่น ICE-TEA-001"
            error={errors.sku?.message}
            {...register("sku")}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="product-description"
              className="block text-sm font-medium text-foreground"
            >
              รายละเอียด
            </label>
            <textarea
              id="product-description"
              rows={3}
              placeholder="คำอธิบายสินค้า..."
              {...register("description")}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ลำดับแสดง"
              type="number"
              placeholder="0"
              error={errors.displayOrder?.message}
              {...register("displayOrder")}
            />

            <div className="space-y-1.5">
              <label
                htmlFor="product-status"
                className="block text-sm font-medium text-foreground"
              >
                สถานะ
              </label>
              <select
                id="product-status"
                {...register("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ACTIVE">ใช้งาน</option>
                <option value="DISABLED">ปิดใช้งาน</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="product-available"
              {...register("isAvailable")}
              className="h-4 w-4 rounded border-input"
            />
            <label
              htmlFor="product-available"
              className="text-sm font-medium text-foreground"
            >
              แสดงให้ลูกค้าเห็น
            </label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingProduct ? "บันทึกการแก้ไข" : "เพิ่มสินค้า"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─────────────────────────────────────────────
// Categories Tab
// ─────────────────────────────────────────────

function CategoriesTab() {
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

  if (categoriesQuery.isError) {
    return (
      <EmptyState
        icon={<Flame className="h-12 w-12" />}
        title="ไม่สามารถโหลดข้อมูลได้"
        description={
          categoriesQuery.error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
        }
        action={
          <Button variant="outline" onClick={() => categoriesQuery.refetch()}>
            ลองอีกครั้ง
          </Button>
        }
      />
    )
  }

  const categories = categoriesQuery.data ?? []

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} หมวดหมู่
        </p>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      {categories.length === 0 && !categoriesQuery.isLoading ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="ยังไม่มีหมวดหมู่"
          description="เพิ่มหมวดหมู่เพื่อจัดระเบียบสินค้า"
          action={
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              เพิ่มหมวดหมู่
            </Button>
          }
        />
      ) : categoriesQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          {categories
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((category, index) => (
              <div key={category.id}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">{category.productCount} สินค้า</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(category)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {index < categories.length - 1 && <Separator />}
              </div>
            ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        editingCategory={editingCategory}
        onSubmit={async (data) => {
          if (editingCategory) {
            await updateCategory.mutateAsync({ id: editingCategory.id, ...data })
          } else {
            await createCategory.mutateAsync(data)
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
    </>
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
