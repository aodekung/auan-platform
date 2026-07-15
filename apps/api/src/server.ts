import fastifyCookie from "@fastify/cookie"
import Fastify from "fastify"

import { AppError } from "./common/errors.js"
import { env } from "./config/env.js"
import { prisma } from "./database/client.js"
import { addressRoutes } from "./modules/addresses/index.js"
import { adminRoutes } from "./modules/admin/index.js"
import { authRoutes } from "./modules/auth/index.js"
import { paymentRoutes } from "./modules/payments/index.js"
import { cartRoutes } from "./modules/cart/index.js"
import { categoryRoutes } from "./modules/categories/index.js"
import { notificationRoutes } from "./modules/notifications/index.js"
import { orderRoutes } from "./modules/orders/index.js"
import { productOptionRoutes } from "./modules/product-options/index.js"
import { productRoutes } from "./modules/products/index.js"
import { settingsRoutes } from "./modules/settings/index.js"
import { lineWebhookRoutes } from "./modules/line-webhook/index.js"
import { richMenuRoutes } from "./modules/rich-menu/index.js"
import { registerCors } from "./plugins/cors.js"
import { registerHelmet } from "./plugins/helmet.js"
import { registerJwt } from "./plugins/jwt.js"
import { registerMultipart } from "./plugins/multipart.js"
import { registerRateLimit } from "./plugins/rate-limit.js"
import { registerSwagger } from "./plugins/swagger.js"
import { healthRoutes } from "./routes/health.js"

const app = Fastify({
  logger: {
    level: env.NODE_ENV === "development" ? "debug" : "info",
    transport:
      env.NODE_ENV === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
  requestIdHeader: "x-request-id",
  requestIdLogLabel: "requestId",
})

async function bootstrap() {
  // Security
  await registerHelmet(app)

  // CORS
  await registerCors(app)

  // Cookie support (required for refresh token / cookie-based auth)
  await app.register(fastifyCookie)

  // Rate limiting
  await registerRateLimit(app)

  // Multipart file upload support
  await registerMultipart(app)

  // JWT authentication
  await registerJwt(app)

  // Swagger documentation
  await registerSwagger(app)

  // Routes
  await healthRoutes(app)
  await authRoutes(app)
  await categoryRoutes(app)
  await productRoutes(app)
  await productOptionRoutes(app)
  await cartRoutes(app)
  await notificationRoutes(app)
  await settingsRoutes(app)
  await addressRoutes(app)
  await orderRoutes(app)
  await paymentRoutes(app)
  await adminRoutes(app)
  await lineWebhookRoutes(app)
  await richMenuRoutes(app)

  // Error handler
  app.setErrorHandler((error: unknown, request, reply) => {
    app.log.error(error)

    if (error instanceof AppError) {
      void reply.code(error.statusCode).send(error.serialize())
      return
    }

    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      error.statusCode === 429
    ) {
      void reply.code(429).send({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      })
      return
    }

    // Handle Zod validation errors
    if (
      error &&
      typeof error === "object" &&
      "validation" in error &&
      Array.isArray(error.validation)
    ) {
      void reply.code(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "message" in error && typeof error.message === "string"
              ? error.message
              : "Validation failed",
        },
      })
      return
    }

    void reply.code(500).send({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          env.NODE_ENV === "production"
            ? "Internal server error"
            : error instanceof Error
              ? error.message
              : "Internal server error",
      },
    })
  })

  // Start server
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" })
    app.log.info(`API server running at http://localhost:${env.PORT}`)
    app.log.info(
      `Swagger docs at http://localhost:${env.PORT}/api/docs`,
    )
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, starting graceful shutdown...`)

    const timeout = setTimeout(() => {
      app.log.error("Graceful shutdown timed out, forcing exit")
      process.exit(1)
    }, 10_000)

    try {
      await app.close()
      app.log.info("Fastify server closed")
    } catch (err) {
      app.log.error(err, "Error during Fastify close")
    }

    try {
      await prisma.$disconnect()
      app.log.info("Database connection closed")
    } catch (err) {
      app.log.error(err, "Error during database disconnect")
    }

    clearTimeout(timeout)
    process.exit(0)
  }

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM")
  })

  process.on("SIGINT", () => {
    void shutdown("SIGINT")
  })
}

bootstrap()
