import { describe, it, expect } from "vitest"

import { ALLOWED_TRANSITIONS, CANCELLABLE_STATUSES } from "@/modules/orders/orders.types.js"

// ─────────────────────────────────────────────────────────────
// ALLOWED_TRANSITIONS
// ─────────────────────────────────────────────────────────────

describe("ALLOWED_TRANSITIONS", () => {
  const nonTerminalStatuses = [
    "PENDING",
    "AWAITING_PAYMENT",
    "AWAITING_VERIFICATION",
    "PAID",
    "QUEUED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ] as const

  const terminalStatuses = [
    "COMPLETED",
    "CANCELLED",
    "EXPIRED",
    "PAYMENT_REJECTED",
  ] as const

  it("has entries for all non-terminal statuses", () => {
    for (const status of nonTerminalStatuses) {
      expect(ALLOWED_TRANSITIONS).toHaveProperty(status)
      expect(Array.isArray(ALLOWED_TRANSITIONS[status])).toBe(true)
    }
  })

  it("terminal statuses map to empty arrays", () => {
    for (const status of terminalStatuses) {
      expect(ALLOWED_TRANSITIONS[status]).toEqual([])
    }
  })

  // ── Per-status transition checks ──

  it("PENDING can transition to AWAITING_PAYMENT and CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["PENDING"]).toEqual(["AWAITING_PAYMENT", "CANCELLED"])
  })

  it("AWAITING_PAYMENT can transition to AWAITING_VERIFICATION, EXPIRED, CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["AWAITING_PAYMENT"]).toEqual([
      "AWAITING_VERIFICATION",
      "EXPIRED",
      "CANCELLED",
    ])
  })

  it("AWAITING_VERIFICATION can transition to PAID, PAYMENT_REJECTED, EXPIRED, CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["AWAITING_VERIFICATION"]).toEqual([
      "PAID",
      "PAYMENT_REJECTED",
      "EXPIRED",
      "CANCELLED",
    ])
  })

  it("PAID can transition to QUEUED and CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["PAID"]).toEqual(["QUEUED", "CANCELLED"])
  })

  it("QUEUED can only transition to PREPARING", () => {
    expect(ALLOWED_TRANSITIONS["QUEUED"]).toEqual(["PREPARING"])
  })

  it("PREPARING can only transition to READY", () => {
    expect(ALLOWED_TRANSITIONS["PREPARING"]).toEqual(["READY"])
  })

  it("READY can only transition to OUT_FOR_DELIVERY", () => {
    expect(ALLOWED_TRANSITIONS["READY"]).toEqual(["OUT_FOR_DELIVERY"])
  })

  it("OUT_FOR_DELIVERY can only transition to DELIVERED", () => {
    expect(ALLOWED_TRANSITIONS["OUT_FOR_DELIVERY"]).toEqual(["DELIVERED"])
  })

  it("DELIVERED can only transition to COMPLETED", () => {
    expect(ALLOWED_TRANSITIONS["DELIVERED"]).toEqual(["COMPLETED"])
  })

  // ── Invalid transitions ──

  it("PREPARING cannot transition to CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["PREPARING"]).not.toContain("CANCELLED")
  })

  it("READY cannot transition to CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["READY"]).not.toContain("CANCELLED")
  })

  it("QUEUED cannot transition to CANCELLED", () => {
    expect(ALLOWED_TRANSITIONS["QUEUED"]).not.toContain("CANCELLED")
  })

  it("COMPLETED cannot transition to anything", () => {
    expect(ALLOWED_TRANSITIONS["COMPLETED"].length).toBe(0)
  })

  it("PAYMENT_REJECTED cannot transition to anything", () => {
    expect(ALLOWED_TRANSITIONS["PAYMENT_REJECTED"].length).toBe(0)
  })
})

// ─────────────────────────────────────────────────────────────
// CANCELLABLE_STATUSES
// ─────────────────────────────────────────────────────────────

describe("CANCELLABLE_STATUSES", () => {
  it("includes exactly PENDING, AWAITING_PAYMENT, AWAITING_VERIFICATION, PAID", () => {
    expect(CANCELLABLE_STATUSES).toEqual([
      "PENDING",
      "AWAITING_PAYMENT",
      "AWAITING_VERIFICATION",
      "PAID",
    ])
  })

  it("each cancellable status has CANCELLED in its ALLOWED_TRANSITIONS", () => {
    for (const status of CANCELLABLE_STATUSES) {
      expect(ALLOWED_TRANSITIONS[status]).toContain("CANCELLED")
    }
  })

  it("non-cancellable statuses do NOT have CANCELLED in transitions (except terminal)", () => {
    const nonCancellable = ["QUEUED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"]
    for (const status of nonCancellable) {
      expect(ALLOWED_TRANSITIONS[status]).not.toContain("CANCELLED")
    }
  })
})
