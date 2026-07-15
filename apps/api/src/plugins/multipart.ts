import fastifyMultipart from "@fastify/multipart"
import { env } from "../config/env.js"
import type { FastifyInstance } from "fastify"

export async function registerMultipart(app: FastifyInstance) {
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: env.UPLOAD_MAX_SIZE,
    },
  })
}
