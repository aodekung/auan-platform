/**
 * Admin Controller — handles HTTP request/response for admin endpoints.
 *
 * Per 60-coding-standard.md: Controllers parse requests, validate input,
 * delegate to services, and return responses.
 * Business logic lives in services, NOT here.
 */

import type { FastifyRequest, FastifyReply } from "fastify"

import { successResponse, paginatedResponse } from "../../common/response.js"

import { listAuditLogs, getSystemActivity } from "./admin.audit.service.js"
import { listCustomers, getCustomer, getCustomerOrders, toggleCustomerStatus } from "./admin.customer.service.js"
import { getDashboardSummary } from "./admin.dashboard.service.js"
import { listStaff, getStaff, createStaff, updateStaff, toggleStaffStatus, resetStaffPassword } from "./admin.staff.service.js"
import { listPayments } from "../payments/payments.service.js"
import { updateOrderStatus } from "../orders/orders.service.js"
import { OrderRepository } from "../../database/repositories/order.repository.js"
import type { CreateStaffRequest, UpdateStaffRequest } from "./admin.types.js"

// ─────────────────────────────────────────────────────────────
// Helper: extract actor info from request
// ─────────────────────────────────────────────────────────────

function getActorInfo(request: FastifyRequest): { actorId: string; actorName: string; actorRole: string } {
  // Try Owner (LINE JWT)
  const user = (request as unknown as Record<string, unknown>).user as
    | { userId: string; lineUserId: string; role: string }
    | undefined

  if (user && user.role === "OWNER") {
    return { actorId: user.userId, actorName: "Owner", actorRole: "OWNER" }
  }

  // Try Staff JWT
  const staff = (request as unknown as Record<string, unknown>).staff as
    | { staffId: string; email: string; role: string }
    | undefined

  if (staff) {
    return { actorId: staff.staffId, actorName: staff.email, actorRole: staff.role }
  }

  return { actorId: "unknown", actorName: "unknown", actorRole: "UNKNOWN" }
}

// ─────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────

export async function dashboardHandler(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const summary = await getDashboardSummary()
  void reply.code(200).send(successResponse(summary))
}

// ─────────────────────────────────────────────────────────────
// Customer Management
// ─────────────────────────────────────────────────────────────

export async function customerListHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = (request.query as unknown as { page?: number; pageSize?: number; search?: string; sortBy?: string; sortOrder?: "asc" | "desc" })
  const result = await listCustomers(query)
  void reply.code(200).send(paginatedResponse(
    result.data,
    { page: query.page ?? 1, pageSize: query.pageSize ?? 20, totalItems: result.total, totalPages: Math.ceil(result.total / (query.pageSize ?? 20)) },
  ))
}

export async function customerDetailHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const result = await getCustomer(id)
  void reply.code(200).send(successResponse(result))
}

export async function customerOrdersHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const query = (request.query as unknown as { page?: number; pageSize?: number })
  const result = await getCustomerOrders(id, query)
  void reply.code(200).send(paginatedResponse(
    result.data,
    { page: query.page ?? 1, pageSize: query.pageSize ?? 20, totalItems: result.total, totalPages: Math.ceil(result.total / (query.pageSize ?? 20)) },
  ))
}

export async function customerToggleStatusHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  // const body = request.body as { isActive: boolean }
  const { actorId, actorName } = getActorInfo(request)
  // Note: toggleCustomerStatus always logs CUSTOMER_DISABLED for now
  // When Customer model gets isActive, this will be updated
  const result = await toggleCustomerStatus(id, actorId, actorName)
  void reply.code(200).send(successResponse(result))
}

// ─────────────────────────────────────────────────────────────
// Staff Management
// ─────────────────────────────────────────────────────────────

export async function staffListHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = (request.query as unknown as { page?: number; pageSize?: number; search?: string; role?: string; isActive?: boolean; sortBy?: string; sortOrder?: "asc" | "desc" })
  const result = await listStaff(query)
  void reply.code(200).send(paginatedResponse(
    result.data,
    { page: query.page ?? 1, pageSize: query.pageSize ?? 20, totalItems: result.total, totalPages: Math.ceil(result.total / (query.pageSize ?? 20)) },
  ))
}

export async function staffDetailHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const result = await getStaff(id)
  void reply.code(200).send(successResponse(result))
}

export async function createStaffHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = request.body as CreateStaffRequest
  const { actorId, actorName } = getActorInfo(request)
  const result = await createStaff(body, actorId, actorName)
  void reply.code(201).send(successResponse(result, "Staff created successfully"))
}

export async function updateStaffHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const body = request.body as UpdateStaffRequest
  const { actorId, actorName, actorRole } = getActorInfo(request)
  const result = await updateStaff(id, body, actorId, actorName, actorRole)
  void reply.code(200).send(successResponse(result, "Staff updated successfully"))
}

export async function staffToggleStatusHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const { actorId, actorName, actorRole } = getActorInfo(request)
  const result = await toggleStaffStatus(id, actorId, actorName, actorRole)
  void reply.code(200).send(successResponse(result))
}

export async function staffResetPasswordHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const { actorId, actorName } = getActorInfo(request)
  const result = await resetStaffPassword(id, actorId, actorName)
  void reply.code(200).send(successResponse(result, "Password reset successfully"))
}

// ─────────────────────────────────────────────────────────────
// Payment Management
// ─────────────────────────────────────────────────────────────

export async function paymentListHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = (request.query as unknown as { page?: number; pageSize?: number; status?: string })
  const result = await listPayments(query)
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20
  void reply.code(200).send(paginatedResponse(
    result.data,
    { page, pageSize, totalItems: result.total, totalPages: Math.ceil(result.total / pageSize) },
  ))
}

// ─────────────────────────────────────────────────────────────
// Order Management
// ─────────────────────────────────────────────────────────────

const orderRepo = new OrderRepository()

export async function orderListHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = request.query as unknown as { page?: number; pageSize?: number; status?: string; search?: string }
  const { orders, total } = await orderRepo.findAllPaginated({
    status: query.status,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 20,
  })
  void reply.code(200).send(paginatedResponse(
    orders,
    { page: query.page ?? 1, pageSize: query.pageSize ?? 20, totalItems: total, totalPages: Math.ceil(total / (query.pageSize ?? 20)) },
  ))
}

export async function orderDetailHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const { id } = request.params as { id: string }
  const result = await orderRepo.findByIdWithDetails(id)
  if (!result) {
    void reply.code(404).send({ success: false, error: { code: "NOT_FOUND", message: "Order not found" } })
    return
  }
  void reply.code(200).send(successResponse(result, "Order retrieved successfully"))
}

export async function updateOrderStatusHandler(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { id } = request.params as { id: string }
  const body = request.body as { status: string; reason?: string }
  const { actorId } = getActorInfo(request)
  const order = await updateOrderStatus(id, body, actorId)
  void reply.code(200).send(successResponse(order, "Order status updated successfully"))
}

// ─────────────────────────────────────────────────────────────
// Audit Log
// ─────────────────────────────────────────────────────────────

export async function auditLogListHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = (request.query as unknown as { page?: number; pageSize?: number; action?: string; entityType?: string; entityId?: string; actorId?: string; startDate?: string; endDate?: string; sortBy?: string; sortOrder?: "asc" | "desc" })
  const result = await listAuditLogs(query)
  void reply.code(200).send(paginatedResponse(
    result.data,
    { page: query.page ?? 1, pageSize: query.pageSize ?? 20, totalItems: result.total, totalPages: Math.ceil(result.total / (query.pageSize ?? 20)) },
  ))
}

export async function systemActivityHandler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const query = (request.query as unknown as { page?: number; pageSize?: number; action?: string; entityType?: string; entityId?: string; actorId?: string; startDate?: string; endDate?: string; sortBy?: string; sortOrder?: "asc" | "desc" })
  const result = await getSystemActivity(query)
  void reply.code(200).send(paginatedResponse(
    result.data,
    { page: query.page ?? 1, pageSize: query.pageSize ?? 20, totalItems: result.total, totalPages: Math.ceil(result.total / (query.pageSize ?? 20)) },
  ))
}
