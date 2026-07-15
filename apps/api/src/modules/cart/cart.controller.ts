/**
 * Cart Controller — handles HTTP request/response for cart endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import type { JwtPayload } from "../auth/auth.types.js"

import type { AddToCartBody, UpdateCartItemBody } from "./cart.schema.js"
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.service.js"

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function getCustomerId(request: FastifyRequest): string {
  return (request.user as unknown as JwtPayload).userId
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/cart
// ─────────────────────────────────────────────────────────────

export async function getCartHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const cart = await getCart(customerId)

  void reply.code(200).send(
    successResponse(cart, "Cart retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/cart/items
// ─────────────────────────────────────────────────────────────

export async function addToCartHandler(
  request: FastifyRequest<{ Body: AddToCartBody }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const cart = await addToCart(customerId, request.body)

  void reply.code(200).send(
    successResponse(cart, "Item added to cart"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/cart/items/:id
// ─────────────────────────────────────────────────────────────

export async function updateCartItemHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateCartItemBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { id } = request.params
  const cart = await updateCartItem(customerId, id, request.body)

  void reply.code(200).send(
    successResponse(cart, "Cart item updated"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/cart/items/:id
// ─────────────────────────────────────────────────────────────

export async function removeCartItemHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { id } = request.params
  const cart = await removeCartItem(customerId, id)

  void reply.code(200).send(
    successResponse(cart, "Item removed from cart"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/cart
// ─────────────────────────────────────────────────────────────

export async function clearCartHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  await clearCart(customerId)

  void reply.code(200).send(
    successResponse(null, "Cart cleared"),
  )
}
