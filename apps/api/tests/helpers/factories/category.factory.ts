/**
 * Factory functions for creating mock Category objects.
 */

import { faker } from "@faker-js/faker/locale/th"

export interface MockCategory {
  id: string
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Create a mock Category object with sensible defaults.
 */
export function createMockCategory(
  overrides: Partial<MockCategory> = {},
): MockCategory {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    description: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}
