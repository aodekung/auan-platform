/**
 * Favorites routes — registers all /api/v1/customers/me/favorites/* endpoints.
 *
 * Endpoints:
 *   GET    /customers/me/favorites               — List favorite products (authenticated)
 *   POST   /customers/me/favorites/:productId    — Add product to favorites (authenticated)
 *   DELETE /customers/me/favorites/:productId    — Remove from favorites (authenticated)
 *   GET    /customers/me/favorites/check/:productId — Check if product is favorited (authenticated)
 */

import type { FastifyInstance } from "fastify"

import { authenticate } from "../auth/auth.middleware.js"

import {
  addFavoriteHandler,
  checkFavoriteHandler,
  listFavoritesHandler,
  removeFavoriteHandler,
} from "./favorites.controller.js"
import {
  addFavoriteRouteSchema,
  checkFavoriteRouteSchema,
  listFavoritesRouteSchema,
  removeFavoriteRouteSchema,
} from "./favorites.schema.js"

export async function favoriteRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /customers/me/favorites ──────────────────────────
  app.get("/api/v1/customers/me/favorites", {
    schema: listFavoritesRouteSchema,
    preHandler: [authenticate],
    handler: listFavoritesHandler,
  })

  // ── POST /customers/me/favorites/:productId ──────────────
  app.post("/api/v1/customers/me/favorites/:productId", {
    schema: addFavoriteRouteSchema,
    preHandler: [authenticate],
    handler: addFavoriteHandler,
  })

  // ── DELETE /customers/me/favorites/:productId ───────────
  app.delete("/api/v1/customers/me/favorites/:productId", {
    schema: removeFavoriteRouteSchema,
    preHandler: [authenticate],
    handler: removeFavoriteHandler,
  })

  // ── GET /customers/me/favorites/check/:productId ───────
  app.get("/api/v1/customers/me/favorites/check/:productId", {
    schema: checkFavoriteRouteSchema,
    preHandler: [authenticate],
    handler: checkFavoriteHandler,
  })
}
