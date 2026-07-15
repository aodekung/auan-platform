/**
 * Payments Controller — handles HTTP request/response for payment endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import type { JwtPayload } from "../auth/auth.types.js"

import type { CreatePaymentBody, UploadSlipBody, RejectPaymentBody } from "./payments.schema.js"
import {
  confirmPayment,
  createPayment,
  getPaymentByOrderId,
  rejectPayment,
  uploadSlip,
  verifyPayment,
} from "./payments.service.js"

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getCustomerId(request: FastifyRequest): string {
  return (request.user as unknown as JwtPayload).userId
}

function getUserId(request: FastifyRequest): string {
  return (request.user as unknown as JwtPayload).userId
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/payments
// ─────────────────────────────────────────────────────────────

export async function createPaymentHandler(
  request: FastifyRequest<{ Body: CreatePaymentBody }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const payment = await createPayment(customerId, request.body)

  void reply.code(201).send(
    successResponse(payment, "Payment created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/payments/:orderId
// ─────────────────────────────────────────────────────────────

export async function getPaymentHandler(
  request: FastifyRequest<{ Params: { orderId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { orderId } = request.params
  const payment = await getPaymentByOrderId(orderId, customerId)

  void reply.code(200).send(
    successResponse(payment, "Payment retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/payments/:id/upload-slip
// ─────────────────────────────────────────────────────────────

export async function uploadSlipHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UploadSlipBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { id } = request.params
  const { slipBase64, fileName } = request.body
  const payment = await uploadSlip(id, customerId, slipBase64, fileName)

  void reply.code(200).send(
    successResponse(payment, "Payment slip uploaded successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/payments/:id/confirm
// ─────────────────────────────────────────────────────────────

export async function confirmPaymentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { id } = request.params
  const payment = await confirmPayment(id, customerId)

  void reply.code(200).send(
    successResponse(payment, "Payment confirmed. Waiting for verification."),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/payments/:id/verify (Owner)
// ─────────────────────────────────────────────────────────────

export async function verifyPaymentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const verifierId = getUserId(request)
  const { id } = request.params
  const payment = await verifyPayment(id, verifierId)

  void reply.code(200).send(
    successResponse(payment, "Payment verified successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/payments/:id/reject (Owner)
// ─────────────────────────────────────────────────────────────

export async function rejectPaymentHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: RejectPaymentBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  const payment = await rejectPayment(id, request.body)

  void reply.code(200).send(
    successResponse(payment, "Payment rejected"),
  )
}
