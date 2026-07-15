import { useEffect, useState } from "react"

import { cn } from "../../lib/utils"

interface PaymentCountdownProps {
  createdAt: string // ISO string
  timeoutSeconds?: number
  onExpired?: () => void
}

export function PaymentCountdown({
  createdAt,
  timeoutSeconds = 300,
  onExpired,
}: PaymentCountdownProps) {
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
    return Math.max(0, timeoutSeconds - elapsed)
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpired?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [createdAt, timeoutSeconds, onExpired])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  const isUrgent = remaining < 60

  return (
    <div className="text-center">
      <p className={cn(
        "font-mono text-2xl font-bold tabular-nums",
        isUrgent ? "text-destructive" : "text-foreground",
      )}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>
      <p className="text-xs text-muted-foreground">
        {isUrgent ? "เหลือเวลาน้อย!" : "นาทีที่เหลือในการชำระเงิน"}
      </p>
    </div>
  )
}
