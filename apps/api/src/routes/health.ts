import type { FastifyInstance } from "fastify"

export async function healthRoutes(app: FastifyInstance) {
  app.get("/api/v1/health", {
    schema: {
      description: "Health check endpoint",
      tags: ["Health"],
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                status: { type: "string" },
                timestamp: { type: "string", format: "date-time" },
                version: { type: "string" },
              },
            },
          },
        },
      },
    },
    handler: async (_request, _reply) => {
      return {
        success: true,
        data: {
          status: "ok",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
        },
      }
    },
  })
}
