import { Link, useLocation } from "react-router-dom"
import { Menu, Bell, ChevronRight, User, LogOut } from "lucide-react"
import { cn } from "@auan/ui"
import { useAuth } from "@/providers/auth-provider"
import { useUIStore } from "@/stores/ui.store"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/kitchen": "Kitchen Board",
  "/payments": "Payments",
  "/products": "Products",
  "/categories": "Categories",
  "/customers": "Customers",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/staff": "Staff",
  "/audit-logs": "Audit Logs",
  "/login": "Login",
}

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: { label: string; href: string }[] = [{ label: "Dashboard", href: "/" }]

  let cumulative = ""
  for (const segment of segments) {
    cumulative += `/${segment}`
    const label = ROUTE_LABELS[cumulative] || segment.charAt(0).toUpperCase() + segment.slice(1)
    crumbs.push({ label, href: cumulative })
  }

  return crumbs
}

export function TopNav() {
  const location = useLocation()
  const { displayName, logout: clearAuth } = useAuth()
  const { setSidebarOpen } = useUIStore()
  const crumbs = buildBreadcrumbs(location.pathname)

  if (location.pathname === "/login") return null

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          if (isLast) {
            return (
              <span key={crumb.href} className="font-medium text-foreground">
                {crumb.label}
              </span>
            )
          }

          return (
            <span key={crumb.href} className="flex items-center gap-1">
              <Link
                to={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notification bell (placeholder) */}
      <button
        className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </button>

      {/* User dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
              {displayName?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="hidden sm:inline font-medium">{displayName}</span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-[500] min-w-48 rounded-md border bg-background p-1 shadow-md"
            sideOffset={4}
            align="end"
          >
            <DropdownMenu.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground" disabled>
              <User className="h-4 w-4" />
              <span>Profile (coming soon)</span>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
            <DropdownMenu.Item
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground text-destructive"
              onClick={() => {
                clearAuth()
                localStorage.clear()
                window.location.href = "/login"
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  )
}
