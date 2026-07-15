/**
 * Addresses Service — business logic for customer address management.
 *
 * Responsibilities:
 * - CRUD operations for customer delivery addresses
 * - Ensure exactly one default address (when addresses exist)
 * - Atomic default-address transitions via Prisma transactions
 * - Ownership validation
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 */

import { prisma } from "../../database/client.js"
import type { Prisma } from "@prisma/client"
import { notFound } from "../../common/errors.js"

import type { AddressResponse, CreateAddressRequest, UpdateAddressRequest } from "./addresses.types.js"

// ─────────────────────────────────────────────────────────────
// Mapper — Prisma model to response DTO
// ─────────────────────────────────────────────────────────────

function toAddressResponse(addr: {
  id: string
  customerId: string
  building: string
  roomNumber: string | null
  note: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}): AddressResponse {
  return {
    id: addr.id,
    customerId: addr.customerId,
    building: addr.building,
    roomNumber: addr.roomNumber,
    note: addr.note,
    isDefault: addr.isDefault,
    createdAt: addr.createdAt.toISOString(),
    updatedAt: addr.updatedAt.toISOString(),
  }
}

// ─────────────────────────────────────────────────────────────
// Ownership validation
// ─────────────────────────────────────────────────────────────

/**
 * Fetch an address by ID and verify it belongs to the given customer.
 * Throws NOT_FOUND if the address does not exist or does not belong
 * to the customer (does not leak ownership information).
 */
async function findOwnedAddress(addressId: string, customerId: string) {
  const address = await prisma.customerAddress.findUnique({
    where: { id: addressId },
  })

  if (!address || address.customerId !== customerId) {
    notFound("Address not found")
  }

  // After notFound throws, address is guaranteed non-null
  return address as NonNullable<typeof address>
}

// ─────────────────────────────────────────────────────────────
// List addresses
// ─────────────────────────────────────────────────────────────

/**
 * Get all addresses for a customer, ordered by isDefault (desc) then createdAt (desc).
 */
export async function listAddresses(customerId: string): Promise<AddressResponse[]> {
  const addresses = await prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })
  return addresses.map(toAddressResponse)
}

// ─────────────────────────────────────────────────────────────
// Create address
// ─────────────────────────────────────────────────────────────

/**
 * Create a new address for a customer.
 * - If this is the customer's first address, it becomes default automatically.
 * - If isDefault is explicitly true, unset all other defaults first.
 */
export async function createAddress(
  customerId: string,
  data: CreateAddressRequest,
): Promise<AddressResponse> {
  const existingCount = await prisma.customerAddress.count({
    where: { customerId },
  })

  const isFirstAddress = existingCount === 0
  const shouldBeDefault = data.isDefault ?? isFirstAddress

  if (shouldBeDefault) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      })

      const address = await tx.customerAddress.create({
        data: {
          customerId,
          building: data.building,
          roomNumber: data.roomNumber,
          note: data.note ?? null,
          isDefault: true,
        },
      })

      return toAddressResponse(address)
    })
  }

  const address = await prisma.customerAddress.create({
    data: {
      customerId,
      building: data.building,
      roomNumber: data.roomNumber,
      note: data.note ?? null,
      isDefault: false,
    },
  })

  return toAddressResponse(address)
}

// ─────────────────────────────────────────────────────────────
// Update address
// ─────────────────────────────────────────────────────────────

/**
 * Update an existing address. Only the owner can update.
 * Building, roomNumber, and note are updatable.
 */
export async function updateAddress(
  addressId: string,
  customerId: string,
  data: UpdateAddressRequest,
): Promise<AddressResponse> {
  await findOwnedAddress(addressId, customerId)

  const address = await prisma.customerAddress.update({
    where: { id: addressId },
    data: {
      ...(data.building !== undefined && { building: data.building }),
      ...(data.roomNumber !== undefined && { roomNumber: data.roomNumber }),
      ...(data.note !== undefined && { note: data.note }),
    },
  })

  return toAddressResponse(address)
}

// ─────────────────────────────────────────────────────────────
// Delete address
// ─────────────────────────────────────────────────────────────

/**
 * Delete an address. Only the owner can delete.
 * If the deleted address was the default and other addresses remain,
 * the oldest remaining address becomes the new default.
 */
export async function deleteAddress(
  addressId: string,
  customerId: string,
): Promise<{ id: string }> {
  const address = await findOwnedAddress(addressId, customerId)

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.customerAddress.delete({
      where: { id: addressId },
    })

    // If we just deleted the default, promote the oldest remaining
    if (address.isDefault) {
      const oldest = await tx.customerAddress.findFirst({
        where: { customerId },
        orderBy: { createdAt: "asc" },
      })

      if (oldest && !oldest.isDefault) {
        await tx.customerAddress.update({
          where: { id: oldest.id },
          data: { isDefault: true },
        })
      }
    }
  })

  return { id: addressId }
}

// ─────────────────────────────────────────────────────────────
// Set default address
// ─────────────────────────────────────────────────────────────

/**
 * Set a specific address as the default.
 * Unsets all other defaults for this customer in an atomic transaction.
 */
export async function setDefaultAddress(
  addressId: string,
  customerId: string,
): Promise<AddressResponse> {
  await findOwnedAddress(addressId, customerId)

  const address = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.customerAddress.updateMany({
      where: { customerId, isDefault: true },
      data: { isDefault: false },
    })

    const updated = await tx.customerAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    })

    return updated
  })

  return toAddressResponse(address)
}
