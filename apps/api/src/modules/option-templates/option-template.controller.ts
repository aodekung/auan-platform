/**
 * Option Templates Controller — handles HTTP request/response for
 * global option group template endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyReply, FastifyRequest } from "fastify"

import { successResponse } from "../../common/response.js"

import type {
  AssignOptionGroupBody,
  CreateOptionBody,
  CreateOptionGroupBody,
  SetPriceOverrideBody,
  UpdateOptionBody,
  UpdateOptionGroupBody,
} from "./option-template.schema.js"
import {
  assignOptionGroup,
  createOption,
  createOptionGroup,
  deleteOption,
  deleteOptionGroup,
  getProductAssignments,
  getOptionGroupsByProductId,
  listOptionGroups,
  removeAssignment,
  setPriceOverrides,
  updateOption,
  updateOptionGroup,
} from "./option-template.service.js"

// ─────────────────────────────────────────────────────────────
// Admin — Option Group Templates
// ─────────────────────────────────────────────────────────────

// GET /api/v1/admin/option-groups
export async function listOptionGroupsHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const groups = await listOptionGroups()

  void reply.code(200).send(
    successResponse(groups, "Option group templates retrieved successfully"),
  )
}

// POST /api/v1/admin/option-groups
export async function createOptionGroupHandler(
  request: FastifyRequest<{ Body: CreateOptionGroupBody }>,
  reply: FastifyReply,
): Promise<void> {
  const group = await createOptionGroup(request.body)

  void reply.code(201).send(
    successResponse(group, "Option group template created successfully"),
  )
}

// PATCH /api/v1/admin/option-groups/:id
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
    successResponse(group, "Option group template updated successfully"),
  )
}

// DELETE /api/v1/admin/option-groups/:id
export async function deleteOptionGroupHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  await deleteOptionGroup(id)

  void reply.code(200).send(
    successResponse(null, "Option group template deleted successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// Admin — Options within Group Templates
// ─────────────────────────────────────────────────────────────

// POST /api/v1/admin/option-groups/:groupId/options
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

// PATCH /api/v1/admin/option-groups/:groupId/options/:id
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

// DELETE /api/v1/admin/option-groups/:groupId/options/:id
export async function deleteOptionHandler(
  request: FastifyRequest<{ Params: { groupId: string; id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { groupId, id } = request.params
  await deleteOption(groupId, id)

  void reply.code(200).send(
    successResponse(null, "Option disabled successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// Admin — Product Assignments
// ─────────────────────────────────────────────────────────────

// GET /api/v1/products/:productId/option-assignments
export async function listAssignmentsHandler(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params
  const assignments = await getProductAssignments(productId)

  void reply.code(200).send(
    successResponse(assignments, "Assignments retrieved successfully"),
  )
}

// POST /api/v1/products/:productId/option-assignments
export async function assignOptionGroupHandler(
  request: FastifyRequest<{
    Params: { productId: string }
    Body: AssignOptionGroupBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params
  const assignment = await assignOptionGroup(productId, request.body)

  void reply.code(201).send(
    successResponse(assignment, "Option group assigned to product successfully"),
  )
}

// DELETE /api/v1/products/:productId/option-assignments/:groupId
export async function removeAssignmentHandler(
  request: FastifyRequest<{ Params: { productId: string; groupId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId, groupId } = request.params
  await removeAssignment(productId, groupId)

  void reply.code(200).send(
    successResponse(null, "Option group unassigned from product successfully"),
  )
}

// PATCH /api/v1/products/:productId/option-assignments/:groupId/overrides
export async function setPriceOverridesHandler(
  request: FastifyRequest<{
    Params: { productId: string; groupId: string }
    Body: SetPriceOverrideBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId, groupId } = request.params
  const overrides = await setPriceOverrides(productId, groupId, request.body.overrides)

  void reply.code(200).send(
    successResponse(overrides, "Price overrides updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// Customer-facing — Same shape as old product-options
// ─────────────────────────────────────────────────────────────

// GET /api/v1/products/:productId/options (template-based)
export async function listProductOptionsHandler(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { productId } = request.params
  const groups = await getOptionGroupsByProductId(productId)

  void reply.code(200).send(
    successResponse(groups, "Option groups retrieved successfully"),
  )
}
