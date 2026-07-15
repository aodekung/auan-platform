import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "../components/ui/button"
import { useAuth } from "../providers/auth-provider"
import { useSilentLogin } from "../hooks/use-auth"
import { isLiffLoggedIn, liffLogin } from "../lib/liff"

export function LoginPage() {
  const { isAuthenticated } = useAuth()
  const { silentLogin } = useSilentLogin()
  const navigate = useNavigate()
  const [isSilentLoginPending, setIsSilentLoginPending] = useState(false)
  const silentLoginAttempted = useRef(false)

  // ── Silent login: if LIFF session exists, authenticate silently ──
  useEffect(() => {
    if (isAuthenticated || !isLiffLoggedIn() || silentLoginAttempted.current) return
    silentLoginAttempted.current = true

    let cancelled = false
    setIsSilentLoginPending(true)

    void (async () => {
      const success = await silentLogin()
      setIsSilentLoginPending(false)
      if (success && !cancelled) {
        navigate("/", { replace: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, silentLogin, navigate])

  // ── Redirect if already authenticated ──
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // ── LIFF login handler ──
  const handleLogin = () => {
    liffLogin()
  }

  // ── Loading state while silent login is in progress ──
  if (isLiffLoggedIn() && isSilentLoginPending) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">กำลังเข้าสู่ระบบ...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <div className="mb-2 text-5xl">🥢</div>
        <h1 className="text-2xl font-bold">อ้วนอ้วนหม่าล่าทอด</h1>
        <p className="mt-1 text-sm text-muted-foreground">เข้าสู่ระบบเพื่อสั่งอาหาร</p>
      </div>

      <Button
        className="w-full max-w-xs"
        size="lg"
        onClick={handleLogin}
      >
        <svg
          className="mr-2 h-5 w-5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.366 4.078a10.28 10.28 0 0 0-4.778-1.07 10.28 10.28 0 0 0-4.778 1.07C6.266 5.708 3.849 9.33 3.849 13.5c0 1.35.228 2.654.649 3.878L12 24l7.5-6.622c.421-1.224.649-2.528.649-3.878 0-4.17-2.417-7.792-5.783-9.422zM12 20.2l-5.236-4.625A8.21 8.21 0 0 1 5.849 13.5c0-3.32 2.136-6.14 5.1-7.18A5.8 5.8 0 0 1 12 6c.38 0 .756.031 1.124.09a.75.75 0 1 1-.248 1.48A4.3 4.3 0 0 0 12 7.5c-2.485 0-4.5 2.686-4.5 6s2.015 6 4.5 6 4.5-2.686 4.5-6c0-.665-.077-1.3-.22-1.9a.75.75 0 0 1 1.46-.36A8.6 8.6 0 0 1 17.651 13.5a6.01 6.01 0 0 1-1.482 3.975z" />
        </svg>
        เข้าสู่ระบบด้วย LINE
      </Button>

      <p className="max-w-xs text-center text-xs text-muted-foreground">
        การเข้าสู่ระบบคือการยอมรับ{" "}
        <a href="#" className="text-primary underline">
          นโยบายความเป็นส่วนตัว
        </a>{" "}
        และ{" "}
        <a href="#" className="text-primary underline">
          ข้อกำหนดการใช้บริการ
        </a>
      </p>
    </div>
  )
}
