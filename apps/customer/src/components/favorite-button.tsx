import { Heart } from "lucide-react"

import { useAuth } from "../providers/auth-provider"
import { useIsFavorited, useToggleFavorite } from "../hooks/use-favorites"

import { cn } from "../lib/utils"

interface FavoriteButtonProps {
  productId: string
  className?: string
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const { data: isFavorited = false } = useIsFavorited(productId)
  const toggleFavorite = useToggleFavorite()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) return

    toggleFavorite.mutate({ productId, isFavorited })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAuthenticated || toggleFavorite.isPending}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-muted/50 disabled:opacity-50",
        className,
      )}
      aria-label={isFavorited ? "นำออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isFavorited
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground",
        )}
      />
    </button>
  )
}
