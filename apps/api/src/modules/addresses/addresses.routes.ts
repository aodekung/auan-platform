/**
 * Addresses routes — registers all /api/v1/addresses/* endpoints.
 *
 * Endpoints:
 *   GET    /api/v1/addresses             — List customer addresses
 *   POST   /api/v1/addresses             — Create address
 *   PATCH  /api/v1/addresses/:id         — Update address
 *   DELETE /api/v1/addresses/:id         — Delete address
 *   PATCH  /api/v1/addresses/:id/default — Set as default
 *
 * All endpoints require authentication.
 */

import type { FastifyInstance } from "fastify"

import { authenticate } from "../auth/auth.middleware.js"

import {
  createAddressHandler,
  deleteAddressHandler,
  listAddressesHandler,
  setDefaultAddressHandler,
  updateAddressHandler,
} from "./addresses.controller.js"
import {
  createAddressRouteSchema,
  deleteAddressRouteSchema,
  listAddressesRouteSchema,
  setDefaultAddressRouteSchema,
  updateAddressRouteSchema,
} from "./addresses.schema.js"

export async function addressRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /api/v1/addresses ─────────────────────────────────
  app.get("/api/v1/addresses", {
    schema: listAddressesRouteSchema,
    preHandler: [authenticate],
    handler: listAddressesHandler,
  })

  // ── POST /api/v1/addresses ────────────────────────────────
  app.post("/api/v1/addresses", {
    schema: createAddressRouteSchema,
    preHandler: [authenticate],
    handler: createAddressHandler,
  })

  // ── PATCH /api/v1/addresses/:id ───────────────────────────
  app.patch("/api/v1/addresses/:id", {
    schema: updateAddressRouteSchema,
    preHandler: [authenticate],
    handler: updateAddressHandler,
  })

  // ── DELETE /api/v1/addresses/:id ────────────────────────────
  app.delete("/api/v1/addresses/:id", {
    schema: deleteAddressRouteSchema,
    preHandler: [authenticate],
    handler: deleteAddressHandler,
  })

  // ── PATCH /api/v1/addresses/:id/default ───────────────────
  app.patch("/api/v1/addresses/:id/default", {
    schema: setDefaultAddressRouteSchema,
    preHandler: [authenticate],
    handler: setDefaultAddressHandler,
  })
}
