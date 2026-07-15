/**
 * Settings Constants — setting keys organized by category.
 *
 * Defines all configurable system settings as key constants.
 * Key format: {category}.{field} or {category}.{sub}.{field} for nested data.
 * Per 161-settings-management.md: "manage all configurable system settings
 * without requiring code changes."
 *
 * Default values reflect 150-business-rules.md operating context:
 *   - Operating hours: 15:00-22:30 daily
 *   - Delivery: Regent Home Bangson Phase 27 & 28, free delivery
 *   - Payment: PromptPay, 300-second timeout
 */

// ─────────────────────────────────────────────────────────────
// Setting Keys by Category
// ─────────────────────────────────────────────────────────────

export const SETTING_KEYS = {
  STORE: {
    NAME: "store.name",
    LOGO: "store.logo",
    DESCRIPTION: "store.description",
    PHONE: "store.phone",
    ADDRESS: "store.address",
    STATUS: "store.status",
  },
  BUSINESS_HOURS: {
    MONDAY_OPEN: "business_hours.monday.open",
    MONDAY_CLOSE: "business_hours.monday.close",
    TUESDAY_OPEN: "business_hours.tuesday.open",
    TUESDAY_CLOSE: "business_hours.tuesday.close",
    WEDNESDAY_OPEN: "business_hours.wednesday.open",
    WEDNESDAY_CLOSE: "business_hours.wednesday.close",
    THURSDAY_OPEN: "business_hours.thursday.open",
    THURSDAY_CLOSE: "business_hours.thursday.close",
    FRIDAY_OPEN: "business_hours.friday.open",
    FRIDAY_CLOSE: "business_hours.friday.close",
    SATURDAY_OPEN: "business_hours.saturday.open",
    SATURDAY_CLOSE: "business_hours.saturday.close",
    SUNDAY_OPEN: "business_hours.sunday.open",
    SUNDAY_CLOSE: "business_hours.sunday.close",
    TEMP_CLOSURE_ENABLED: "business_hours.temporary_closure.enabled",
    TEMP_CLOSURE_REASON: "business_hours.temporary_closure.reason",
    TEMP_CLOSURE_START: "business_hours.temporary_closure.start",
    TEMP_CLOSURE_END: "business_hours.temporary_closure.end",
  },
  PAYMENT: {
    PROMPTPAY_NUMBER: "payment.promptpay_number",
    ACCOUNT_NAME: "payment.account_name",
    PROMPTPAY_QR: "payment.promptpay_qr",
    TIMEOUT: "payment.timeout",
  },
  DELIVERY: {
    AREAS: "delivery.areas",
    BUILDINGS: "delivery.buildings",
    FEE: "delivery.fee",
    MIN_ORDER: "delivery.min_order",
    ESTIMATED_TIME: "delivery.estimated_time",
    PICKUP_ENABLED: "delivery.pickup_enabled",
    DELIVERY_ENABLED: "delivery.enabled",
  },
  NOTIFICATION: {
    ENABLED: "notification.enabled",
    LINE_ENABLED: "notification.line_enabled",
    EMAIL_ENABLED: "notification.email_enabled",
    SMS_ENABLED: "notification.sms_enabled",
    PUSH_ENABLED: "notification.push_enabled",
  },
  SYSTEM: {
    LANGUAGE: "system.language",
    TIMEZONE: "system.timezone",
    CURRENCY: "system.currency",
    DATE_FORMAT: "system.date_format",
    MAINTENANCE_MODE: "system.maintenance_mode",
    APP_VERSION: "system.app_version",
  },
} as const

// ─────────────────────────────────────────────────────────────
// Category Constants
// ─────────────────────────────────────────────────────────────

export const SETTING_CATEGORIES = [
  "store",
  "business_hours",
  "payment",
  "delivery",
  "notification",
  "system",
] as const

export type SettingCategory = (typeof SETTING_CATEGORIES)[number]

// ─────────────────────────────────────────────────────────────
// Days of Week
// ─────────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]

// ─────────────────────────────────────────────────────────────
// Allowed MIME Types for Image Upload
// ─────────────────────────────────────────────────────────────

export const ALLOWED_IMAGE_MIMETYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

// ─────────────────────────────────────────────────────────────
// Default Values (seed)
// ─────────────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: Array<{
  key: string
  value: string
  category: string
  description: string
}> = [
  // Store
  { key: "store.name", value: "Auan Auan Mala Tod", category: "store", description: "Store display name" },
  { key: "store.logo", value: "", category: "store", description: "Store logo image URL" },
  { key: "store.description", value: "Mala skewers restaurant at Regent Home Bangson", category: "store", description: "Store description" },
  { key: "store.phone", value: "", category: "store", description: "Store contact phone" },
  { key: "store.address", value: "Regent Home Bangson", category: "store", description: "Store address" },
  { key: "store.status", value: "open", category: "store", description: "Store status: open or closed" },

  // Business Hours (15:00-22:30 daily per 150-business-rules.md)
  ...DAYS_OF_WEEK.flatMap((day) => [
    { key: `business_hours.${day}.open`, value: "15:00", category: "business_hours", description: `${day} opening time` },
    { key: `business_hours.${day}.close`, value: "22:30", category: "business_hours", description: `${day} closing time` },
  ]),
  { key: "business_hours.temporary_closure.enabled", value: "false", category: "business_hours", description: "Temporary closure enabled" },
  { key: "business_hours.temporary_closure.reason", value: "", category: "business_hours", description: "Temporary closure reason" },
  { key: "business_hours.temporary_closure.start", value: "", category: "business_hours", description: "Temporary closure start (ISO 8601)" },
  { key: "business_hours.temporary_closure.end", value: "", category: "business_hours", description: "Temporary closure end (ISO 8601)" },

  // Payment
  { key: "payment.promptpay_number", value: "", category: "payment", description: "PromptPay number" },
  { key: "payment.account_name", value: "", category: "payment", description: "Account holder name" },
  { key: "payment.promptpay_qr", value: "", category: "payment", description: "PromptPay QR image URL" },
  { key: "payment.timeout", value: "300", category: "payment", description: "Payment timeout in seconds" },

  // Delivery
  { key: "delivery.areas", value: JSON.stringify(["Regent Home Bangson Phase 27", "Regent Home Bangson Phase 28"]), category: "delivery", description: "Delivery areas (JSON array)" },
  { key: "delivery.buildings", value: JSON.stringify(["A", "B", "C", "D"]), category: "delivery", description: "Delivery buildings (JSON array)" },
  { key: "delivery.fee", value: "0", category: "delivery", description: "Delivery fee in THB" },
  { key: "delivery.min_order", value: "0", category: "delivery", description: "Minimum order amount in THB" },
  { key: "delivery.estimated_time", value: "20", category: "delivery", description: "Estimated delivery time in minutes" },
  { key: "delivery.pickup_enabled", value: "false", category: "delivery", description: "Pickup option enabled" },
  { key: "delivery.enabled", value: "true", category: "delivery", description: "Delivery enabled" },

  // Notification
  { key: "notification.enabled", value: "true", category: "notification", description: "Master notification toggle" },
  { key: "notification.line_enabled", value: "true", category: "notification", description: "LINE notifications enabled" },
  { key: "notification.email_enabled", value: "false", category: "notification", description: "Email notifications enabled" },
  { key: "notification.sms_enabled", value: "false", category: "notification", description: "SMS notifications enabled" },
  { key: "notification.push_enabled", value: "false", category: "notification", description: "Push notifications enabled" },

  // System
  { key: "system.language", value: "th", category: "system", description: "System language" },
  { key: "system.timezone", value: "Asia/Bangkok", category: "system", description: "System timezone (IANA)" },
  { key: "system.currency", value: "THB", category: "system", description: "Currency code" },
  { key: "system.date_format", value: "DD/MM/YYYY", category: "system", description: "Date display format" },
  { key: "system.maintenance_mode", value: "false", category: "system", description: "Maintenance mode enabled" },
  { key: "system.app_version", value: "1.0.0", category: "system", description: "Application version" },
]

// ─────────────────────────────────────────────────────────────
// Cache Configuration
// ─────────────────────────────────────────────────────────────

/** Settings cache TTL in milliseconds. */
export const SETTINGS_CACHE_TTL_MS = 60_000
