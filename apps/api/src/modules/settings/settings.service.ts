/**
 * Settings Service — business logic for settings management.
 *
 * Responsibilities:
 * - Read/write settings organized by category (key-value store)
 * - Map raw settings to structured response DTOs
 * - Audit log all setting changes
 * - Cache settings for performance (in-memory with TTL)
 * - File upload handling (store logo, PromptPay QR)
 * - Reset settings to defaults
 * - Compute derived state (e.g., isOpen from business hours)
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 161-settings-management.md: "settings changes take effect immediately."
 * Per 100-security-rules.md: public APIs expose only customer-required info.
 */

import { randomUUID } from "node:crypto"
import { writeFile, mkdir } from "node:fs/promises"
import { join, extname } from "node:path"

import type { MultipartFile } from "@fastify/multipart"

import { AppError, ErrorCode } from "../../common/errors.js"
import { env } from "../../config/env.js"
import { AuditLogRepository } from "../../database/repositories/audit-log.repository.js"
import { SettingRepository } from "../../database/repositories/setting.repository.js"

import {
  ALLOWED_IMAGE_MIMETYPES,
  DAYS_OF_WEEK,
  DEFAULT_SETTINGS,
  SETTINGS_CACHE_TTL_MS,
  SETTING_KEYS,
} from "./settings.constants.js"
import type {
  AllSettingsResponse,
  BusinessHoursResponse,
  DaySchedule,
  DeliverySettingsResponse,
  NotificationSettingsResponse,
  PaymentSettingsResponse,
  PublicStoreResponse,
  StoreSettingsResponse,
  SystemSettingsResponse,
  TemporaryClosure,
  UpdateAllSettingsRequest,
  UpdateBusinessHoursRequest,
  UpdateDeliverySettingsRequest,
  UpdateNotificationSettingsRequest,
  UpdatePaymentSettingsRequest,
  UpdateStoreSettingsRequest,
  UpdateSystemSettingsRequest,
} from "./settings.types.js"

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const settingRepo = new SettingRepository()
const auditLogRepo = new AuditLogRepository()

// ─────────────────────────────────────────────────────────────
// In-Memory Cache
// ─────────────────────────────────────────────────────────────

interface CacheEntry {
  data: Map<string, string>
  expiry: number
}

let cache: CacheEntry | null = null

function getCache(): Map<string, string> {
  if (cache && cache.expiry > Date.now()) {
    return cache.data
  }
  return new Map()
}

function setCache(data: Map<string, string>): void {
  cache = {
    data,
    expiry: Date.now() + SETTINGS_CACHE_TTL_MS,
  }
}

function clearCache(): void {
  cache = null
}

/**
 * Load all settings from DB into a Map.
 * Uses cache if still valid.
 */
async function loadAllSettingsMap(): Promise<Map<string, string>> {
  const cached = getCache()
  if (cached.size > 0) {
    return cached
  }

  const settings = await settingRepo.findAll()
  const map = new Map<string, string>()
  for (const setting of settings) {
    map.set(setting.key, setting.value)
  }
  setCache(map)
  return map
}

/**
 * Get a single setting value from the map, with a default fallback.
 */
function getSettingValue(map: Map<string, string>, key: string, defaultValue = ""): string {
  return map.get(key) ?? defaultValue
}

// ─────────────────────────────────────────────────────────────
// Mappers — raw settings Map to structured Response DTOs
// ─────────────────────────────────────────────────────────────

function mapToStoreSettings(map: Map<string, string>): StoreSettingsResponse {
  return {
    name: getSettingValue(map, SETTING_KEYS.STORE.NAME),
    logo: getSettingValue(map, SETTING_KEYS.STORE.LOGO),
    description: getSettingValue(map, SETTING_KEYS.STORE.DESCRIPTION),
    phone: getSettingValue(map, SETTING_KEYS.STORE.PHONE),
    address: getSettingValue(map, SETTING_KEYS.STORE.ADDRESS),
    status: getSettingValue(map, SETTING_KEYS.STORE.STATUS, "open"),
  }
}

function mapToPublicStore(map: Map<string, string>): PublicStoreResponse {
  const status = getSettingValue(map, SETTING_KEYS.STORE.STATUS, "open")
  const isOpen = status === "open" && !isTemporarilyClosed(map)

  return {
    name: getSettingValue(map, SETTING_KEYS.STORE.NAME),
    logo: getSettingValue(map, SETTING_KEYS.STORE.LOGO),
    description: getSettingValue(map, SETTING_KEYS.STORE.DESCRIPTION),
    phone: getSettingValue(map, SETTING_KEYS.STORE.PHONE),
    address: getSettingValue(map, SETTING_KEYS.STORE.ADDRESS),
    isOpen,
  }
}

function isTemporarilyClosed(map: Map<string, string>): boolean {
  const enabled = getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_ENABLED, "false")
  if (enabled !== "true") return false

  const now = new Date()
  const start = getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_START)
  const end = getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_END)

  if (start && end) {
    return now >= new Date(start) && now <= new Date(end)
  }
  return enabled === "true"
}

function mapToBusinessHours(map: Map<string, string>): BusinessHoursResponse {
  const schedule: DaySchedule[] = DAYS_OF_WEEK.map((day) => ({
    day,
    open: getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS[`${day.toUpperCase()}_OPEN` as keyof typeof SETTING_KEYS.BUSINESS_HOURS] as string, "15:00"),
    close: getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS[`${day.toUpperCase()}_CLOSE` as keyof typeof SETTING_KEYS.BUSINESS_HOURS] as string, "22:30"),
  }))

  const tempClosure: TemporaryClosure = {
    enabled: getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_ENABLED, "false") === "true",
    reason: getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_REASON),
    start: getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_START) || null,
    end: getSettingValue(map, SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_END) || null,
  }

  return { schedule, temporaryClosure: tempClosure }
}

function mapToPaymentSettings(map: Map<string, string>): PaymentSettingsResponse {
  return {
    promptpayNumber: getSettingValue(map, SETTING_KEYS.PAYMENT.PROMPTPAY_NUMBER),
    accountName: getSettingValue(map, SETTING_KEYS.PAYMENT.ACCOUNT_NAME),
    promptpayQr: getSettingValue(map, SETTING_KEYS.PAYMENT.PROMPTPAY_QR),
    timeout: Number(getSettingValue(map, SETTING_KEYS.PAYMENT.TIMEOUT, "300")),
  }
}

function mapToDeliverySettings(map: Map<string, string>): DeliverySettingsResponse {
  const areasStr = getSettingValue(map, SETTING_KEYS.DELIVERY.AREAS, "[]")
  const buildingsStr = getSettingValue(map, SETTING_KEYS.DELIVERY.BUILDINGS, "[]")

  return {
    areas: safeJsonParse(areasStr, []),
    buildings: safeJsonParse(buildingsStr, []),
    fee: Number(getSettingValue(map, SETTING_KEYS.DELIVERY.FEE, "0")),
    minOrder: Number(getSettingValue(map, SETTING_KEYS.DELIVERY.MIN_ORDER, "0")),
    estimatedTime: Number(getSettingValue(map, SETTING_KEYS.DELIVERY.ESTIMATED_TIME, "20")),
    pickupEnabled: getSettingValue(map, SETTING_KEYS.DELIVERY.PICKUP_ENABLED, "false") === "true",
    deliveryEnabled: getSettingValue(map, SETTING_KEYS.DELIVERY.DELIVERY_ENABLED, "true") === "true",
  }
}

function mapToNotificationSettings(map: Map<string, string>): NotificationSettingsResponse {
  return {
    enabled: getSettingValue(map, SETTING_KEYS.NOTIFICATION.ENABLED, "true") === "true",
    lineEnabled: getSettingValue(map, SETTING_KEYS.NOTIFICATION.LINE_ENABLED, "true") === "true",
    emailEnabled: getSettingValue(map, SETTING_KEYS.NOTIFICATION.EMAIL_ENABLED, "false") === "true",
    smsEnabled: getSettingValue(map, SETTING_KEYS.NOTIFICATION.SMS_ENABLED, "false") === "true",
    pushEnabled: getSettingValue(map, SETTING_KEYS.NOTIFICATION.PUSH_ENABLED, "false") === "true",
  }
}

function mapToSystemSettings(map: Map<string, string>): SystemSettingsResponse {
  return {
    language: getSettingValue(map, SETTING_KEYS.SYSTEM.LANGUAGE, "th"),
    timezone: getSettingValue(map, SETTING_KEYS.SYSTEM.TIMEZONE, "Asia/Bangkok"),
    currency: getSettingValue(map, SETTING_KEYS.SYSTEM.CURRENCY, "THB"),
    dateFormat: getSettingValue(map, SETTING_KEYS.SYSTEM.DATE_FORMAT, "DD/MM/YYYY"),
    maintenanceMode: getSettingValue(map, SETTING_KEYS.SYSTEM.MAINTENANCE_MODE, "false") === "true",
    appVersion: getSettingValue(map, SETTING_KEYS.SYSTEM.APP_VERSION, "1.0.0"),
  }
}

function mapToAllSettings(map: Map<string, string>): AllSettingsResponse {
  return {
    store: mapToStoreSettings(map),
    businessHours: mapToBusinessHours(map),
    payment: mapToPaymentSettings(map),
    delivery: mapToDeliverySettings(map),
    notification: mapToNotificationSettings(map),
    system: mapToSystemSettings(map),
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

// ─────────────────────────────────────────────────────────────
// Public (Customer-facing) — Read Only
// ─────────────────────────────────────────────────────────────

/**
 * Get public store information.
 * Exposes only fields needed by customers (no internal config).
 */
export async function getPublicStoreSettings(): Promise<PublicStoreResponse> {
  const map = await loadAllSettingsMap()
  return mapToPublicStore(map)
}

/**
 * Get public business hours schedule.
 */
export async function getPublicBusinessHours(): Promise<BusinessHoursResponse> {
  const map = await loadAllSettingsMap()
  return mapToBusinessHours(map)
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Read
// ─────────────────────────────────────────────────────────────

/**
 * Get all settings across all categories.
 */
export async function getAllSettings(): Promise<AllSettingsResponse> {
  const map = await loadAllSettingsMap()
  return mapToAllSettings(map)
}

/**
 * Get settings for a specific category.
 */
export async function getStoreSettings(): Promise<StoreSettingsResponse> {
  const map = await loadAllSettingsMap()
  return mapToStoreSettings(map)
}

export async function getBusinessHoursSettings(): Promise<BusinessHoursResponse> {
  const map = await loadAllSettingsMap()
  return mapToBusinessHours(map)
}

export async function getPaymentSettings(): Promise<PaymentSettingsResponse> {
  const map = await loadAllSettingsMap()
  return mapToPaymentSettings(map)
}

export async function getDeliverySettings(): Promise<DeliverySettingsResponse> {
  const map = await loadAllSettingsMap()
  return mapToDeliverySettings(map)
}

export async function getNotificationSettings(): Promise<NotificationSettingsResponse> {
  const map = await loadAllSettingsMap()
  return mapToNotificationSettings(map)
}

export async function getSystemSettings(): Promise<SystemSettingsResponse> {
  const map = await loadAllSettingsMap()
  return mapToSystemSettings(map)
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Read by Category (flat list)
// ─────────────────────────────────────────────────────────────

/**
 * Get settings filtered by category as a flat list of SettingItem.
 */
export async function getSettingsByCategory(category: string): Promise<Array<{ key: string; value: string; category: string; description: string | null }>> {
  const settings = await settingRepo.findByCategory(category)
  return settings.map((s) => ({
    key: s.key,
    value: s.value,
    category: s.category,
    description: s.description,
  }))
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Update
// ─────────────────────────────────────────────────────────────

/**
 * Update all settings across all categories at once.
 */
export async function updateAllSettings(
  data: UpdateAllSettingsRequest,
  userId: string,
  userName: string,
): Promise<AllSettingsResponse> {
  const entries: Array<{ key: string; value: string; category: string }> = []
  const auditChanges: Array<{ key: string; oldValue: string; newValue: string }> = []

  const map = await loadAllSettingsMap()

  if (data.store) {
    const changes = buildStoreEntries(data.store)
    for (const entry of changes) {
      const oldValue = map.get(entry.key) ?? ""
      if (entry.value !== oldValue) {
        auditChanges.push({ key: entry.key, oldValue, newValue: entry.value })
      }
      entries.push(entry)
    }
  }

  if (data.businessHours) {
    const changes = buildBusinessHoursEntries(data.businessHours)
    for (const entry of changes) {
      const oldValue = map.get(entry.key) ?? ""
      if (entry.value !== oldValue) {
        auditChanges.push({ key: entry.key, oldValue, newValue: entry.value })
      }
      entries.push(entry)
    }
  }

  if (data.payment) {
    const changes = buildPaymentEntries(data.payment)
    for (const entry of changes) {
      const oldValue = map.get(entry.key) ?? ""
      if (entry.value !== oldValue) {
        auditChanges.push({ key: entry.key, oldValue, newValue: entry.value })
      }
      entries.push(entry)
    }
  }

  if (data.delivery) {
    const changes = buildDeliveryEntries(data.delivery)
    for (const entry of changes) {
      const oldValue = map.get(entry.key) ?? ""
      if (entry.value !== oldValue) {
        auditChanges.push({ key: entry.key, oldValue, newValue: entry.value })
      }
      entries.push(entry)
    }
  }

  if (data.notification) {
    const changes = buildNotificationEntries(data.notification)
    for (const entry of changes) {
      const oldValue = map.get(entry.key) ?? ""
      if (entry.value !== oldValue) {
        auditChanges.push({ key: entry.key, oldValue, newValue: entry.value })
      }
      entries.push(entry)
    }
  }

  if (data.system) {
    const changes = buildSystemEntries(data.system)
    for (const entry of changes) {
      const oldValue = map.get(entry.key) ?? ""
      if (entry.value !== oldValue) {
        auditChanges.push({ key: entry.key, oldValue, newValue: entry.value })
      }
      entries.push(entry)
    }
  }

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { changes: auditChanges },
    })
  }

  return getAllSettings()
}

/**
 * Update store settings.
 */
export async function updateStoreSettings(
  data: UpdateStoreSettingsRequest,
  userId: string,
  userName: string,
): Promise<StoreSettingsResponse> {
  const entries = buildStoreEntries(data)
  const map = await loadAllSettingsMap()
  const auditChanges = trackChanges(entries, map)

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: "store", changes: auditChanges },
    })
  }

  return getStoreSettings()
}

/**
 * Update business hours settings.
 */
export async function updateBusinessHoursSettings(
  data: UpdateBusinessHoursRequest,
  userId: string,
  userName: string,
): Promise<BusinessHoursResponse> {
  const entries = buildBusinessHoursEntries(data)
  const map = await loadAllSettingsMap()
  const auditChanges = trackChanges(entries, map)

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: "business_hours", changes: auditChanges },
    })
  }

  return getBusinessHoursSettings()
}

/**
 * Update payment settings.
 */
export async function updatePaymentSettings(
  data: UpdatePaymentSettingsRequest,
  userId: string,
  userName: string,
): Promise<PaymentSettingsResponse> {
  const entries = buildPaymentEntries(data)
  const map = await loadAllSettingsMap()
  const auditChanges = trackChanges(entries, map)

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: "payment", changes: auditChanges },
    })
  }

  return getPaymentSettings()
}

/**
 * Update delivery settings.
 */
export async function updateDeliverySettings(
  data: UpdateDeliverySettingsRequest,
  userId: string,
  userName: string,
): Promise<DeliverySettingsResponse> {
  const entries = buildDeliveryEntries(data)
  const map = await loadAllSettingsMap()
  const auditChanges = trackChanges(entries, map)

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: "delivery", changes: auditChanges },
    })
  }

  return getDeliverySettings()
}

/**
 * Update notification settings.
 */
export async function updateNotificationSettings(
  data: UpdateNotificationSettingsRequest,
  userId: string,
  userName: string,
): Promise<NotificationSettingsResponse> {
  const entries = buildNotificationEntries(data)
  const map = await loadAllSettingsMap()
  const auditChanges = trackChanges(entries, map)

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: "notification", changes: auditChanges },
    })
  }

  return getNotificationSettings()
}

/**
 * Update system settings.
 */
export async function updateSystemSettings(
  data: UpdateSystemSettingsRequest,
  userId: string,
  userName: string,
): Promise<SystemSettingsResponse> {
  const entries = buildSystemEntries(data)
  const map = await loadAllSettingsMap()
  const auditChanges = trackChanges(entries, map)

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: "system", changes: auditChanges },
    })
  }

  return getSystemSettings()
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Batch Update
// ─────────────────────────────────────────────────────────────

/**
 * Update multiple settings by key in a single request.
 * Accepts an array of { key, value } pairs and upserts each.
 */
export async function batchUpdateSettings(
  settings: Array<{ key: string; value: string }>,
  userId: string,
  userName: string,
): Promise<Array<{ key: string; value: string; category: string; description: string | null }>> {
  if (settings.length === 0) {
    return []
  }

  const map = await loadAllSettingsMap()
  const auditChanges: Array<{ key: string; oldValue: string; newValue: string }> = []

  // For each key, look up the existing setting to get category/description
  const entries: Array<{ key: string; value: string; category: string; description?: string }> = []

  for (const item of settings) {
    const oldValue = map.get(item.key) ?? ""
    if (item.value !== oldValue) {
      auditChanges.push({ key: item.key, oldValue, newValue: item.value })
    }
    // Look up existing setting for category/description
    const existing = await settingRepo.findByKey(item.key)
    entries.push({
      key: item.key,
      value: item.value,
      category: existing?.category ?? "system",
      description: existing?.description ?? undefined,
    })
  }

  if (entries.length > 0) {
    await settingRepo.upsertMany(entries)
    clearCache()
  }

  if (auditChanges.length > 0) {
    await auditLogRepo.log({
      action: "SETTING_UPDATED",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { changes: auditChanges },
    })
  }

  // Return updated items
  const results: Array<{ key: string; value: string; category: string; description: string | null }> = []
  for (const item of settings) {
    const updated = await settingRepo.findByKey(item.key)
    if (updated) {
      results.push({
        key: updated.key,
        value: updated.value,
        category: updated.category,
        description: updated.description,
      })
    }
  }
  return results
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Reset
// ─────────────────────────────────────────────────────────────

/**
 * Reset settings to defaults for a specific category or all categories.
 */
export async function resetSettings(
  category?: string,
  userId?: string,
  userName?: string,
): Promise<AllSettingsResponse> {
  const defaults = DEFAULT_SETTINGS.filter(
    (d) => !category || d.category === category,
  )

  if (category) {
    await settingRepo.deleteByCategory(category)
  } else {
    for (const cat of ["store", "business_hours", "payment", "delivery", "notification", "system"]) {
      await settingRepo.deleteByCategory(cat)
    }
  }

  await settingRepo.upsertMany(defaults)
  clearCache()

  if (userId) {
    await auditLogRepo.log({
      action: "SETTING_RESET",
      entityType: "Setting",
      actorId: userId,
      actorName: userName,
      details: { category: category ?? "all" },
    })
  }

  return getAllSettings()
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — File Upload
// ─────────────────────────────────────────────────────────────

/**
 * Validate and save an uploaded image file.
 * Returns the relative path of the saved file.
 */
async function saveUploadedFile(
  file: MultipartFile,
  subdirectory: string,
): Promise<string> {
  const mimetype = file.mimetype
  if (!mimetype || !ALLOWED_IMAGE_MIMETYPES.includes(mimetype as typeof ALLOWED_IMAGE_MIMETYPES[number])) {
    throw new AppError(
      400,
      ErrorCode.INVALID_FILE_TYPE,
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIMETYPES.join(", ")}`,
    )
  }

  const fileBuffer = await file.toBuffer()
  if (fileBuffer.length > env.UPLOAD_MAX_SIZE) {
    throw new AppError(
      413,
      ErrorCode.FILE_TOO_LARGE,
      `File too large. Maximum size: ${env.UPLOAD_MAX_SIZE / 1_048_576}MB`,
    )
  }

  const ext = extname(file.filename) || ".png"
  const filename = `${randomUUID()}${ext}`
  const uploadDir = join(env.UPLOAD_PATH, subdirectory)

  await mkdir(uploadDir, { recursive: true })
  const filepath = join(uploadDir, filename)
  await writeFile(filepath, fileBuffer)

  return `${subdirectory}/${filename}`
}

/**
 * Upload store logo image.
 */
export async function uploadStoreLogo(
  file: MultipartFile,
  userId: string,
  userName: string,
): Promise<StoreSettingsResponse> {
  const relativePath = await saveUploadedFile(file, "store")

  await settingRepo.upsert({
    key: SETTING_KEYS.STORE.LOGO,
    value: relativePath,
    category: "store",
    description: "Store logo image URL",
  })
  clearCache()

  await auditLogRepo.log({
    action: "SETTING_UPDATED",
    entityType: "Setting",
    actorId: userId,
    actorName: userName,
    details: { category: "store", key: SETTING_KEYS.STORE.LOGO, newValue: relativePath },
  })

  return getStoreSettings()
}

/**
 * Upload PromptPay QR image.
 */
export async function uploadPromptPayQr(
  file: MultipartFile,
  userId: string,
  userName: string,
): Promise<PaymentSettingsResponse> {
  const relativePath = await saveUploadedFile(file, "payment")

  await settingRepo.upsert({
    key: SETTING_KEYS.PAYMENT.PROMPTPAY_QR,
    value: relativePath,
    category: "payment",
    description: "PromptPay QR image URL",
  })
  clearCache()

  await auditLogRepo.log({
    action: "SETTING_UPDATED",
    entityType: "Setting",
    actorId: userId,
    actorName: userName,
    details: { category: "payment", key: SETTING_KEYS.PAYMENT.PROMPTPAY_QR, newValue: relativePath },
  })

  return getPaymentSettings()
}

// ─────────────────────────────────────────────────────────────
// Entry Builders — convert typed request to key-value entries
// ─────────────────────────────────────────────────────────────

function buildStoreEntries(data: UpdateStoreSettingsRequest): Array<{ key: string; value: string; category: string }> {
  const entries: Array<{ key: string; value: string; category: string }> = []
  if (data.name !== undefined) entries.push({ key: SETTING_KEYS.STORE.NAME, value: data.name, category: "store" })
  if (data.logo !== undefined) entries.push({ key: SETTING_KEYS.STORE.LOGO, value: data.logo, category: "store" })
  if (data.description !== undefined) entries.push({ key: SETTING_KEYS.STORE.DESCRIPTION, value: data.description ?? "", category: "store" })
  if (data.phone !== undefined) entries.push({ key: SETTING_KEYS.STORE.PHONE, value: data.phone, category: "store" })
  if (data.address !== undefined) entries.push({ key: SETTING_KEYS.STORE.ADDRESS, value: data.address, category: "store" })
  if (data.status !== undefined) entries.push({ key: SETTING_KEYS.STORE.STATUS, value: data.status, category: "store" })
  return entries
}

function buildBusinessHoursEntries(data: UpdateBusinessHoursRequest): Array<{ key: string; value: string; category: string }> {
  const entries: Array<{ key: string; value: string; category: string }> = []

  if (data.schedule) {
    for (const [day, schedule] of Object.entries(data.schedule)) {
      if (!schedule) continue
      if (schedule.open !== undefined) {
        const key = SETTING_KEYS.BUSINESS_HOURS[`${day.toUpperCase()}_OPEN` as keyof typeof SETTING_KEYS.BUSINESS_HOURS] as string
        entries.push({ key, value: schedule.open, category: "business_hours" })
      }
      if (schedule.close !== undefined) {
        const key = SETTING_KEYS.BUSINESS_HOURS[`${day.toUpperCase()}_CLOSE` as keyof typeof SETTING_KEYS.BUSINESS_HOURS] as string
        entries.push({ key, value: schedule.close, category: "business_hours" })
      }
    }
  }

  if (data.temporaryClosure) {
    const tc = data.temporaryClosure
    if (tc.enabled !== undefined) entries.push({ key: SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_ENABLED, value: String(tc.enabled), category: "business_hours" })
    if (tc.reason !== undefined) entries.push({ key: SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_REASON, value: tc.reason, category: "business_hours" })
    if (tc.start !== undefined) entries.push({ key: SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_START, value: tc.start ?? "", category: "business_hours" })
    if (tc.end !== undefined) entries.push({ key: SETTING_KEYS.BUSINESS_HOURS.TEMP_CLOSURE_END, value: tc.end ?? "", category: "business_hours" })
  }

  return entries
}

function buildPaymentEntries(data: UpdatePaymentSettingsRequest): Array<{ key: string; value: string; category: string }> {
  const entries: Array<{ key: string; value: string; category: string }> = []
  if (data.promptpayNumber !== undefined) entries.push({ key: SETTING_KEYS.PAYMENT.PROMPTPAY_NUMBER, value: data.promptpayNumber, category: "payment" })
  if (data.accountName !== undefined) entries.push({ key: SETTING_KEYS.PAYMENT.ACCOUNT_NAME, value: data.accountName, category: "payment" })
  if (data.promptpayQr !== undefined) entries.push({ key: SETTING_KEYS.PAYMENT.PROMPTPAY_QR, value: data.promptpayQr, category: "payment" })
  if (data.timeout !== undefined) entries.push({ key: SETTING_KEYS.PAYMENT.TIMEOUT, value: String(data.timeout), category: "payment" })
  return entries
}

function buildDeliveryEntries(data: UpdateDeliverySettingsRequest): Array<{ key: string; value: string; category: string }> {
  const entries: Array<{ key: string; value: string; category: string }> = []
  if (data.areas !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.AREAS, value: JSON.stringify(data.areas), category: "delivery" })
  if (data.buildings !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.BUILDINGS, value: JSON.stringify(data.buildings), category: "delivery" })
  if (data.fee !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.FEE, value: String(data.fee), category: "delivery" })
  if (data.minOrder !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.MIN_ORDER, value: String(data.minOrder), category: "delivery" })
  if (data.estimatedTime !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.ESTIMATED_TIME, value: String(data.estimatedTime), category: "delivery" })
  if (data.pickupEnabled !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.PICKUP_ENABLED, value: String(data.pickupEnabled), category: "delivery" })
  if (data.deliveryEnabled !== undefined) entries.push({ key: SETTING_KEYS.DELIVERY.DELIVERY_ENABLED, value: String(data.deliveryEnabled), category: "delivery" })
  return entries
}

function buildNotificationEntries(data: UpdateNotificationSettingsRequest): Array<{ key: string; value: string; category: string }> {
  const entries: Array<{ key: string; value: string; category: string }> = []
  if (data.enabled !== undefined) entries.push({ key: SETTING_KEYS.NOTIFICATION.ENABLED, value: String(data.enabled), category: "notification" })
  if (data.lineEnabled !== undefined) entries.push({ key: SETTING_KEYS.NOTIFICATION.LINE_ENABLED, value: String(data.lineEnabled), category: "notification" })
  if (data.emailEnabled !== undefined) entries.push({ key: SETTING_KEYS.NOTIFICATION.EMAIL_ENABLED, value: String(data.emailEnabled), category: "notification" })
  if (data.smsEnabled !== undefined) entries.push({ key: SETTING_KEYS.NOTIFICATION.SMS_ENABLED, value: String(data.smsEnabled), category: "notification" })
  if (data.pushEnabled !== undefined) entries.push({ key: SETTING_KEYS.NOTIFICATION.PUSH_ENABLED, value: String(data.pushEnabled), category: "notification" })
  return entries
}

function buildSystemEntries(data: UpdateSystemSettingsRequest): Array<{ key: string; value: string; category: string }> {
  const entries: Array<{ key: string; value: string; category: string }> = []
  if (data.language !== undefined) entries.push({ key: SETTING_KEYS.SYSTEM.LANGUAGE, value: data.language, category: "system" })
  if (data.timezone !== undefined) entries.push({ key: SETTING_KEYS.SYSTEM.TIMEZONE, value: data.timezone, category: "system" })
  if (data.currency !== undefined) entries.push({ key: SETTING_KEYS.SYSTEM.CURRENCY, value: data.currency, category: "system" })
  if (data.dateFormat !== undefined) entries.push({ key: SETTING_KEYS.SYSTEM.DATE_FORMAT, value: data.dateFormat, category: "system" })
  if (data.maintenanceMode !== undefined) entries.push({ key: SETTING_KEYS.SYSTEM.MAINTENANCE_MODE, value: String(data.maintenanceMode), category: "system" })
  if (data.appVersion !== undefined) entries.push({ key: SETTING_KEYS.SYSTEM.APP_VERSION, value: data.appVersion, category: "system" })
  return entries
}

// ─────────────────────────────────────────────────────────────
// Audit Helpers
// ─────────────────────────────────────────────────────────────

interface ChangeRecord {
  key: string
  oldValue: string
  newValue: string
}

function trackChanges(
  entries: Array<{ key: string; value: string }>,
  currentMap: Map<string, string>,
): ChangeRecord[] {
  return entries
    .filter((entry) => entry.value !== (currentMap.get(entry.key) ?? ""))
    .map((entry) => ({
      key: entry.key,
      oldValue: currentMap.get(entry.key) ?? "",
      newValue: entry.value,
    }))
}
