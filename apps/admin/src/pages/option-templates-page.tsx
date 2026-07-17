import { useState, type FormEvent } from "react"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Flame,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"
import {
  useOptionGroups,
  useCreateOptionGroup,
  useDeleteOptionGroup,
  useCreateOption,
  useDeleteOption,
} from "@/hooks/use-option-templates"
import type { OptionGroupTemplate } from "@/hooks/use-option-templates"
import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertDialogBox } from "@/components/ui/dialog"
import { cn } from "@auan/ui"

// ─────────────────────────────────────────────
// InlinePriceInput
// ─────────────────────────────────────────────

function InlinePriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        ฿
      </span>
      <input
        type="number"
        min="0"
        step="0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "0"}
        className="flex h-8 w-24 rounded-md border border-input bg-background pl-5 pr-2 text-xs tabular-nums ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// OptionGroupCard
// ─────────────────────────────────────────────

function OptionGroupCard({
  group,
  onCreateOption,
  onDeleteOption,
  onDeleteGroup,
  isCreating,
  isDeletingOption,
}: {
  group: OptionGroupTemplate
  onCreateOption: (groupId: string, name: string, price: string) => void
  onDeleteOption: (groupId: string, optionId: string) => void
  onDeleteGroup: (group: OptionGroupTemplate) => void
  isCreating: boolean
  isDeletingOption: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const [newOptName, setNewOptName] = useState("")
  const [newOptPrice, setNewOptPrice] = useState("0")

  const handleAddOption = (e: FormEvent) => {
    e.preventDefault()
    if (!newOptName.trim()) return
    onCreateOption(group.id, newOptName.trim(), newOptPrice)
    setNewOptName("")
    setNewOptPrice("0")
  }

  return (
    <div className="rounded-lg border bg-card">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium text-foreground">{group.name}</span>
          <Badge variant="outline">{group.options.length} ตัวเลือก</Badge>
          {group.required && <Badge variant="warning">จำเป็น</Badge>}
          {group.multiple && <Badge variant="info">หลายตัวเลือก</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteGroup(group)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded options */}
      {expanded && (
        <div className="border-t px-4 py-3 space-y-2">
          {group.options.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              ยังไม่มีตัวเลือกในกลุ่มนี้
            </p>
          )}
          {group.options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">{opt.name}</span>
                {Number(opt.additionalPrice) > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    +฿{Number(opt.additionalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive h-7 w-7 p-0"
                isLoading={isDeletingOption === opt.id}
                onClick={() => onDeleteOption(group.id, opt.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {/* Add option inline */}
          <form
            onSubmit={handleAddOption}
            className="flex items-center gap-2 pt-2 border-t border-border/50"
          >
            <input
              type="text"
              value={newOptName}
              onChange={(e) => setNewOptName(e.target.value)}
              placeholder="ชื่อตัวเลือก"
              required
              className="flex h-8 flex-1 rounded-md border border-input bg-background px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <InlinePriceInput
              value={newOptPrice}
              onChange={setNewOptPrice}
            />
            <Button
              type="submit"
              size="sm"
              className="h-8"
              disabled={!newOptName.trim()}
              isLoading={isCreating}
            >
              <Plus className="h-3.5 w-3.5" />
              เพิ่ม
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// OptionTemplatesPage
// ─────────────────────────────────────────────

export function OptionTemplatesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState<OptionGroupTemplate | null>(null)

  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupRequired, setNewGroupRequired] = useState(false)
  const [newGroupMultiple, setNewGroupMultiple] = useState(false)

  const groupsQuery = useOptionGroups()
  const createGroup = useCreateOptionGroup()
  const deleteGroup = useDeleteOptionGroup()
  const createOption = useCreateOption()
  const deleteOption = useDeleteOption()

  const [deletingOptionId, setDeletingOptionId] = useState<string | null>(null)

  const handleCreateGroup = async (e: FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    await createGroup.mutateAsync({
      name: newGroupName.trim(),
      required: newGroupRequired,
      multiple: newGroupMultiple,
    })
    toast.success("เพิ่มกลุ่มตัวเลือกสำเร็จ")
    setNewGroupName("")
    setNewGroupRequired(false)
    setNewGroupMultiple(false)
  }

  const handleCreateOption = async (
    groupId: string,
    name: string,
    price: string,
  ) => {
    await createOption.mutateAsync({
      groupId,
      name,
      additionalPrice: price,
    })
    toast.success("เพิ่มตัวเลือกสำเร็จ")
  }

  const handleDeleteOption = async (groupId: string, optionId: string) => {
    setDeletingOptionId(optionId)
    try {
      await deleteOption.mutateAsync({ groupId, id: optionId })
      toast.success("ลบตัวเลือกสำเร็จ")
    } finally {
      setDeletingOptionId(null)
    }
  }

  const openDeleteGroupDialog = (group: OptionGroupTemplate) => {
    setDeletingGroup(group)
    setDeleteDialogOpen(true)
  }

  const handleDeleteGroup = async () => {
    if (!deletingGroup) return
    await deleteGroup.mutateAsync({ id: deletingGroup.id })
    toast.success("ลบกลุ่มตัวเลือกสำเร็จ")
    setDeleteDialogOpen(false)
    setDeletingGroup(null)
  }

  if (groupsQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="ตัวเลือกพิเศษ"
          description="จัดการกลุ่มตัวเลือกที่ใช้ร่วมกันทั้งร้าน"
        />
        <EmptyState
          icon={<AlertCircle className="h-12 w-12" />}
          title="ไม่สามารถโหลดข้อมูลได้"
          description={groupsQuery.error?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"}
          action={
            <Button variant="outline" onClick={() => groupsQuery.refetch()}>
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    )
  }

  const groups = groupsQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตัวเลือกพิเศษ"
        description="จัดการกลุ่มตัวเลือกที่ใช้ร่วมกันทั้งร้าน"
      />

      {/* Group cards */}
      {groupsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-12 w-12" />}
          title="ยังไม่มีกลุ่มตัวเลือก"
          description="เพิ่มกลุ่มตัวเลือกที่ใช้ร่วมกันทั้วไป เช่น ขนาด ความหวาน ระดับเผ็ด"
        />
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <OptionGroupCard
              key={group.id}
              group={group}
              onCreateOption={handleCreateOption}
              onDeleteOption={handleDeleteOption}
              onDeleteGroup={openDeleteGroupDialog}
              isCreating={createOption.isPending}
              isDeletingOption={deletingOptionId}
            />
          ))}
        </div>
      )}

      {/* Create new group section */}
      <div className="rounded-lg border border-dashed bg-card p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">
          เพิ่มกลุ่มใหม่
        </h3>
        <form onSubmit={handleCreateGroup} className="space-y-3">
          <Input
            placeholder="เช่น ขนาด, ความหวาน, ระดับเผ็ด"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newGroupRequired}
                onChange={(e) => setNewGroupRequired(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              จำเป็นต้องเลือก
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={newGroupMultiple}
                onChange={(e) => setNewGroupMultiple(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              เลือกหลายรายการ
            </label>
          </div>
          <Button
            type="submit"
            disabled={!newGroupName.trim()}
            isLoading={createGroup.isPending}
          >
            <Plus className="h-4 w-4" />
            เพิ่มกลุ่ม
          </Button>
        </form>
      </div>

      {/* Delete group confirmation */}
      <AlertDialogBox
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="ลบกลุ่มตัวเลือก"
        description={`คุณต้องการลบกลุ่ม "${deletingGroup?.name}" หรือไม่? ตัวเลือกทั้งหมดในกลุ่มจะถูกลบด้วย`}
        action={
          <Button
            variant="destructive"
            isLoading={deleteGroup.isPending}
            onClick={handleDeleteGroup}
          >
            ลบ
          </Button>
        }
        cancel={
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            ยกเลิก
          </Button>
        }
      />
    </div>
  )
}
