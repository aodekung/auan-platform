/**
 * Shared file upload utility.
 *
 * Validates MIME type, checks file size, generates UUID filename,
 * writes to disk under the configured UPLOAD_PATH.
 *
 * Used by: settings (logo, QR), products (image), and any future uploads.
 */

import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { extname, join } from "node:path"

import type { MultipartFile } from "@fastify/multipart"

import { AppError, ErrorCode } from "./errors.js"
import { env } from "../config/env.js"

/** Allowed MIME types for image uploads. */
export const ALLOWED_IMAGE_MIMETYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const

/**
 * Validate and save an uploaded image file.
 *
 * @returns The relative path of the saved file (e.g. "store/abc123.png")
 */
export async function saveUploadedFile(
  file: MultipartFile,
  subdirectory: string,
): Promise<string> {
  const mimetype = file.mimetype
  if (!mimetype || !ALLOWED_IMAGE_MIMETYPES.includes(mimetype as typeof ALLOWED_IMAGE_MIMETYPES[number])) {
    throw new AppError(
      400,
      ErrorCode.INVALID_FILE_TYPE,
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIMETYPES.join(", ")}`,
    )
  }

  const fileBuffer = await file.toBuffer()
  if (fileBuffer.length > env.UPLOAD_MAX_SIZE) {
    throw new AppError(
      413,
      ErrorCode.FILE_TOO_LARGE,
      `File too large. Maximum size: ${Math.round(env.UPLOAD_MAX_SIZE / 1_048_576)}MB`,
    )
  }

  const ext = extname(file.filename) || ".png"
  const filename = `${randomUUID()}${ext}`
  const uploadDir = join(env.UPLOAD_PATH, subdirectory)

  await mkdir(uploadDir, { recursive: true })
  const filepath = join(uploadDir, filename)
  await writeFile(filepath, fileBuffer)

  return `${subdirectory}/${filename}`
}
