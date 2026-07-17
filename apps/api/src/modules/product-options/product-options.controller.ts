/**
 * Product Options Controller — handles HTTP request/response for option endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyReply, FastifyRequest } from "fastify"

import { successResponse } from "../../common/response.js"

import type {
  CreateOptionBody,
  CreateOptionGroupBody,
  UpdateOptionBody,
  UpdateOptionGroupBody,
} from "./product-options.schema.js"
import { getOptionGroupsByProductId } from "../option-templates/option-template.service.js"

import {
  createOption,
  createOptionGroup,
  deleteOptionGroup,
  disableOption,
  updateOption,
  updateOptionGroup,
} from "./product-options.service.js"

// ─────────────────────────────────────────────────────────────
// GET /api/v1/products/:productId/options
// ─────────────────────────────────────────────────────────────

export async function listOptionGroupsHandler(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params
  const groups = await getOptionGroupsByProductId(productId)

  void reply.code(200).send(
    successResponse(groups, "Option groups retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/products/:productId/options
// ─────────────────────────────────────────────────────────────

export async function createOptionGroupHandler(
  request: FastifyRequest<{
    Params: { productId: string }
    Body: CreateOptionGroupBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params
  const group = await createOptionGroup(productId, request.body)

  void reply.code(201).send(
    successResponse(group, "Option group created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/product-options/:id
// ─────────────────────────────────────────────────────────────

export async function updateOptionGroupHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateOptionGroupBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  const group = await updateOptionGroup(id, request.body)

  void reply.code(200).send(
    successResponse(group, "Option group updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/product-options/:id
// ─────────────────────────────────────────────────────────────

export async function deleteOptionGroupHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  await deleteOptionGroup(id)

  void reply.code(200).send(
    successResponse(null, "Option group deleted successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/product-options/:groupId/options
// ─────────────────────────────────────────────────────────────

export async function createOptionHandler(
  request: FastifyRequest<{
    Params: { groupId: string }
    Body: CreateOptionBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { groupId } = request.params
  const option = await createOption(groupId, request.body)

  void reply.code(201).send(
    successResponse(option, "Option created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/product-options/:groupId/options/:id
// ─────────────────────────────────────────────────────────────

export async function updateOptionHandler(
  request: FastifyRequest<{
    Params: { groupId: string; id: string }
    Body: UpdateOptionBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { groupId, id } = request.params
  const option = await updateOption(groupId, id, request.body)

  void reply.code(200).send(
    successResponse(option, "Option updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/product-options/:groupId/options/:id
// ─────────────────────────────────────────────────────────────

export async function disableOptionHandler(
  request: FastifyRequest<{ Params: { groupId: string; id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { groupId, id } = request.params
  await disableOption(groupId, id)

  void reply.code(200).send(
    successResponse(null, "Option disabled successfully"),
  )
}
