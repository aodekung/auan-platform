/**
 * Product Controller — handles HTTP request/response for product endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { paginatedResponse, successResponse } from "../../common/response.js"

import type { CreateProductBody, ProductQuery, UpdateProductBody } from "./products.schema.js"
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "./products.service.js"

// ─────────────────────────────────────────────────────────────
// GET /api/v1/products
// ─────────────────────────────────────────────────────────────

export async function listProductsHandler(
  request: FastifyRequest<{ Querystring: ProductQuery }>,
  reply: FastifyReply,
): Promise<void> {
  const query = request.query
  const { products, pagination } = await getAllProducts(query)

  void reply.code(200).send(
    paginatedResponse(products, pagination),
  )
}

// ─────────────────────────────────────────────────────────────
// GET /api/v1/products/:id
// ─────────────────────────────────────────────────────────────

export async function getProductHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  const product = await getProductById(id)

  void reply.code(200).send(
    successResponse(product, "Product retrieved successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// POST /api/v1/products
// ─────────────────────────────────────────────────────────────

export async function createProductHandler(
  request: FastifyRequest<{ Body: CreateProductBody }>,
  reply: FastifyReply,
): Promise<void> {
  const product = await createProduct(request.body)

  void reply.code(201).send(
    successResponse(product, "Product created successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/v1/products/:id
// ─────────────────────────────────────────────────────────────

export async function updateProductHandler(
  request: FastifyRequest<{
    Params: { id: string }
    Body: UpdateProductBody
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  const product = await updateProduct(id, request.body)

  void reply.code(200).send(
    successResponse(product, "Product updated successfully"),
  )
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/v1/products/:id
// ─────────────────────────────────────────────────────────────

export async function deleteProductHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params
  await deleteProduct(id)

  void reply.code(200).send(
    successResponse(null, "Product disabled successfully"),
  )
}
