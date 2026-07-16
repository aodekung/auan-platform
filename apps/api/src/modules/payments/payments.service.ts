/**
 * Payments Service — business logic for payment management.
 *
 * Responsibilities:
 * - Create payment for order (validate order state, check duplicates)
 * - Get payment by order ID (with lazy expiry check)
 * - Upload payment slip (base64 decode, save to disk)
 * - Customer confirms payment (PENDING -> AWAITING_VERIFICATION)
 * - Owner verifies payment (AWAITING_VERIFICATION -> PAID)
 * - Owner rejects payment (AWAITING_VERIFICATION -> REJECTED)
 *
 * Per 60-architecture.md: business logic lives in services, NOT controllers.
 * Per 153-pricing-rules.md: monetary values are returned as strings.
 * Per 158-order-status.md: order status changes are logged in OrderStatusHistory.
 */

import type { Decimal } from "@prisma/client/runtime/library"
import type { Prisma } from "@prisma/client"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import crypto from "node:crypto"

import { prisma } from "../../database/client.js"
import { AppError, ErrorCode } from "../../common/errors.js"
import { OrderRepository } from "../../database/repositories/order.repository.js"
import { OrderStatusHistoryRepository } from "../../database/repositories/order-status-history.repository.js"
import { SettingRepository } from "../../database/repositories/setting.repository.js"
import { dispatchNotification } from "../notifications/notification.service.js"

import type {
  CreatePaymentRequest,
  PaymentResponse,
  PaymentWithOrderResponse,
  PaymentOrderSummary,
  CreatePaymentResponse,
  RejectPaymentRequest,
} from "./payments.types.js"
import {
  SLIP_UPLOAD_STATUSES,
  CONFIRMABLE_STATUSES,
} from "./payments.types.js"

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const PAYMENT_METHOD_PROMPTPAY = "PROMPTPAY"
const DEFAULT_PAYMENT_TIMEOUT_SECONDS = 300
const SLIPS_DIR = join(process.cwd(), "uploads", "slips")

/** Allowed MIME types for slip images. */
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}

// ─────────────────────────────────────────────────────────────
// Repository instances (singleton per module)
// ─────────────────────────────────────────────────────────────

const orderRepo = new OrderRepository()
const orderStatusHistoryRepo = new OrderStatusHistoryRepository()
const settingRepo = new SettingRepository()

// ─────────────────────────────────────────────────────────────
// Mappers
// ─────────────────────────────────────────────────────────────

function mapPayment(payment: {
  id: string
  orderId: string
  method: string
  amount: Decimal | number
  paymentStatus: string
  slipImage: string | null
  paidAt: Date | null
  verifiedAt: Date | null
  verifiedBy: string | null
  rejectReason: string | null
  createdAt: Date
  updatedAt: Date
}): PaymentResponse {
  return {
    id: payment.id,
    orderId: payment.orderId,
    method: payment.method,
    amount: payment.amount.toString(),
    paymentStatus: payment.paymentStatus,
    slipImage: payment.slipImage,
    paidAt: payment.paidAt?.toISOString() ?? null,
    verifiedAt: payment.verifiedAt?.toISOString() ?? null,
    verifiedBy: payment.verifiedBy,
    rejectReason: payment.rejectReason,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  }
}

function mapOrderSummary(order: {
  id: string
  orderNumber: string
  orderStatus: string
  items: Array<{
    productName: string
    quantity: number
    unitPrice: Decimal | number
  }>
}): PaymentOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
    })),
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a setting value by key. Returns null if the setting does not exist.
 */
async function getSettingValue(key: string): Promise<string | null> {
  const setting = await settingRepo.findByKey(key)
  return setting?.value ?? null
}

/**
 * Get the payment timeout in seconds from settings.
 * Defaults to DEFAULT_PAYMENT_TIMEOUT_SECONDS (300).
 */
async function getPaymentTimeout(): Promise<number> {
  const raw = await getSettingValue("payment.timeout")
  if (raw) {
    const parsed = parseInt(raw, 10)
    if (!Number.isNaN(parsed) && parsed > 0) return parsed
  }
  return DEFAULT_PAYMENT_TIMEOUT_SECONDS
}

/**
 * Detect image MIME type from base64 data URL prefix or raw magic bytes.
 * Returns { mime, extension } or throws if invalid.
 */
function detectImageType(base64: string): { mime: string; extension: string } {
  // Check for data URL prefix (e.g., "data:image/png;base64,...")
  const dataUrlMatch = base64.match(/^data:(image\/\w+);base64,/)
  if (dataUrlMatch) {
    const mime = dataUrlMatch[1]
    const ext = ALLOWED_IMAGE_TYPES[mime]
    if (ext) return { mime, extension: ext }
    throw new AppError(
      400,
      ErrorCode.INVALID_FILE_TYPE,
      `Unsupported image type: ${mime}. Allowed: image/jpeg, image/png, image/webp`,
    )
  }

  // Fallback: detect from magic bytes in raw base64
  const rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64
  const buffer = Buffer.from(rawBase64, "base64")

  if (buffer.length < 4) {
    throw new AppError(
      400,
      ErrorCode.INVALID_FILE_TYPE,
      "Image data is too small to be valid",
    )
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: ".jpg" }
  }
  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { mime: "image/png", extension: ".png" }
  }
  // WebP: RIFF....WEBP (bytes 0-3 = RIFF, 8-11 = WEBP)
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { mime: "image/webp", extension: ".webp" }
  }

  throw new AppError(
    400,
    ErrorCode.INVALID_FILE_TYPE,
    "Invalid image format. Allowed: image/jpeg, image/png, image/webp",
  )
}

/**
 * Save a base64-encoded image to disk.
 * Creates the uploads/slips directory if it does not exist.
 * Returns the relative file path (e.g., "uploads/slips/abc123.jpg").
 */
async function saveSlipImage(
  base64: string,
  fileName?: string,
): Promise<string> {
  const { mime, extension } = detectImageType(base64)

  // Extract raw base64 (strip data URL prefix if present)
  const rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64
  const buffer = Buffer.from(rawBase64, "base64")

  // Check size (5MB max)
  const maxSize = 5 * 1024 * 1024
  if (buffer.length > maxSize) {
    throw new AppError(
      400,
      ErrorCode.FILE_TOO_LARGE,
      "Slip image must not exceed 5MB",
    )
  }

  // Ensure directory exists
  await mkdir(SLIPS_DIR, { recursive: true })

  // Generate filename
  const uniqueId = crypto.randomBytes(16).toString("hex")
  const safeName = fileName
    ? fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
    : undefined
  const finalFileName = safeName
    ? `${uniqueId}_${safeName}`
    : `${uniqueId}${extension}`

  const filePath = join(SLIPS_DIR, finalFileName)

  await writeFile(filePath, buffer)

  // Return relative path for storage in DB
  return `uploads/slips/${finalFileName}`
}

// ─────────────────────────────────────────────────────────────
// Create Payment
// ─────────────────────────────────────────────────────────────

/**
 * Create a payment for an order.
 *
 * Flow:
 *   1. Validate order exists and belongs to the customer
 *   2. Validate order status is AWAITING_PAYMENT
 *   3. Check payment doesn't already exist for this order
 *   4. Create Payment record with status PENDING
 *   5. Fetch PromptPay details from settings
 *   6. Return payment with order info and PromptPay details
 */
export async function createPayment(
  customerId: string,
  data: CreatePaymentRequest,
): Promise<CreatePaymentResponse> {
  const { orderId } = data

  // Step 1: Validate order exists and belongs to customer
  const order = await orderRepo.findById(orderId)
  if (!order) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }
  if (order.customerId !== customerId) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  // Step 2: Validate order status is AWAITING_PAYMENT
  if (order.orderStatus !== "AWAITING_PAYMENT") {
    throw new AppError(
      400,
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Cannot create payment for order with status "${order.orderStatus}". Order must be AWAITING_PAYMENT.`,
    )
  }

  // Step 3: Check payment doesn't already exist
  const existingPayment = await prisma.payment.findUnique({
    where: { orderId },
  })
  if (existingPayment) {
    throw new AppError(
      409,
      ErrorCode.CONFLICT,
      "Payment already exists for this order",
    )
  }

  // Step 4: Create Payment record with status PENDING
  const payment = await prisma.payment.create({
    data: {
      orderId,
      method: PAYMENT_METHOD_PROMPTPAY,
      amount: order.total,
      paymentStatus: "PENDING",
    },
  })

  // Step 5: Fetch order with items for response
  const orderWithItems = await orderRepo.findByIdWithDetails(orderId)
  if (!orderWithItems) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to retrieve order details after payment creation",
    )
  }

  // Fetch PromptPay details from settings
  const [promptPayNumber, promptPayQrUrl] = await Promise.all([
    getSettingValue("payment.promptpay.number"),
    getSettingValue("payment.promptpay.qrcode"),
  ])

  return {
    ...mapPayment(payment),
    order: mapOrderSummary(orderWithItems),
    promptPayNumber,
    promptPayQrUrl,
  }
}

// ─────────────────────────────────────────────────────────────
// Get Payment by Order ID
// ─────────────────────────────────────────────────────────────

/**
 * Get payment for a specific order (customer's own orders only).
 *
 * Includes lazy timeout check: if payment status is PENDING
 * and createdAt + timeout has elapsed, update both payment and order to EXPIRED.
 */
export async function getPaymentByOrderId(
  orderId: string,
  customerId: string,
): Promise<PaymentWithOrderResponse> {
  // Validate order belongs to customer
  const order = await orderRepo.findById(orderId)
  if (!order) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }
  if (order.customerId !== customerId) {
    throw new AppError(404, ErrorCode.ORDER_NOT_FOUND, "Order not found")
  }

  // Get payment
  let payment = await prisma.payment.findUnique({
    where: { orderId },
  })
  if (!payment) {
    throw new AppError(
      404,
      ErrorCode.PAYMENT_NOT_FOUND,
      "Payment not found for this order",
    )
  }

  // Lazy timeout check: if PENDING and expired
  if (payment.paymentStatus === "PENDING") {
    const timeout = await getPaymentTimeout()
    const createdAtMs = payment.createdAt.getTime()
    const nowMs = Date.now()

    if (nowMs - createdAtMs > timeout * 1000) {
      // Capture paymentId for closure (TS loses narrowing in async)
      const paymentId = payment.id

      // Expire both payment and order
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: { paymentStatus: "EXPIRED" },
        })

        await tx.order.update({
          where: { id: orderId },
          data: { orderStatus: "EXPIRED" },
        })

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: order.orderStatus,
            toStatus: "EXPIRED",
            changedBy: null,
            reason: "Payment timed out",
          },
        })
      })

      // Re-fetch the updated payment
      const refetched = await prisma.payment.findUnique({
        where: { orderId },
      })
      if (!refetched) {
        throw new AppError(
          500,
          ErrorCode.INTERNAL_ERROR,
          "Failed to retrieve payment after timeout update",
        )
      }
      payment = refetched
    }
  }

  // Fetch order with items for response
  const orderWithItems = await orderRepo.findByIdWithDetails(orderId)
  if (!orderWithItems) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to retrieve order details",
    )
  }

  return {
    ...mapPayment(payment),
    order: mapOrderSummary(orderWithItems),
  }
}

// ─────────────────────────────────────────────────────────────
// Admin: Get payment by orderId (no customer ownership check)
// ─────────────────────────────────────────────────────────────

export async function getPaymentByOrderIdAdmin(
  orderId: string,
): Promise<PaymentWithOrderResponse> {
  let payment = await prisma.payment.findUnique({ where: { orderId } })
  if (!payment) {
    throw new AppError(404, ErrorCode.PAYMENT_NOT_FOUND, "Payment not found for this order")
  }

  // Lazy timeout check: if PENDING and expired
  if (payment.paymentStatus === "PENDING") {
    const timeout = await getPaymentTimeout()
    const createdAtMs = payment.createdAt.getTime()
    const nowMs = Date.now()

    if (nowMs - createdAtMs > timeout * 1000) {
      const paymentId = payment.id

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: { paymentStatus: "EXPIRED" },
        })

        await tx.order.update({
          where: { id: orderId },
          data: { orderStatus: "EXPIRED" },
        })

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            fromStatus: "QUEUED", // fallback default
            toStatus: "EXPIRED",
            changedBy: null,
            reason: "Payment timed out",
          },
        })
      })

      const refetched = await prisma.payment.findUnique({ where: { orderId } })
      if (!refetched) {
        throw new AppError(500, ErrorCode.INTERNAL_ERROR, "Failed to retrieve payment after timeout update")
      }
      payment = refetched
    }
  }

  const orderWithItems = await orderRepo.findByIdWithDetails(orderId)
  if (!orderWithItems) {
    throw new AppError(500, ErrorCode.INTERNAL_ERROR, "Failed to retrieve order details")
  }

  return {
    ...mapPayment(payment),
    order: mapOrderSummary(orderWithItems),
  }
}

// ─────────────────────────────────────────────────────────────
// Upload Slip
// ─────────────────────────────────────────────────────────────

/**
 * Upload a payment slip image.
 *
 * Validates:
 *   - Payment exists and belongs to a customer's order
 *   - Payment status is PENDING or AWAITING_VERIFICATION
 *   - Image is valid JPEG, PNG, or WebP (max 5MB)
 *
 * Saves the decoded image to uploads/slips/ and updates the payment record.
 */
export async function uploadSlip(
  paymentId: string,
  customerId: string,
  slipBase64: string,
  fileName?: string,
): Promise<PaymentResponse> {
  // Validate payment exists
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })
  if (!payment) {
    throw new AppError(
      404,
      ErrorCode.PAYMENT_NOT_FOUND,
      "Payment not found",
    )
  }

  // Validate payment belongs to customer's order
  const order = await orderRepo.findById(payment.orderId)
  if (!order || order.customerId !== customerId) {
    throw new AppError(404, ErrorCode.PAYMENT_NOT_FOUND, "Payment not found")
  }

  // Validate payment status allows slip upload
  if (!SLIP_UPLOAD_STATUSES.includes(payment.paymentStatus as never)) {
    throw new AppError(
      400,
      ErrorCode.INVALID_PAYMENT_STATUS,
      `Cannot upload slip for payment with status "${payment.paymentStatus}"`,
    )
  }

  // Save slip image to disk
  const slipImagePath = await saveSlipImage(slipBase64, fileName)

  // Update payment
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      slipImage: slipImagePath,
    },
  })

  return mapPayment(updated)
}

// ─────────────────────────────────────────────────────────────
// Confirm Payment (Customer)
// ─────────────────────────────────────────────────────────────

/**
 * Customer confirms they have completed payment.
 *
 * Transitions payment status: PENDING -> AWAITING_VERIFICATION.
 */
export async function confirmPayment(
  paymentId: string,
  customerId: string,
): Promise<PaymentResponse> {
  // Validate payment exists
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })
  if (!payment) {
    throw new AppError(
      404,
      ErrorCode.PAYMENT_NOT_FOUND,
      "Payment not found",
    )
  }

  // Validate payment belongs to customer's order
  const order = await orderRepo.findById(payment.orderId)
  if (!order || order.customerId !== customerId) {
    throw new AppError(404, ErrorCode.PAYMENT_NOT_FOUND, "Payment not found")
  }

  // Validate status allows confirmation
  if (!CONFIRMABLE_STATUSES.includes(payment.paymentStatus as never)) {
    throw new AppError(
      400,
      ErrorCode.INVALID_PAYMENT_STATUS,
      `Cannot confirm payment with status "${payment.paymentStatus}"`,
    )
  }

  // If already AWAITING_VERIFICATION, return as-is
  if (payment.paymentStatus === "AWAITING_VERIFICATION") {
    return mapPayment(payment)
  }

  // Update payment status
  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { paymentStatus: "AWAITING_VERIFICATION" },
  })

  return mapPayment(updated)
}

// ─────────────────────────────────────────────────────────────
// Verify Payment (Owner)
// ─────────────────────────────────────────────────────────────

/**
 * Owner verifies and approves a payment.
 *
 * Transitions: paymentStatus -> PAID, orderStatus -> PAID.
 * Creates OrderStatusHistory entry for the order.
 */
export async function verifyPayment(
  paymentId: string,
  verifierId: string,
): Promise<PaymentResponse> {
  // Validate payment exists
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })
  if (!payment) {
    throw new AppError(
      404,
      ErrorCode.PAYMENT_NOT_FOUND,
      "Payment not found",
    )
  }

  // Validate payment status is AWAITING_VERIFICATION
  if (payment.paymentStatus !== "AWAITING_VERIFICATION") {
    throw new AppError(
      400,
      ErrorCode.INVALID_PAYMENT_STATUS,
      `Cannot verify payment with status "${payment.paymentStatus}". Must be AWAITING_VERIFICATION.`,
    )
  }

  const now = new Date()

  // Update payment and order atomically
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: "PAID",
        paidAt: now,
        verifiedAt: now,
        verifiedBy: verifierId,
      },
    })

    // Get current order status for history
    const currentOrder = await tx.order.findUnique({
      where: { id: payment.orderId },
      select: { orderStatus: true },
    })

    // Update order status
    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        orderStatus: "PAID",
        paymentStatus: "PAID",
      },
    })

    // Create status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        fromStatus: currentOrder?.orderStatus ?? null,
        toStatus: "PAID",
        changedBy: verifierId,
        reason: null,
      },
    })
  })

  // Dispatch LINE notification for payment verification
  try {
    const order = await prisma.order.findUnique({ where: { id: payment.orderId }, select: { customerId: true, orderNumber: true } })
    if (order) {
      const customer = await prisma.customer.findUnique({ where: { id: order.customerId }, select: { lineUserId: true } })
      if (customer?.lineUserId) {
        await dispatchNotification(customer.lineUserId, "PAYMENT_VERIFIED", "LINE", {
          orderNumber: order.orderNumber,
        }, { orderId: payment.orderId })
      }
    }
  } catch (error) {
    console.error({ err: error }, "Failed to dispatch payment verification notification")
  }

  // Fetch and return updated payment
  const updated = await prisma.payment.findUnique({
    where: { id: paymentId },
  })
  if (!updated) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to retrieve updated payment",
    )
  }

  return mapPayment(updated)
}

// ─────────────────────────────────────────────────────────────
// Reject Payment (Owner)
// ─────────────────────────────────────────────────────────────

/**
 * Owner rejects a payment.
 *
 * Transitions: paymentStatus -> REJECTED, orderStatus -> PAYMENT_REJECTED.
 * Creates OrderStatusHistory entry for the order.
 */
export async function rejectPayment(
  paymentId: string,
  data: RejectPaymentRequest,
): Promise<PaymentResponse> {
  // Validate payment exists
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })
  if (!payment) {
    throw new AppError(
      404,
      ErrorCode.PAYMENT_NOT_FOUND,
      "Payment not found",
    )
  }

  // Validate payment status is AWAITING_VERIFICATION
  if (payment.paymentStatus !== "AWAITING_VERIFICATION") {
    throw new AppError(
      400,
      ErrorCode.INVALID_PAYMENT_STATUS,
      `Cannot reject payment with status "${payment.paymentStatus}". Must be AWAITING_VERIFICATION.`,
    )
  }

  // Update payment and order atomically
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update payment
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: "REJECTED",
        rejectReason: data.reason ?? null,
      },
    })

    // Get current order status for history
    const currentOrder = await tx.order.findUnique({
      where: { id: payment.orderId },
      select: { orderStatus: true },
    })

    // Update order status
    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        orderStatus: "PAYMENT_REJECTED",
      },
    })

    // Create status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: payment.orderId,
        fromStatus: currentOrder?.orderStatus ?? null,
        toStatus: "PAYMENT_REJECTED",
        changedBy: null,
        reason: data.reason ?? null,
      },
    })
  })

  // Dispatch LINE notification for payment rejection
  try {
    const order = await prisma.order.findUnique({ where: { id: payment.orderId }, select: { customerId: true, orderNumber: true } })
    if (order) {
      const customer = await prisma.customer.findUnique({ where: { id: order.customerId }, select: { lineUserId: true } })
      if (customer?.lineUserId) {
        await dispatchNotification(customer.lineUserId, "PAYMENT_REJECTED", "LINE", {
          orderNumber: order.orderNumber,
          reason: data.reason,
        }, { orderId: payment.orderId })
      }
    }
  } catch (error) {
    console.error({ err: error }, "Failed to dispatch payment rejection notification")
  }

  // Fetch and return updated payment
  const updated = await prisma.payment.findUnique({
    where: { id: paymentId },
  })
  if (!updated) {
    throw new AppError(
      500,
      ErrorCode.INTERNAL_ERROR,
      "Failed to retrieve updated payment",
    )
  }

  return mapPayment(updated)
}

// ─────────────────────────────────────────────────────────────
// List Payments (Admin)
// ─────────────────────────────────────────────────────────────

export interface ListPaymentsQuery {
  page?: number
  pageSize?: number
  status?: string
}

/**
 * List all payments (admin view) with optional status filter and pagination.
 */
export async function listPayments(
  query: ListPaymentsQuery,
): Promise<{ data: PaymentResponse[]; total: number }> {
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20
  const where: Prisma.PaymentWhereInput = {}

  if (query.status) {
    where.paymentStatus = query.status
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ])

  return {
    data: payments.map(mapPayment),
    total,
  }
}
