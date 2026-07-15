/**
 * Factory functions for creating mock Payment objects.
 */

import { faker } from "@faker-js/faker/locale/th"

export interface MockPayment {
  id: string
  orderId: string
  method: string
  amount: number
  paymentStatus: string
  slipImage: string | null
  paidAt: Date | null
  verifiedAt: Date | null
  verifiedBy: string | null
  rejectReason: string | null
  createdAt: Date
  updatedAt: Date
  order: { id: string; orderNumber: string }
}

/**
 * Create a mock Payment object with sensible defaults.
 */
export function createMockPayment(
  overrides: Partial<MockPayment> = {},
): MockPayment {
  const orderId = faker.string.uuid()

  return {
    id: faker.string.uuid(),
    orderId,
    method: "PROMPTPAY",
    amount: 25,
    paymentStatus: "PENDING",
    slipImage: null,
    paidAt: null,
    verifiedAt: null,
    verifiedBy: null,
    rejectReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: {
      id: orderId,
      orderNumber: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${faker.string.numeric(6)}`,
    },
    ...overrides,
  }
}
