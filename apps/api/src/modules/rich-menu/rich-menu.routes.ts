/**
 * Rich Menu Routes — registers admin Rich Menu endpoints.
 *
 * Endpoints:
 *   POST /api/v1/admin/rich-menu/deploy — Deploy Rich Menu (Owner only)
 *   GET  /api/v1/admin/rich-menu/list    — List Rich Menus (Owner only)
 */

import type { FastifyInstance } from "fastify"

import { authenticate, authorize } from "../auth/auth.middleware.js"
import {
  deployRichMenuHandler,
  listRichMenusHandler,
} from "./rich-menu.controller.js"
import {
  deployRichMenuRouteSchema,
  listRichMenusRouteSchema,
} from "./rich-menu.schema.js"

export async function richMenuRoutes(app: FastifyInstance): Promise<void> {
  // POST /admin/rich-menu/deploy
  app.post("/api/v1/admin/rich-menu/deploy", {
    schema: deployRichMenuRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: deployRichMenuHandler,
  })

  // GET /admin/rich-menu/list
  app.get("/api/v1/admin/rich-menu/list", {
    schema: listRichMenusRouteSchema,
    preHandler: [authenticate, authorize("OWNER")],
    handler: listRichMenusHandler,
  })
}
