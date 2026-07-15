/**
 * Base Repository — generic CRUD operations backed by Prisma.
 *
 * Provides common data-access methods that every repository can use.
 * Repositories must NOT contain business logic (per 199-ai-task-rules.md).
 *
 * Note: Prisma v6 does not export a generic $ModelDelegate type,
 * so we use a simpler approach with a typed delegate parameter.
 */

import type { Prisma } from "@prisma/client"

import { prisma } from "../client.js"

export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Base repository providing common CRUD operations.
 * Concrete repositories wrap specific Prisma delegates.
 */
export class BaseRepository<
  T extends { id: string },
> {
  protected readonly model: Prisma.ModelName

  constructor(model: Prisma.ModelName) {
    this.model = model
  }

  protected get db() {
    return (prisma as unknown as Record<string, Record<string, unknown>>)[
      this.model.charAt(0).toLowerCase() + this.model.slice(1)
    ] as Record<string, (...args: unknown[]) => Promise<unknown>>
  }

  async findById(id: string): Promise<T | null> {
    return this.db.findUnique({ where: { id } }) as Promise<T | null>
  }

  async findMany(
    options?: PaginationOptions & {
      where?: Record<string, unknown>
      orderBy?: Record<string, unknown>
    },
  ): Promise<T[]> {
    const { page, pageSize, ...rest } = options ?? {}
    const args: Record<string, unknown> = { ...rest }
    if (page !== undefined && pageSize !== undefined) {
      args.skip = (page - 1) * pageSize
      args.take = pageSize
    }
    return this.db.findMany(args) as Promise<T[]>
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.db.count({ where }) as Promise<number>
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.db.count({ where: { id } })
    return (count as number) > 0
  }
}
