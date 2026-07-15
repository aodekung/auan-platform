/**
 * Addresses module type definitions and DTOs.
 *
 * These types define the shape of data flowing between
 * controller <-> service <-> database.
 *
 * Per 60-coding-standard.md: use interfaces for object contracts.
 */

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

/** Supported building identifiers (Regent Home Bangson Phase 27 & 28). */
export const BUILDINGS = ["A", "B", "C", "D"] as const
export type Building = (typeof BUILDINGS)[number]

// ─────────────────────────────────────────────────────────────
// DTO — Response
// ─────────────────────────────────────────────────────────────

/** Address response returned to clients. */
export interface AddressResponse {
  id: string
  customerId: string
  building: string
  roomNumber: string | null
  note: string | null
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────────────────────
// DTO — Request
// ─────────────────────────────────────────────────────────────

/** Create address request body. */
export interface CreateAddressRequest {
  building: Building
  roomNumber: string
  note?: string
  isDefault?: boolean
}

/** Update address request body (all fields optional). */
export interface UpdateAddressRequest {
  building?: Building
  roomNumber?: string
  note?: string
}
