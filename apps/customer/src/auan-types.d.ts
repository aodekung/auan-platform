declare module "@auan/types" {
  // ═══════════════════════════════════════════════════════════════
  // Order statuses
  // ═══════════════════════════════════════════════════════════════

  export const ORDER_STATUS: Readonly<{
    PENDING: "PENDING"
    AWAITING_PAYMENT: "AWAITING_PAYMENT"
    AWAITING_VERIFICATION: "AWAITING_VERIFICATION"
    PAID: "PAID"
    QUEUED: "QUEUED"
    PREPARING: "PREPARING"
    READY: "READY"
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY"
    DELIVERED: "DELIVERED"
    COMPLETED: "COMPLETED"
    CANCELLED: "CANCELLED"
    EXPIRED: "EXPIRED"
    PAYMENT_REJECTED: "PAYMENT_REJECTED"
  }>

  export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

  export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[]

  // ═══════════════════════════════════════════════════════════════
  // Payment statuses
  // ═══════════════════════════════════════════════════════════════

  export const PAYMENT_STATUS: Readonly<{
    PENDING: "PENDING"
    AWAITING_VERIFICATION: "AWAITING_VERIFICATION"
    PAID: "PAID"
    REJECTED: "REJECTED"
    FAILED: "FAILED"
    EXPIRED: "EXPIRED"
    REFUNDED: "REFUNDED"
  }>

  export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

  // ═══════════════════════════════════════════════════════════════
  // Notification statuses & types
  // ═══════════════════════════════════════════════════════════════

  export const NOTIFICATION_STATUS: Readonly<{
    PENDING: "PENDING"
    SENDING: "SENDING"
    SENT: "SENT"
    FAILED: "FAILED"
    CANCELLED: "CANCELLED"
  }>

  export type NotificationStatus = (typeof NOTIFICATION_STATUS)[keyof typeof NOTIFICATION_STATUS]

  export const NOTIFICATION_TYPE: Readonly<{
    ORDER_CREATED: "ORDER_CREATED"
    PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED"
    PAYMENT_VERIFIED: "PAYMENT_VERIFIED"
    PAYMENT_REJECTED: "PAYMENT_REJECTED"
    PAYMENT_EXPIRED: "PAYMENT_EXPIRED"
    KITCHEN_STARTED: "KITCHEN_STARTED"
    ORDER_READY: "ORDER_READY"
    ORDER_OUT_FOR_DELIVERY: "ORDER_OUT_FOR_DELIVERY"
    ORDER_DELIVERED: "ORDER_DELIVERED"
    ORDER_COMPLETED: "ORDER_COMPLETED"
    ORDER_CANCELLED: "ORDER_CANCELLED"
    SYSTEM_ANNOUNCEMENT: "SYSTEM_ANNOUNCEMENT"
  }>

  export type NotificationType = (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]

  export const NOTIFICATION_CHANNEL: Readonly<{
    LINE: "LINE"
    EMAIL: "EMAIL"
    SMS: "SMS"
    PUSH: "PUSH"
    WEBSOCKET: "WEBSOCKET"
    IN_APP: "IN_APP"
  }>

  export type NotificationChannel = (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL]

  // ═══════════════════════════════════════════════════════════════
  // Product status
  // ═══════════════════════════════════════════════════════════════

  export const PRODUCT_STATUS: Readonly<{
    ACTIVE: "ACTIVE"
    DISABLED: "DISABLED"
  }>

  export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]

  // ═══════════════════════════════════════════════════════════════
  // Staff roles
  // ═══════════════════════════════════════════════════════════════

  export const STAFF_ROLE: Readonly<{
    OWNER: "OWNER"
    ADMINISTRATOR: "ADMINISTRATOR"
    MANAGER: "MANAGER"
    KITCHEN: "KITCHEN"
    STAFF: "STAFF"
  }>

  export type StaffRole = (typeof STAFF_ROLE)[keyof typeof STAFF_ROLE]

  export const STAFF_ROLE_HIERARCHY: Record<StaffRole, number>

  // ═══════════════════════════════════════════════════════════════
  // Audit actions
  // ═══════════════════════════════════════════════════════════════

  export const AUDIT_ACTION: Readonly<{
    ORDER_CREATED: "ORDER_CREATED"
    ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED"
    ORDER_CANCELLED: "ORDER_CANCELLED"
    PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED"
    PAYMENT_VERIFIED: "PAYMENT_VERIFIED"
    PAYMENT_REJECTED: "PAYMENT_REJECTED"
    PRODUCT_CREATED: "PRODUCT_CREATED"
    PRODUCT_UPDATED: "PRODUCT_UPDATED"
    PRODUCT_DELETED: "PRODUCT_DELETED"
    CUSTOMER_DISABLED: "CUSTOMER_DISABLED"
    CUSTOMER_ENABLED: "CUSTOMER_ENABLED"
    STAFF_CREATED: "STAFF_CREATED"
    STAFF_UPDATED: "STAFF_UPDATED"
    STAFF_DISABLED: "STAFF_DISABLED"
    STAFF_ENABLED: "STAFF_ENABLED"
    STAFF_PASSWORD_RESET: "STAFF_PASSWORD_RESET"
    SETTING_UPDATED: "SETTING_UPDATED"
    SETTING_RESET: "SETTING_RESET"
    LOGIN: "LOGIN"
    LOGOUT: "LOGOUT"
    LOGIN_FAILED: "LOGIN_FAILED"
    UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS"
  }>

  export type AuditAction = (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION]

  // ═══════════════════════════════════════════════════════════════
  // API response envelope
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
  // Domain types — Categories
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
  // Domain types — Products
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
    isAvailable: boolean
    status: string
    category: { id: string; name: string }
    optionGroups?: OptionGroupResponse[]
    createdAt: string
    updatedAt: string
  }

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
  // Domain types — Cart
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
  // Domain types — Addresses
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
  // Domain types — Orders
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
  // Domain types — Payments
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
  // Domain types — Settings
  // ═══════════════════════════════════════════════════════════════

  export interface StoreSettingsResponse {
    name: string
    logo: string | null
    description: string | null
    phone: string | null
    address: string | null
    isOpen: boolean
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
  // Domain types — Notifications
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
  // Domain types — Auth (LINE)
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

  export interface LoginResponse {
    accessToken: string
    refreshToken: string
    expiresIn: number
    customer: AuthProfileResponse
  }

  // ═══════════════════════════════════════════════════════════════
  // Domain types — Staff Auth
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
  // Domain types — Admin Dashboard
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
  // Domain types — Customers (Admin view)
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
  // Domain types — Audit Logs
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
}

declare module "@auan/ui" {
  export function cn(...inputs: ClassValue[]): string
  type ClassValue = string | number | boolean | undefined | null | ClassValue[]
}
