/**
 * Settings module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> repository.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 * Per 161-settings-management.md: settings organized by category.
 */

import type { DayOfWeek } from "./settings.constants.js"

// ─────────────────────────────────────────────────────────────
// DTO — Common
// ─────────────────────────────────────────────────────────────

/** Single key-value setting as stored in DB. */
export interface SettingItem {
  key: string
  value: string
  category: string
  description: string | null
}

// ─────────────────────────────────────────────────────────────
// DTO — Business Hours
// ─────────────────────────────────────────────────────────────

/** Per-day business hours. */
export interface DaySchedule {
  day: DayOfWeek
  open: string
  close: string
}

/** Temporary closure info. */
export interface TemporaryClosure {
  enabled: boolean
  reason: string
  start: string | null
  end: string | null
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (Store)
// ─────────────────────────────────────────────────────────────

/** Store settings (admin view — all fields). */
export interface StoreSettingsResponse {
  name: string
  logo: string
  description: string
  phone: string
  address: string
  status: string
}

/** Public store info (customer view — limited fields). */
export interface PublicStoreResponse {
  name: string
  logo: string
  description: string
  phone: string
  address: string
  isOpen: boolean
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (Business Hours)
// ─────────────────────────────────────────────────────────────

/** Business hours settings. */
export interface BusinessHoursResponse {
  schedule: DaySchedule[]
  temporaryClosure: TemporaryClosure
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (Payment)
// ─────────────────────────────────────────────────────────────

/** Payment settings. */
export interface PaymentSettingsResponse {
  promptpayNumber: string
  accountName: string
  promptpayQr: string
  timeout: number
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (Delivery)
// ─────────────────────────────────────────────────────────────

/** Delivery settings. */
export interface DeliverySettingsResponse {
  areas: string[]
  buildings: string[]
  fee: number
  minOrder: number
  estimatedTime: number
  pickupEnabled: boolean
  deliveryEnabled: boolean
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (Notification)
// ─────────────────────────────────────────────────────────────

/** Notification settings. */
export interface NotificationSettingsResponse {
  enabled: boolean
  lineEnabled: boolean
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (System)
// ─────────────────────────────────────────────────────────────

/** System settings. */
export interface SystemSettingsResponse {
  language: string
  timezone: string
  currency: string
  dateFormat: string
  maintenanceMode: boolean
  appVersion: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Response (All Settings Combined)
// ─────────────────────────────────────────────────────────────

/** All settings across all categories. */
export interface AllSettingsResponse {
  store: StoreSettingsResponse
  businessHours: BusinessHoursResponse
  payment: PaymentSettingsResponse
  delivery: DeliverySettingsResponse
  notification: NotificationSettingsResponse
  system: SystemSettingsResponse
}

// ─────────────────────────────────────────────────────────────
// DTO — Request (Update Schemas)
// ─────────────────────────────────────────────────────────────

/** Update store settings request. */
export interface UpdateStoreSettingsRequest {
  name?: string
  logo?: string
  description?: string | null
  phone?: string
  address?: string
  status?: string
}

/** Single day schedule for business hours update. */
export interface DayScheduleInput {
  open: string
  close: string
}

/** Update business hours request. */
export interface UpdateBusinessHoursRequest {
  schedule?: Partial<Record<DayOfWeek, DayScheduleInput>>
  temporaryClosure?: {
    enabled?: boolean
    reason?: string
    start?: string | null
    end?: string | null
  }
}

/** Update payment settings request. */
export interface UpdatePaymentSettingsRequest {
  promptpayNumber?: string
  accountName?: string
  promptpayQr?: string
  timeout?: number
}

/** Update delivery settings request. */
export interface UpdateDeliverySettingsRequest {
  areas?: string[]
  buildings?: string[]
  fee?: number
  minOrder?: number
  estimatedTime?: number
  pickupEnabled?: boolean
  deliveryEnabled?: boolean
}

/** Update notification settings request. */
export interface UpdateNotificationSettingsRequest {
  enabled?: boolean
  lineEnabled?: boolean
  emailEnabled?: boolean
  smsEnabled?: boolean
  pushEnabled?: boolean
}

/** Update system settings request. */
export interface UpdateSystemSettingsRequest {
  language?: string
  timezone?: string
  currency?: string
  dateFormat?: string
  maintenanceMode?: boolean
  appVersion?: string
}

/** Update all settings request (all categories at once). */
export interface UpdateAllSettingsRequest {
  store?: UpdateStoreSettingsRequest
  businessHours?: UpdateBusinessHoursRequest
  payment?: UpdatePaymentSettingsRequest
  delivery?: UpdateDeliverySettingsRequest
  notification?: UpdateNotificationSettingsRequest
  system?: UpdateSystemSettingsRequest
}

/** Reset settings request. */
export interface ResetSettingsRequest {
  category?: string
}
