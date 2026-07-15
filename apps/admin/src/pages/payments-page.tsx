import { useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { CreditCard, CheckCircle2, XCircle, Eye, Inbox } from "lucide-react"
import { usePayments, useVerifyPayment, useRejectPayment } from "@/hooks/use-payments"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { AlertDialogBox } from "@/components/ui/dialog"
import { DataTable, type Column } from "@/components/admin/data-table"
import { PaymentStatusBadge } from "@/components/admin/status-badge"
import type { PaymentResponse, PaymentStatus } from "@/api"
import { cn } from "@auan/ui"

// ─────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────

type FilterTab = { key: string; label: string; value?: string }

const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "awaiting", label: "รอตรวจสอบ", value: "AWAITING_VERIFICATION" },
  { key: "paid", label: "ชำระแล้ว", value: "PAID" },
  { key: "rejected", label: "ปฏิเสธ", value: "REJECTED" },
]

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

function formatCurrency(amount: number): string {
  return `฿${amount.toFixed(2)}`
}

// ─────────────────────────────────────────────
// PaymentsPage
// ─────────────────────────────────────────────

export function PaymentsPage() {
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")

  // Reject dialog state
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  // Verify confirmation state
  const [verifyOpen, setVerifyOpen] = useState(false)
  const [verifyPaymentId, setVerifyPaymentId] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      page,
      pageSize: 10,
      status: activeTab !== "all" ? FILTER_TABS.find((t) => t.key === activeTab)?.value : undefined,
    }),
    [page, activeTab],
  )

  const { data, isLoading, isError, error, refetch } = usePayments(filters)
  const verifyMutation = useVerifyPayment()
  const rejectMutation = useRejectPayment()

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key)
    setPage(1)
  }, [])

  const handleVerify = (paymentId: string) => {
    setVerifyPaymentId(paymentId)
    setVerifyOpen(true)
  }

  const confirmVerify = () => {
    if (!verifyPaymentId) return
    verifyMutation.mutate(verifyPaymentId, {
      onSuccess: () => {
        setVerifyOpen(false)
        setVerifyPaymentId(null)
      },
    })
  }

  const handleReject = (paymentId: string) => {
    setRejectPaymentId(paymentId)
    setRejectReason("")
    setRejectOpen(true)
  }

  const confirmReject = () => {
    if (!rejectPaymentId) return
    rejectMutation.mutate(
      { paymentId: rejectPaymentId, reason: rejectReason || undefined },
      {
        onSuccess: () => {
          setRejectOpen(false)
          setRejectPaymentId(null)
          setRejectReason("")
        },
      },
    )
  }

  const columns = useMemo<Column<PaymentResponse>[]>(
    () => [
      {
        key: "index",
        header: "#",
        className: "w-12",
        render: (_row, rowIndex) => (
          <span className="text-muted-foreground">{(page - 1) * 10 + rowIndex + 1}</span>
        ),
      },
      {
        key: "orderId",
        header: "ออเดอร์",
        render: (row) => (
          <Link
            to={`/orders/${row.orderId}`}
            className="font-medium text-primary hover:underline"
          >
            {row.orderId}
          </Link>
        ),
      },
      {
        key: "amount",
        header: "จำนวนเงิน",
        render: (row) => (
          <span className="tabular-nums font-medium">{formatCurrency(Number(row.amount))}</span>
        ),
      },
      {
        key: "paymentStatus",
        header: "สถานะ",
        render: (row) => (
          <PaymentStatusBadge status={row.paymentStatus as PaymentStatus} />
        ),
      },
      {
        key: "slipImage",
        header: "สลิป",
        render: (row) =>
          row.slipImage ? (
            <img
              src={row.slipImage}
              alt="Payment slip"
              className="h-10 w-10 rounded-md border object-cover"
            />
          ) : (
            <span className="text-sm text-muted-foreground">ไม่มี</span>
          ),
      },
      {
        key: "createdAt",
        header: "เวลา",
        render: (row) => (
          <span className="text-muted-foreground text-xs">{formatThaiDate(row.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        header: "จัดการ",
        className: "w-48",
        render: (row) => (
          <div className="flex items-center gap-2">
            {row.paymentStatus === "AWAITING_VERIFICATION" ? (
              <>
                <Button
                  size="sm"
                  onClick={() => handleVerify(row.id)}
                  isLoading={verifyMutation.isPending && verifyPaymentId === row.id}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  ยืนยัน
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(row.id)}
                >
                  <XCircle className="h-4 w-4" />
                  ปฏิเสธ
                </Button>
              </>
            ) : (
              <Button asChild size="sm" variant="outline">
                <Link to={`/orders/${row.orderId}`}>
                  <Eye className="h-4 w-4" />
                  ดู
                </Link>
              </Button>
            )}
          </div>
        ),
      },
    ],
    [page, verifyMutation.isPending, verifyPaymentId],
  )

  if (isLoading) {
    return <PaymentsLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="ตรวจสอบการชำระเงิน"
          description="ยืนยันหรือปฏิเสธการชำระเงิน"
        />
        <EmptyState
          icon={<CreditCard className="h-12 w-12" />}
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
      <PageHeader
        title="ตรวจสอบการชำระเงิน"
        description="ยืนยันหรือปฏิเสธการชำระเงิน"
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={activeTab === tab.key ? "default" : "outline"}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {data.data.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="ไม่มีรายการชำระเงิน"
          description="ยังไม่มีรายการชำระเงินในระบบ หรือไม่พบรายการที่ตรงกับเงื่อนไข"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data.data}
          pagination={data.pagination}
          onPageChange={setPage}
          emptyMessage="ไม่พบรายการชำระเงิน"
        />
      )}

      {/* Verify confirmation */}
      <AlertDialogBox
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        title="ยืนยันการชำระเงิน"
        description="ต้องการยืนยันรายการชำระเงินรายการนี้?"
        cancel={
          <Button variant="outline" onClick={() => setVerifyOpen(false)}>
            ยกเลิก
          </Button>
        }
        action={
          <Button onClick={confirmVerify} isLoading={verifyMutation.isPending}>
            ยืนยัน
          </Button>
        }
      />

      {/* Reject dialog with reason */}
      <Dialog open={rejectOpen} onOpenChange={(open) => {
        setRejectOpen(open)
        if (!open) {
          setRejectPaymentId(null)
          setRejectReason("")
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธการชำระเงิน</DialogTitle>
            <DialogDescription>กรุณาระบุเหตุผลในการปฏิเสธ (ไม่จำเป็น)</DialogDescription>
          </DialogHeader>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="เหตุผลในการปฏิเสธ..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectOpen(false)
              setRejectPaymentId(null)
              setRejectReason("")
            }}>
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              isLoading={rejectMutation.isPending}
            >
              ปฏิเสธ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────

function PaymentsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>

      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3 flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b px-4 py-3 flex gap-4">
            {Array.from({ length: 7 }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
