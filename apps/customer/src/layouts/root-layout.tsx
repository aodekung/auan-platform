import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Home, Package, User, Heart, UtensilsCrossed, ShoppingBag } from "lucide-react"

import { useStoreSettings } from "../hooks/use-settings"
import { useCartStore } from "../stores"
import { cn } from "../lib/utils"
import { getLiffContext } from "../lib/liff"

function getUploadUrl(relativePath: string): string {
  if (!relativePath) return ""
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  return `${baseUrl}/uploads/${relativePath}`
}

const NAV_ITEMS = [
  { to: "/", label: "หน้าแรก", icon: Home },
  { to: "/menu", label: "เมนู", icon: UtensilsCrossed },
  { to: "/favorites", label: "รายการโปรด", icon: Heart },
  { to: "/orders", label: "ออเดอร์", icon: Package },
  { to: "/profile", label: "โปรไฟล์", icon: User },
] as const

/** Routes that should hide the bottom nav (payment page needs full screen) */
const HIDE_NAV_PATHS = ["/payment/", "/checkout"]

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const hideNav = HIDE_NAV_PATHS.some((p) => location.pathname.includes(p))
  const { data: storeSettings } = useStoreSettings()
  const cartItemCount = useCartStore((s) => s.getItemCount())

  // ── LIFF deep link routing ──
  // On mount, if LIFF provides a path via context (e.g. from rich menu
  // or shared link), navigate there and replace history entry.
  useEffect(() => {
    const ctx = getLiffContext()
    // LIFF context path is available at runtime but not in the TypeScript
    // types — cast to access it safely.
    const liffPath = (ctx as Record<string, unknown> | null)?.path as string | undefined
    if (liffPath && liffPath !== "/" && liffPath !== location.pathname) {
      navigate(liffPath, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            {storeSettings?.logo ? (
              <img
                src={getUploadUrl(storeSettings.logo)}
                alt={storeSettings.name || "Logo"}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <span className="text-xl">🥢</span>
            )}
            <span className="text-lg font-bold">
              {storeSettings?.name || "อ้วนอ้วนหม่าล่าทอด"}
            </span>
          </Link>
        </div>
      </header>

      {/* Main content — add bottom padding when nav is visible */}
      <main
        className={cn(
          "container mx-auto flex-1 px-4 py-4",
          hideNav ? "pb-4" : "pb-20",
        )}
      >
        <Outlet />
      </main>

      {/* Cart FAB */}
      {!hideNav && cartItemCount > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </span>
        </Link>
      )}

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
          <div className="flex h-16 items-center justify-around">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
