import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/common/**/*.ts",
        "src/modules/**/*.service.ts",
        "src/modules/**/*.types.ts",
        "src/modules/auth/utils/**/*.ts",
        "src/modules/auth/staff-auth.utils.ts",
      ],
      exclude: [
        "src/**/*.routes.ts",
        "src/**/*.controller.ts",
        "src/**/*.schema.ts",
        "src/server.ts",
        "src/config/**",
        "src/plugins/**",
        "src/database/**",
        "src/lib/**",
        // Modules not yet tested (future phases)
        "src/modules/admin/**",
        "src/modules/line-webhook/**",
        "src/modules/rich-menu/**",
        "src/modules/product-options/**",
        "src/modules/notifications/notification.service.ts",
        "src/modules/notifications/notification.types.ts",
        // Utility files not yet tested (future phases)
        "src/modules/auth/utils/jwt.utils.ts",
        "src/modules/auth/utils/line.utils.ts",
        // Type-only files (interfaces, no runtime logic)
        "src/modules/**/*.types.ts",
        "**/node_modules/**",
      ],
      thresholds: {
        statements: 65,
        branches: 55,
        functions: 65,
        lines: 65,
      },
    },
  },
})
