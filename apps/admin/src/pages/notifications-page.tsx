import { Bell, BellOff } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"

// ─────────────────────────────────────────────
// NotificationsPage
// ─────────────────────────────────────────────

export function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="การแจ้งเตือน" description="ดูและส่งการแจ้งเตือนไปยังลูกค้า" />

      <EmptyState
        icon={<BellOff className="h-12 w-12" />}
        title="ยังไม่มีการแจ้งเตือน"
        description="การแจ้งเตือนจะแสดงที่นี่เมื่อมีการส่งไปยังลูกค้า สามารถส่งการแจ้งเตือนผ่านหน้าจัดการได้เฉพาะเจ้าของร้านเท่านั้น"
      />
    </div>
  )
}
