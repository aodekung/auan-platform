/**
 * Singleton Prisma Client instance.
 *
 * Reusing a single client across the application avoids
 * connection pool exhaustion in development/hot-reload.
 */

import { PrismaClient } from "@prisma/client"

import { env } from "../config/env.js"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
