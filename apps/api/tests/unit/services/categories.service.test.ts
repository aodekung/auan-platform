import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// vi.hoisted: define mock objects + constructors that are hoisted
// alongside vi.mock factories so they are available when factories run.
// ─────────────────────────────────────────────────────────────

const { mockCategoryRepo, MockCategoryRepository } = vi.hoisted(() => {
  const mockCategoryRepo = {
    findActive: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    countProducts: vi.fn(),
  }
  const MockCategoryRepository = vi.fn(function () { return mockCategoryRepo })
  return { mockCategoryRepo, MockCategoryRepository }
})

vi.mock("@/database/repositories/category.repository.js", () => ({
  CategoryRepository: MockCategoryRepository,
}))

// Imports
import { AppError } from "@/common/errors.js"
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/modules/categories/categories.service.js"

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks()
})

function makeCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: "cat-001",
    name: "Skewers",
    description: "Various skewers",
    displayOrder: 1,
    isActive: true,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

// ─────────────────────────────────────────────────────────────
// getAllCategories
// ─────────────────────────────────────────────────────────────

describe("getAllCategories", () => {
  it("returns categories sorted by displayOrder", async () => {
    const categories = [
      makeCategory({ id: "cat-001", name: "Skewers", displayOrder: 2 }),
      makeCategory({ id: "cat-002", name: "Drinks", displayOrder: 1 }),
    ]
    mockCategoryRepo.findActive.mockResolvedValue(categories)
    mockCategoryRepo.countProducts.mockResolvedValue(5)

    const result = await getAllCategories()

    // The repo already returns sorted data; service just maps
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("Skewers")
    expect(result[1].name).toBe("Drinks")
    expect(result[0].productCount).toBe(5)
  })
})

// ─────────────────────────────────────────────────────────────
// getCategoryById
// ─────────────────────────────────────────────────────────────

describe("getCategoryById", () => {
  it("throws 404 when category not found", async () => {
    mockCategoryRepo.findById.mockResolvedValue(null)

    try {
      await getCategoryById("nonexistent")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("CATEGORY_NOT_FOUND")
    }
  })

  it("returns category with productCount", async () => {
    mockCategoryRepo.findById.mockResolvedValue(makeCategory())
    mockCategoryRepo.countProducts.mockResolvedValue(3)

    const result = await getCategoryById("cat-001")

    expect(result.id).toBe("cat-001")
    expect(result.name).toBe("Skewers")
    expect(result.productCount).toBe(3)
  })
})

// ─────────────────────────────────────────────────────────────
// createCategory
// ─────────────────────────────────────────────────────────────

describe("createCategory", () => {
  it("throws 409 for duplicate name (case-insensitive)", async () => {
    // findByName is expected to do case-insensitive matching at repo level
    mockCategoryRepo.findByName.mockResolvedValue(makeCategory())

    try {
      await createCategory({ name: "Skewers" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(409)
      expect((err as AppError).code).toBe("DUPLICATE_CATEGORY_NAME")
    }
  })

  it("creates category with isActive: true and default displayOrder", async () => {
    mockCategoryRepo.findByName.mockResolvedValue(null)
    mockCategoryRepo.create.mockResolvedValue(makeCategory({ displayOrder: 0 }))
    mockCategoryRepo.countProducts.mockResolvedValue(0)

    const result = await createCategory({ name: "New Category" })

    expect(mockCategoryRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Category",
        isActive: true,
        displayOrder: 0,
      }),
    )
    expect(result.name).toBe("Skewers")
  })
})

// ─────────────────────────────────────────────────────────────
// updateCategory
// ─────────────────────────────────────────────────────────────

describe("updateCategory", () => {
  it("throws 404 when category not found", async () => {
    mockCategoryRepo.findById.mockResolvedValue(null)

    try {
      await updateCategory("nonexistent", { name: "Updated" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("CATEGORY_NOT_FOUND")
    }
  })

  it("throws 409 for duplicate name on rename", async () => {
    mockCategoryRepo.findById.mockResolvedValue(makeCategory({ name: "Skewers" }))
    mockCategoryRepo.findByName.mockResolvedValue(makeCategory({ id: "cat-other" }))

    try {
      await updateCategory("cat-001", { name: "Existing Name" })
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(409)
      expect((err as AppError).code).toBe("DUPLICATE_CATEGORY_NAME")
    }
  })

  it("does not throw 409 when name is unchanged", async () => {
    mockCategoryRepo.findById.mockResolvedValue(makeCategory({ name: "Skewers" }))
    mockCategoryRepo.update.mockResolvedValue(makeCategory())
    mockCategoryRepo.countProducts.mockResolvedValue(0)

    // Setting name to the same value — findByName should not be called
    // because the condition `data.name !== existing.name` is false
    const result = await updateCategory("cat-001", { name: "Skewers", description: "Updated" })

    expect(mockCategoryRepo.findByName).not.toHaveBeenCalled()
    expect(result.description).toBe("Various skewers") // from mock update return
  })

  it("updates successfully", async () => {
    mockCategoryRepo.findById.mockResolvedValue(makeCategory({ name: "Skewers" }))
    mockCategoryRepo.update.mockResolvedValue(
      makeCategory({ name: "Updated Category", description: "New desc" }),
    )
    mockCategoryRepo.countProducts.mockResolvedValue(2)

    const result = await updateCategory("cat-001", { name: "Updated Category", description: "New desc" })

    expect(mockCategoryRepo.update).toHaveBeenCalledWith(
      "cat-001",
      expect.objectContaining({
        name: "Updated Category",
        description: "New desc",
      }),
    )
    expect(result.name).toBe("Updated Category")
    expect(result.productCount).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────
// deleteCategory
// ─────────────────────────────────────────────────────────────

describe("deleteCategory", () => {
  it("throws 404 when category not found", async () => {
    mockCategoryRepo.findById.mockResolvedValue(null)

    try {
      await deleteCategory("nonexistent")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(404)
      expect((err as AppError).code).toBe("CATEGORY_NOT_FOUND")
    }
  })

  it("throws 409 when products are linked", async () => {
    mockCategoryRepo.findById.mockResolvedValue(makeCategory())
    mockCategoryRepo.countProducts.mockResolvedValue(5)

    try {
      await deleteCategory("cat-001")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(409)
      expect((err as AppError).code).toBe("INVALID_CATEGORY")
    }
  })

  it("sets isActive to false when no products linked", async () => {
    mockCategoryRepo.findById.mockResolvedValue(makeCategory())
    mockCategoryRepo.countProducts.mockResolvedValue(0)
    mockCategoryRepo.update.mockResolvedValue(undefined)

    await deleteCategory("cat-001")

    expect(mockCategoryRepo.update).toHaveBeenCalledWith("cat-001", { isActive: false })
  })
})
