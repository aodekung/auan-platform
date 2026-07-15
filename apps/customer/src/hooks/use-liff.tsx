import { useCallback, useEffect, useState } from "react"

import { Button } from "../components/ui/button"
import { initLiff } from "../lib/liff"

// ─────────────────────────────────────────────────────────────
// useLiff Hook
// ─────────────────────────────────────────────────────────────

interface LiffState {
  /** LIFF SDK has been initialized and is ready. */
  isReady: boolean
  /** Non-null when initialization fails. */
  error: string | null
  /** Retry initialization after a failure. */
  retry: () => void
}

/**
 * React hook that initializes the LIFF SDK on mount.
 *
 * Returns `{ isReady, error, retry }`. While `isReady` is false,
 * callers should show a loading state. If `error` is set, callers
 * should show an error state with a retry option.
 *
 * When VITE_LIFF_ID is not configured, the hook resolves
 * immediately with `isReady: true` (standalone browser mode).
 */
export function useLiff(): LiffState {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const init = useCallback(async () => {
    setIsReady(false)
    setError(null)

    const success = await initLiff()
    if (success) {
      setIsReady(true)
    } else if (!import.meta.env.VITE_LIFF_ID) {
      // No LIFF_ID configured — run in standalone mode
      setIsReady(true)
    } else {
      setError("ไม่สามารถเชื่อมต่อกับ LINE ได้ กรุณาลองอีกครั้ง")
    }
  }, [])

  useEffect(() => {
    void init()
  }, [init])

  const retry = useCallback(() => {
    void init()
  }, [init])

  return { isReady, error, retry }
}

// ─────────────────────────────────────────────────────────────
// LiffGate Component
// ─────────────────────────────────────────────────────────────

interface LiffGateProps {
  children: React.ReactNode
}

/**
 * Gates rendering children behind LIFF initialization.
 *
 * Shows a centered loading spinner while LIFF is initializing,
 * or an error state with a retry button if initialization fails.
 * Once ready, renders children normally.
 */
export function LiffGate({ children }: LiffGateProps) {
  const { isReady, error, retry } = useLiff()

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-4xl">⚠️</div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={retry}>
          ลองอีกครั้ง
        </Button>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
