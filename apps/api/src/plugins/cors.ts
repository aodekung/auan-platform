import fastifyCors from "@fastify/cors"
import type { FastifyInstance } from "fastify"

import { env } from "../config/env.js"

export async function registerCors(app: FastifyInstance) {
  const devOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
  ]

  const productionOrigins: string[] = []

  // FRONTEND_URL may contain multiple comma-separated URLs
  // e.g. "https://auan-auan.vercel.app"
  if (env.FRONTEND_URL) {
    for (const origin of env.FRONTEND_URL.split(",").map((s) => s.trim())) {
      if (origin) productionOrigins.push(origin)
    }
  }

  // Always allow LIFF and LINE in-app browser
  productionOrigins.push("https://liff.line.me")
  productionOrigins.push("https://access.line.me")

  // If no FRONTEND_URL set, allow all origins in production (failsafe)
  // This ensures the API works even if env var is missing
  const allowedOrigins =
    env.NODE_ENV === "development"
      ? devOrigins
      : productionOrigins.length > 2
        ? productionOrigins
        : true // allow all origins as fallback

  await app.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
}
