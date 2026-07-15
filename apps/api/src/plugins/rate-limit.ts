import fastifyRateLimit from "@fastify/rate-limit"
import type { FastifyInstance } from "fastify"

export async function registerRateLimit(app: FastifyInstance) {
  // Global rate limit: 100 requests per minute per IP
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
    cache: 10000,
  })
}
