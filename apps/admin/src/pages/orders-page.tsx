import { useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { ShoppingCart, Eye, Inbox } from "lucide-react"
import { useOrders } from "@/hooks/use-orders"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable, type Column } from "@/components/admin/data-table"
import { SearchBar } from "@/components/admin/search-bar"
import { OrderStatusBadge } from "@/components/admin/status-badge"
import type { OrderListItemResponse, OrderStatus } from "@/api"
import { cn } from "@auan/ui"

// ─────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────

type FilterTab = { key: string; label: string; value?: string }

const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอชำระเงิน", value: "PENDING" },
  { key: "preparing", label: "กำลังทำ", value: "PREPARING" },
  { key: "ready", label: "พร้อม", value: "READY" },
  { key: "completed", label: "เสร็จสิ้น", value: "COMPLETED" },
  { key: "cancelled", label: "ยกเลิก", value: "CANCELLED" },
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
// OrdersPage
// ─────────────────────────────────────────────

export function OrdersPage() {
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  const filters = useMemo(
    () => ({
      page,
      pageSize: 10,
      status: activeTab !== "all" ? FILTER_TABS.find((t) => t.key === activeTab)?.value : undefined,
      search: search || undefined,
    }),
    [page, activeTab, search],
  )

  const { data, isLoading, isError, error, refetch } = useOrders(filters)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key)
    setPage(1)
  }, [])

  const columns = useMemo<Column<OrderListItemResponse>[]>(
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
        key: "orderNumber",
        header: "หมายเลขออเดอร์",
        render: (row) => (
          <span className="font-medium text-foreground">{row.orderNumber}</span>
        ),
      },
      {
        key: "orderStatus",
        header: "สถานะ",
        render: (row) => (
          <OrderStatusBadge status={row.orderStatus as OrderStatus} />
        ),
      },
      {
        key: "itemCount",
        header: "รายการ",
        render: (row) => (
          <span className="tabular-nums">{row.itemCount} รายการ</span>
        ),
      },
      {
        key: "total",
        header: "ยอดรวม",
        render: (row) => (
          <span className="tabular-nums font-medium">{formatCurrency(Number(row.total))}</span>
        ),
      },
      {
        key: "createdAt",
        header: "สร้างเมื่อ",
        render: (row) => (
          <span className="text-muted-foreground text-xs">{formatThaiDate(row.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        header: "จัดการ",
        className: "w-24",
        render: (row) => (
          <Button asChild size="sm" variant="outline">
            <Link to={`/orders/${row.id}`}>
              <Eye className="h-4 w-4" />
              ดูรายละเอียด
            </Link>
          </Button>
        ),
      },
    ],
    [page],
  )

  if (isLoading) {
    return <OrdersLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="จัดการออเดอร์" description="ดูและจัดการออเดอร์ทั้งหมด" />
        <EmptyState
          icon={<ShoppingCart className="h-12 w-12" />}
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
      <PageHeader title="จัดการออเดอร์" description="ดูและจัดการออเดอร์ทั้งหมด" />

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

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
        placeholder="ค้นหาหมายเลขออเดอร์..."
      />

      {/* Table */}
      {data.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="ไม่มีออเดอร์"
          description="ยังไม่มีออเดอร์ในระบบ หรือไม่พบออเดอร์ที่ตรงกับเงื่อนไข"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          emptyMessage="ไม่พบออเดอร์"
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────

function OrdersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      <Skeleton className="h-10 w-full max-w-sm rounded-md" />

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
