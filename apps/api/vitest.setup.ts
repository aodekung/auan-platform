/**
 * Global Vitest setup — mock environment variables required at import time.
 */

import { randomBytes } from "node:crypto"

// Must be set BEFORE any module imports env.ts
process.env.NODE_ENV = "test"
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://test:test@localhost:5432/test"
process.env.JWT_SECRET = process.env.TEST_JWT_SECRET ?? randomBytes(32).toString("hex")
process.env.STAFF_JWT_SECRET = process.env.TEST_STAFF_JWT_SECRET ?? randomBytes(32).toString("hex")
process.env.LINE_CHANNEL_ID = process.env.TEST_LINE_CHANNEL_ID ?? "test-channel-id"
process.env.LINE_CHANNEL_SECRET = process.env.TEST_LINE_CHANNEL_SECRET ?? randomBytes(16).toString("hex")
process.env.OWNER_LINE_USER_IDS = process.env.TEST_OWNER_LINE_USER_IDS ?? "U-owner-001-test"
process.env.AUTH_TOKEN_SOURCE = "bearer"
process.env.REFRESH_TOKEN_EXPIRY_DAYS = "30"
process.env.STAFF_JWT_EXPIRY_HOURS = "8"
process.env.STAFF_SESSION_EXPIRY_DAYS = "30"
process.env.BCRYPT_SALT_ROUNDS = "4"
process.env.PORT = "3000"
process.env.UPLOAD_PATH = "./uploads"
process.env.UPLOAD_MAX_SIZE = "5242880"
