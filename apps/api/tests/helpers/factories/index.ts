/**
 * Barrel export for all test factories.
 *
 * Import from `@/tests/helpers/factories` (or the relative path) to
 * get every factory function in one place.
 */

export {
  createMockCustomer,
  type MockCustomer,
} from "./customer.factory.js"

export {
  createMockProduct,
  createMockProducts,
  type MockProduct,
  type MockProductCategory,
} from "./product.factory.js"

export {
  createMockCart,
  createMockCartItem,
  createMockCartWithItems,
  type MockCart,
  type MockCartItem,
} from "./cart.factory.js"

export {
  createMockOrder,
  createMockOrderItem,
  createMockOrderStatusHistory,
  createMockOrderWithDetails,
  type MockOrder,
  type MockOrderItem,
  type MockOrderItemOption,
  type MockOrderStatusHistory,
} from "./order.factory.js"

export {
  createMockPayment,
  type MockPayment,
} from "./payment.factory.js"

export {
  createMockCategory,
  type MockCategory,
} from "./category.factory.js"

export {
  createMockStaff,
  createMockStaffRole,
  createMockStaffSession,
  type MockStaff,
  type MockStaffRole,
  type MockStaffSession,
} from "./staff.factory.js"

export {
  createMockSetting,
  createMockStoreSettings,
  type MockSetting,
} from "./setting.factory.js"
