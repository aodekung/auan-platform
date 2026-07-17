import 'dotenv/config';
import fastifyCookie from "@fastify/cookie"
import Fastify from "fastify"
import { mkdir, readFile, stat } from "node:fs/promises"
import path from "node:path"
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"

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
import { optionTemplateRoutes } from "./modules/option-templates/index.js"
import { productRoutes } from "./modules/products/index.js"
import { settingsRoutes } from "./modules/settings/index.js"
import { lineWebhookRoutes } from "./modules/line-webhook/index.js"
import { favoriteRoutes } from "./modules/favorites/index.js"
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
})
  .withTypeProvider<ZodTypeProvider>()
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)

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

  // Serve uploaded files statically
  // Custom buffer-based file serving to fix "stream closed prematurely" on Windows.
  // @fastify/static uses createReadStream which has timing issues on Windows.
  // Reading files into a buffer eliminates the stream race condition entirely.
  const uploadsDir = path.join(process.cwd(), env.UPLOAD_PATH)
  await mkdir(uploadsDir, { recursive: true })
  await mkdir(path.join(uploadsDir, "products"), { recursive: true })
  await mkdir(path.join(uploadsDir, "payment"), { recursive: true })
  await mkdir(path.join(uploadsDir, "store"), { recursive: true })

  const uploadMimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  }

  app.get("/api/v1/uploads/*", async (request, reply) => {
    const urlPath = (request.params as Record<string, string>)["*"]
    if (!urlPath) {
      void reply.code(404).send({ error: "Not found" })
      return
    }

    // Prevent directory traversal
    const safePath = urlPath.replace(/\\/g, "/").replace(/\.\./g, "").replace(/^\/+/, "")
    const fullPath = path.resolve(path.join(uploadsDir, safePath))

    // Ensure the resolved path is still within uploadsDir
    if (!fullPath.startsWith(uploadsDir)) {
      void reply.code(403).send({ error: "Forbidden" })
      return
    }

    try {
      const buffer = await readFile(fullPath)
      const ext = path.extname(fullPath).toLowerCase()
      const contentType = uploadMimeTypes[ext] || "application/octet-stream"
      const fileStat = await stat(fullPath)

      void reply
        .header("Content-Type", contentType)
        .header("Content-Length", buffer.length)
        .header("Cache-Control", "public, max-age=86400")
        .header("Last-Modified", fileStat.mtime.toUTCString())
        .send(buffer)
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code
      if (code === "ENOENT") {
        void reply.code(404).send({ error: "File not found" })
      } else {
        app.log.error(err, "Error serving uploaded file")
        void reply.code(500).send({ error: "Internal server error" })
      }
    }
  })

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
  await optionTemplateRoutes(app)
  await cartRoutes(app)
  await notificationRoutes(app)
  await settingsRoutes(app)
  await addressRoutes(app)
  await orderRoutes(app)
  await paymentRoutes(app)
  await adminRoutes(app)
  await lineWebhookRoutes(app)
  await richMenuRoutes(app)
  await favoriteRoutes(app)

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
