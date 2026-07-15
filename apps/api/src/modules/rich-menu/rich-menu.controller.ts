/**
 * Rich Menu Controller — HTTP handlers for admin Rich Menu endpoints.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"
import { deployRichMenu, listAllRichMenus } from "./rich-menu.service.js"
import type { DeployRichMenuRequest } from "./rich-menu.types.js"

// ─────────────────────────────────────────────────────────────
// POST /api/v1/admin/rich-menu/deploy
// ─────────────────────────────────────────────────────────────

export async function deployRichMenuHandler(
  request: FastifyRequest<{
    Body: DeployRichMenuRequest
  }>,
  reply: FastifyReply,
): Promise<void> {
  const result = await deployRichMenu(request.body)

  void reply.code(200).send(
    successResponse(result, "Rich Menu deployed successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/admin/rich-menu/list
// ─────────────────────────────────────────────────────────────

export async function listRichMenusHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const result = await listAllRichMenus()

  void reply.code(200).send(
    successResponse(result, "Rich Menus listed successfully"),
  )
}
