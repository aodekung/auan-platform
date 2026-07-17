/**
 * Settings Controller — handles HTTP request/response for settings endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"

import type {
  UpdateAllSettingsBody,
  UpdateBusinessHoursBody,
  UpdateDeliverySettingsBody,
  UpdateNotificationSettingsBody,
  UpdatePaymentSettingsBody,
  ResetSettingsBody,
  UpdateStoreSettingsBody,
  UpdateSystemSettingsBody,
  BatchUpdateSettingsBody,
  GetAllSettingsQuery,
} from "./settings.schema.js"
import {
  getAllSettings,
  getPublicBusinessHours,
  getPublicStoreSettings,
  getBusinessHoursSettings,
  getDeliverySettings,
  getNotificationSettings,
  getPaymentSettings,
  getSettingsByCategory,
  getStoreSettings,
  getSystemSettings,
  batchUpdateSettings,
  resetSettings,
  updateAllSettings,
  updateBusinessHoursSettings,
  updateDeliverySettings,
  updateNotificationSettings,
  updatePaymentSettings,
  updateStoreSettings,
  updateSystemSettings,
  uploadPromptPayQr,
  uploadStoreLogo,
} from "./settings.service.js"

// ─────────────────────────────────────────────────────────────
// Helper — extract authenticated actor info from JWT
// Supports both Owner (LINE JWT on request.user) and Staff JWT (request.staff)
// ─────────────────────────────────────────────────────────────

interface JwtPayload {
  userId: string
  lineUserId: string
  role: string
  displayName?: string
}

interface StaffJwtPayload {
  staffId: string
  email: string
  role: string
}

function getUser(request: FastifyRequest): { userId: string; displayName: string } {
  // Try Owner (LINE JWT)
  const user = (request as unknown as Record<string, unknown>).user as JwtPayload | undefined
  if (user?.userId) {
    return { userId: user.userId, displayName: user.displayName ?? "Owner" }
  }
  // Try Staff JWT
  const staff = (request as unknown as Record<string, unknown>).staff as StaffJwtPayload | undefined
  if (staff?.staffId) {
    return { userId: staff.staffId, displayName: staff.email }
  }
  // Fallback (should never reach here if auth middleware runs correctly)
  return { userId: "unknown", displayName: "unknown" }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// GET /api/v1/settings/store
// ─────────────────────────────────────────────────────────────

export async function getPublicStoreHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getPublicStoreSettings()
  void reply.code(200).send(
    successResponse(settings, "Store information retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/settings/business-hours
// ─────────────────────────────────────────────────────────────

export async function getPublicBusinessHoursHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const hours = await getPublicBusinessHours()
  void reply.code(200).send(
    successResponse(hours, "Business hours retrieved successfully"),
  )
}

// ═══════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings
// ─────────────────────────────────────────────────────────────

export async function getAllSettingsHandler(
  request: FastifyRequest<{ Querystring: GetAllSettingsQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const { category } = request.query
  if (category) {
    const items = await getSettingsByCategory(category)
    void reply.code(200).send(
      successResponse(items, "Settings retrieved successfully"),
    )
    return
  }
  const settings = await getAllSettings()
  void reply.code(200).send(
    successResponse(settings, "All settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings
// ─────────────────────────────────────────────────────────────

export async function updateAllSettingsHandler(
  request: FastifyRequest<{ Body: UpdateAllSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updateAllSettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "All settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings/store
// ─────────────────────────────────────────────────────────────

export async function getStoreSettingsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getStoreSettings()
  void reply.code(200).send(
    successResponse(settings, "Store settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings/store
// ─────────────────────────────────────────────────────────────

export async function updateStoreSettingsHandler(
  request: FastifyRequest<{ Body: UpdateStoreSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updateStoreSettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Store settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/admin/settings/store/logo
// ─────────────────────────────────────────────────────────────

export async function uploadStoreLogoHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const data = await request.file()
  if (!data) {
    void reply.code(400).send({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "No file uploaded" },
    })
    return
  }
  const settings = await uploadStoreLogo(data, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Store logo uploaded successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings/business-hours
// ─────────────────────────────────────────────────────────────

export async function getBusinessHoursSettingsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getBusinessHoursSettings()
  void reply.code(200).send(
    successResponse(settings, "Business hours settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings/business-hours
// ─────────────────────────────────────────────────────────────

export async function updateBusinessHoursSettingsHandler(
  request: FastifyRequest<{ Body: UpdateBusinessHoursBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updateBusinessHoursSettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Business hours settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings/payment
// ─────────────────────────────────────────────────────────────

export async function getPaymentSettingsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getPaymentSettings()
  void reply.code(200).send(
    successResponse(settings, "Payment settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings/payment
// ─────────────────────────────────────────────────────────────

export async function updatePaymentSettingsHandler(
  request: FastifyRequest<{ Body: UpdatePaymentSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updatePaymentSettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Payment settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/admin/settings/payment/qrcode
// ─────────────────────────────────────────────────────────────

export async function uploadPromptPayQrHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const data = await request.file()
  if (!data) {
    void reply.code(400).send({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "No file uploaded" },
    })
    return
  }
  const settings = await uploadPromptPayQr(data, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "PromptPay QR uploaded successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings/delivery
// ─────────────────────────────────────────────────────────────

export async function getDeliverySettingsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getDeliverySettings()
  void reply.code(200).send(
    successResponse(settings, "Delivery settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings/delivery
// ─────────────────────────────────────────────────────────────

export async function updateDeliverySettingsHandler(
  request: FastifyRequest<{ Body: UpdateDeliverySettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updateDeliverySettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Delivery settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings/notifications
// ─────────────────────────────────────────────────────────────

export async function getNotificationSettingsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getNotificationSettings()
  void reply.code(200).send(
    successResponse(settings, "Notification settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings/notifications
// ─────────────────────────────────────────────────────────────

export async function updateNotificationSettingsHandler(
  request: FastifyRequest<{ Body: UpdateNotificationSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updateNotificationSettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Notification settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/settings/system
// ─────────────────────────────────────────────────────────────

export async function getSystemSettingsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const settings = await getSystemSettings()
  void reply.code(200).send(
    successResponse(settings, "System settings retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PUT /api/v1/admin/settings/system
// ─────────────────────────────────────────────────────────────

export async function updateSystemSettingsHandler(
  request: FastifyRequest<{ Body: UpdateSystemSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await updateSystemSettings(request.body, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "System settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/admin/settings/batch
// ─────────────────────────────────────────────────────────────

export async function batchUpdateSettingsHandler(
  request: FastifyRequest<{ Body: BatchUpdateSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const results = await batchUpdateSettings(request.body.settings, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(results, "Settings updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/admin/settings/reset
// ─────────────────────────────────────────────────────────────

export async function resetSettingsHandler(
  request: FastifyRequest<{ Body: ResetSettingsBody }>,
  reply: FastifyReply,
): Promise<void> {
  const user = getUser(request)
  const settings = await resetSettings(request.body.category, user.userId, user.displayName ?? "")
  void reply.code(200).send(
    successResponse(settings, "Settings reset to defaults successfully"),
  )
}
