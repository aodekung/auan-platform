import { MapPin, Clock, Phone } from "lucide-react"

import { Card, CardContent } from "../components/ui/card"
import { useStoreSettings, useBusinessHours } from "../hooks/use-settings"
import { ErrorState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"

const THAI_DAYS: Record<string, string> = {
  monday: "วันจันทร์",
  tuesday: "วันอังคาร",
  wednesday: "วันพุธ",
  thursday: "วันพฤหัสบดี",
  friday: "วันศุกร์",
  saturday: "วันเสาร์",
  sunday: "วันอาทิตย์",
}

export function StorePage() {
  const { data: store, error: storeError, refetch: refetchStore } = useStoreSettings()
  const { data: hours, error: hoursError, refetch: refetchHours } = useBusinessHours()

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <h1 className="text-xl font-bold">🏪 ข้อมูลร้าน</h1>

        {(storeError || hoursError) && (
          <ErrorState
            message="ไม่สามารถโหลดข้อมูลร้านได้"
            onRetry={() => {
              void refetchStore()
              void refetchHours()
            }}
          />
        )}

        {/* Store Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <h2 className="text-lg font-bold">{store?.name ?? "อ้วนอ้วนหม่าล่าทอด"}</h2>
              {store?.description && (
                <p className="text-sm text-muted-foreground">{store.description}</p>
              )}
            </div>

            {store?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>{store.phone}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>คอนโดมิเนียม The Regent Home Bangson</span>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium">🚚 เขตจัดส่ง</p>
              <p className="text-muted-foreground">Phase 27 & 28 — ตึก A, B, C, D เท่านั้น</p>
              <p className="mt-1 text-green-600 text-xs">จัดส่งฟรี ไม่มีขั้นต่ำ</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        {hours && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">เวลาทำการ</h2>
              </div>

              {hours.temporaryClosure.enabled && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-2 text-center text-sm text-destructive">
                  <p className="font-medium">ปิดชั่วคราว</p>
                  {hours.temporaryClosure.reason && (
                    <p className="text-xs">{hours.temporaryClosure.reason}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                {hours.schedule.map((day) => (
                  <div
                    key={day.day}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {THAI_DAYS[day.day] ?? day.day}
                    </span>
                    <span className="font-medium">
                      {day.open} – {day.close}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
}
