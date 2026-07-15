import type { OptionGroupResponse } from "../../api"

interface OptionSelectorProps {
  group: OptionGroupResponse
  selectedOptionId: string | null
  onSelect: (groupId: string, optionId: string, optionName: string, additionalPrice: number) => void
}

export function OptionSelector({ group, selectedOptionId, onSelect }: OptionSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">{group.name}</h3>
        {group.required && (
          <span className="text-xs text-destructive">*</span>
        )}
      </div>

      <div className="space-y-1.5">
        {group.options.map((option) => {
          const isSelected = selectedOptionId === option.id
          const priceLabel =
            Number(option.additionalPrice) > 0
              ? `+฿${Number(option.additionalPrice).toLocaleString()}`
              : ""

          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name={group.id}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(group.id, option.id, option.name, Number(option.additionalPrice))}
                className="h-4 w-4 accent-primary"
              />
              <span className="flex-1 text-sm">{option.name}</span>
              {priceLabel && (
                <span className="text-xs text-muted-foreground">{priceLabel}</span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}
