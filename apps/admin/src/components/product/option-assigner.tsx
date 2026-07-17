import { useState } from "react"
import { Plus, Trash2, Layers, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  useOptionGroups,
  useProductOptionAssignments,
  useAssignOptionGroup,
  useRemoveOptionAssignment,
} from "@/hooks/use-option-templates"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// ─────────────────────────────────────────────
// OptionAssigner
// ─────────────────────────────────────────────

interface OptionAssignerProps {
  productId: string
}

export function OptionAssigner({ productId }: OptionAssignerProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("")

  const groupsQuery = useOptionGroups()
  const assignmentsQuery = useProductOptionAssignments(productId)
  const assignGroup = useAssignOptionGroup()
  const removeAssignment = useRemoveOptionAssignment()

  const assignedGroupIds = new Set(
    (assignmentsQuery.data ?? []).map((a) => a.optionGroupId),
  )

  const unassignedGroups = (groupsQuery.data ?? []).filter(
    (g) => !assignedGroupIds.has(g.id),
  )

  const assignments = assignmentsQuery.data ?? []

  const handleAssign = async () => {
    if (!selectedGroupId) return
    await assignGroup.mutateAsync({ productId, optionGroupId: selectedGroupId })
    toast.success("เพิ่มกลุ่มตัวเลือกสำเร็จ")
    setSelectedGroupId("")
  }

  const handleRemove = async (groupId: string) => {
    await removeAssignment.mutateAsync({ productId, groupId })
    toast.success("ลบกลุ่มตัวเลือกสำเร็จ")
  }

  const isLoading =
    groupsQuery.isLoading || assignmentsQuery.isLoading

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Assigned groups */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">
          กลุ่มที่เลือกไว้
        </h4>
        {assignments.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            ยังไม่ได้เลือกกลุ่มตัวเลือก
          </p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{a.optionGroupName}</span>
                  {a.required && <Badge variant="warning">จำเป็น</Badge>}
                  {a.multiple && <Badge variant="info">หลายตัวเลือก</Badge>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-7 w-7 p-0"
                  isLoading={removeAssignment.isPending}
                  onClick={() => handleRemove(a.optionGroupId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add group dropdown */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">
          เพิ่มกลุ่ม
        </h4>
        {unassignedGroups.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            เพิ่มกลุ่มตัวเลือกที่หน้า "ตัวเลือกพิเศษ" ก่อน
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="flex h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">เลือกกลุ่ม...</option>
              {unassignedGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              disabled={!selectedGroupId}
              isLoading={assignGroup.isPending}
              onClick={handleAssign}
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่ม
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
