import { useState, useCallback, useMemo } from "react"
import { FileText, Inbox } from "lucide-react"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable, type Column } from "@/components/admin/data-table"
import { AUDIT_ACTION } from "@/api"
import type { AuditLogResponse, AuditAction } from "@/api"

// ─────────────────────────────────────────────
// Action label mapping (Thai)
// ─────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTION.ORDER_CREATED]: "สร้างออเดอร์",
  [AUDIT_ACTION.ORDER_STATUS_CHANGED]: "เปลี่ยนสถานะออเดอร์",
  [AUDIT_ACTION.ORDER_CANCELLED]: "ยกเลิกออเดอร์",
  [AUDIT_ACTION.PAYMENT_SUBMITTED]: "ส่งหลักฐานชำระเงิน",
  [AUDIT_ACTION.PAYMENT_VERIFIED]: "ยืนยันการชำระเงิน",
  [AUDIT_ACTION.PAYMENT_REJECTED]: "ปฏิเสธการชำระเงิน",
  [AUDIT_ACTION.PRODUCT_CREATED]: "สร้างสินค้า",
  [AUDIT_ACTION.PRODUCT_UPDATED]: "แก้ไขสินค้า",
  [AUDIT_ACTION.PRODUCT_DELETED]: "ลบสินค้า",
  [AUDIT_ACTION.CUSTOMER_DISABLED]: "ระงับลูกค้า",
  [AUDIT_ACTION.CUSTOMER_ENABLED]: "เปิดใช้ลูกค้า",
  [AUDIT_ACTION.STAFF_CREATED]: "สร้างพนักงาน",
  [AUDIT_ACTION.STAFF_UPDATED]: "แก้ไขพนักงาน",
  [AUDIT_ACTION.STAFF_DISABLED]: "ระงับพนักงาน",
  [AUDIT_ACTION.STAFF_ENABLED]: "เปิดใช้พนักงาน",
  [AUDIT_ACTION.STAFF_PASSWORD_RESET]: "รีเซ็ตรหัสผ่านพนักงาน",
  [AUDIT_ACTION.SETTING_UPDATED]: "แก้ไขการตั้งค่า",
  [AUDIT_ACTION.SETTING_RESET]: "รีเซ็ตการตั้งค่า",
  [AUDIT_ACTION.LOGIN]: "เข้าสู่ระบบ",
  [AUDIT_ACTION.LOGOUT]: "ออกจากระบบ",
}

const ACTION_OPTIONS = Object.entries(AUDIT_ACTION).map(([key, value]) => ({
  key,
  value: value as string,
  label: ACTION_LABELS[value] || key,
}))

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatThaiDate(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

// ─────────────────────────────────────────────
// AuditLogsPage
// ─────────────────────────────────────────────

export function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filters = useMemo(
    () => ({
      page,
      pageSize: 20,
      action: actionFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [page, actionFilter, startDate, endDate],
  )

  const { data, isLoading, isError, error, refetch } = useAuditLogs(filters)

  const handleActionFilter = useCallback((value: string) => {
    setActionFilter(value)
    setPage(1)
  }, [])

  const handleDateFilter = useCallback(() => {
    setPage(1)
  }, [])

  const handleClearFilters = useCallback(() => {
    setActionFilter("")
    setStartDate("")
    setEndDate("")
    setPage(1)
  }, [])

  const columns = useMemo<Column<AuditLogResponse>[]>(
    () => [
      {
        key: "index",
        header: "#",
        className: "w-12",
        render: (_row, rowIndex) => (
          <span className="text-muted-foreground">{(page - 1) * 20 + rowIndex + 1}</span>
        ),
      },
      {
        key: "action",
        header: "การกระทำ",
        render: (row) => (
          <Badge variant="outline">
            {ACTION_LABELS[row.action] || row.action}
          </Badge>
        ),
      },
      {
        key: "entityType",
        header: "ประเภท",
        render: (row) => (
          <span className="text-sm text-muted-foreground">{row.entityType || "—"}</span>
        ),
      },
      {
        key: "actorId",
        header: "ผู้ดำเนินการ",
        render: (row) => (
          <span className="text-sm text-muted-foreground">{row.actorId || "—"}</span>
        ),
      },
      {
        key: "details",
        header: "รายละเอียด",
        render: (row) => {
          if (!row.details) return <span className="text-sm text-muted-foreground">—</span>
          try {
            return (
              <span className="text-xs text-muted-foreground max-w-[200px] truncate block">
                {JSON.stringify(row.details)}
              </span>
            )
          } catch {
            return <span className="text-sm text-muted-foreground">—</span>
          }
        },
      },
      {
        key: "createdAt",
        header: "เวลา",
        render: (row) => (
          <span className="text-muted-foreground text-xs">{formatThaiDate(row.createdAt)}</span>
        ),
      },
    ],
    [page],
  )

  if (isLoading) {
    return <AuditLogsLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="บันทึกการใช้งาน" description="ดูบันทึกกิจกรรมทั้งหมดในระบบ" />
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลได้"
          description={error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <PageHeader title="บันทึกการใช้งาน" description="ดูบันทึกกิจกรรมทั้งหมดในระบบ" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Action filter */}
        <select
          value={actionFilter}
          onChange={(e) => handleActionFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">ทุกการกระทำ</option>
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); handleDateFilter() }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="จากวันที่"
        />
        <span className="text-sm text-muted-foreground">ถึง</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); handleDateFilter() }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="ถึงวันที่"
        />

        {/* Clear filters */}
        {(actionFilter || startDate || endDate) && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      {/* Table */}
      {data.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="ไม่มีบันทึกกิจกรรม"
          description="ยังไม่มีบันทึกกิจกรรมในระบบ หรือไม่พบบันทึกที่ตรงกับเงื่อนไข"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          emptyMessage="ไม่พบบันทึกกิจกรรม"
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────

function AuditLogsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-4 self-center" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b px-4 py-3 flex gap-4">
            {Array.from({ length: 6 }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
