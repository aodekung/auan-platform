// ─────────────────────────────────────────────────────────────
// Re-export shared types from @auan/types
// (resolved via auan-types.d.ts declaration)
// ─────────────────────────────────────────────────────────────

// Status constants
export { ORDER_STATUS, PAYMENT_STATUS } from "@auan/types"

// API response envelope
export type {
  ApiResponse,
  PaginatedResponse,
  Pagination,
  ApiError,
} from "@auan/types"

// Domain types — Categories
export type { CategoryResponse } from "@auan/types"

// Domain types — Products
export type {
  ProductResponse,
  ProductOptionResponse,
  OptionGroupResponse,
} from "@auan/types"

// Domain types — Cart
export type {
  SelectedOptionResponse,
  CartItemResponse,
  CartResponse,
} from "@auan/types"

// Domain types — Addresses
export type { Building, AddressResponse } from "@auan/types"

// Domain types — Orders
export type {
  OrderItemOptionResponse,
  OrderItemResponse,
  OrderStatusHistoryResponse,
  OrderResponse,
  OrderListItemResponse,
} from "@auan/types"

// Domain types — Payments
export type { PaymentResponse } from "@auan/types"

// Domain types — Settings
export type {
  StoreSettingsResponse,
  DaySchedule,
  TemporaryClosure,
  BusinessHoursResponse,
} from "@auan/types"

// Domain types — Notifications
export type { NotificationResponse } from "@auan/types"

// Domain types — Auth
export type { AuthProfileResponse, LoginResponse, UpdateProfileRequest } from "@auan/types"

// Domain types — Favorites
export type { FavoriteResponse, FavoriteCheckResponse, ProductListItemResponse } from "@auan/types"
