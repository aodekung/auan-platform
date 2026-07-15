/**
 * Factory functions for creating mock Product objects.
 */

import { faker } from "@faker-js/faker/locale/th"

export interface MockProductCategory {
  id: string
  name: string
}

export interface MockProduct {
  id: string
  categoryId: string
  sku: string | null
  name: string
  nameEn: string | null
  description: string | null
  imageUrl: string | null
  price: number
  status: string
  displayOrder: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
  category: MockProductCategory
}

/**
 * Create a mock Product object with sensible defaults.
 * Prices are plain numbers (not Prisma Decimal objects).
 */
export function createMockProduct(
  overrides: Partial<MockProduct> = {},
): MockProduct {
  const categoryId = faker.string.uuid()
  return {
    id: faker.string.uuid(),
    categoryId,
    sku: null,
    name: faker.commerce.productName(),
    nameEn: null,
    description: faker.commerce.productDescription(),
    imageUrl: faker.image.url(),
    price: 25,
    status: "ACTIVE",
    displayOrder: 1,
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: categoryId,
      name: faker.commerce.department(),
    },
    ...overrides,
  }
}

/**
 * Create an array of mock Product objects.
 */
export function createMockProducts(
  count: number,
  overrides: Partial<MockProduct> = {},
): MockProduct[] {
  return Array.from({ length: count }, () => createMockProduct(overrides))
}
