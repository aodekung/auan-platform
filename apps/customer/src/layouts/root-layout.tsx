import { useEffect } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Home, Package, User } from "lucide-react"

import { cn } from "../lib/utils"
import { getLiffContext } from "../lib/liff"

const NAV_ITEMS = [
  { to: "/menu", label: "เมนู", icon: Home },
  { to: "/orders", label: "ออเดอร์", icon: Package },
  { to: "/profile", label: "โปรไฟล์", icon: User },
] as const

/** Routes that should hide the bottom nav (payment page needs full screen) */
const HIDE_NAV_PATHS = ["/payment/", "/checkout"]

export function RootLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const hideNav = HIDE_NAV_PATHS.some((p) => location.pathname.includes(p))

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
          <Link to="/" className="text-lg font-bold">
            อ้วนอ้วนหม่าล่าทอด
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
