import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// Mock setup (hoisted — must be defined before vi.mock factory runs)
// ─────────────────────────────────────────────────────────────

const {
  mockCartRepo,
  mockCartItemRepo,
  mockProductRepo,
  MockCartRepository,
  MockCartItemRepository,
  MockProductRepository,
} = vi.hoisted(() => {
  const cartRepo = {
    findOrCreateByCustomerId: vi.fn(),
    findWithItems: vi.fn(),
    findByCustomerId: vi.fn(),
  }
  const cartItemRepo = {
    findExistingItem: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteAllByCartId: vi.fn(),
  }
  const productRepo = {
    findById: vi.fn(),
  }
  return {
    mockCartRepo: cartRepo,
    mockCartItemRepo: cartItemRepo,
    mockProductRepo: productRepo,
    MockCartRepository: vi.fn(function () { return cartRepo }),
    MockCartItemRepository: vi.fn(function () { return cartItemRepo }),
    MockProductRepository: vi.fn(function () { return productRepo }),
  }
})

vi.mock("@/database/repositories/cart.repository.js", () => ({
  CartRepository: MockCartRepository,
}))

vi.mock("@/database/repositories/cart-item.repository.js", () => ({
  CartItemRepository: MockCartItemRepository,
}))

vi.mock("@/database/repositories/product.repository.js", () => ({
  ProductRepository: MockProductRepository,
}))

// Imports
import { AppError, ErrorCode } from "@/common/errors.js"
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/modules/cart/cart.service.js"

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

function makeCart(overrides: Record<string, unknown> = {}) {
  return {
    id: "cart-001",
    customerId: "cust-001",
    createdAt: new Date("2025-06-01T00:00:00.000Z"),
    updatedAt: new Date("2025-06-01T00:00:00.000Z"),
    ...overrides,
  }
}

function makeCartWithItems(items: Array<Record<string, unknown>> = []) {
  return {
    id: "cart-001",
    customerId: "cust-001",
    updatedAt: new Date("2025-06-01T12:00:00.000Z"),
    items: items.map((item) => ({
      id: item.id ?? "item-001",
      productId: item.productId ?? "prod-001",
      productName: item.productName ?? "Product A",
      quantity: item.quantity ?? 2,
      unitPrice: item.unitPrice ?? 150,
      subtotal: item.subtotal ?? 300,
      selectedOptions: item.selectedOptions ?? [],
      note: item.note ?? null,
      product: {
        id: item.productId ?? "prod-001",
        name: item.productName ?? "Product A",
        imageUrl: null,
        price: 100,
        status: "ACTIVE",
        isAvailable: true,
        ...item.product,
      },
    })),
  }
}

function makeCartItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "item-001",
    cartId: "cart-001",
    productId: "prod-001",
    productName: "Product A",
    quantity: 2,
    unitPrice: 150,
    subtotal: 300,
    selectedOptions: [],
    optionsHash: null,
    note: null,
    product: {
      id: "prod-001",
      name: "Product A",
      imageUrl: null,
      price: 100,
      status: "ACTIVE",
      isAvailable: true,
    },
    ...overrides,
  }
}

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod-001",
    name: "Product A",
    price: 100,
    status: "ACTIVE",
    isAvailable: true,
    category: { id: "cat-001", name: "Category A" },
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// getCart
// ─────────────────────────────────────────────────────────────

describe("getCart", () => {
  it("should return empty cart when no cart with items exists", async () => {
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(
      makeCart({ id: "cart-001", updatedAt: new Date("2025-06-01T12:00:00.000Z") }),
    )
    mockCartRepo.findWithItems.mockResolvedValue(null)

    const result = await getCart("cust-001")

    expect(result.id).toBe("cart-001")
    expect(result.items).toEqual([])
    expect(result.itemCount).toBe(0)
    expect(result.subtotal).toBe("0.00")
    expect(result.total).toBe("0.00")
  })

  it("should return cart with items when cart has items", async () => {
    const cartWithItems = makeCartWithItems([
      { id: "item-001", productName: "Product A", quantity: 2, unitPrice: 150, subtotal: 300 },
      { id: "item-002", productName: "Product B", quantity: 1, unitPrice: 200, subtotal: 200 },
    ])
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartRepo.findWithItems.mockResolvedValue(cartWithItems)

    const result = await getCart("cust-001")

    expect(result.items).toHaveLength(2)
    expect(result.items[0].productName).toBe("Product A")
    expect(result.items[1].productName).toBe("Product B")
  })

  it("should calculate cart totals correctly (subtotal, total, itemCount)", async () => {
    const cartWithItems = makeCartWithItems([
      { id: "item-001", quantity: 2, unitPrice: 150, subtotal: 300 },
      { id: "item-002", quantity: 3, unitPrice: 50, subtotal: 150 },
    ])
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartRepo.findWithItems.mockResolvedValue(cartWithItems)

    const result = await getCart("cust-001")

    // itemCount = 2 + 3 = 5
    expect(result.itemCount).toBe(5)
    // subtotal = 300 + 150 = 450.00
    expect(result.subtotal).toBe("450.00")
    // total = subtotal (no delivery fees)
    expect(result.total).toBe("450.00")
  })
})

// ─────────────────────────────────────────────────────────────
// addToCart
// ─────────────────────────────────────────────────────────────

describe("addToCart", () => {
  it("should throw 404 when product not found", async () => {
    mockProductRepo.findById.mockResolvedValue(null)

    await expect(
      addToCart("cust-001", { productId: "nonexistent" }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.PRODUCT_NOT_FOUND,
    })
  })

  it("should throw 400 when product status is not ACTIVE", async () => {
    mockProductRepo.findById.mockResolvedValue(
      makeProduct({ status: "DISABLED" }),
    )

    await expect(
      addToCart("cust-001", { productId: "prod-001" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.PRODUCT_UNAVAILABLE,
    })
  })

  it("should throw 400 when product isAvailable is false", async () => {
    mockProductRepo.findById.mockResolvedValue(
      makeProduct({ isAvailable: false }),
    )

    await expect(
      addToCart("cust-001", { productId: "prod-001" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.PRODUCT_UNAVAILABLE,
    })
  })

  it("should throw 400 when option missing optionGroupId", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct())

    await expect(
      addToCart("cust-001", {
        productId: "prod-001",
        selectedOptions: [
          { optionGroupId: "", optionId: "opt-1", optionName: "Size M", additionalPrice: 10 },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_OPTION,
    })
  })

  it("should throw 400 when option missing optionId", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct())

    await expect(
      addToCart("cust-001", {
        productId: "prod-001",
        selectedOptions: [
          { optionGroupId: "grp-1", optionId: "", optionName: "Size M", additionalPrice: 10 },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_OPTION,
    })
  })

  it("should throw 400 when option missing optionName", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct())

    await expect(
      addToCart("cust-001", {
        productId: "prod-001",
        selectedOptions: [
          { optionGroupId: "grp-1", optionId: "opt-1", optionName: "", additionalPrice: 10 },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.INVALID_OPTION,
    })
  })

  it("should increment quantity when same product and same options (merge logic)", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartItemRepo.findExistingItem.mockResolvedValue(
      makeCartItem({ id: "item-existing", quantity: 2, unitPrice: 120, optionsHash: "hash1" }),
    )
    mockCartItemRepo.update.mockResolvedValue(makeCartItem())
    // getCart after add
    mockCartRepo.findWithItems.mockResolvedValue(
      makeCartWithItems([{ id: "item-existing", quantity: 3, unitPrice: 120, subtotal: 360 }]),
    )

    await addToCart("cust-001", {
      productId: "prod-001",
      quantity: 1,
      selectedOptions: [
        { optionGroupId: "grp-1", optionId: "opt-1", optionName: "Size M", additionalPrice: 20 },
      ],
    })

    // Should update existing item: quantity 2 + 1 = 3
    expect(mockCartItemRepo.update).toHaveBeenCalledWith("item-existing", {
      quantity: 3,
      unitPrice: expect.any(Number),
      subtotal: expect.any(Number),
    })
  })

  it("should create new item when same product but different options", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    // Existing item with different optionsHash
    mockCartItemRepo.findExistingItem.mockResolvedValue(null)
    mockCartItemRepo.create.mockResolvedValue(makeCartItem())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await addToCart("cust-001", {
      productId: "prod-001",
      selectedOptions: [
        { optionGroupId: "grp-1", optionId: "opt-2", optionName: "Size L", additionalPrice: 30 },
      ],
    })

    expect(mockCartItemRepo.create).toHaveBeenCalled()
    expect(mockCartItemRepo.update).not.toHaveBeenCalled()
  })

  it("should calculate unit price as base price plus sum of option additional prices", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartItemRepo.findExistingItem.mockResolvedValue(null)
    mockCartItemRepo.create.mockResolvedValue(makeCartItem())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await addToCart("cust-001", {
      productId: "prod-001",
      selectedOptions: [
        { optionGroupId: "grp-1", optionId: "opt-1", optionName: "Size M", additionalPrice: 20 },
        { optionGroupId: "grp-2", optionId: "opt-3", optionName: "Extra Topping", additionalPrice: 15 },
      ],
    })

    expect(mockCartItemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPrice: 135, // 100 + 20 + 15
      }),
    )
  })

  it("should throw 400 when merged quantity exceeds 50", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartItemRepo.findExistingItem.mockResolvedValue(
      makeCartItem({ quantity: 49, optionsHash: "hash1" }),
    )

    await expect(
      addToCart("cust-001", {
        productId: "prod-001",
        quantity: 5, // 49 + 5 = 54 > 50
        selectedOptions: [
          { optionGroupId: "grp-1", optionId: "opt-1", optionName: "Size M", additionalPrice: 20 },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: ErrorCode.MAX_QUANTITY_EXCEEDED,
    })
  })

  it("should create new item with correct data when no existing item", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100, name: "Product A" }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart({ id: "cart-001" }))
    mockCartItemRepo.findExistingItem.mockResolvedValue(null)
    mockCartItemRepo.create.mockResolvedValue(makeCartItem())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await addToCart("cust-001", {
      productId: "prod-001",
      quantity: 3,
      note: "No spice",
    })

    expect(mockCartItemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cartId: "cart-001",
        productId: "prod-001",
        productName: "Product A",
        quantity: 3,
        unitPrice: 100, // base price only, no options
        subtotal: 300, // 100 * 3
        note: "No spice",
      }),
    )
  })

  it("should handle empty selectedOptions array correctly (optionsHash = null)", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartItemRepo.findExistingItem.mockResolvedValue(null)
    mockCartItemRepo.create.mockResolvedValue(makeCartItem())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await addToCart("cust-001", {
      productId: "prod-001",
      selectedOptions: [],
    })

    expect(mockCartItemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        optionsHash: null,
      }),
    )
  })

  it("should calculate subtotal as unitPrice times quantity for new item", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProduct({ price: 100 }))
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartItemRepo.findExistingItem.mockResolvedValue(null)
    mockCartItemRepo.create.mockResolvedValue(makeCartItem())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await addToCart("cust-001", {
      productId: "prod-001",
      quantity: 4,
      selectedOptions: [
        { optionGroupId: "grp-1", optionId: "opt-1", optionName: "Size M", additionalPrice: 25 },
      ],
    })

    // unitPrice = 100 + 25 = 125, quantity = 4, subtotal = 500
    expect(mockCartItemRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        unitPrice: 125,
        subtotal: 500,
      }),
    )
  })
})

// ─────────────────────────────────────────────────────────────
// updateCartItem
// ─────────────────────────────────────────────────────────────

describe("updateCartItem", () => {
  it("should throw 404 when item not found", async () => {
    mockCartItemRepo.findById.mockResolvedValue(null)

    await expect(
      updateCartItem("cust-001", "item-nonexistent", { quantity: 5 }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.CART_ITEM_NOT_FOUND,
    })
  })

  it("should throw 404 when item belongs to different customer", async () => {
    mockCartItemRepo.findById.mockResolvedValue(
      makeCartItem({ id: "item-001", cartId: "cart-other" }),
    )
    mockCartRepo.findByCustomerId.mockResolvedValue(
      makeCart({ id: "cart-001" }),
    )

    await expect(
      updateCartItem("cust-001", "item-001", { quantity: 5 }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.CART_ITEM_NOT_FOUND,
    })
  })

  it("should recalculate subtotal from unitPrice times new quantity", async () => {
    const item = makeCartItem({ id: "item-001", cartId: "cart-001", unitPrice: 150, quantity: 2 })
    mockCartItemRepo.findById.mockResolvedValue(item)
    mockCartRepo.findByCustomerId.mockResolvedValue(makeCart({ id: "cart-001" }))
    mockCartItemRepo.update.mockResolvedValue(item)
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await updateCartItem("cust-001", "item-001", { quantity: 5 })

    // subtotal = 150 * 5 = 750
    expect(mockCartItemRepo.update).toHaveBeenCalledWith("item-001", {
      quantity: 5,
      subtotal: 750,
    })
  })

  it("should update note when note provided", async () => {
    const item = makeCartItem({ id: "item-001", cartId: "cart-001", unitPrice: 100 })
    mockCartItemRepo.findById.mockResolvedValue(item)
    mockCartRepo.findByCustomerId.mockResolvedValue(makeCart({ id: "cart-001" }))
    mockCartItemRepo.update.mockResolvedValue(item)
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems())

    await updateCartItem("cust-001", "item-001", { note: "Extra sauce" })

    expect(mockCartItemRepo.update).toHaveBeenCalledWith("item-001", {
      note: "Extra sauce",
    })
  })

  it("should return updated cart", async () => {
    const item = makeCartItem({ id: "item-001", cartId: "cart-001" })
    mockCartItemRepo.findById.mockResolvedValue(item)
    mockCartRepo.findByCustomerId.mockResolvedValue(makeCart({ id: "cart-001" }))
    mockCartItemRepo.update.mockResolvedValue(item)
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    const cartWithItems = makeCartWithItems([{ id: "item-001", quantity: 5 }])
    mockCartRepo.findWithItems.mockResolvedValue(cartWithItems)

    const result = await updateCartItem("cust-001", "item-001", { quantity: 5 })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].quantity).toBe(5)
  })
})

// ─────────────────────────────────────────────────────────────
// removeCartItem
// ─────────────────────────────────────────────────────────────

describe("removeCartItem", () => {
  it("should throw 404 when item not found", async () => {
    mockCartItemRepo.findById.mockResolvedValue(null)

    await expect(
      removeCartItem("cust-001", "item-nonexistent"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.CART_ITEM_NOT_FOUND,
    })
  })

  it("should throw 404 when item belongs to different customer", async () => {
    mockCartItemRepo.findById.mockResolvedValue(
      makeCartItem({ id: "item-001", cartId: "cart-other" }),
    )
    mockCartRepo.findByCustomerId.mockResolvedValue(
      makeCart({ id: "cart-001" }),
    )

    await expect(
      removeCartItem("cust-001", "item-001"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ErrorCode.CART_ITEM_NOT_FOUND,
    })
  })

  it("should delete item and return updated cart", async () => {
    const item = makeCartItem({ id: "item-001", cartId: "cart-001" })
    mockCartItemRepo.findById.mockResolvedValue(item)
    mockCartRepo.findByCustomerId.mockResolvedValue(makeCart({ id: "cart-001" }))
    mockCartItemRepo.delete.mockResolvedValue(undefined)
    mockCartRepo.findOrCreateByCustomerId.mockResolvedValue(makeCart())
    mockCartRepo.findWithItems.mockResolvedValue(makeCartWithItems([]))

    const result = await removeCartItem("cust-001", "item-001")

    expect(mockCartItemRepo.delete).toHaveBeenCalledWith("item-001")
    expect(result.items).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────
// clearCart
// ─────────────────────────────────────────────────────────────

describe("clearCart", () => {
  it("should delete all items when cart exists", async () => {
    mockCartRepo.findByCustomerId.mockResolvedValue(makeCart({ id: "cart-001" }))
    mockCartItemRepo.deleteAllByCartId.mockResolvedValue(3)

    await clearCart("cust-001")

    expect(mockCartItemRepo.deleteAllByCartId).toHaveBeenCalledWith("cart-001")
  })

  it("should do nothing when no cart exists", async () => {
    mockCartRepo.findByCustomerId.mockResolvedValue(null)

    await clearCart("cust-001")

    expect(mockCartItemRepo.deleteAllByCartId).not.toHaveBeenCalled()
  })
})
