import { useState, useCallback } from "react"
import { Users, Inbox } from "lucide-react"
import { useCustomers } from "@/hooks/use-customers"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable, type Column } from "@/components/admin/data-table"
import { SearchBar } from "@/components/admin/search-bar"
import type { CustomerDetailResponse } from "@/api"

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatThaiDate(dateString: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString))
}

// ─────────────────────────────────────────────
// CustomersPage
// ─────────────────────────────────────────────

export function CustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const filters = {
    page,
    pageSize: 10,
    search: search || undefined,
  }

  const { data, isLoading, isError, error, refetch } = useCustomers(filters)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const columns: Column<CustomerDetailResponse>[] = [
    {
      key: "index",
      header: "#",
      className: "w-12",
      render: (_row, rowIndex) => (
        <span className="text-muted-foreground">{(page - 1) * 10 + rowIndex + 1}</span>
      ),
    },
    {
      key: "displayName",
      header: "ชื่อ",
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.pictureUrl ? (
            <img
              src={row.pictureUrl}
              alt={row.displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              {row.displayName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <span className="font-medium text-foreground">{row.displayName}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "เบอร์โทร",
      render: (row) => (
        <span className="text-muted-foreground text-sm">{row.phone || "—"}</span>
      ),
    },
    {
      key: "totalOrders",
      header: "จำนวนออเดอร์",
      className: "text-center",
      render: (row) => (
        <span className="tabular-nums">{row.totalOrders ?? 0} ออเดอร์</span>
      ),
    },
    {
      key: "totalSpent",
      header: "ยอดรวม",
      className: "text-right",
      render: (row) => (
        <span className="tabular-nums font-medium">
          {row.totalSpent ? `฿${Number(row.totalSpent).toLocaleString()}` : "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "สมัครเมื่อ",
      render: (row) => (
        <span className="text-muted-foreground text-xs">{formatThaiDate(row.createdAt)}</span>
      ),
    },
  ]

  if (isLoading) {
    return <CustomersLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="จัดการลูกค้า" description="ดูและจัดการข้อมูลลูกค้าทั้งหมด" />
        <EmptyState
          icon={<Users className="h-12 w-12" />}
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
      <PageHeader title="จัดการลูกค้า" description="ดูและจัดการข้อมูลลูกค้าทั้งหมด" />

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onSearch={handleSearch}
        placeholder="ค้นหาชื่อลูกค้า..."
      />

      {/* Table */}
      {data.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title="ไม่มีลูกค้า"
          description="ยังไม่มีลูกค้าในระบบ หรือไม่พบลูกค้าที่ตรงกับเงื่อนไข"
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          emptyMessage="ไม่พบลูกค้า"
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────

function CustomersLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <Skeleton className="h-10 w-full max-w-sm rounded-md" />

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
