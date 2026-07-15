import {
  ShoppingCart,
  Clock,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  CalendarDays,
  Flame,
  Hash,
} from "lucide-react"
import { useDashboard } from "@/hooks/use-dashboard"
import { DashboardCard, DashboardCardSkeleton } from "@/components/admin/dashboard-card"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@auan/ui"
import { Button } from "@/components/ui/button"

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard()

  if (isLoading) {
    return <DashboardLoading />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="ภาพรวมร้านวันนี้" />
        <EmptyState
          icon={<Flame className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลได้"
          description={error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={<Button variant="outline" onClick={() => refetch()}>ลองอีกครั้ง</Button>}
        />
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="ภาพรวมร้านวันนี้" />

      {/* Row 1: Order Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          icon={ShoppingCart}
          label="Today's Orders"
          value={data.todayOrders}
          variant="default"
        />
        <DashboardCard
          icon={Clock}
          label="Pending Payment"
          value={data.pendingOrders}
          variant="warning"
        />
        <DashboardCard
          icon={ChefHat}
          label="Preparing"
          value={data.preparingOrders}
          variant="info"
        />
        <DashboardCard
          icon={PackageCheck}
          label="Ready"
          value={0}
          variant="success"
        />
        <DashboardCard
          icon={CheckCircle2}
          label="Completed"
          value={data.completedOrders}
          variant="success"
        />
        <DashboardCard
          icon={XCircle}
          label="Cancelled"
          value={data.cancelledOrders}
          variant="error"
        />
      </div>

      {/* Row 2: Revenue */}
      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          icon={TrendingUp}
          label="Today"
          value={`฿${data.revenue.today.toLocaleString()}`}
          variant="default"
        />
        <DashboardCard
          icon={CalendarDays}
          label="This Week"
          value={`฿${data.revenue.thisWeek.toLocaleString()}`}
          variant="default"
        />
        <DashboardCard
          icon={DollarSign}
          label="This Month"
          value={`฿${data.revenue.thisMonth.toLocaleString()}`}
          variant="default"
        />
      </div>

      {/* Row 3: Popular Products + Stats */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Popular Products */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Popular Products</h2>
          {data.popularProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            <ul className="space-y-3">
              {data.popularProducts.map((product, index) => (
                <li key={product.productId} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-foreground">
                    {product.productName}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground">
                    {product.totalQuantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-xs">Active Customers</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums">{data.activeCustomers}</p>
            </div>
            <div className="rounded-md bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-xs">Total Products</span>
              </div>
              <p className="mt-1 text-xl font-bold tabular-nums">—</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled>ดูออเดอร์ทั้งหมด</Button>
        <Button variant="outline" disabled>ตรวจสอบการชำระเงิน</Button>
        <Button variant="outline" disabled>จัดการเมนู</Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
