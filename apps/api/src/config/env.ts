import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "staging", "test"])
    .default("development"),
  PORT: z.coerce
    .number({ invalid_type_error: "PORT must be a number" })
    .default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LINE_CHANNEL_ID: z.string(),
  LINE_CHANNEL_SECRET: z.string(),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().optional(),
  /** LINE Messaging API channel access token. Falls back to LINE_CHANNEL_ACCESS_TOKEN if not set. */
  LINE_MESSAGING_ACCESS_TOKEN: z.string().optional(),
  /** LIFF App ID (used for generating LIFF URLs, e.g. rich menu links). */
  LIFF_ID: z.string().optional(),
  /** Comma-separated LINE User IDs that have Owner role. */
  OWNER_LINE_USER_IDS: z.string().default(""),
  /** How to read access tokens: "bearer" (header), "cookie", or "both". */
  AUTH_TOKEN_SOURCE: z.enum(["bearer", "cookie", "both"]).default("bearer"),
  /** Refresh token expiry in days. Default: 30 days. */
  REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().default(30),
  /** Whether JWT cookies use Secure flag (HTTPS only). */
  JWT_COOKIE_SECURE: z.coerce.boolean().default(false).refine(
    (val) => process.env.NODE_ENV !== "production" || val === true,
    { message: "JWT_COOKIE_SECURE must be true in production" },
  ),
  /** Whether JWT cookies are httpOnly (cannot be read by JS). */
  JWT_COOKIE_HTTP_ONLY: z.coerce.boolean().default(true),
  /** SameSite policy for JWT cookies. */
  JWT_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  /** Domain for JWT cookies (empty = current domain). */
  JWT_COOKIE_DOMAIN: z.string().optional(),
  /** Path for JWT cookies. */
  JWT_COOKIE_PATH: z.string().default("/"),
  /** Directory path for uploaded files. */
  UPLOAD_PATH: z.string().default("./uploads"),
  /** Maximum upload file size in bytes. Default: 5MB. */
  UPLOAD_MAX_SIZE: z.coerce.number().default(5_242_880),
  /** Secret key for Staff JWT (separate from customer JWT). Min 32 chars. */
  STAFF_JWT_SECRET: z.string().min(32),
  /** Staff JWT token expiry in hours. Default: 8 hours. */
  STAFF_JWT_EXPIRY_HOURS: z.coerce.number().default(8),
  /** Staff refresh/session token expiry in days. Default: 30 days. */
  STAFF_SESSION_EXPIRY_DAYS: z.coerce.number().default(30),
  /** bcrypt salt rounds for staff password hashing. Default: 12. */
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  /** Pre-seeded owner email. If set, seed creates an owner staff account. */
  OWNER_EMAIL: z.string().optional(),
  /** Frontend URL for CORS and LIFF URL generation. Used in production. */
  FRONTEND_URL: z.string().optional(),
  /** LINE Webhook path (registered in LINE Developers Console). */
  LINE_WEBHOOK_PATH: z.string().default("/api/v1/webhooks/line"),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  // Render may set PORT to empty string or non-numeric — fix before Zod parses
  if (process.env.PORT && isNaN(Number(process.env.PORT))) {
    delete process.env.PORT
  }

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error("❌ Invalid environment variables:")
    console.error(result.error.flatten().fieldErrors)
    process.exit(1)
  }

  return result.data
}

export const env = validateEnv()
