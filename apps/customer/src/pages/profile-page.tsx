import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LogOut, Store, ClipboardList, MapPin, ChevronRight, Phone, Pencil, X, Loader2, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Separator } from "../components/ui/separator"
import { Input } from "../components/ui/input"
import { useAuth } from "../providers/auth-provider"
import { useLogout, useUpdateProfile } from "../hooks/use-auth"
import { ErrorBoundary } from "../components/feedback/error-boundary"

export function ProfilePage() {
  const { displayName, pictureUrl, phone, isAuthenticated } = useAuth()
  const logout = useLogout()
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()

  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneInput, setPhoneInput] = useState(phone ?? "")
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/login"),
    })
  }

  const handleOpenEdit = () => {
    setPhoneInput(phone ?? "")
    setIsEditingPhone(true)
    setToastMessage(null)
  }

  const handleCloseEdit = () => {
    setIsEditingPhone(false)
  }

  const handleSavePhone = () => {
    if (!phoneInput.trim()) {
      setToastMessage({ type: "error", message: "กรุณากรอกเบอร์โทรศัพท์" })
      return
    }

    const phoneRegex = /^0\d{8,9}$/
    if (!phoneRegex.test(phoneInput)) {
      setToastMessage({ type: "error", message: "เบอร์โทรไม่ถูกต้อง (ต้องขึ้นต้นด้วย 0, 9-10 หลัก)" })
      return
    }

    // Optimistic update
    updateProfile.mutate(
      { phone: phoneInput },
      {
        onSuccess: () => {
          setIsEditingPhone(false)
          setToastMessage({ type: "success", message: "บันทึกเบอร์โทรศัพท์เรียบร้อยแล้ว" })
          setTimeout(() => setToastMessage(null), 3000)
        },
        onError: () => {
          setToastMessage({ type: "error", message: "ไม่สามารถบันทึกได้ กรุณาลองอีกครั้ง" })
        },
      },
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-xl font-bold">👤 โปรไฟล์</h1>

        {/* Toast */}
        {toastMessage && (
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              toastMessage.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {toastMessage.message}
          </div>
        )}

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

        {/* Phone Number Card */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">เบอร์โทรศัพท์</p>
              <p className="text-sm font-medium">
                {phone ?? (
                  <span className="text-muted-foreground">ยังไม่ได้ตั้งค่า</span>
                )}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Phone Edit Dialog (Overlay) */}
        {isEditingPhone && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full rounded-t-2xl bg-background p-6 shadow-lg sm:max-w-md sm:rounded-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">แก้ไขเบอร์โทรศัพท์</h2>
                <button onClick={handleCloseEdit} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="phone-input" className="mb-2 block text-sm font-medium">
                    เบอร์โทรศัพท์
                  </label>
                  <Input
                    id="phone-input"
                    type="tel"
                    placeholder="0XXXXXXXXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    maxLength={10}
                    className="text-lg"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    เบอร์โทรศัพท์ 10 หลัก (ขึ้นต้นด้วย 0)
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleCloseEdit}>
                    ยกเลิก
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSavePhone}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      "บันทึก"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
              to="/addresses"
              className="flex items-center gap-3 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/50"
            >
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">ที่อยู่ของฉัน</span>
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
