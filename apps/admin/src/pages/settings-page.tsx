import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Settings,
  Store,
  Clock,
  CreditCard,
  Truck,
  Bell,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react"
import {
  useSettingsByCategory,
  useBusinessHours,
  useUpdateSettings,
} from "@/hooks/use-settings"
import type { SettingItem } from "@/hooks/use-settings"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const THAI_DAYS = [
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
  "อาทิตย์",
] as const

const EN_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const

const STORE_FIELDS: Array<{
  key: string
  label: string
  placeholder?: string
  type?: string
}> = [
  { key: "store.name", label: "ชื่อร้าน", placeholder: "เช่น ร้านอาหาร Auan Auan" },
  { key: "store.name_en", label: "ชื่อร้าน (EN)", placeholder: "e.g. Auan Auan Restaurant" },
  { key: "store.description", label: "คำอธิบาย", placeholder: "รายละเอียดร้าน" },
  { key: "store.phone", label: "เบอร์โทร", placeholder: "0-000-0000" },
  { key: "store.address", label: "ที่อยู่", placeholder: "ที่อยู่ร้าน" },
  { key: "store.status", label: "สถานะเปิด/ปิด", placeholder: "open / closed" },
]

const PAYMENT_FIELDS: Array<{
  key: string
  label: string
  placeholder?: string
}> = [
  { key: "payment.promptpay_number", label: "PromptPay Number", placeholder: "0XX-XXX-XXXX" },
  { key: "payment.account_name", label: "ชื่อบัญชี", placeholder: "ชื่อเจ้าของบัญชี" },
  { key: "payment.timeout", label: "เวลาหมดอายุการชำระเงิน (นาที)", placeholder: "30" },
]

const DELIVERY_FIELDS: Array<{
  key: string
  label: string
  placeholder?: string
  type?: string
}> = [
  { key: "delivery.fee", label: "ค่าจัดส่ง (บาท)", placeholder: "0" },
  { key: "delivery.min_order", label: "ยอดขั้นต่ำ (บาท)", placeholder: "100" },
  { key: "delivery.estimated_time", label: "เวลาจัดส่งประมาณ (นาที)", placeholder: "30" },
  { key: "delivery.enabled", label: "เปิด/ปิด (enabled)", placeholder: "true / false" },
  { key: "delivery.pickup_enabled", label: "เปิด/ปิดรับเอง (pickup_enabled)", placeholder: "true / false" },
]

const NOTIFICATION_TOGGLES: Array<{
  key: string
  label: string
}> = [
  { key: "notification.enabled", label: "เปิดใช้การแจ้งเตือน" },
  { key: "notification.line_enabled", label: "LINE" },
  { key: "notification.email_enabled", label: "Email" },
  { key: "notification.sms_enabled", label: "SMS" },
  { key: "notification.push_enabled", label: "Push" },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toMap(items: SettingItem[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const item of items) {
    map.set(item.key, item.value)
  }
  return map
}

function getDefault(key: string, map: Map<string, string>): string {
  return map.get(key) ?? ""
}

// ─────────────────────────────────────────────
// Sub-components: Settings Card Skeleton
// ─────────────────────────────────────────────

function SettingsCardSkeleton({ fieldCount }: { fieldCount: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: fieldCount }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Card 1: Store Info
// ─────────────────────────────────────────────

function StoreInfoCard() {
  const { data, isLoading, isError, error } = useSettingsByCategory("store")
  const updateSettings = useUpdateSettings()
  const map = data ? toMap(data) : new Map<string, string>()

  const { register, handleSubmit } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(STORE_FIELDS.map((f) => [f.key, ""])),
  })

  useEffect(() => {
    if (data) {
      STORE_FIELDS.forEach((f) => {
        const el = document.querySelector(`[name="${f.key}"]`) as HTMLInputElement | null
        if (el) el.value = getDefault(f.key, map)
      })
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = () => {
    const formData = new FormData(
      document.querySelector("[data-form=store]") as HTMLFormElement,
    )
    const changed: Array<{ key: string; value: string }> = []
    STORE_FIELDS.forEach((f) => {
      const newVal = formData.get(f.key) as string
      const oldVal = getDefault(f.key, map)
      if (newVal !== oldVal) {
        changed.push({ key: f.key, value: newVal })
      }
    })
    if (changed.length > 0) {
      updateSettings.mutate({ settings: changed })
    }
  }

  if (isLoading) return <SettingsCardSkeleton fieldCount={STORE_FIELDS.length} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          ข้อมูลร้าน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form data-form="store" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {STORE_FIELDS.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              defaultValue={getDefault(field.key, map)}
              {...register(field.key)}
            />
          ))}
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        {isError && (
          <p className="mr-auto flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error?.message}
          </p>
        )}
        <Button
          onClick={() => handleSubmit(onSubmit)()}
          isLoading={updateSettings.isPending}
        >
          <Save className="h-4 w-4" />
          บันทึก
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Card 2: Business Hours
// ─────────────────────────────────────────────

function BusinessHoursCard() {
  const { data, isLoading, isError, error, refetch } = useBusinessHours()
  const updateSettings = useUpdateSettings()

  const [hoursState, setHoursState] = useState<
    Array<{ day: string; open: string; close: string; isOpen: boolean }>
  >([])

  useEffect(() => {
    if (data) {
      setHoursState(
        EN_DAYS.map((enDay, i) => {
          const existing = data.schedule.find((s) => s.day === enDay)
          return {
            day: enDay,
            open: existing?.open ?? "09:00",
            close: existing?.close ?? "21:00",
            isOpen: !!existing,
          }
        }),
      )
    }
  }, [data])

  const handleToggle = (index: number) => {
    setHoursState((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isOpen: !item.isOpen } : item,
      ),
    )
  }

  const handleChange = (
    index: number,
    field: "open" | "close",
    value: string,
  ) => {
    setHoursState((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    )
  }

  const handleSave = () => {
    const settings: Array<{ key: string; value: string }> = []
    for (const entry of hoursState) {
      settings.push({ key: `business_hours.${entry.day}.open`, value: entry.open })
      settings.push({ key: `business_hours.${entry.day}.close`, value: entry.close })
      settings.push({
        key: `business_hours.${entry.day}.is_open`,
        value: String(entry.isOpen),
      })
    }
    updateSettings.mutate(
      { settings },
      {
        onSuccess: () => {
          refetch()
        },
      },
    )
  }

  if (isLoading) {
    return <SettingsCardSkeleton fieldCount={7} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          เวลาทำการ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hoursState.map((entry, index) => (
            <div key={entry.day} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm font-medium text-foreground">
                {THAI_DAYS[index]}
              </span>
              <input
                type="time"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                value={entry.open}
                onChange={(e) => handleChange(index, "open", e.target.value)}
                disabled={!entry.isOpen}
              />
              <span className="text-sm text-muted-foreground">-</span>
              <input
                type="time"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                value={entry.close}
                onChange={(e) => handleChange(index, "close", e.target.value)}
                disabled={!entry.isOpen}
              />
              <Button
                type="button"
                variant={entry.isOpen ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggle(index)}
              >
                {entry.isOpen ? "เปิด" : "ปิด"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        {isError && (
          <p className="mr-auto flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error?.message}
          </p>
        )}
        <Button
          onClick={handleSave}
          isLoading={updateSettings.isPending}
        >
          <Save className="h-4 w-4" />
          บันทึก
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Card 3: Payment
// ─────────────────────────────────────────────

function PaymentCard() {
  const { data, isLoading, isError, error } = useSettingsByCategory("payment")
  const updateSettings = useUpdateSettings()
  const map = data ? toMap(data) : new Map<string, string>()

  const { register, handleSubmit } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(PAYMENT_FIELDS.map((f) => [f.key, ""])),
  })

  useEffect(() => {
    if (data) {
      PAYMENT_FIELDS.forEach((f) => {
        const el = document.querySelector(`[name="${f.key}"]`) as HTMLInputElement | null
        if (el) el.value = getDefault(f.key, map)
      })
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = () => {
    const formData = new FormData(
      document.querySelector("[data-form=payment]") as HTMLFormElement,
    )
    const changed: Array<{ key: string; value: string }> = []
    PAYMENT_FIELDS.forEach((f) => {
      const newVal = formData.get(f.key) as string
      const oldVal = getDefault(f.key, map)
      if (newVal !== oldVal) {
        changed.push({ key: f.key, value: newVal })
      }
    })
    if (changed.length > 0) {
      updateSettings.mutate({ settings: changed })
    }
  }

  if (isLoading) return <SettingsCardSkeleton fieldCount={PAYMENT_FIELDS.length} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          การชำระเงิน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form data-form="payment" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {PAYMENT_FIELDS.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              defaultValue={getDefault(field.key, map)}
              {...register(field.key)}
            />
          ))}
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        {isError && (
          <p className="mr-auto flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error?.message}
          </p>
        )}
        <Button
          onClick={() => handleSubmit(onSubmit)()}
          isLoading={updateSettings.isPending}
        >
          <Save className="h-4 w-4" />
          บันทึก
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Card 4: Delivery
// ─────────────────────────────────────────────

function DeliveryCard() {
  const { data, isLoading, isError, error } = useSettingsByCategory("delivery")
  const updateSettings = useUpdateSettings()
  const map = data ? toMap(data) : new Map<string, string>()

  const { register, handleSubmit } = useForm<Record<string, string>>({
    defaultValues: Object.fromEntries(DELIVERY_FIELDS.map((f) => [f.key, ""])),
  })

  useEffect(() => {
    if (data) {
      DELIVERY_FIELDS.forEach((f) => {
        const el = document.querySelector(`[name="${f.key}"]`) as HTMLInputElement | null
        if (el) el.value = getDefault(f.key, map)
      })
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = () => {
    const formData = new FormData(
      document.querySelector("[data-form=delivery]") as HTMLFormElement,
    )
    const changed: Array<{ key: string; value: string }> = []
    DELIVERY_FIELDS.forEach((f) => {
      const newVal = formData.get(f.key) as string
      const oldVal = getDefault(f.key, map)
      if (newVal !== oldVal) {
        changed.push({ key: f.key, value: newVal })
      }
    })
    if (changed.length > 0) {
      updateSettings.mutate({ settings: changed })
    }
  }

  if (isLoading) return <SettingsCardSkeleton fieldCount={DELIVERY_FIELDS.length} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          การจัดส่ง
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form data-form="delivery" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {DELIVERY_FIELDS.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              defaultValue={getDefault(field.key, map)}
              {...register(field.key)}
            />
          ))}
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        {isError && (
          <p className="mr-auto flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error?.message}
          </p>
        )}
        <Button
          onClick={() => handleSubmit(onSubmit)()}
          isLoading={updateSettings.isPending}
        >
          <Save className="h-4 w-4" />
          บันทึก
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Card 5: Notification
// ─────────────────────────────────────────────

function NotificationCard() {
  const { data, isLoading, isError, error } = useSettingsByCategory("notification")
  const updateSettings = useUpdateSettings()
  const map = data ? toMap(data) : new Map<string, string>()

  const [toggles, setToggles] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (data) {
      const initial: Record<string, boolean> = {}
      NOTIFICATION_TOGGLES.forEach((t) => {
        initial[t.key] = getDefault(t.key, map) === "true"
      })
      setToggles(initial)
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    const settings: Array<{ key: string; value: string }> = []
    NOTIFICATION_TOGGLES.forEach((t) => {
      const newVal = String(toggles[t.key] ?? false)
      const oldVal = getDefault(t.key, map)
      if (newVal !== oldVal) {
        settings.push({ key: t.key, value: newVal })
      }
    })
    if (settings.length > 0) {
      updateSettings.mutate({ settings })
    }
  }

  if (isLoading) return <SettingsCardSkeleton fieldCount={NOTIFICATION_TOGGLES.length} />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          การแจ้งเตือน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {NOTIFICATION_TOGGLES.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between"
            >
              <span className="text-sm font-medium text-foreground">
                {toggle.label}
              </span>
              <Button
                type="button"
                variant={toggles[toggle.key] ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggle(toggle.key)}
              >
                {toggles[toggle.key] ? "เปิด" : "ปิด"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        {isError && (
          <p className="mr-auto flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error?.message}
          </p>
        )}
        <Button
          onClick={handleSave}
          isLoading={updateSettings.isPending}
        >
          <Save className="h-4 w-4" />
          บันทึก
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton for entire page
// ─────────────────────────────────────────────

function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCardSkeleton fieldCount={6} />
        <SettingsCardSkeleton fieldCount={7} />
        <SettingsCardSkeleton fieldCount={3} />
        <SettingsCardSkeleton fieldCount={5} />
      </div>
      <SettingsCardSkeleton fieldCount={5} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export function SettingsPage() {
  // Use the store query as the primary loading/error indicator
  const storeQuery = useSettingsByCategory("store")

  if (storeQuery.isLoading) {
    return <SettingsLoading />
  }

  if (storeQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="ตั้งค่าร้าน" description="จัดการข้อมูลและการตั้งค่าร้าน" />
        <EmptyState
          icon={<AlertCircle className="h-12 w-12" />}
          title="ไม่สามารถโหลดการตั้งค่าได้"
          description={storeQuery.error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => storeQuery.refetch()}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตั้งค่าร้าน"
        description="จัดการข้อมูลและการตั้งค่าร้าน"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <StoreInfoCard />
        <BusinessHoursCard />
        <PaymentCard />
        <DeliveryCard />
      </div>

      <NotificationCard />
    </div>
  )
}
