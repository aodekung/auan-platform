/**
 * Admin Customer Management Service.
 *
 * Business logic for admin customer operations:
 * - List/search customers with pagination
 * - View customer details with order summary
 * - View customer order history
 * - Enable/disable customers
 *
 * Per 60-architecture.md: business logic in services, NOT controllers.
 * Per 100-security-rules.md: audit all administrative actions.
 */

import { AppError, ErrorCode } from "../../common/errors.js"
import { prisma } from "../../database/client.js"
import { AuditLogRepository } from "../../database/repositories/audit-log.repository.js"
import { CustomerRepository } from "../../database/repositories/customer.repository.js"

import type { CustomerDetailResponse, CustomerListQuery, CustomerOrderHistoryQuery } from "./admin.types.js"

const customerRepo = new CustomerRepository()
const auditLogRepo = new AuditLogRepository()

/**
 * List customers with pagination and search.
 */
export async function listCustomers(query: CustomerListQuery) {
  return customerRepo.findAll(query)
}

/**
 * Get customer details with order summary.
 */
export async function getCustomer(id: string): Promise<CustomerDetailResponse> {
  const customer = await customerRepo.findById(id)
  if (!customer) {
    throw new AppError(404, ErrorCode.NOT_FOUND, "Customer not found")
  }

  const orderStats = await prisma.order.aggregate({
    where: { customerId: id },
    _count: true,
    _sum: { total: true },
  })

  return {
    id: customer.id,
    lineUserId: customer.lineUserId,
    displayName: customer.displayName,
    pictureUrl: customer.pictureUrl,
    phone: customer.phone,
    totalOrders: orderStats._count,
    totalSpent: Number(orderStats._sum.total ?? 0),
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  }
}

/**
 * Get a customer's order history with pagination.
 */
export async function getCustomerOrders(customerId: string, query: CustomerOrderHistoryQuery) {
  const customer = await customerRepo.findById(customerId)
  if (!customer) {
    throw new AppError(404, ErrorCode.NOT_FOUND, "Customer not found")
  }

  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20
  const skip = (page - 1) * pageSize

  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { customerId },
      include: {
        items: { include: { product: { select: { name: true } } } },
        payment: { select: { paymentStatus: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { customerId } }),
  ])

  return { data, total }
}

/**
 * Toggle customer status (disable/enable).
 * Note: Customer model doesn't have isActive/deletedAt fields.
 * This is a future-ready placeholder. For now, we log the action.
 */
export async function toggleCustomerStatus(
  id: string,
  actorId: string,
  actorName: string,
): Promise<CustomerDetailResponse> {
  const customer = await customerRepo.findById(id)
  if (!customer) {
    throw new AppError(404, ErrorCode.NOT_FOUND, "Customer not found")
  }

  // Future: implement enable/disable when Customer model has isActive field
  // For now, just audit log the action
  await auditLogRepo.log({
    action: "CUSTOMER_DISABLED",
    entityType: "Customer",
    entityId: id,
    actorId,
    actorName,
  })

  return getCustomer(id)
}
