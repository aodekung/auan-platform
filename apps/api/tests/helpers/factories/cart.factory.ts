/**
 * Factory functions for creating mock Cart and CartItem objects.
 */

import { faker } from "@faker-js/faker/locale/th"

export interface MockCartProduct {
  id: string
  name: string
  imageUrl: string | null
  price: number
  status: string
  isAvailable: boolean
}

export interface MockCartItem {
  id: string
  cartId: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  selectedOptions: unknown
  optionsHash: string | null
  note: string | null
  createdAt: Date
  product: MockCartProduct
}

export interface MockCart {
  id: string
  customerId: string
  createdAt: Date
  updatedAt: Date
  items: MockCartItem[]
}

/**
 * Create a mock Cart object with sensible defaults.
 */
export function createMockCart(
  overrides: Partial<MockCart> = {},
): MockCart {
  return {
    id: faker.string.uuid(),
    customerId: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    ...overrides,
  }
}

/**
 * Create a mock CartItem object with sensible defaults.
 */
export function createMockCartItem(
  overrides: Partial<MockCartItem> = {},
): MockCartItem {
  const cartId = faker.string.uuid()
  const productId = faker.string.uuid()

  return {
    id: faker.string.uuid(),
    cartId,
    productId,
    productName: faker.commerce.productName(),
    quantity: 1,
    unitPrice: 25,
    subtotal: 25,
    selectedOptions: null,
    optionsHash: null,
    note: null,
    createdAt: new Date(),
    product: {
      id: productId,
      name: faker.commerce.productName(),
      imageUrl: faker.image.url(),
      price: 25,
      status: "ACTIVE",
      isAvailable: true,
    },
    ...overrides,
  }
}

/**
 * Create a mock Cart with pre-populated items.
 *
 * Each item receives its own set of `itemOverrides`.
 * If `itemsOverrides` is an array, each element is spread over the
 * corresponding item (index-matched). If a single object is provided,
 * it is spread over every item.
 */
export function createMockCartWithItems(
  itemsOverrides: Partial<MockCartItem>[] | Partial<MockCartItem> = [{}],
): MockCart {
  const cartId = faker.string.uuid()
  const customerId = faker.string.uuid()

  const items: MockCartItem[] = (Array.isArray(itemsOverrides)
    ? itemsOverrides
    : [itemsOverrides]
  ).map((itemOverride) => createMockCartItem({ cartId, ...itemOverride }))

  return {
    id: cartId,
    customerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    items,
  }
}
