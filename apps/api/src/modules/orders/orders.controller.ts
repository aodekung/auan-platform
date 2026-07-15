/**
 * Orders Controller — handles HTTP request/response for order endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { paginatedResponse, successResponse } from "../../common/response.js"
import type { JwtPayload } from "../auth/auth.types.js"

import type { CancelOrderBody, CreateOrderBody, OrderQuery, UpdateOrderStatusBody } from "./orders.schema.js"
import {
  cancelOrder,
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "./orders.service.js"

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getCustomerId(request: FastifyRequest): string {
  return (request.user as unknown as JwtPayload).userId
}

function getChangedBy(request: FastifyRequest): string {
  const payload = request.user as unknown as JwtPayload
  return payload.userId
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/orders
// ─────────────────────────────────────────────────────────────

export async function createOrderHandler(
  request: FastifyRequest<{ Body: CreateOrderBody }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const order = await createOrder(customerId, request.body)

  void reply.code(201).send(
    successResponse(order, "Order created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/orders
// ─────────────────────────────────────────────────────────────

export async function listOrdersHandler(
  request: FastifyRequest<{ Querystring: OrderQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { orders, total, page, pageSize, totalPages } = await listOrders(
    customerId,
    request.query,
  )

  void reply.code(200).send(
    paginatedResponse(orders, {
      page,
      pageSize,
      totalItems: total,
      totalPages,
    }),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/orders/:id
// ─────────────────────────────────────────────────────────────

export async function getOrderHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { id } = request.params
  const order = await getOrder(id, customerId)

  void reply.code(200).send(
    successResponse(order, "Order retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/orders/:id/cancel
// ─────────────────────────────────────────────────────────────

export async function cancelOrderHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: CancelOrderBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { id } = request.params
  const order = await cancelOrder(id, customerId, request.body.reason)

  void reply.code(200).send(
    successResponse(order, "Order cancelled successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/orders/:id/status
// ─────────────────────────────────────────────────────────────

export async function updateOrderStatusHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateOrderStatusBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const changedBy = getChangedBy(request)
  const { id } = request.params
  const order = await updateOrderStatus(id, request.body, changedBy)

  void reply.code(200).send(
    successResponse(order, "Order status updated successfully"),
  )
}
