import { describe, it, expect } from "vitest"
import { createHash } from "node:crypto"

// ─────────────────────────────────────────────────────────────
// Re-implement pure helper logic from cart.service.ts for
// direct unit testing (these functions are not exported).
// ─────────────────────────────────────────────────────────────

type SelectedOption = {
  optionGroupId: string
  optionId: string
  optionName?: string
  additionalPrice?: number | string
}

/**
 * Hash selected options into a deterministic string.
 * Mirrors the private hashOptions() in cart.service.ts.
 */
function hashOptions(options: Array<{ optionGroupId: string; optionId: string }>): string {
  if (options.length === 0) return ""
  const sorted = [...options].sort((a, b) =>
    a.optionGroupId.localeCompare(b.optionGroupId) ||
    a.optionId.localeCompare(b.optionId),
  )
  return createHash("sha256").update(JSON.stringify(sorted)).digest("hex")
}

/**
 * Calculate the total additional price from selected options.
 * Mirrors the private calculateOptionsPrice() in cart.service.ts.
 */
function calculateOptionsPrice(options: Array<{ additionalPrice: number | string }>): number {
  return options.reduce(
    (sum, opt) =>
      sum + (typeof opt.additionalPrice === "number"
        ? opt.additionalPrice
        : parseFloat(opt.additionalPrice)),
    0,
  )
}

// ─────────────────────────────────────────────────────────────
// hashOptions tests
// ─────────────────────────────────────────────────────────────

describe("hashOptions()", () => {
  it("empty array returns empty string", () => {
    expect(hashOptions([])).toBe("")
  })

  it("single option returns a 64-character hex string", () => {
    const hash = hashOptions([{ optionGroupId: "g1", optionId: "o1" }])

    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it("same options in different order returns the same hash (deterministic)", () => {
    const optionsA = [
      { optionGroupId: "g2", optionId: "o2" },
      { optionGroupId: "g1", optionId: "o1" },
    ]
    const optionsB = [
      { optionGroupId: "g1", optionId: "o1" },
      { optionGroupId: "g2", optionId: "o2" },
    ]

    expect(hashOptions(optionsA)).toBe(hashOptions(optionsB))
  })

  it("different options return different hashes", () => {
    const optionsA = [{ optionGroupId: "g1", optionId: "o1" }]
    const optionsB = [{ optionGroupId: "g1", optionId: "o2" }]

    expect(hashOptions(optionsA)).not.toBe(hashOptions(optionsB))
  })

  it("hash is stable across repeated calls", () => {
    const options = [{ optionGroupId: "grp-abc", optionId: "opt-xyz" }]

    const first = hashOptions(options)
    const second = hashOptions(options)

    expect(first).toBe(second)
  })

  it("hash output matches expected SHA-256 computation", () => {
    // Manually compute expected hash for a known input
    const options = [{ optionGroupId: "a", optionId: "b" }]
    const sorted = [...options].sort((x, y) =>
      x.optionGroupId.localeCompare(y.optionGroupId) ||
      x.optionId.localeCompare(y.optionId),
    )
    const expected = createHash("sha256").update(JSON.stringify(sorted)).digest("hex")

    expect(hashOptions(options)).toBe(expected)
  })
})

// ─────────────────────────────────────────────────────────────
// calculateOptionsPrice tests
// ─────────────────────────────────────────────────────────────

describe("calculateOptionsPrice()", () => {
  it("empty options returns 0", () => {
    expect(calculateOptionsPrice([])).toBe(0)
  })

  it("single option with numeric price returns that price", () => {
    const options = [{ additionalPrice: 10 }]
    expect(calculateOptionsPrice(options)).toBe(10)
  })

  it("multiple options sums correctly", () => {
    const options = [
      { additionalPrice: 5 },
      { additionalPrice: 3.5 },
      { additionalPrice: 1.5 },
    ]
    expect(calculateOptionsPrice(options)).toBe(10)
  })

  it("string additionalPrice is parsed correctly", () => {
    const options = [{ additionalPrice: "7.25" }]
    expect(calculateOptionsPrice(options)).toBe(7.25)
  })

  it("mixed number and string prices sum correctly", () => {
    const options = [
      { additionalPrice: 5 },
      { additionalPrice: "4.50" },
      { additionalPrice: "0.50" },
    ]
    expect(calculateOptionsPrice(options)).toBe(10)
  })

  it("handles zero prices correctly", () => {
    const options = [
      { additionalPrice: 0 },
      { additionalPrice: "0" },
    ]
    expect(calculateOptionsPrice(options)).toBe(0)
  })
})
