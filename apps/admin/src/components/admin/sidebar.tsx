import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  CreditCard,
  Package,
  FolderTree,
  Users,
  Bell,
  Settings,
  UserCog,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react"
import { cn } from "@auan/ui"
import { useAuth } from "@/providers/auth-provider"
import { useUIStore } from "@/stores/ui.store"
import type { NavItem } from "@/types/admin.types"

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Kitchen Board", href: "/kitchen", icon: ChefHat },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Products", href: "/products", icon: Package },
  { label: "Categories", href: "/categories", icon: FolderTree, disabled: true },
  { label: "Customers", href: "/customers", icon: Users, disabled: true },
  { label: "Notifications", href: "/notifications", icon: Bell, disabled: true },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Staff", href: "/staff", icon: UserCog },
  { label: "Audit Logs", href: "/audit-logs", icon: FileText, disabled: true },
]

export function Sidebar() {
  const location = useLocation()
  const { displayName, role } = useAuth()
  const { isSidebarCollapsed, toggleSidebarCollapsed, setSidebarOpen } = useUIStore()

  function handleNavClick() {
    // Close sidebar on mobile after clicking a nav item
    setSidebarOpen(false)
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-250",
        isSidebarCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Flame className="h-6 w-6 shrink-0 text-primary" />
        {!isSidebarCollapsed && (
          <span className="text-sm font-semibold text-foreground truncate">
            Auan-Auan
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            if (item.disabled) {
              return (
                <li key={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground",
                      isSidebarCollapsed && "justify-center",
                    )}
                    title={isSidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </li>
              )
            }

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground",
                    isSidebarCollapsed && "justify-center",
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t px-2 py-2 hidden lg:block">
        <button
          onClick={toggleSidebarCollapsed}
          className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* User info */}
      <div className="border-t p-3">
        <div
          className={cn(
            "flex items-center gap-2",
            isSidebarCollapsed && "justify-center",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {displayName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
