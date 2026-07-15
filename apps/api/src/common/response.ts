/**
 * Standardized API response format per 90-api-rules.md
 */
export function successResponse<T>(data: T, message = "Success") {
  return {
    success: true as const,
    data,
    message,
  }
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  },
) {
  return {
    success: true as const,
    data,
    pagination,
  }
}

export function errorResponse(code: string, message: string) {
  return {
    success: false as const,
    error: {
      code,
      message,
    },
  }
}
