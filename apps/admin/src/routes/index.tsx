import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AdminLayout } from "@/layouts/admin-layout"
import { ProtectedRoute } from "@/components/guards/protected-route"
import { PublicRoute } from "@/components/guards/public-route"
import { LoginPage } from "@/pages/login-page"
import { DashboardPage } from "@/pages/dashboard-page"
import { OrdersPage } from "@/pages/orders-page"
import { OrderDetailPage } from "@/pages/order-detail-page"
import { KitchenPage } from "@/pages/kitchen-page"
import { PaymentsPage } from "@/pages/payments-page"
import { ProductsPage } from "@/pages/products-page"
import { SettingsPage } from "@/pages/settings-page"
import { StaffPage } from "@/pages/staff-page"
import { NotFoundPage } from "@/pages/not-found-page"

const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: (
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      ),
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "orders", element: <OrdersPage /> },
        { path: "orders/:id", element: <OrderDetailPage /> },
        { path: "kitchen", element: <KitchenPage /> },
        { path: "payments", element: <PaymentsPage /> },
        { path: "products", element: <ProductsPage /> },
        { path: "settings", element: <SettingsPage /> },
        { path: "staff", element: <StaffPage /> },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
  { basename: "/admin" },
)

export function AppRoutes() {
  return <RouterProvider router={router} />
}
