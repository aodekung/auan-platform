import { Link } from "react-router-dom"

import { Button } from "../components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">ไม่พบหน้าที่คุณกำลังค้นหา</p>
      <Link to="/">
        <Button>กลับหน้าแรก</Button>
      </Link>
    </div>
  )
}
