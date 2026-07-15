import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/admin/sidebar"
import { TopNav } from "@/components/admin/top-nav"
import { useUIStore } from "@/stores/ui.store"
import { cn } from "@auan/ui"
import { useEffect } from "react"

export function AdminLayout() {
  const { isSidebarOpen, setSidebarOpen } = useUIStore()

  // Close sidebar on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSidebarOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [setSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-[400] bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-[400] lg:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
