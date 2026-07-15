/**
 * Favorites Controller — handles HTTP request/response for favorites endpoints.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import type { JwtPayload } from "../auth/auth.types.js"

import type {
  FavoriteCheckResponse,
  FavoriteResponse,
} from "./favorites.types.js"
import {
  addFavorite,
  checkFavorite,
  listFavorites,
  removeFavorite,
} from "./favorites.service.js"

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

function getCustomerId(request: FastifyRequest): string {
  return (request.user as unknown as JwtPayload).userId
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/customers/me/favorites
// ─────────────────────────────────────────────────────────────

export async function listFavoritesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const favorites = await listFavorites(customerId)

  void reply.code(200).send(
    successResponse(favorites, "Favorites retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/customers/me/favorites/:productId
// ─────────────────────────────────────────────────────────────

export async function addFavoriteHandler(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { productId } = request.params
  const favorite = await addFavorite(customerId, productId)

  void reply.code(201).send(
    successResponse(favorite, "Product added to favorites"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/customers/me/favorites/:productId
// ─────────────────────────────────────────────────────────────

export async function removeFavoriteHandler(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { productId } = request.params
  await removeFavorite(customerId, productId)

  void reply.code(200).send(
    successResponse(null, "Product removed from favorites"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/customers/me/favorites/check/:productId
// ─────────────────────────────────────────────────────────────

export async function checkFavoriteHandler(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const customerId = getCustomerId(request)
  const { productId } = request.params
  const result: FavoriteCheckResponse = await checkFavorite(customerId, productId)

  void reply.code(200).send(
    successResponse(result, "Favorite status checked"),
  )
}
