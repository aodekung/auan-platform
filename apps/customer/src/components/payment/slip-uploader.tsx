import { useRef, useState } from "react"
import { Camera, Upload, X } from "lucide-react"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"

interface SlipUploaderProps {
  onUpload: (file: File) => void
  isUploading?: boolean
  previewUrl?: string | null
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_MB = 5

export function SlipUploader({ onUpload, isUploading, previewUrl }: SlipUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError(null)

    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("รองรับเฉพาะไฟล์ JPEG, PNG, WebP")
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`ขนาดไฟล์เกิน ${MAX_SIZE_MB}MB`)
      return
    }

    onUpload(file)

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      {previewUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <img src={previewUrl} alt="สลิปการโอนเงิน" className="h-full w-full object-contain" />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-md bg-background/80 p-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label="เปลี่ยนรูป"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          className={cn("w-full gap-2", isUploading && "opacity-50")}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดสลิปการโอนเงิน"}
        </Button>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
