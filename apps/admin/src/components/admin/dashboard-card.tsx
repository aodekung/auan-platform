import type { LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@auan/ui"
import { Skeleton } from "@/components/ui/skeleton"

const dashboardCardVariants = cva(
  "flex items-center gap-4 rounded-lg border p-4 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        warning: "bg-[var(--warning)]/10 border-[var(--warning)]/20 text-[var(--warning)]",
        success: "bg-[var(--success)]/10 border-[var(--success)]/20 text-[var(--success)]",
        error: "bg-[var(--destructive)]/10 border-[var(--destructive)]/20 text-[var(--destructive)]",
        info: "bg-[var(--info)]/10 border-[var(--info)]/20 text-[var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

interface DashboardCardProps extends VariantProps<typeof dashboardCardVariants> {
  icon: LucideIcon
  label: string
  value: string | number
  className?: string
}

export function DashboardCard({ icon: Icon, label, value, variant, className }: DashboardCardProps) {
  return (
    <div className={cn(dashboardCardVariants({ variant }), className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background/80">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  )
}
