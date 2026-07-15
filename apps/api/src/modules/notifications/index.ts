/**
 * Notification module — public API for registration in server.ts.
 *
 * Exports:
 *   notificationRoutes — route registration (controllers + handlers)
 *   dispatchNotification — for other modules to trigger notifications
 *   processNotificationQueue — for queue processing (cron / scheduled task)
 */

export { notificationRoutes } from "./notification.routes.js"
export { dispatchNotification, processQueue as processNotificationQueue } from "./notification.service.js"
