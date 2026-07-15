import { Copy, Check } from "lucide-react"
import { useState } from "react"

import { Button } from "../ui/button"

interface PromptPayQRProps {
  qrImageUrl: string
  promptPayNumber: string
  amount: string
}

export function PromptPayQR({ qrImageUrl, promptPayNumber, amount }: PromptPayQRProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(promptPayNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 text-center">
      <h3 className="text-sm font-medium">แสกน QR เพื่อชำระเงิน</h3>

      {/* QR Code */}
      <div className="mx-auto flex aspect-square w-48 items-center justify-center overflow-hidden rounded-lg border bg-white">
        {qrImageUrl ? (
          <img
            src={qrImageUrl}
            alt="PromptPay QR Code"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-xs">QR Code</p>
            <p className="text-xs">(ยังไม่ได้ตั้งค่า)</p>
          </div>
        )}
      </div>

      {/* PromptPay Number */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">หมายเลข PromptPay</p>
        <div className="flex items-center justify-center gap-2">
          <span className="font-mono text-lg font-semibold tracking-wider">
            {promptPayNumber}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            aria-label="คัดลอกหมายเลข"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Amount */}
      <div className="rounded-md bg-muted p-3">
        <p className="text-xs text-muted-foreground">จำนวนเงินที่ต้องชำระ</p>
        <p className="text-xl font-bold text-primary">
          ฿{Number(amount).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
