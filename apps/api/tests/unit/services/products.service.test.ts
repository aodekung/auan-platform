import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// vi.hoisted: define mock objects + constructors that are hoisted
// alongside vi.mock factories so they are available when factories run.
// ─────────────────────────────────────────────────────────────

const { mockProductRepo, MockProductRepository, mockCategoryRepo, MockCategoryRepository } = vi.hoisted(() => {
  const mockProductRepo = {
    findActive: vi.fn(),
    findById: vi.fn(),
    findBySku: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    exists: vi.fn(),
  }
  const MockProductRepository = vi.fn(function () { return mockProductRepo })

  const mockCategoryRepo = {
    findById: vi.fn(),
    findActive: vi.fn(),
    countProducts: vi.fn(),
  }
  const MockCategoryRepository = vi.fn(function () { return mockCategoryRepo })

  return { mockProductRepo, MockProductRepository, mockCategoryRepo, MockCategoryRepository }
})

vi.mock("@/database/repositories/product.repository.js", () => ({
  ProductRepository: MockProductRepository,
}))

vi.mock("@/database/repositories/category.repository.js", () => ({
  CategoryRepository: MockCategoryRepository,
}))

vi.mock("@/modules/product-options/product-options.service.js", () => ({
  getOptionGroupsByProductId: vi.fn().mockResolvedValue([]),
}))

vi.mock("@/database/client.js", () => ({
  prisma: {},
}))

// Imports
import { AppError } from "@/common/errors.js"
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/modules/products/products.service.js"
import { getOptionGroupsByProductId } from "@/modules/product-options/product-options.service.js"

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod-001",
    categoryId: "cat-001",
    sku: "SKU-001",
    name: "Mala Skewer",
    nameEn: "Mala Skewer",
    description: "Spicy mala skewer",
    imageUrl: "https://img.url/mala.jpg",
    price: 50,
    status: "ACTIVE",
    displayOrder: 0,
    isAvailable: true,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

function makeProductWithCategory() {
  return {
    ...makeProduct(),
    category: { id: "cat-001", name: "Skewers" },
  }
}

// ─────────────────────────────────────────────────────────────
// getAllProducts
// ─────────────────────────────────────────────────────────────

describe("getAllProducts", () => {
  it("returns products mapped to response with pagination", async () => {
    const products = [makeProduct(), makeProduct({ id: "prod-002", name: "Chicken Skewer" })]
    mockProductRepo.findActive.mockResolvedValue({ data: products, total: 2 })

    const result = await getAllProducts({ page: 1, pageSize: 10 })

    expect(result.products).toHaveLength(2)
    expect(result.products[0]).toEqual(
      expect.objectContaining({
        id: "prod-001",
        price: "50",
      }),
    )
    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalItems: 2,
      totalPages: 1,
    })
  })

  it("passes query options (categoryId, search, sort, page, pageSize) to repo", async () => {
    mockProductRepo.findActive.mockResolvedValue({ data: [], total: 0 })

    await getAllProducts({
      categoryId: "cat-001",
      search: "mala",
      sort: "price",
      order: "asc",
      page: 2,
      pageSize: 5,
    })

    expect(mockProductRepo.findActive).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "cat-001",
        search: "mala",
        sort: "price",
        order: "asc",
        page: 2,
        pageSize: 5,
      }),
    )
  })
})

// ─────────────────────────────────────────────────────────────
// getProductById
// ─────────────────────────────────────────────────────────────

describe("getProductById", () => {
  it("returns product with category and option groups", async () => {
    const product = makeProductWithCategory()
    mockProductRepo.findById.mockResolvedValue(product)
    vi.mocked(getOptionGroupsByProductId).mockResolvedValue([
      { id: "opt-001", name: "Spice Level", options: [] },
    ])

    const result = await getProductById("prod-001")

    expect(result.category).toEqual({ id: "cat-001", name: "Skewers" })
    expect(result.optionGroups).toHaveLength(1)
    expect(getOptionGroupsByProductId).toHaveBeenCalledWith("prod-001")
  })

  it("throws 404 when product not found", async () => {
    mockProductRepo.findById.mockResolvedValue(null)

    try {
      await getProductById("nonexistent")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("PRODUCT_NOT_FOUND")
    }
  })
})

// ─────────────────────────────────────────────────────────────
// createProduct
// ─────────────────────────────────────────────────────────────

describe("createProduct", () => {
  it("throws 400 when category not found", async () => {
    mockCategoryRepo.findById.mockResolvedValue(null)

    try {
      await createProduct({
        categoryId: "cat-missing",
        name: "New Product",
        price: 50,
      })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(400)
      expect((err as AppError).code).toBe("INVALID_CATEGORY")
    }
  })

  it("throws 400 when category is inactive", async () => {
    mockCategoryRepo.findById.mockResolvedValue({
      id: "cat-001",
      isActive: false,
    })

    try {
      await createProduct({
        categoryId: "cat-001",
        name: "New Product",
        price: 50,
      })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(400)
      expect((err as AppError).code).toBe("INVALID_CATEGORY")
    }
  })

  it("throws 409 when SKU already exists", async () => {
    mockCategoryRepo.findById.mockResolvedValue({ id: "cat-001", isActive: true })
    mockProductRepo.findBySku.mockResolvedValue(makeProduct())

    try {
      await createProduct({
        categoryId: "cat-001",
        sku: "SKU-001",
        name: "New Product",
        price: 50,
      })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(409)
      expect((err as AppError).code).toBe("DUPLICATE_PRODUCT_SKU")
    }
  })

  it("creates product and returns detail response", async () => {
    mockCategoryRepo.findById.mockResolvedValue({ id: "cat-001", isActive: true })
    mockProductRepo.findBySku.mockResolvedValue(null)
    mockProductRepo.create.mockResolvedValue(makeProduct())
    mockProductRepo.findById.mockResolvedValue(makeProductWithCategory())

    const result = await createProduct({
      categoryId: "cat-001",
      sku: "SKU-NEW",
      name: "New Product",
      price: 100,
    })

    expect(mockProductRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Product",
        sku: "SKU-NEW",
        categoryId: "cat-001",
        price: 100,
      }),
    )
    expect(result.category).toEqual({ id: "cat-001", name: "Skewers" })
  })
})

// ─────────────────────────────────────────────────────────────
// updateProduct
// ─────────────────────────────────────────────────────────────

describe("updateProduct", () => {
  it("throws 404 when product not found", async () => {
    mockProductRepo.findById.mockResolvedValue(null)

    try {
      await updateProduct("nonexistent", { name: "Updated" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("PRODUCT_NOT_FOUND")
    }
  })

  it("throws 400 when new category is invalid", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProductWithCategory())
    mockCategoryRepo.findById.mockResolvedValue(null)

    try {
      await updateProduct("prod-001", { categoryId: "cat-bad" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(400)
      expect((err as AppError).code).toBe("INVALID_CATEGORY")
    }
  })

  it("throws 409 when new SKU is taken", async () => {
    mockProductRepo.findById.mockResolvedValue(makeProductWithCategory())
    mockProductRepo.findBySku.mockResolvedValue(makeProduct({ id: "prod-other" }))

    try {
      await updateProduct("prod-001", { sku: "SKU-TAKEN" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(409)
      expect((err as AppError).code).toBe("DUPLICATE_PRODUCT_SKU")
    }
  })

  it("updates product and returns detail response", async () => {
    mockProductRepo.findById
      .mockResolvedValueOnce(makeProductWithCategory()) // existence check
      .mockResolvedValueOnce(makeProductWithCategory()) // re-fetch for response
    mockProductRepo.update.mockResolvedValue(undefined)

    const result = await updateProduct("prod-001", { name: "Updated Name" })

    expect(mockProductRepo.update).toHaveBeenCalledWith(
      "prod-001",
      expect.objectContaining({ name: "Updated Name" }),
    )
    expect(result.name).toBe("Mala Skewer") // re-fetched from DB
    expect(result.category).toEqual({ id: "cat-001", name: "Skewers" })
  })
})

// ─────────────────────────────────────────────────────────────
// deleteProduct
// ─────────────────────────────────────────────────────────────

describe("deleteProduct", () => {
  it("throws 404 when product not found", async () => {
    mockProductRepo.exists.mockResolvedValue(false)

    try {
      await deleteProduct("nonexistent")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("PRODUCT_NOT_FOUND")
    }
  })

  it("sets status to DISABLED and isAvailable to false", async () => {
    mockProductRepo.exists.mockResolvedValue(true)
    mockProductRepo.update.mockResolvedValue(undefined)

    await deleteProduct("prod-001")

    expect(mockProductRepo.update).toHaveBeenCalledWith("prod-001", {
      status: "DISABLED",
      isAvailable: false,
    })
  })
})
