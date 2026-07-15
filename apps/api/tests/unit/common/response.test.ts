import { describe, it, expect } from "vitest"

import { successResponse, paginatedResponse, errorResponse } from "@/common/response.js"

describe("successResponse()", () => {
  it("returns { success: true, data, message }", () => {
    const result = successResponse({ id: "1", name: "Test" }, "Item retrieved")

    expect(result).toEqual({
      success: true,
      data: { id: "1", name: "Test" },
      message: "Item retrieved",
    })
  })

  it('defaults message to "Success"', () => {
    const result = successResponse({ count: 42 })

    expect(result.message).toBe("Success")
    expect(result.data).toEqual({ count: 42 })
    expect(result.success).toBe(true)
  })

  it("success field is typed as true (not boolean)", () => {
    const result = successResponse(null)

    // Type-level check: success is `true as const`, not a generic boolean
    expect(result).toHaveProperty("success", true)
    // Verify it is literally `true` and not just truthy
    expect(result.success).toBe(true)
    expect(typeof result.success).toBe("boolean")
  })
})

describe("paginatedResponse()", () => {
  it("returns { success: true, data, pagination }", () => {
    const data = [{ id: "1" }, { id: "2" }]
    const pagination = { page: 1, pageSize: 10, totalItems: 25, totalPages: 3 }

    const result = paginatedResponse(data, pagination)

    expect(result).toEqual({
      success: true,
      data,
      pagination,
    })
  })

  it("works with empty data array", () => {
    const pagination = { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 }

    const result = paginatedResponse([], pagination)

    expect(result.data).toEqual([])
    expect(result.pagination.totalItems).toBe(0)
    expect(result.success).toBe(true)
  })
})

describe("errorResponse()", () => {
  it("returns { success: false, error: { code, message } }", () => {
    const result = errorResponse("NOT_FOUND", "Resource not found")

    expect(result).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    })
  })

  it("success field is typed as false (not boolean)", () => {
    const result = errorResponse("INTERNAL_ERROR", "Server error")

    expect(result.success).toBe(false)
    expect(typeof result.success).toBe("boolean")
  })
})
