/**
 * Auth module — public API for registration in server.ts.
 *
 * Exports:
 *   authRoutes    — route registration (controllers + handlers)
 *   authenticate — JWT verification middleware
 *   authorize    — role-based access control middleware
 */

export { authRoutes } from "./auth.routes.js"
export { authenticate, authorize } from "./auth.middleware.js"
export { authenticateStaff, authorizeStaff, authenticateOrStaff, authorizeOwnerOrAdmin } from "./auth.middleware.js"
