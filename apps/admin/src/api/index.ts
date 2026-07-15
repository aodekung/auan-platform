// ─────────────────────────────────────────────
// Re-export shared types from @auan/types
// ─────────────────────────────────────────────

// Status constants
export {
  ORDER_STATUS,
  PAYMENT_STATUS,
  STAFF_ROLE,
  STAFF_ROLE_HIERARCHY,
  AUDIT_ACTION,
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
  PRODUCT_STATUS,
  TERMINAL_ORDER_STATUSES,
} from "@auan/types"

// API response envelope
export type {
  ApiResponse,
  PaginatedResponse,
  Pagination,
  ApiError,
} from "@auan/types"

// Domain types — Orders
export type {
  OrderResponse,
  OrderListItemResponse,
  OrderItemResponse,
  OrderItemOptionResponse,
  OrderStatusHistoryResponse,
  OrderStatus,
} from "@auan/types"

// Domain types — Payments
export type { PaymentResponse, PaymentStatus } from "@auan/types"

// Domain types — Products
export type {
  ProductResponse,
  ProductOptionResponse,
  OptionGroupResponse,
} from "@auan/types"

// Domain types — Categories
export type { CategoryResponse } from "@auan/types"

// Domain types — Customers
export type { CustomerDetailResponse } from "@auan/types"

// Domain types — Staff
export type {
  StaffLoginResponse,
  StaffMeResponse,
  StaffDetailResponse,
  StaffRole,
  ResetPasswordResponse,
} from "@auan/types"

// Domain types — Notifications
export type { NotificationResponse, NotificationStatus, NotificationType } from "@auan/types"

// Domain types — Settings
export type {
  StoreSettingsResponse,
  BusinessHoursResponse,
} from "@auan/types"

// Domain types — Audit
export type { AuditLogResponse, AuditAction } from "@auan/types"

// Domain types — Dashboard
export type { DashboardSummary, PopularProduct } from "@auan/types"
