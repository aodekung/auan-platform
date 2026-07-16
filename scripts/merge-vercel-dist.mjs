/**
 * Merge customer + admin dist folders into .vercel/output/static/
 * Vercel Build Output API v3 — uses .vercel/output/static as native output.
 */
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")
const staticDir = resolve(root, ".vercel/output/static")

console.log("==> Merging dist folders into .vercel/output/static/")

rmSync(resolve(root, ".vercel/output"), { recursive: true, force: true })
mkdirSync(resolve(staticDir, "admin"), { recursive: true })

// Copy customer app (serves at root /)
cpSync(resolve(root, "apps/customer/dist"), staticDir, { recursive: true })

// Copy admin app (serves at /admin/)
cpSync(resolve(root, "apps/admin/dist"), resolve(staticDir, "admin"), { recursive: true })

// Write Vercel Build Output config (config.json — NOT routes.json)
const configDir = resolve(root, ".vercel/output/config")
mkdirSync(configDir, { recursive: true })

// Build Output API v3: routes go in config.json (NOT routes.json)
writeFileSync(resolve(configDir, "config.json"), JSON.stringify({
  version: 3,
  routes: [
    // Admin SPA — rewrite /admin and /admin/* to /admin/index.html
    { src: "/admin", dest: "/admin/index.html" },
    { src: "/admin/(.*)", dest: "/admin/index.html" },
    // Customer SPA — rewrite everything else (except static assets) to /index.html
    { src: "/((?!assets|admin/assets|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)", dest: "/index.html" },
  ],
}, null, 2))

// Headers config for cache
writeFileSync(resolve(configDir, "headers.json"), JSON.stringify([
  {
    source: "/assets/(.*)",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  },
  {
    source: "/admin/assets/(.*)",
    headers: [
      { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
    ],
  },
]))

console.log("==> Build complete. Output in .vercel/output/static/")
