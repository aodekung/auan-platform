/**
 * Product Options Service — business logic for option group and option management.
 *
 * Responsibilities:
 * - List option groups with active options for a product (public)
 * - Create / update / delete option groups (Owner)
 * - Add / update / soft-disable options within a group (Owner)
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 153-pricing-rules.md: additionalPrice is Decimal(10,2), serialized as string.
 */

import type { Decimal } from "@prisma/client/runtime/library"

import { prisma } from "../../database/client.js"
import { ErrorCode, notFound } from "../../common/errors.js"

import type {
  OptionGroupResponse,
  OptionResponse,
} from "./product-options.types.js"

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

/**
 * Map a Prisma ProductOption entity to OptionResponse DTO.
 * Converts Decimal additionalPrice to string for JSON serialization.
 */
function mapOptionToResponse(option: {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: Decimal | number
  displayOrder: number
  isActive: boolean
}): OptionResponse {
  return {
    id: option.id,
    optionGroupId: option.optionGroupId,
    name: option.name,
    additionalPrice: Number(option.additionalPrice).toFixed(2),
    displayOrder: option.displayOrder,
    isActive: option.isActive,
  }
}

/**
 * Map a Prisma ProductOptionGroup entity (with options include) to
 * OptionGroupResponse DTO.
 * Filters to only active options and sorts by displayOrder.
 */
function mapGroupToResponse(group: {
  id: string
  productId: string
  name: string
  required: boolean
  multiple: boolean
  displayOrder: number
  options: Array<{
    id: string
    optionGroupId: string
    name: string
    additionalPrice: Decimal | number
    displayOrder: number
    isActive: boolean
  }>
}): OptionGroupResponse {
  const activeOptions = group.options
    .filter((o) => o.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return {
    id: group.id,
    productId: group.productId,
    name: group.name,
    required: group.required,
    multiple: group.multiple,
    displayOrder: group.displayOrder,
    options: activeOptions.map(mapOptionToResponse),
  }
}

// ─────────────────────────────────────────────────────────────
// Public (Customer-facing)
// ─────────────────────────────────────────────────────────────

/**
 * Get all option groups with their active options for a product.
 * Returns 404 if the product does not exist.
 * Groups are ordered by displayOrder; active options within each
 * group are also ordered by displayOrder.
 */
export async function getOptionGroupsByProductId(
  productId: string,
): Promise<OptionGroupResponse[]> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    notFound("Product not found", ErrorCode.PRODUCT_NOT_FOUND)
  }

  const groups = await prisma.productOptionGroup.findMany({
    where: { productId },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  return groups.map(mapGroupToResponse)
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Option Groups
// ─────────────────────────────────────────────────────────────

/**
 * Create a new option group for a product.
 * Validates that the product exists before creation.
 */
export async function createOptionGroup(
  productId: string,
  data: {
    name: string
    required: boolean
    multiple: boolean
    displayOrder?: number
  },
): Promise<OptionGroupResponse> {
  // Validate product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    notFound("Product not found", ErrorCode.PRODUCT_NOT_FOUND)
  }

  // Count existing groups to determine displayOrder if not provided
  const nextOrder = data.displayOrder ?? (await prisma.productOptionGroup.count({
    where: { productId },
  }))

  const group = await prisma.productOptionGroup.create({
    data: {
      productId,
      name: data.name,
      required: data.required,
      multiple: data.multiple,
      displayOrder: nextOrder,
    },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  })

  return mapGroupToResponse(group)
}

/**
 * Update an existing option group's name, required, multiple, or displayOrder.
 */
export async function updateOptionGroup(
  id: string,
  data: {
    name?: string
    required?: boolean
    multiple?: boolean
    displayOrder?: number
  },
): Promise<OptionGroupResponse> {
  const existing = await prisma.productOptionGroup.findUnique({
    where: { id },
  })

  if (!existing) {
    notFound("Option group not found", ErrorCode.NOT_FOUND)
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.required !== undefined) updateData.required = data.required
  if (data.multiple !== undefined) updateData.multiple = data.multiple
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder

  const group = await prisma.productOptionGroup.update({
    where: { id },
    data: updateData,
    include: {
      options: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  })

  return mapGroupToResponse(group)
}

/**
 * Delete an option group and cascade-delete all its options.
 */
export async function deleteOptionGroup(id: string): Promise<void> {
  const existing = await prisma.productOptionGroup.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existing) {
    notFound("Option group not found", ErrorCode.NOT_FOUND)
  }

  // Cascade delete: Prisma will delete related ProductOption records
  // because of the relation configuration with onDelete: Cascade.
  await prisma.productOptionGroup.delete({
    where: { id },
  })
}

// ─────────────────────────────────────────────────────────────
// Admin (Owner-only) — Options within Groups
// ─────────────────────────────────────────────────────────────

/**
 * Add a new option to an existing option group.
 * Validates that the option group exists before creation.
 */
export async function createOption(
  groupId: string,
  data: {
    name: string
    additionalPrice: number
    displayOrder?: number
  },
): Promise<OptionResponse> {
  // Validate option group exists
  const group = await prisma.productOptionGroup.findUnique({
    where: { id: groupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group not found", ErrorCode.NOT_FOUND)
  }

  // Count existing options to determine displayOrder if not provided
  const nextOrder = data.displayOrder ?? (await prisma.productOption.count({
    where: { optionGroupId: groupId },
  }))

  const option = await prisma.productOption.create({
    data: {
      optionGroupId: groupId,
      name: data.name,
      additionalPrice: data.additionalPrice,
      displayOrder: nextOrder,
    },
  })

  return mapOptionToResponse(option)
}

/**
 * Update an existing option's name, additionalPrice, displayOrder, or isActive.
 */
export async function updateOption(
  groupId: string,
  id: string,
  data: {
    name?: string
    additionalPrice?: number
    displayOrder?: number
    isActive?: boolean
  },
): Promise<OptionResponse> {
  // Validate option group exists
  const group = await prisma.productOptionGroup.findUnique({
    where: { id: groupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group not found", ErrorCode.NOT_FOUND)
  }

  // Validate option exists within the group
  const existing = await prisma.productOption.findFirst({
    where: { id, optionGroupId: groupId },
  })

  if (!existing) {
    notFound("Option not found", ErrorCode.NOT_FOUND)
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.additionalPrice !== undefined) updateData.additionalPrice = data.additionalPrice
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const option = await prisma.productOption.update({
    where: { id },
    data: updateData,
  })

  return mapOptionToResponse(option)
}

/**
 * Soft-disable an option by setting isActive to false.
 */
export async function disableOption(
  groupId: string,
  id: string,
): Promise<void> {
  // Validate option group exists
  const group = await prisma.productOptionGroup.findUnique({
    where: { id: groupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group not found", ErrorCode.NOT_FOUND)
  }

  // Validate option exists within the group
  const existing = await prisma.productOption.findFirst({
    where: { id, optionGroupId: groupId },
  })

  if (!existing) {
    notFound("Option not found", ErrorCode.NOT_FOUND)
  }

  await prisma.productOption.update({
    where: { id },
    data: { isActive: false },
  })
}
