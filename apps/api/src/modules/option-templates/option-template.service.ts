/**
 * Option Templates Service — business logic for global option group templates,
 * their options, product assignments, and price overrides.
 *
 * Responsibilities:
 * - CRUD for global option group templates and their options
 * - Assign/unassign templates to products
 * - Per-product price overrides
 * - Customer-facing endpoint that returns the same shape as old product-options
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 153-pricing-rules.md: additionalPrice is Decimal(10,2), serialized as string.
 */

import type { Decimal } from "@prisma/client/runtime/library"

import { prisma } from "../../database/client.js"
import { ErrorCode, notFound } from "../../common/errors.js"

import type {
  AssignmentResponse,
  CustomerOptionGroupResponse,
  OptionGroupTemplateResponse,
  OptionTemplateResponse,
  PriceOverrideResponse,
} from "./option-template.types.js"

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

/**
 * Map a Prisma OptionTemplate entity to OptionTemplateResponse DTO.
 * Converts Decimal additionalPrice to string for JSON serialization.
 */
function mapOptionToResponse(option: {
  id: string
  optionGroupId: string
  name: string
  additionalPrice: Decimal | number
  displayOrder: number
  isActive: boolean
}): OptionTemplateResponse {
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
 * Map a Prisma OptionGroupTemplate entity (with options include) to
 * OptionGroupTemplateResponse DTO.
 * Filters to only active options and sorts by displayOrder.
 */
function mapGroupToResponse(group: {
  id: string
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
}): OptionGroupTemplateResponse {
  const activeOptions = group.options
    .filter((o) => o.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  return {
    id: group.id,
    name: group.name,
    required: group.required,
    multiple: group.multiple,
    displayOrder: group.displayOrder,
    options: activeOptions.map(mapOptionToResponse),
  }
}

// ─────────────────────────────────────────────────────────────
// Admin — Option Group Templates
// ─────────────────────────────────────────────────────────────

/**
 * List all option group templates with their active options,
 * ordered by displayOrder.
 */
export async function listOptionGroups(): Promise<OptionGroupTemplateResponse[]> {
  const groups = await prisma.optionGroupTemplate.findMany({
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

/**
 * Get a single option group template by id with its active options.
 */
export async function getOptionGroupById(
  id: string,
): Promise<OptionGroupTemplateResponse> {
  const group = await prisma.optionGroupTemplate.findUnique({
    where: { id },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  })

  if (!group) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  return mapGroupToResponse(group!)
}

/**
 * Create a new option group template.
 * Auto-increments displayOrder if not provided.
 */
export async function createOptionGroup(data: {
  name: string
  required: boolean
  multiple: boolean
  displayOrder?: number
}): Promise<OptionGroupTemplateResponse> {
  const nextOrder =
    data.displayOrder ??
    (await prisma.optionGroupTemplate.count())

  const group = await prisma.optionGroupTemplate.create({
    data: {
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
 * Update an existing option group template's fields.
 */
export async function updateOptionGroup(
  id: string,
  data: {
    name?: string
    required?: boolean
    multiple?: boolean
    displayOrder?: number
  },
): Promise<OptionGroupTemplateResponse> {
  const existing = await prisma.optionGroupTemplate.findUnique({
    where: { id },
  })

  if (!existing) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.required !== undefined) updateData.required = data.required
  if (data.multiple !== undefined) updateData.multiple = data.multiple
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder

  const group = await prisma.optionGroupTemplate.update({
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
 * Hard delete an option group template.
 * Cascade deletes: options, assignments, and overrides are deleted
 * by Prisma's onDelete: Cascade configuration.
 */
export async function deleteOptionGroup(id: string): Promise<void> {
  const existing = await prisma.optionGroupTemplate.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existing) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  await prisma.optionGroupTemplate.delete({
    where: { id },
  })
}

// ─────────────────────────────────────────────────────────────
// Admin — Options within Group Templates
// ─────────────────────────────────────────────────────────────

/**
 * Add a new option to an existing option group template.
 */
export async function createOption(
  groupId: string,
  data: {
    name: string
    additionalPrice: number
    displayOrder?: number
  },
): Promise<OptionTemplateResponse> {
  const group = await prisma.optionGroupTemplate.findUnique({
    where: { id: groupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  const nextOrder =
    data.displayOrder ??
    (await prisma.optionTemplate.count({
      where: { optionGroupId: groupId },
    }))

  const option = await prisma.optionTemplate.create({
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
 * Update an existing option within a group template.
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
): Promise<OptionTemplateResponse> {
  const group = await prisma.optionGroupTemplate.findUnique({
    where: { id: groupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  const existing = await prisma.optionTemplate.findFirst({
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

  const option = await prisma.optionTemplate.update({
    where: { id },
    data: updateData,
  })

  return mapOptionToResponse(option)
}

/**
 * Soft-disable an option by setting isActive to false.
 */
export async function deleteOption(
  groupId: string,
  id: string,
): Promise<void> {
  const group = await prisma.optionGroupTemplate.findUnique({
    where: { id: groupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  const existing = await prisma.optionTemplate.findFirst({
    where: { id, optionGroupId: groupId },
  })

  if (!existing) {
    notFound("Option not found", ErrorCode.NOT_FOUND)
  }

  await prisma.optionTemplate.update({
    where: { id },
    data: { isActive: false },
  })
}

// ─────────────────────────────────────────────────────────────
// Admin — Product Assignments
// ─────────────────────────────────────────────────────────────

/**
 * Get all option group template assignments for a product.
 * Includes the full option group with its active options and any price overrides.
 */
export async function getProductAssignments(
  productId: string,
): Promise<AssignmentResponse[]> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    notFound("Product not found", ErrorCode.PRODUCT_NOT_FOUND)
  }

  const assignments = await prisma.productOptionGroupAssignment.findMany({
    where: { productId },
    include: {
      optionGroup: {
        include: {
          options: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
      priceOverrides: {
        include: {
          option: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  return assignments.map((a) => ({
    id: a.id,
    productId: a.productId,
    optionGroupId: a.optionGroupId,
    displayOrder: a.displayOrder,
    optionGroup: mapGroupToResponse(a.optionGroup),
    priceOverrides: a.priceOverrides.map((po) => ({
      id: po.id,
      optionId: po.optionId,
      optionName: po.option.name,
      additionalPrice: Number(po.additionalPrice).toFixed(2),
    })),
  }))
}

/**
 * Assign an option group template to a product.
 */
export async function assignOptionGroup(
  productId: string,
  data: {
    optionGroupId: string
    displayOrder?: number
  },
): Promise<AssignmentResponse> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    notFound("Product not found", ErrorCode.PRODUCT_NOT_FOUND)
  }

  // Verify option group template exists
  const group = await prisma.optionGroupTemplate.findUnique({
    where: { id: data.optionGroupId },
    select: { id: true },
  })

  if (!group) {
    notFound("Option group template not found", ErrorCode.NOT_FOUND)
  }

  const nextOrder =
    data.displayOrder ??
    (await prisma.productOptionGroupAssignment.count({
      where: { productId },
    }))

  const assignment = await prisma.productOptionGroupAssignment.create({
    data: {
      productId,
      optionGroupId: data.optionGroupId,
      displayOrder: nextOrder,
    },
    include: {
      optionGroup: {
        include: {
          options: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
      priceOverrides: {
        include: {
          option: {
            select: { name: true },
          },
        },
      },
    },
  })

  return {
    id: assignment.id,
    productId: assignment.productId,
    optionGroupId: assignment.optionGroupId,
    displayOrder: assignment.displayOrder,
    optionGroup: mapGroupToResponse(assignment.optionGroup),
    priceOverrides: assignment.priceOverrides.map((po) => ({
      id: po.id,
      optionId: po.optionId,
      optionName: po.option.name,
      additionalPrice: Number(po.additionalPrice).toFixed(2),
    })),
  }
}

/**
 * Remove an option group template assignment from a product.
 * Cascade deletes any associated price overrides.
 */
export async function removeAssignment(
  productId: string,
  optionGroupId: string,
): Promise<void> {
  const assignment = await prisma.productOptionGroupAssignment.findUnique({
    where: {
      productId_optionGroupId: {
        productId,
        optionGroupId,
      },
    },
    select: { id: true },
  })

  if (!assignment) {
    notFound("Assignment not found", ErrorCode.NOT_FOUND)
  }

  await prisma.productOptionGroupAssignment.delete({
    where: { id: assignment!.id },
  })
}

/**
 * Set per-product price overrides for an assigned option group.
 * Performs an upsert: existing overrides are updated, new ones are created.
 * Overrides not present in the request are deleted (full replacement).
 */
export async function setPriceOverrides(
  productId: string,
  optionGroupId: string,
  data: Array<{ optionId: string; additionalPrice: number }>,
): Promise<PriceOverrideResponse[]> {
  // Verify the assignment exists
  const assignment = await prisma.productOptionGroupAssignment.findUnique({
    where: {
      productId_optionGroupId: {
        productId,
        optionGroupId,
      },
    },
    select: { id: true },
  })

  if (!assignment) {
    notFound("Assignment not found", ErrorCode.NOT_FOUND)
  }

  // Verify all optionIds belong to the group
  const options = await prisma.optionTemplate.findMany({
    where: { optionGroupId },
    select: { id: true },
  })

  const optionIds = new Set(options.map((o) => o.id))
  for (const override of data) {
    if (!optionIds.has(override.optionId)) {
      notFound(
        `Option ${override.optionId} does not belong to the specified group`,
        ErrorCode.NOT_FOUND,
      )
    }
  }

  // Delete existing overrides for this assignment
  await prisma.productPriceOverride.deleteMany({
    where: { assignmentId: assignment!.id },
  })

  // Create new overrides
  if (data.length > 0) {
    await prisma.productPriceOverride.createMany({
      data: data.map((override) => ({
        assignmentId: assignment!.id,
        optionId: override.optionId,
        additionalPrice: override.additionalPrice,
      })),
    })
  }

  // Return the created overrides
  const overrides = await prisma.productPriceOverride.findMany({
    where: { assignmentId: assignment!.id },
    include: {
      option: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return overrides.map((po) => ({
    id: po.id,
    optionId: po.optionId,
    optionName: po.option.name,
    additionalPrice: Number(po.additionalPrice).toFixed(2),
  }))
}

// ─────────────────────────────────────────────────────────────
// Customer-facing — Same shape as old product-options
// ─────────────────────────────────────────────────────────────

/**
 * Get all option groups for a product, returning the EXACT same shape as
 * the old getOptionGroupsByProductId from product-options.service.ts.
 *
 * This is the CRITICAL function for customer-facing endpoints.
 * The customer app must work unchanged when consuming this response.
 *
 * Algorithm:
 * 1. Get all assignments for the product (ordered by displayOrder)
 * 2. For each assignment, get the template with active options
 * 3. For each option, check if there is a price override —
 *    if yes use override price, else use template price
 * 4. Map to the old OptionGroupResponse format:
 *    { id (assignment id), productId, name, required, multiple, options[] }
 */
export async function getOptionGroupsByProductId(
  productId: string,
): Promise<CustomerOptionGroupResponse[]> {
  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  })

  if (!product) {
    notFound("Product not found", ErrorCode.PRODUCT_NOT_FOUND)
  }

  // Get all assignments with active options and price overrides
  const assignments = await prisma.productOptionGroupAssignment.findMany({
    where: { productId },
    include: {
      optionGroup: {
        include: {
          options: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
        },
      },
      priceOverrides: {
        select: {
          optionId: true,
          additionalPrice: true,
        },
      },
    },
    orderBy: { displayOrder: "asc" },
  })

  // Build a map of overrides: optionId -> additionalPrice
  return assignments.map((assignment) => {
    const overrideMap = new Map(
      assignment.priceOverrides.map((po) => [
        po.optionId,
        Number(po.additionalPrice).toFixed(2),
      ]),
    )

    const options = assignment.optionGroup.options
      .map((option) => ({
        id: option.id,
        optionGroupId: option.optionGroupId,
        name: option.name,
        additionalPrice:
          overrideMap.get(option.id) ??
          Number(option.additionalPrice).toFixed(2),
        displayOrder: option.displayOrder,
        isActive: option.isActive,
      }))

    return {
      id: assignment.id,
      productId: assignment.productId,
      name: assignment.optionGroup.name,
      required: assignment.optionGroup.required,
      multiple: assignment.optionGroup.multiple,
      displayOrder: assignment.displayOrder,
      options,
    }
  })
}
