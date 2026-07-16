import { useNavigate } from "react-router-dom"
import { MapPin, Clock, Phone, ChevronLeft } from "lucide-react"

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
  const navigate = useNavigate()
  const { data: store, error: storeError, refetch: refetchStore } = useStoreSettings()
  const { data: hours, error: hoursError, refetch: refetchHours } = useBusinessHours()

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">ข้อมูลร้าน</h1>
        </div>

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

        {/* Google Maps Embed */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">แผนที่ร้าน</h2>
            </div>
            <div className="overflow-hidden rounded-lg">
              <iframe
                title="แผนที่ร้านอ้วนอ้วนหม่าล่าทอด"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.8!2d100.63!3d13.82!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z4oCY4oCc4oCZ4oCc4oCa4oCY4oCc4oCb4oCY!5e0!3m2!1sth!2sth!4v1"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
