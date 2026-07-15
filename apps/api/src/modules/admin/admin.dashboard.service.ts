/**
 * Admin Dashboard Service — aggregation queries for admin dashboard.
 *
 * All business logic lives in services per 60-architecture.md.
 * Uses direct Prisma queries for aggregation (no repository wrapper needed).
 */

import { prisma } from "../../database/client.js"

import type { DashboardSummary } from "./admin.types.js"

/**
 * Get dashboard summary data.
 * Aggregates order counts, revenue, popular products, active customers.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1)

  // Order counts
  const [todayOrders, pendingOrders, preparingOrders, completedOrders, cancelledOrders] =
    await prisma.$transaction([
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { orderStatus: "AWAITING_VERIFICATION" } }),
      prisma.order.count({ where: { orderStatus: "PREPARING" } }),
      prisma.order.count({ where: { orderStatus: "COMPLETED" } }),
      prisma.order.count({ where: { orderStatus: "CANCELLED" } }),
    ])

  // Revenue aggregation
  const [revenueToday, revenueThisWeek, revenueThisMonth] = await prisma.$transaction([
    prisma.payment.aggregate({
      where: { paymentStatus: "PAID", paidAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paymentStatus: "PAID", paidAt: { gte: weekStart } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { paymentStatus: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
  ])

  // Popular products (top 5 by quantity sold)
  const popularProducts = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  })

  // Active customers (distinct customers who ordered)
  const activeCustomers = await prisma.order.groupBy({
    by: ["customerId"],
  })

  return {
    todayOrders,
    pendingOrders,
    preparingOrders,
    completedOrders,
    cancelledOrders,
    revenue: {
      today: Number(revenueToday._sum.amount ?? 0),
      thisWeek: Number(revenueThisWeek._sum.amount ?? 0),
      thisMonth: Number(revenueThisMonth._sum.amount ?? 0),
    },
    popularProducts: popularProducts.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      totalQuantity: p._sum.quantity ?? 0,
    })),
    activeCustomers: activeCustomers.length,
  }
}
