/**
 * Global Vitest setup — mock environment variables required at import time.
 */

// Must be set BEFORE any module imports env.ts
process.env.NODE_ENV = "test"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.JWT_SECRET = "test-jwt-secret-key-must-be-at-least-32-chars-long!"
process.env.STAFF_JWT_SECRET = "test-staff-jwt-secret-key-must-be-32-chars!"
process.env.LINE_CHANNEL_ID = "test-channel-id"
process.env.LINE_CHANNEL_SECRET = "test-channel-secret"
process.env.OWNER_LINE_USER_IDS = "U-owner-001,U-owner-002"
process.env.AUTH_TOKEN_SOURCE = "bearer"
process.env.REFRESH_TOKEN_EXPIRY_DAYS = "30"
process.env.STAFF_JWT_EXPIRY_HOURS = "8"
process.env.STAFF_SESSION_EXPIRY_DAYS = "30"
process.env.BCRYPT_SALT_ROUNDS = "4"
process.env.PORT = "3000"
process.env.UPLOAD_PATH = "./uploads"
process.env.UPLOAD_MAX_SIZE = "5242880"
