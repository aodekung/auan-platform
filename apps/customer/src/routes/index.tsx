import { createBrowserRouter, RouterProvider } from "react-router-dom"

import { RootLayout } from "../layouts/root-layout"
import { CartPage } from "../pages/cart-page"
import { CheckoutPage } from "../pages/checkout-page"
import { HomePage } from "../pages/home-page"
import { LoginPage } from "../pages/login-page"
import { MenuPage } from "../pages/menu-page"
import { NotFoundPage } from "../pages/not-found-page"
import { OrderDetailPage } from "../pages/order-detail-page"
import { OrdersPage } from "../pages/orders-page"
import { PaymentPage } from "../pages/payment-page"
import { ProductDetailPage } from "../pages/product-detail-page"
import { ProfilePage } from "../pages/profile-page"
import { StorePage } from "../pages/store-page"
import { ProtectedRoute } from "../components/guards/protected-route"
import { PublicRoute } from "../components/guards/public-route"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "menu", element: <MenuPage /> },
      { path: "product/:id", element: <ProductDetailPage /> },
      { path: "login", element: <PublicRoute><LoginPage /></PublicRoute> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },
      { path: "payment/:orderId", element: <ProtectedRoute><PaymentPage /></ProtectedRoute> },
      { path: "orders", element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
      { path: "orders/:id", element: <ProtectedRoute><OrderDetailPage /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: "store", element: <StorePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
