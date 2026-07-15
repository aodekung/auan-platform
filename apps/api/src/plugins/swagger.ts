import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import type { FastifyInstance } from "fastify"
import { jsonSchemaTransform } from "fastify-type-provider-zod"

import { env } from "../config/env.js"

export async function registerSwagger(app: FastifyInstance) {
  const serverUrl =
    env.NODE_ENV === "production"
      ? `${env.FRONTEND_URL || "https://localhost"}/api`
      : `http://localhost:${env.PORT}`

  await app.register(fastifySwagger, {
    transform: jsonSchemaTransform,
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Auan-Auan-Platform API",
        description: "API documentation for Auan-Auan-Platform",
        version: "1.0.0",
      },
      servers: [
        {
          url: serverUrl,
          description: env.NODE_ENV === "production" ? "Production" : "Development",
        },
      ],
      tags: [
        { name: "Health", description: "Health check endpoints" },
        { name: "Auth", description: "Authentication endpoints" },
        { name: "Products", description: "Product management" },
        { name: "Categories", description: "Category management" },
        { name: "Cart", description: "Shopping cart" },
        { name: "Orders", description: "Order management" },
        { name: "Payments", description: "Payment processing" },
        { name: "Notifications", description: "Notification management" },
        { name: "Kitchen", description: "Kitchen operations" },
        { name: "Settings", description: "Settings management" },
        { name: "Admin", description: "Admin operations" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description:
              "JWT token obtained from LINE Login authentication",
          },
        },
      },
    },
  })

  await app.register(fastifySwaggerUi, {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  })
}
