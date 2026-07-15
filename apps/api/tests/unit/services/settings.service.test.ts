import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// vi.hoisted: define mock objects + constructors that are hoisted
// alongside vi.mock factories so they are available when factories run.
// ─────────────────────────────────────────────────────────────

const { mockSettingRepo, MockSettingRepository, mockAuditLogRepo, MockAuditLogRepository } = vi.hoisted(() => {
  const mockSettingRepo = {
    findAll: vi.fn(),
    upsertMany: vi.fn(),
    upsert: vi.fn(),
    deleteByCategory: vi.fn(),
  }
  const MockSettingRepository = vi.fn(function () { return mockSettingRepo })

  const mockAuditLogRepo = {
    log: vi.fn(),
  }
  const MockAuditLogRepository = vi.fn(function () { return mockAuditLogRepo })

  return { mockSettingRepo, MockSettingRepository, mockAuditLogRepo, MockAuditLogRepository }
})

vi.mock("@/database/repositories/setting.repository.js", () => ({
  SettingRepository: MockSettingRepository,
}))

vi.mock("@/database/repositories/audit-log.repository.js", () => ({
  AuditLogRepository: MockAuditLogRepository,
}))

vi.mock("@/config/env.js", () => ({
  env: {
    UPLOAD_PATH: "/tmp/uploads",
    UPLOAD_MAX_SIZE: 5 * 1_048_576,
  },
}))

// Mock node modules used by file upload functions
vi.mock("node:crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("mock-uuid"),
}))

vi.mock("node:fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("node:path", () => ({
  join: (...args: string[]) => args.join("/"),
  extname: (filename: string) => filename.split(".").pop() ?? "",
}))

// We also need to mock @fastify/multipart type import
vi.mock("@fastify/multipart", () => ({}))

// Imports — use dynamic import because settings service has module-level cache
// that must be reset between tests via vi.resetModules()

// ─────────────────────────────────────────────────────────────
// Setup / Helpers
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks()
  vi.resetModules()
})

async function importService() {
  return await import("@/modules/settings/settings.service.js")
}

function makeSettingsMap(overrides: Record<string, string> = {}): Array<{ key: string; value: string }> {
  const defaults: Array<[string, string]> = [
    ["store.name", "Auan Auan Mala Tod"],
    ["store.logo", "/logo.png"],
    ["store.description", "Mala skewers restaurant"],
    ["store.phone", "0812345678"],
    ["store.address", "Regent Home Bangson"],
    ["store.status", "open"],
    ["business_hours.temporary_closure.enabled", "false"],
    ["business_hours.temporary_closure.reason", ""],
    ["business_hours.temporary_closure.start", ""],
    ["business_hours.temporary_closure.end", ""],
    ["payment.timeout", "300"],
    ["payment.promptpay_number", ""],
    ["payment.account_name", ""],
    ["payment.promptpay_qr", ""],
    ["delivery.areas", "[]"],
    ["delivery.buildings", "[]"],
    ["delivery.fee", "0"],
    ["delivery.min_order", "0"],
    ["delivery.estimated_time", "20"],
    ["delivery.pickup_enabled", "false"],
    ["delivery.enabled", "true"],
    ["notification.enabled", "true"],
    ["notification.line_enabled", "true"],
    ["notification.email_enabled", "false"],
    ["notification.sms_enabled", "false"],
    ["notification.push_enabled", "false"],
    ["system.language", "th"],
    ["system.timezone", "Asia/Bangkok"],
    ["system.currency", "THB"],
    ["system.date_format", "DD/MM/YYYY"],
    ["system.maintenance_mode", "false"],
    ["system.app_version", "1.0.0"],
  ]

  for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
    defaults.push([`business_hours.${day}.open`, "15:00"])
    defaults.push([`business_hours.${day}.close`, "22:30"])
  }

  return defaults.map(([key, value]) => ({
    key,
    value: overrides[key] ?? value,
  }))
}

// ─────────────────────────────────────────────────────────────
// getPublicStoreSettings
// ─────────────────────────────────────────────────────────────

describe("getPublicStoreSettings", () => {
  it("returns store settings with correct fields", async () => {
    mockSettingRepo.findAll.mockResolvedValue(makeSettingsMap())

    const { getPublicStoreSettings } = await importService()
    const result = await getPublicStoreSettings()

    expect(result).toEqual({
      name: "Auan Auan Mala Tod",
      logo: "/logo.png",
      description: "Mala skewers restaurant",
      phone: "0812345678",
      address: "Regent Home Bangson",
      isOpen: true,
    })
  })

  it("computes isOpen based on store.status setting", async () => {
    mockSettingRepo.findAll.mockResolvedValue(
      makeSettingsMap({ "store.status": "closed" }),
    )

    const { getPublicStoreSettings } = await importService()
    const result = await getPublicStoreSettings()

    expect(result.isOpen).toBe(false)
  })

  it("returns defaults when settings not configured", async () => {
    // Empty database — no settings rows
    mockSettingRepo.findAll.mockResolvedValue([])

    const { getPublicStoreSettings } = await importService()
    const result = await getPublicStoreSettings()

    expect(result).toEqual({
      name: "",
      logo: "",
      description: "",
      phone: "",
      address: "",
      isOpen: true, // defaults to "open"
    })
  })

  it("computes isOpen as false when temporarily closed", async () => {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 3_600_000).toISOString()
    const oneHourLater = new Date(now.getTime() + 3_600_000).toISOString()

    mockSettingRepo.findAll.mockResolvedValue(
      makeSettingsMap({
        "business_hours.temporary_closure.enabled": "true",
        "business_hours.temporary_closure.start": oneHourAgo,
        "business_hours.temporary_closure.end": oneHourLater,
      }),
    )

    const { getPublicStoreSettings } = await importService()
    const result = await getPublicStoreSettings()

    // Store status is "open" but temp closure is enabled and we are within the window
    expect(result.isOpen).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// Cache behavior
// ─────────────────────────────────────────────────────────────

describe("cache behavior", () => {
  it("second call within TTL returns cached value (does not query repo again)", async () => {
    mockSettingRepo.findAll.mockResolvedValue(makeSettingsMap())

    const { getPublicStoreSettings } = await importService()

    // First call — hits the database
    const result1 = await getPublicStoreSettings()

    // Second call — should use cache, so findAll should NOT be called again
    const result2 = await getPublicStoreSettings()

    expect(result1).toEqual(result2)
    expect(mockSettingRepo.findAll).toHaveBeenCalledTimes(1)
  })

  it("cache clears on update operations", async () => {
    mockSettingRepo.findAll.mockResolvedValue(makeSettingsMap())

    const { getPublicStoreSettings, updateStoreSettings } = await importService()

    // Populate cache
    await getPublicStoreSettings()
    expect(mockSettingRepo.findAll).toHaveBeenCalledTimes(1)

    // Perform an update (which calls clearCache internally)
    await updateStoreSettings({ name: "New Name" }, "user-001", "Admin")

    // After update, the cache is cleared, so the getStoreSettings() call
    // inside updateStoreSettings will trigger a fresh findAll
    // (updateStoreSettings calls getStoreSettings() at the end)
    expect(mockSettingRepo.findAll).toHaveBeenCalledTimes(2)
  })
})

// ─────────────────────────────────────────────────────────────
// getAllSettings
// ─────────────────────────────────────────────────────────────

describe("getAllSettings", () => {
  it("returns all settings categories", async () => {
    mockSettingRepo.findAll.mockResolvedValue(makeSettingsMap())

    const { getAllSettings } = await importService()
    const result = await getAllSettings()

    expect(result).toHaveProperty("store")
    expect(result).toHaveProperty("businessHours")
    expect(result).toHaveProperty("payment")
    expect(result).toHaveProperty("delivery")
    expect(result).toHaveProperty("notification")
    expect(result).toHaveProperty("system")

    expect(result.store.name).toBe("Auan Auan Mala Tod")
    expect(result.payment.timeout).toBe(300)
    expect(result.system.language).toBe("th")
  })
})

// ─────────────────────────────────────────────────────────────
// resetSettings
// ─────────────────────────────────────────────────────────────

describe("resetSettings", () => {
  it("resets all settings to defaults", async () => {
    mockSettingRepo.findAll.mockResolvedValue(makeSettingsMap())
    mockSettingRepo.deleteByCategory.mockResolvedValue(undefined)
    mockSettingRepo.upsertMany.mockResolvedValue(undefined)

    const { resetSettings } = await importService()
    await resetSettings(undefined, "user-001", "Admin")

    // Should delete all categories
    expect(mockSettingRepo.deleteByCategory).toHaveBeenCalledTimes(6)
    // Should upsert default settings
    expect(mockSettingRepo.upsertMany).toHaveBeenCalled()
    // Should log audit
    expect(mockAuditLogRepo.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SETTING_RESET",
        details: { category: "all" },
      }),
    )
  })
})
