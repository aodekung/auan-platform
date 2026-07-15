import { describe, it, expect, vi, beforeEach } from "vitest"

// ─────────────────────────────────────────────────────────────
// vi.hoisted: define mock objects + constructors that are hoisted
// alongside vi.mock factories so they are available when factories run.
// ─────────────────────────────────────────────────────────────

const { mockTemplateRepo, MockNotificationTemplateRepository } = vi.hoisted(() => {
  const mockTemplateRepo = {
    findByTypeAndChannel: vi.fn(),
    findByType: vi.fn(),
  }
  const MockNotificationTemplateRepository = vi.fn(function () { return mockTemplateRepo })
  return { mockTemplateRepo, MockNotificationTemplateRepository }
})

vi.mock("@/database/repositories/notification-template.repository.js", () => ({
  NotificationTemplateRepository: MockNotificationTemplateRepository,
}))

// Imports
import { renderTemplate } from "@/modules/notifications/notification-template.service.js"

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────
// renderTemplate
// ─────────────────────────────────────────────────────────────

describe("renderTemplate", () => {
  it("returns DB template when found by type+channel", async () => {
    mockTemplateRepo.findByTypeAndChannel.mockResolvedValue({
      type: "ORDER_CREATED",
      channel: "line",
      title: "Custom DB Title {{customerName}}",
      body: "Custom DB body for {{orderNumber}}",
    })

    const result = await renderTemplate("ORDER_CREATED", "line", {
      customerName: "John",
      orderNumber: "ORD-001",
    })

    expect(result.title).toBe("Custom DB Title John")
    expect(result.body).toBe("Custom DB body for ORD-001")
    // Should not fall back to type-only or defaults
    expect(mockTemplateRepo.findByType).not.toHaveBeenCalled()
  })

  it("returns DB template by type when channel-specific not found", async () => {
    mockTemplateRepo.findByTypeAndChannel.mockResolvedValue(null)
    mockTemplateRepo.findByType.mockResolvedValue({
      type: "PAYMENT_VERIFIED",
      channel: null,
      title: "Generic Title {{orderNumber}}",
      body: "Generic body for {{customerName}}",
    })

    const result = await renderTemplate("PAYMENT_VERIFIED", "line", {
      customerName: "Jane",
      orderNumber: "ORD-002",
    })

    expect(result.title).toBe("Generic Title ORD-002")
    expect(result.body).toBe("Generic body for Jane")
  })

  it("falls back to hardcoded default when no DB template", async () => {
    mockTemplateRepo.findByTypeAndChannel.mockResolvedValue(null)
    mockTemplateRepo.findByType.mockResolvedValue(null)

    const result = await renderTemplate("ORDER_CREATED", "line", {
      orderNumber: "ORD-003",
    })

    // Default for ORDER_CREATED (Thai text)
    expect(result.title).toContain("สร้างออเดอร์แล้ว")
    expect(result.body).toContain("ORD-003")
  })

  it("returns ultimate fallback for unknown types", async () => {
    mockTemplateRepo.findByTypeAndChannel.mockResolvedValue(null)
    mockTemplateRepo.findByType.mockResolvedValue(null)

    const result = await renderTemplate("UNKNOWN_TYPE", "line", {
      orderNumber: "ORD-004",
    })

    expect(result.title).toBe("Notification: UNKNOWN_TYPE")
    expect(result.body).toContain("UNKNOWN_TYPE")
    expect(result.body).toContain("ORD-004")
  })

  it("replaces {{key}} placeholders in template", async () => {
    mockTemplateRepo.findByTypeAndChannel.mockResolvedValue({
      type: "ORDER_READY",
      channel: "line",
      title: "Order {{orderNumber}} is ready",
      body: "{{customerName}}, your order {{orderNumber}} is ready for {{building}} {{roomNumber}}",
    })

    const result = await renderTemplate("ORDER_READY", "line", {
      customerName: "John",
      orderNumber: "ORD-005",
      building: "A",
      roomNumber: "101",
    })

    expect(result.title).toBe("Order ORD-005 is ready")
    expect(result.body).toBe(
      "John, your order ORD-005 is ready for A 101",
    )
  })

  it("leaves placeholders in place when data keys are missing", async () => {
    mockTemplateRepo.findByTypeAndChannel.mockResolvedValue({
      type: "ORDER_CREATED",
      channel: "line",
      title: "Hello {{customerName}}",
      body: "Order {{orderNumber}} total {{orderTotal}}",
    })

    const result = await renderTemplate("ORDER_CREATED", "line", {
      orderNumber: "ORD-006",
      // customerName and orderTotal are NOT provided
    })

    // Missing keys are left as-is per the implementation
    expect(result.title).toBe("Hello {{customerName}}")
    expect(result.body).toBe("Order ORD-006 total {{orderTotal}}")
  })
})
