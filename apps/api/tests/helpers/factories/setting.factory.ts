/**
 * Factory functions for creating mock Setting objects.
 */

import { faker } from "@faker-js/faker/locale/th"

export interface MockSetting {
  id: string
  key: string
  value: string
  category: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a mock Setting object with sensible defaults.
 */
export function createMockSetting(
  overrides: Partial<MockSetting> = {},
): MockSetting {
  return {
    id: faker.string.uuid(),
    key: faker.string.alphanumeric({ length: 12 }),
    value: faker.string.alphanumeric({ length: 20 }),
    category: "store",
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create an array of common store settings typically needed for tests.
 */
export function createMockStoreSettings(): MockSetting[] {
  return [
    createMockSetting({
      key: "store_name",
      value: "Auan Auan",
      category: "store",
      description: "Store display name",
    }),
    createMockSetting({
      key: "store_description",
      value: "Delicious mala skewers",
      category: "store",
      description: "Store description",
    }),
    createMockSetting({
      key: "promptpay_number",
      value: "0987654321",
      category: "payment",
      description: "PromptPay QR number",
    }),
    createMockSetting({
      key: "operating_hours_start",
      value: "10:00",
      category: "business_hours",
      description: "Opening time",
    }),
    createMockSetting({
      key: "operating_hours_end",
      value: "22:00",
      category: "business_hours",
      description: "Closing time",
    }),
    createMockSetting({
      key: "estimated_prep_time_minutes",
      value: "15",
      category: "store",
      description: "Estimated preparation time",
    }),
  ]
}
