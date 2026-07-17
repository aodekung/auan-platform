import { LayoutGrid, List } from "lucide-react"
import { cn } from "../../lib/utils"

type ViewMode = "grid" | "list"

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-md border bg-muted p-0.5">
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "rounded px-2 py-1 text-xs transition-colors",
          value === "grid" ? "bg-background shadow-sm" : "text-muted-foreground"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "rounded px-2 py-1 text-xs transition-colors",
          value === "list" ? "bg-background shadow-sm" : "text-muted-foreground"
        )}
      >
        <List className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export type { ViewMode }
