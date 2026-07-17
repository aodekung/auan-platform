import fastifyCors from "@fastify/cors"
import type { FastifyInstance } from "fastify"

import { env } from "../config/env.js"

export async function registerCors(app: FastifyInstance) {
  const devOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
  ]

  // Allow all ngrok URLs (*.ngrok-free.app / *.ngrok-free.dev / *.ngrok.dev / *.ngrok.io)
  const ngrokPattern = /https:\/\/[a-z0-9-]+\.ngrok(-free)?\.(app|dev|io)$/

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
      : productionOrigins

  await app.register(fastifyCors, {
    origin: (origin, callback) => {
      // Allow all ngrok URLs in any environment
      if (origin && ngrokPattern.test(origin)) {
        return callback(null, true)
      }
      // Allow listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      return callback(new Error("Not allowed by CORS"), false)
      // NOTE: if you see this error, check the origin that's being rejected
      // console.error("[CORS] Blocked origin:", origin) // uncomment to debug
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
}
