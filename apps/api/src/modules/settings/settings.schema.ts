/**
 * Zod validation schemas for the Settings module.
 *
 * Every request body is validated through these schemas
 * before reaching the service layer (per 90-api-rules.md).
 *
 * Per 150-business-rules.md:
 *   - Phone validation: Thai mobile format
 *   - Delivery fee: integer THB (no decimals)
 *   - Business hours: HH:mm format
 * Per 155-payment-workflow.md:
 *   - PromptPay: 10-digit number
 *   - Payment timeout: seconds
 * Per 100-security-rules.md:
 *   - Validate all external input
 */

import { z } from "zod"

import { DAYS_OF_WEEK, SETTING_CATEGORIES } from "./settings.constants.js"

// ─────────────────────────────────────────────────────────────
// Shared Validators
// ─────────────────────────────────────────────────────────────

/** Thai mobile phone number: 0XX-XXX-XXXX or +66X-XXX-XXXX. */
const thaiPhoneSchema = z
  .string()
  .regex(/^(\+66|66|0)\d{9}$/, "Invalid Thai phone number format")

/** Time in HH:mm format (24-hour). */
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format (24-hour)")

/** Store status enum. */
const storeStatusSchema = z.enum(["open", "closed"])

/** IANA timezone identifier. */
const timezoneSchema = z
  .string()
  .min(1)
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)*$/, "Invalid IANA timezone format")

// ─────────────────────────────────────────────────────────────
// Request Schemas — Store
// ─────────────────────────────────────────────────────────────

export const updateStoreSettingsBodySchema = z.object({
  name: z
    .string()
    .min(1, "Store name must not be empty")
    .max(100, "Store name must not exceed 100 characters")
    .optional(),
  logo: z.string().max(500, "Logo URL must not exceed 500 characters").optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),
  phone: thaiPhoneSchema.optional(),
  address: z
    .string()
    .max(300, "Address must not exceed 300 characters")
    .optional(),
  status: storeStatusSchema.optional(),
})

export type UpdateStoreSettingsBody = z.infer<typeof updateStoreSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — Business Hours
// ─────────────────────────────────────────────────────────────

const dayScheduleInputSchema = z.object({
  open: timeSchema,
  close: timeSchema,
})

export const updateBusinessHoursBodySchema = z.object({
  schedule: z
    .record(
      z.enum(DAYS_OF_WEEK),
      dayScheduleInputSchema.optional(),
    )
    .optional(),
  temporaryClosure: z
    .object({
      enabled: z.boolean().optional(),
      reason: z.string().max(300).optional(),
      start: z.string().datetime({ offset: true }).nullable().optional(),
      end: z.string().datetime({ offset: true }).nullable().optional(),
    })
    .optional(),
})

export type UpdateBusinessHoursBody = z.infer<typeof updateBusinessHoursBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — Payment
// ─────────────────────────────────────────────────────────────

export const updatePaymentSettingsBodySchema = z.object({
  promptpayNumber: z
    .string()
    .regex(/^\d{10}$/, "PromptPay number must be exactly 10 digits")
    .optional(),
  accountName: z
    .string()
    .min(1, "Account name must not be empty")
    .max(100, "Account name must not exceed 100 characters")
    .optional(),
  promptpayQr: z.string().max(500).optional(),
  timeout: z
    .number({ invalid_type_error: "Timeout must be a number" })
    .int("Timeout must be an integer")
    .min(60, "Timeout must be at least 60 seconds")
    .max(3600, "Timeout must not exceed 3600 seconds")
    .optional(),
})

export type UpdatePaymentSettingsBody = z.infer<typeof updatePaymentSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — Delivery
// ─────────────────────────────────────────────────────────────

export const updateDeliverySettingsBodySchema = z.object({
  areas: z.array(z.string().max(100)).min(1, "At least one delivery area is required").optional(),
  buildings: z.array(z.string().max(10)).min(1, "At least one building is required").optional(),
  fee: z
    .number({ invalid_type_error: "Delivery fee must be a number" })
    .int("Delivery fee must be an integer")
    .min(0, "Delivery fee must be 0 or greater")
    .optional(),
  minOrder: z
    .number({ invalid_type_error: "Minimum order must be a number" })
    .int("Minimum order must be an integer")
    .min(0, "Minimum order must be 0 or greater")
    .optional(),
  estimatedTime: z
    .number({ invalid_type_error: "Estimated time must be a number" })
    .int("Estimated time must be an integer")
    .min(1, "Estimated time must be at least 1 minute")
    .optional(),
  pickupEnabled: z.boolean().optional(),
  deliveryEnabled: z.boolean().optional(),
})

export type UpdateDeliverySettingsBody = z.infer<typeof updateDeliverySettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — Notification
// ─────────────────────────────────────────────────────────────

export const updateNotificationSettingsBodySchema = z.object({
  enabled: z.boolean().optional(),
  lineEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
})

export type UpdateNotificationSettingsBody = z.infer<typeof updateNotificationSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — System
// ─────────────────────────────────────────────────────────────

const currencySchema = z
  .string()
  .length(3, "Currency must be a 3-letter code (ISO 4217)")

export const updateSystemSettingsBodySchema = z.object({
  language: z.string().length(2, "Language must be a 2-letter code (ISO 639-1)").optional(),
  timezone: timezoneSchema.optional(),
  currency: currencySchema.optional(),
  dateFormat: z.string().max(20, "Date format must not exceed 20 characters").optional(),
  maintenanceMode: z.boolean().optional(),
  appVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must follow semver (e.g., 1.0.0)")
    .optional(),
})

export type UpdateSystemSettingsBody = z.infer<typeof updateSystemSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — Batch Update
// ─────────────────────────────────────────────────────────────

export const batchUpdateSettingsBodySchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1, "Setting key is required"),
      value: z.string(),
    }),
  ).min(1, "At least one setting is required"),
})

export type BatchUpdateSettingsBody = z.infer<typeof batchUpdateSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Query Schemas
// ─────────────────────────────────────────────────────────────

export const getAllSettingsQuerySchema = z.object({
  category: z.string().optional(),
})

export type GetAllSettingsQuery = z.infer<typeof getAllSettingsQuerySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — All Settings (combined)
// ─────────────────────────────────────────────────────────────

export const updateAllSettingsBodySchema = z.object({
  store: updateStoreSettingsBodySchema.optional(),
  businessHours: updateBusinessHoursBodySchema.optional(),
  payment: updatePaymentSettingsBodySchema.optional(),
  delivery: updateDeliverySettingsBodySchema.optional(),
  notification: updateNotificationSettingsBodySchema.optional(),
  system: updateSystemSettingsBodySchema.optional(),
})

export type UpdateAllSettingsBody = z.infer<typeof updateAllSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Request Schemas — Reset
// ─────────────────────────────────────────────────────────────

export const resetSettingsBodySchema = z.object({
  category: z.enum(SETTING_CATEGORIES).optional(),
})

export type ResetSettingsBody = z.infer<typeof resetSettingsBodySchema>

// ─────────────────────────────────────────────────────────────
// Response Schemas (for Swagger)
// ─────────────────────────────────────────────────────────────

const dayScheduleSchema = z.object({
  day: z.string(),
  open: z.string(),
  close: z.string(),
})

const temporaryClosureSchema = z.object({
  enabled: z.boolean(),
  reason: z.string(),
  start: z.string().nullable(),
  end: z.string().nullable(),
})

const storeSettingsResponseSchema = z.object({
  name: z.string(),
  logo: z.string(),
  description: z.string(),
  phone: z.string(),
  address: z.string(),
  status: z.string(),
})

const publicStoreResponseSchema = z.object({
  name: z.string(),
  logo: z.string(),
  description: z.string(),
  phone: z.string(),
  address: z.string(),
  isOpen: z.boolean(),
})

const businessHoursResponseSchema = z.object({
  schedule: z.array(dayScheduleSchema),
  temporaryClosure: temporaryClosureSchema,
})

const paymentSettingsResponseSchema = z.object({
  promptpayNumber: z.string(),
  accountName: z.string(),
  promptpayQr: z.string(),
  timeout: z.number(),
})

const deliverySettingsResponseSchema = z.object({
  areas: z.array(z.string()),
  buildings: z.array(z.string()),
  fee: z.number(),
  minOrder: z.number(),
  estimatedTime: z.number(),
  pickupEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
})

const notificationSettingsResponseSchema = z.object({
  enabled: z.boolean(),
  lineEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
})

const systemSettingsResponseSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  currency: z.string(),
  dateFormat: z.string(),
  maintenanceMode: z.boolean(),
  appVersion: z.string(),
})

const allSettingsResponseSchema = z.object({
  store: storeSettingsResponseSchema,
  businessHours: businessHoursResponseSchema,
  payment: paymentSettingsResponseSchema,
  delivery: deliverySettingsResponseSchema,
  notification: notificationSettingsResponseSchema,
  system: systemSettingsResponseSchema,
})

const errorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

// ─────────────────────────────────────────────────────────────
// Route Schemas (Fastify route options for Swagger)
// ─────────────────────────────────────────────────────────────

/** GET /api/v1/settings/store (public) */
export const getPublicStoreRouteSchema = {
  description: "Get public store information",
  tags: ["Settings"],
  response: {
    200: z.object({
      success: z.literal(true),
      data: publicStoreResponseSchema,
      message: z.string(),
    }),
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/settings/business-hours (public) */
export const getPublicBusinessHoursRouteSchema = {
  description: "Get business hours schedule",
  tags: ["Settings"],
  response: {
    200: z.object({
      success: z.literal(true),
      data: businessHoursResponseSchema,
      message: z.string(),
    }),
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings */
export const getAllSettingsRouteSchema = {
  description: "Get all settings (Owner only). Pass ?category=X to filter by category.",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  querystring: getAllSettingsQuerySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: allSettingsResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings */
export const updateAllSettingsRouteSchema = {
  description: "Update all settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updateAllSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: allSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings/store */
export const getStoreSettingsRouteSchema = {
  description: "Get store settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: storeSettingsResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings/store */
export const updateStoreSettingsRouteSchema = {
  description: "Update store settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updateStoreSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: storeSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/admin/settings/store/logo */
export const uploadStoreLogoRouteSchema = {
  description: "Upload store logo image (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: storeSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    413: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings/business-hours */
export const getBusinessHoursRouteSchema = {
  description: "Get business hours settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: businessHoursResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings/business-hours */
export const updateBusinessHoursRouteSchema = {
  description: "Update business hours settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updateBusinessHoursBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: businessHoursResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings/payment */
export const getPaymentSettingsRouteSchema = {
  description: "Get payment settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentSettingsResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings/payment */
export const updatePaymentSettingsRouteSchema = {
  description: "Update payment settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updatePaymentSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/admin/settings/payment/qrcode */
export const uploadPromptPayQrRouteSchema = {
  description: "Upload PromptPay QR image (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: paymentSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    413: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings/delivery */
export const getDeliverySettingsRouteSchema = {
  description: "Get delivery settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: deliverySettingsResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings/delivery */
export const updateDeliverySettingsRouteSchema = {
  description: "Update delivery settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updateDeliverySettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: deliverySettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings/notifications */
export const getNotificationSettingsRouteSchema = {
  description: "Get notification settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: notificationSettingsResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings/notifications */
export const updateNotificationSettingsRouteSchema = {
  description: "Update notification settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updateNotificationSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: notificationSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** GET /api/v1/admin/settings/system */
export const getSystemSettingsRouteSchema = {
  description: "Get system settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      success: z.literal(true),
      data: systemSettingsResponseSchema,
      message: z.string(),
    }),
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PUT /api/v1/admin/settings/system */
export const updateSystemSettingsRouteSchema = {
  description: "Update system settings (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: updateSystemSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: systemSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** POST /api/v1/admin/settings/reset */
export const resetSettingsRouteSchema = {
  description: "Reset settings to defaults (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: resetSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: allSettingsResponseSchema,
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const

/** PATCH /api/v1/admin/settings/batch */
export const batchUpdateSettingsRouteSchema = {
  description: "Batch update settings by key (Owner only)",
  tags: ["Settings"],
  security: [{ bearerAuth: [] }],
  body: batchUpdateSettingsBodySchema,
  response: {
    200: z.object({
      success: z.literal(true),
      data: z.array(z.object({
        key: z.string(),
        value: z.string(),
        category: z.string(),
        description: z.string().nullable(),
      })),
      message: z.string(),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
} as const
