import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import type { ProductResponse, CategoryResponse } from "@/api"

// ─────────────────────────────────────────────
// Product List
// ─────────────────────────────────────────────

interface ProductFilters {
  page?: number
  pageSize?: number
  categoryId?: string
  search?: string
  status?: string
}

export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize))
  if (filters.categoryId) params.set("categoryId", filters.categoryId)
  if (filters.search) params.set("search", filters.search)
  if (filters.status) params.set("status", filters.status)

  const query = params.toString()
  const endpoint = `/admin/products${query ? `?${query}` : ""}`

  return useQuery({
    queryKey: ["admin", "products", filters],
    queryFn: () => apiClient.get<ProductResponse[]>(endpoint),
    staleTime: 1000 * 60 * 2,
  })
}

// ─────────────────────────────────────────────
// Product Detail
// ─────────────────────────────────────────────

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["admin", "products", id],
    queryFn: () => apiClient.get<ProductResponse>(`/admin/products/${id}`),
    enabled: !!id,
  })
}

// ─────────────────────────────────────────────
// Create Product
// ─────────────────────────────────────────────

interface CreateProductPayload {
  categoryId: string
  name: string
  nameEn?: string
  description?: string
  price: number
  status?: string
  displayOrder?: number
  quantity?: number
  isAvailable?: boolean
  sku?: string
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      apiClient.post<ProductResponse>("/admin/products", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
    },
  })
}

// ─────────────────────────────────────────────
// Update Product
// ─────────────────────────────────────────────

type UpdateProductPayload = Partial<CreateProductPayload>

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateProductPayload & { id: string }) =>
      apiClient.patch<ProductResponse>(`/admin/products/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
    },
  })
}

// ─────────────────────────────────────────────
// Delete Product (soft disable)
// ─────────────────────────────────────────────

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<ProductResponse>(`/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
    },
  })
}

// ─────────────────────────────────────────────
// Upload Product Image
// ─────────────────────────────────────────────

export function useUploadProductImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append("file", file)
      const token = localStorage.getItem("admin_access_token")
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1"
      const res = await fetch(`${baseUrl}/admin/products/${id}/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (res.status === 401) {
        localStorage.removeItem("admin_access_token")
        localStorage.removeItem("admin_session_token")
        const err = new Error("Unauthorized")
        err.name = "UnauthorizedError"
        throw err
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || "Upload failed")
      }
      const json = await res.json()
      return json.data
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "products", id] })
    },
  })
}

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiClient.get<CategoryResponse[]>("/admin/categories"),
    staleTime: 1000 * 60 * 5,
  })
}

interface CreateCategoryPayload {
  name: string
  description?: string
  displayOrder?: number
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) =>
      apiClient.post<CategoryResponse>("/admin/categories", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
    },
  })
}

type UpdateCategoryPayload = Partial<CreateCategoryPayload>

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateCategoryPayload & { id: string }) =>
      apiClient.patch<CategoryResponse>(`/admin/categories/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] })
    },
  })
}
