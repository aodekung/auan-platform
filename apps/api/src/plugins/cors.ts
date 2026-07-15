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
  // e.g. "https://auan.vercel.app,https://auan.vercel.app/admin"
  if (env.FRONTEND_URL) {
    for (const origin of env.FRONTEND_URL.split(",").map((s) => s.trim())) {
      if (origin) productionOrigins.push(origin)
    }
  }

  // LIFF URLs use liff.line.me domain
  productionOrigins.push("https://liff.line.me")

  // LINE in-app browser origin
  productionOrigins.push("https://access.line.me")

  const allowedOrigins =
    env.NODE_ENV === "development" ? devOrigins : productionOrigins

  await app.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
}
