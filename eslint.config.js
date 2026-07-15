/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      ".turbo",
      "apps/api/prisma",
    ],
  },
]
