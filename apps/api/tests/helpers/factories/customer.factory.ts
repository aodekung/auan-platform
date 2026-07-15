/**
 * Factory functions for creating mock Customer objects.
 */

import { faker } from "@faker-js/faker/locale/th"

export interface MockCustomer {
  id: string
  lineUserId: string
  displayName: string
  pictureUrl: string
  phone: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a mock Customer object with sensible defaults.
 * Any field can be overridden via the `overrides` parameter.
 */
export function createMockCustomer(
  overrides: Partial<MockCustomer> = {},
): MockCustomer {
  return {
    id: faker.string.uuid(),
    lineUserId: `U${faker.string.alphanumeric(32)}`,
    displayName: faker.person.firstName(),
    pictureUrl: faker.image.avatar(),
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
