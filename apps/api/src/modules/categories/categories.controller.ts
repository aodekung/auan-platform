/**
 * Category Controller — handles HTTP request/response for category endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse } from "../../common/response.js"

import type {
  CreateCategoryBody,
  UpdateCategoryBody,
} from "./categories.schema.js"
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "./categories.service.js"

// ─────────────────────────────────────────────────────────────
// GET /api/v1/categories
// ─────────────────────────────────────────────────────────────

export async function listCategoriesHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const categories = await getAllCategories()

  void reply.code(200).send(
    successResponse(categories, "Categories retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────

export async function getCategoryHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  const category = await getCategoryById(id)

  void reply.code(200).send(
    successResponse(category, "Category retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/categories
// ─────────────────────────────────────────────────────────────

export async function createCategoryHandler(
  request: FastifyRequest<{ Body: CreateCategoryBody }>,
  reply: FastifyReply,
): Promise<void> {
  const category = await createCategory(request.body)

  void reply.code(201).send(
    successResponse(category, "Category created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────

export async function updateCategoryHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateCategoryBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  const category = await updateCategory(id, request.body)

  void reply.code(200).send(
    successResponse(category, "Category updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/categories/:id
// ─────────────────────────────────────────────────────────────

export async function deleteCategoryHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  await deleteCategory(id)

  void reply.code(200).send(
    successResponse(null, "Category disabled successfully"),
  )
}
