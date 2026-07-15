/**
 * Admin module type definitions and DTOs.
 */

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export interface DashboardSummary {
  todayOrders: number
  pendingOrders: number
  preparingOrders: number
  completedOrders: number
  cancelledOrders: number
  revenue: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  popularProducts: Array<{
    productId: string
    productName: string
    totalQuantity: number
  }>
  activeCustomers: number
}

// ─────────────────────────────────────────────────────────────
// Customer Management
// ─────────────────────────────────────────────────────────────

export interface CustomerListQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CustomerDetailResponse {
  id: string
  lineUserId: string
  displayName: string
  pictureUrl: string
  phone: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

export interface CustomerOrderHistoryQuery {
  page?: number
  pageSize?: number
}

// ─────────────────────────────────────────────────────────────
// Staff Management
// ─────────────────────────────────────────────────────────────

export interface StaffListQuery {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CreateStaffRequest {
  email: string
  password: string
  displayName: string
  phoneNumber?: string
  role: string
}

export interface UpdateStaffRequest {
  displayName?: string
  phoneNumber?: string
  role?: string
}

export interface StaffDetailResponse {
  id: string
  email: string
  displayName: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ResetPasswordResponse {
  tempPassword: string
}

// ─────────────────────────────────────────────────────────────
// Audit Log
// ─────────────────────────────────────────────────────────────

export interface AuditLogListQuery {
  page?: number
  pageSize?: number
  action?: string
  entityType?: string
  entityId?: string
  actorId?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}
