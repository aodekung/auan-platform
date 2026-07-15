import { Link, useNavigate } from "react-router-dom"
import { LogOut, Store, ClipboardList, ChevronRight } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { useAuth } from "../providers/auth-provider"
import { useLogout } from "../hooks/use-auth"
import { ErrorBoundary } from "../components/feedback/error-boundary"

export function ProfilePage() {
  const { displayName, pictureUrl, isAuthenticated } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login"),
    })
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-xl font-bold">👤 โปรไฟล์</h1>

        {/* User Info Card */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            {pictureUrl ? (
              <img
                src={pictureUrl}
                alt={displayName ?? ""}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl text-primary-foreground">
                {displayName?.charAt(0) ?? "?"}
              </div>
            )}
            <div>
              <p className="font-medium">{displayName ?? "ผู้ใช้"}</p>
              <p className="text-xs text-muted-foreground">ล็อกอินด้วย LINE</p>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-0">
            <Link
              to="/orders"
              className="flex items-center gap-3 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/50"
            >
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">ประวัติออเดอร์</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/store"
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
            >
              <Store className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">ข้อมูลร้าน</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
        </Button>
      </div>
    </ErrorBoundary>
  )
}
