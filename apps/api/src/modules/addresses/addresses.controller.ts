/**
 * Addresses Controller — handles HTTP request/response for address endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import type { JwtPayload } from "../auth/auth.types.js"

import type { CreateAddressBody, UpdateAddressBody } from "./addresses.schema.js"
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "./addresses.service.js"

// ─────────────────────────────────────────────────────────────
// Helper — extract authenticated customer ID from JWT
// ─────────────────────────────────────────────────────────────

function getCustomerId(request: FastifyRequest): string {
  return (request.user as unknown as JwtPayload).userId
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/addresses
// ─────────────────────────────────────────────────────────────

export async function listAddressesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const addresses = await listAddresses(customerId)
  void reply.code(200).send(
    successResponse(addresses, "Addresses retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/addresses
// ─────────────────────────────────────────────────────────────

export async function createAddressHandler(
  request: FastifyRequest<{ Body: CreateAddressBody }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const address = await createAddress(customerId, request.body)
  void reply.code(201).send(
    successResponse(address, "Address created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/addresses/:id
// ─────────────────────────────────────────────────────────────

export async function updateAddressHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateAddressBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const address = await updateAddress(request.params.id, customerId, request.body)
  void reply.code(200).send(
    successResponse(address, "Address updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/addresses/:id
// ─────────────────────────────────────────────────────────────

export async function deleteAddressHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const result = await deleteAddress(request.params.id, customerId)
  void reply.code(200).send(
    successResponse(result, "Address deleted successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/addresses/:id/default
// ─────────────────────────────────────────────────────────────

export async function setDefaultAddressHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const address = await setDefaultAddress(request.params.id, customerId)
  void reply.code(200).send(
    successResponse(address, "Default address updated successfully"),
  )
}
