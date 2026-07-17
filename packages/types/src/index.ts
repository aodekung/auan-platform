// Shared type definitions for Auan-Auan-Platform
//
// These union types mirror the String-status fields stored in PostgreSQL.
// They provide compile-time safety for status values used across
// frontend, backend, and shared packages without requiring DB enums
// (per 173-database-design.md: prefer application-layer enums).

// ═══════════════════════════════════════════════════════════════
// ORDER DOMAIN — 13 statuses (per 158-order-status.md)
// ═══════════════════════════════════════════════════════════════

export const ORDER_STATUS = {
  PENDING: "PENDING",
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  PAID: "PAID",
  QUEUED: "QUEUED",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/** Terminal statuses — no further transitions allowed */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.EXPIRED,
] as const;

// ═══════════════════════════════════════════════════════════════
// PAYMENT DOMAIN — 7 statuses (per 155-payment-workflow.md)
// ═══════════════════════════════════════════════════════════════

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  AWAITING_VERIFICATION: "AWAITING_VERIFICATION",
  PAID: "PAID",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION DOMAIN — 5 statuses (per 159-notification-rules.md)
// ═══════════════════════════════════════════════════════════════

export const NOTIFICATION_STATUS = {
  PENDING: "PENDING",
  SENDING: "SENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type NotificationStatus =
  (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS];

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION TYPES (per 159-notification-rules.md + spec)
// ═══════════════════════════════════════════════════════════════

export const NOTIFICATION_TYPE = {
  // Order lifecycle — customer notifications
  ORDER_CREATED: "ORDER_CREATED",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  PAYMENT_EXPIRED: "PAYMENT_EXPIRED",
  KITCHEN_STARTED: "KITCHEN_STARTED",
  ORDER_READY: "ORDER_READY",
  ORDER_OUT_FOR_DELIVERY: "ORDER_OUT_FOR_DELIVERY",
  ORDER_DELIVERED: "ORDER_DELIVERED",
  ORDER_COMPLETED: "ORDER_COMPLETED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  // System notifications
  SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export const NOTIFICATION_CHANNEL = {
  LINE: "LINE",
  EMAIL: "EMAIL",
  SMS: "SMS",
  PUSH: "PUSH",
  WEBSOCKET: "WEBSOCKET",
  IN_APP: "IN_APP",
} as const;

export type NotificationChannel =
  (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

// ═══════════════════════════════════════════════════════════════
// PRODUCT DOMAIN — Prisma enum (only enum allowed per conflict resolution)
// ═══════════════════════════════════════════════════════════════

export const PRODUCT_STATUS = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

// ═══════════════════════════════════════════════════════════════
// STAFF DOMAIN — roles and hierarchy (per 175-auth, 170-system-architecture)
// ═══════════════════════════════════════════════════════════════

export const STAFF_ROLE = {
  OWNER: "OWNER",
  ADMINISTRATOR: "ADMINISTRATOR",
  MANAGER: "MANAGER",
  KITCHEN: "KITCHEN",
  STAFF: "STAFF",
} as const;

export type StaffRole = (typeof STAFF_ROLE)[keyof typeof STAFF_ROLE];

/**
 * Role hierarchy: higher number = higher privilege.
 * A role can manage staff at or below its own level.
 * OWNER (4) > ADMINISTRATOR (3) > MANAGER (2) > KITCHEN (1) > STAFF (0)
 */
export const STAFF_ROLE_HIERARCHY: Record<StaffRole, number> = {
  STAFF: 0,
  KITCHEN: 1,
  MANAGER: 2,
  ADMINISTRATOR: 3,
  OWNER: 4,
};

// ═══════════════════════════════════════════════════════════════
// AUDIT DOMAIN — action types (per 100-security-rules, 170-system-architecture)
// ═══════════════════════════════════════════════════════════════

export const AUDIT_ACTION = {
  // Order actions
  ORDER_CREATED: "ORDER_CREATED",
  ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
  ORDER_CANCELLED: "ORDER_CANCELLED",
  // Payment actions
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAYMENT_VERIFIED: "PAYMENT_VERIFIED",
  PAYMENT_REJECTED: "PAYMENT_REJECTED",
  // Product actions
  PRODUCT_CREATED: "PRODUCT_CREATED",
  PRODUCT_UPDATED: "PRODUCT_UPDATED",
  PRODUCT_DELETED: "PRODUCT_DELETED",
  // Customer actions
  CUSTOMER_DISABLED: "CUSTOMER_DISABLED",
  CUSTOMER_ENABLED: "CUSTOMER_ENABLED",
  // Staff actions
  STAFF_CREATED: "STAFF_CREATED",
  STAFF_UPDATED: "STAFF_UPDATED",
  STAFF_DISABLED: "STAFF_DISABLED",
  STAFF_ENABLED: "STAFF_ENABLED",
  STAFF_PASSWORD_RESET: "STAFF_PASSWORD_RESET",
  // Settings actions
  SETTING_UPDATED: "SETTING_UPDATED",
  SETTING_RESET: "SETTING_RESET",
  // Auth actions
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  LOGIN_FAILED: "LOGIN_FAILED",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
} as const;

export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION];

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES — shared envelope (per 90-api-rules.md)
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: true
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Categories
// ═══════════════════════════════════════════════════════════════

export interface CategoryResponse {
  id: string
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  productCount: number
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Products
// ═══════════════════════════════════════════════════════════════

export interface ProductResponse {
  id: string
  categoryId: string
  sku: string | null
  name: string
  nameEn: string | null
  description: string | null
  imageUrl: string | null
  price: string
  displayOrder: number
  quantity: number
  isAvailable: boolean
  status: string
  category: { id: string; name: string }
  optionGroups?: OptionGroupResponse[]
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Product Options
// ═══════════════════════════════════════════════════════════════

export interface ProductOptionResponse {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: string
  displayOrder: number
  isActive: boolean
}

export interface OptionGroupResponse {
  id: string
  productId: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  options: ProductOptionResponse[]
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Cart
// ═══════════════════════════════════════════════════════════════

export interface SelectedOptionResponse {
  optionGroupId: string
  optionId: string
  optionName: string
  additionalPrice: string
}

export interface CartItemResponse {
  id: string
  productId: string
  productName: string
  imageUrl: string | null
  unitPrice: string
  quantity: number
  subtotal: string
  selectedOptions: SelectedOptionResponse[]
  note: string | null
}

export interface CartResponse {
  id: string
  items: CartItemResponse[]
  itemCount: number
  subtotal: string
  total: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Addresses
// ═══════════════════════════════════════════════════════════════

export type Building = "A" | "B" | "C" | "D"

export interface AddressResponse {
  id: string
  customerId: string
  building: Building
  roomNumber: string | null
  note: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Orders
// ═══════════════════════════════════════════════════════════════

export interface OrderItemOptionResponse {
  id: string
  optionName: string
  additionalPrice: string
}

export interface OrderItemResponse {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: string
  subtotal: string
  imageUrl: string | null
  options: OrderItemOptionResponse[]
}

export interface OrderStatusHistoryResponse {
  id: string
  fromStatus: string | null
  toStatus: string
  reason: string | null
  changedBy: string | null
  createdAt: string
}

export interface OrderResponse {
  id: string
  orderNumber: string
  customerId: string
  addressId: string | null
  subtotal: string
  total: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  note: string | null
  items: OrderItemResponse[]
  statusHistory: OrderStatusHistoryResponse[]
  createdAt: string
  updatedAt: string
}

export interface OrderListItemResponse {
  id: string
  orderNumber: string
  customerId: string
  addressId: string | null
  subtotal: string
  total: string
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  note: string | null
  itemCount: number
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Products (list item variant)
// ═══════════════════════════════════════════════════════════════

export interface ProductListItemResponse {
  id: string
  name: string
  nameEn: string | null
  description: string | null
  imageUrl: string | null
  price: string
  status: string
  quantity: number
  isAvailable: boolean
  displayOrder: number
  category: { id: string; name: string }
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Favorites
// ═══════════════════════════════════════════════════════════════

export interface FavoriteResponse {
  id: string
  productId: string
  product?: ProductListItemResponse
  createdAt: string
}

export interface FavoriteCheckResponse {
  isFavorited: boolean
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Payments
// ═══════════════════════════════════════════════════════════════

export interface PaymentResponse {
  id: string
  orderId: string
  method: string
  amount: string
  paymentStatus: PaymentStatus
  slipImage: string | null
  paidAt: string | null
  verifiedAt: string | null
  verifiedBy: string | null
  rejectReason: string | null
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Settings
// ═══════════════════════════════════════════════════════════════

export interface StoreSettingsResponse {
  name: string
  logo: string | null
  description: string | null
  phone: string | null
  address: string | null
  isOpen: boolean
  promptpayQr: string | null
  promptpayNumber: string | null
}

export interface DaySchedule {
  day: string
  open: string
  close: string
}

export interface TemporaryClosure {
  enabled: boolean
  reason: string | null
  start: string | null
  end: string | null
}

export interface BusinessHoursResponse {
  schedule: DaySchedule[]
  temporaryClosure: TemporaryClosure
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Notifications
// ═══════════════════════════════════════════════════════════════

export interface NotificationResponse {
  id: string
  customerId: string
  type: string
  title: string
  body: string
  status: string
  isRead: boolean
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Customer Auth (LINE)
// ═══════════════════════════════════════════════════════════════

export interface AuthProfileResponse {
  id: string
  lineUserId: string
  displayName: string
  pictureUrl: string | null
  phone: string | null
  role: "CUSTOMER" | "OWNER"
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  phone?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  customer: AuthProfileResponse
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Staff Auth
// ═══════════════════════════════════════════════════════════════

export interface StaffLoginResponse {
  accessToken: string
  sessionToken: string
  expiresIn: number
  staff: {
    id: string
    email: string
    displayName: string
    role: StaffRole
  }
}

export interface StaffMeResponse {
  id: string
  email: string
  displayName: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: StaffRole
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StaffDetailResponse {
  id: string
  email: string
  displayName: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: StaffRole
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ResetPasswordResponse {
  tempPassword: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Admin Dashboard
// ═══════════════════════════════════════════════════════════════

export interface PopularProduct {
  productId: string
  productName: string
  totalQuantity: number
}

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
  popularProducts: PopularProduct[]
  activeCustomers: number
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Customers (Admin view)
// ═══════════════════════════════════════════════════════════════

export interface CustomerDetailResponse {
  id: string
  lineUserId: string
  displayName: string
  pictureUrl: string | null
  phone: string | null
  totalOrders: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Audit Logs
// ═══════════════════════════════════════════════════════════════

export interface AuditLogResponse {
  id: string
  action: AuditAction
  entityType: string
  entityId: string | null
  actorId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

// ═══════════════════════════════════════════════════════════════
// DOMAIN TYPES — Option Templates
// ═══════════════════════════════════════════════════════════════

export interface PriceOverrideResponse {
  id: string
  optionId: string
  optionName: string
  additionalPrice: string
}

export interface OptionTemplateResponse {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: string
  displayOrder: number
  isActive: boolean
}

export interface OptionGroupTemplateResponse {
  id: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  options: OptionTemplateResponse[]
}

export interface ProductOptionAssignmentResponse {
  id: string
  productId: string
  optionGroupId: string
  displayOrder: number
  optionGroup: OptionGroupTemplateResponse
  priceOverrides: PriceOverrideResponse[]
}
