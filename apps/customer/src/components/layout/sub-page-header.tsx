import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

interface SubPageHeaderProps {
  title: string
  /** Override the default back navigation (default: navigate(-1)) */
  onBack?: () => void
}

/**
 * Reusable sub-page header with a back button and page title.
 * Used on inner pages where the bottom nav is visible but the user
 * navigated away from a top-level tab (e.g. /cart, /orders/:id).
 */
export function SubPageHeader({ title, onBack }: SubPageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="flex items-center gap-3 py-1">
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="ย้อนกลับ"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="text-xl font-bold">{title}</h1>
    </div>
  )
}
