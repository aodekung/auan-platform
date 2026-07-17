import path from "path"
import type { PluginOption } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

/**
 * Redirect /admin → /admin/ so Vite serves index.html.
 * Without this, visiting `http://localhost:5174/admin` (no trailing slash)
 * returns a plain-text 404 instead of the SPA shell.
 */
function trailingSlashRedirect(): PluginOption {
  return {
    name: "trailing-slash-redirect",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const base = "/admin"
        if (req.url === base || req.url === `${base}?`) {
          req.url = `${base}/`
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), trailingSlashRedirect()],
  base: "/admin/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
})
