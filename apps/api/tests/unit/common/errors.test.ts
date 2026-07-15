import { describe, it, expect } from "vitest"

import { AppError, ErrorCode, notFound, badRequest, unauthorized, forbidden, conflict } from "@/common/errors.js"

describe("AppError", () => {
  it("constructor sets statusCode, code, and message", () => {
    const error = new AppError(400, ErrorCode.VALIDATION_ERROR, "Bad input")

    expect(error).toBeInstanceOf(Error)
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR)
    expect(error.message).toBe("Bad input")
    expect(error.name).toBe("AppError")
  })

  it('name is always "AppError"', () => {
    const error = new AppError(500, ErrorCode.INTERNAL_ERROR, "Oops")
    expect(error.name).toBe("AppError")
  })

  it("serialize() returns the error response shape", () => {
    const error = new AppError(404, ErrorCode.NOT_FOUND, "Not here")

    const serialized = error.serialize()

    expect(serialized).toEqual({
      success: false,
      error: {
        code: ErrorCode.NOT_FOUND,
        message: "Not here",
      },
    })
  })
})

describe("notFound()", () => {
  it("throws AppError with 404 + NOT_FOUND + given message", () => {
    expect(() => notFound("User not found")).toThrow(AppError)
    expect(() => notFound("User not found")).toThrow("User not found")

    try {
      notFound("User not found")
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(404)
      expect(appErr.code).toBe(ErrorCode.NOT_FOUND)
      expect(appErr.message).toBe("User not found")
    }
  })

  it("with custom code uses that code", () => {
    try {
      notFound("Order missing", ErrorCode.ORDER_NOT_FOUND)
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(404)
      expect(appErr.code).toBe(ErrorCode.ORDER_NOT_FOUND)
      expect(appErr.message).toBe("Order missing")
    }
  })
})

describe("badRequest()", () => {
  it("throws AppError with 400 + VALIDATION_ERROR", () => {
    try {
      badRequest("Invalid email format")
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(400)
      expect(appErr.code).toBe(ErrorCode.VALIDATION_ERROR)
      expect(appErr.message).toBe("Invalid email format")
    }
  })
})

describe("unauthorized()", () => {
  it("throws AppError with 401 + AUTHENTICATION_ERROR + default message", () => {
    try {
      unauthorized()
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(401)
      expect(appErr.code).toBe(ErrorCode.AUTHENTICATION_ERROR)
      expect(appErr.message).toBe("Unauthorized")
    }
  })

  it("with custom message uses that message", () => {
    try {
      unauthorized("Token expired")
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(401)
      expect(appErr.code).toBe(ErrorCode.AUTHENTICATION_ERROR)
      expect(appErr.message).toBe("Token expired")
    }
  })
})

describe("forbidden()", () => {
  it("throws AppError with 403 + AUTHORIZATION_ERROR", () => {
    try {
      forbidden()
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(403)
      expect(appErr.code).toBe(ErrorCode.AUTHORIZATION_ERROR)
      expect(appErr.message).toBe("Forbidden")
    }
  })

  it("with custom message uses that message", () => {
    try {
      forbidden("You cannot delete this resource")
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(403)
      expect(appErr.code).toBe(ErrorCode.AUTHORIZATION_ERROR)
      expect(appErr.message).toBe("You cannot delete this resource")
    }
  })
})

describe("conflict()", () => {
  it("throws AppError with 409 + CONFLICT", () => {
    try {
      conflict("Email already registered")
    } catch (err) {
      const appErr = err as AppError
      expect(appErr.statusCode).toBe(409)
      expect(appErr.code).toBe(ErrorCode.CONFLICT)
      expect(appErr.message).toBe("Email already registered")
    }
  })
})
