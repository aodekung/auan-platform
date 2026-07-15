/**
 * Merge customer + admin dist folders into vercel-output/
 * Used by "pnpm vercel:build" for Vercel deployment.
 */
import { cpSync, mkdirSync, rmSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const outDir = resolve(root, "vercel-output")

console.log("==> Merging dist folders...")

rmSync(outDir, { recursive: true, force: true })
mkdirSync(resolve(outDir, "admin"), { recursive: true })

cpSync(resolve(root, "apps/customer/dist"), outDir, { recursive: true })
cpSync(resolve(root, "apps/admin/dist"), resolve(outDir, "admin"), { recursive: true })

console.log("==> Build complete. Output in vercel-output/")
