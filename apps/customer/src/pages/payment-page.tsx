import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"

import { Button } from "../components/ui/button"
import { Separator } from "../components/ui/separator"
import { PaymentCountdown } from "../components/payment/payment-countdown"
import { PromptPayQR } from "../components/payment/promptpay-qr"
import { SlipUploader } from "../components/payment/slip-uploader"
import { usePayment, useCreatePayment, useUploadSlip, useConfirmPayment } from "../hooks/use-payments"
import { useOrderDetail } from "../hooks/use-orders"
import { useStoreSettings } from "../hooks/use-settings"
import { ErrorState } from "../components/feedback"
import { ErrorBoundary } from "../components/feedback/error-boundary"
import { SubPageHeader } from "../components/layout/sub-page-header"
import { cn } from "../lib/utils"

function getUploadUrl(relativePath: string): string {
  if (!relativePath) return ""
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1"
  return `${baseUrl}/uploads/${relativePath}`
}

export function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading: orderLoading } = useOrderDetail(orderId ?? "")
  const { data: payment, isLoading: payLoading } = usePayment(orderId ?? "")
  const { data: storeSettings } = useStoreSettings()
  const createPayment = useCreatePayment()
  const uploadSlip = useUploadSlip()
  const confirmPayment = useConfirmPayment()

  const [slipPreview, setSlipPreview] = useState<string | null>(null)

  // Create payment if it doesn't exist
  const handleCreatePayment = () => {
    if (!orderId) return
    createPayment.mutate({ orderId })
  }

  // Handle slip upload
  const handleSlipUpload = (file: File) => {
    if (!payment) return
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setSlipPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    uploadSlip.mutate({ paymentId: payment.id, file })
  }

  // Handle "I've Paid" confirmation
  const handleConfirmPayment = () => {
    if (!payment) return
    confirmPayment.mutate(payment.id)
  }

  // Handle expired
  const handleExpired = () => {
    // Payment will be auto-marked as expired on next status check
  }

  const isLoading = orderLoading || payLoading
  const isTerminal = payment?.paymentStatus && ["PAID", "EXPIRED", "REJECTED", "REFUNDED"].includes(payment.paymentStatus)
  const isExpired = payment?.paymentStatus === "EXPIRED"
  const isPaid = payment?.paymentStatus === "PAID"
  const isRejected = payment?.paymentStatus === "REJECTED"

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  // Payment expired
  if (isExpired) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <Clock className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">หมดเวลาชำระเงิน</h2>
          <p className="text-sm text-muted-foreground">
            ออเดอร์นี้หมดเวลาชำระเงินแล้ว กรุณาสั่งออเดอร์ใหม่
          </p>
          <Link to="/menu">
            <Button>สั่งออเดอร์ใหม่</Button>
          </Link>
        </div>
      </ErrorBoundary>
    )
  }

  // Payment successful
  if (isPaid) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <h2 className="text-xl font-bold">ชำระเงินสำเร็จ!</h2>
          <p className="text-sm text-muted-foreground">
            กำลังเตรียมออเดอร์ของคุณ ร้านจะแจ้งเตือนเมื่อออเดอร์พร้อม
          </p>
          <Link to={`/orders/${orderId}`}>
            <Button>ติดตามออเดอร์</Button>
          </Link>
        </div>
      </ErrorBoundary>
    )
  }

  // Payment rejected
  if (isRejected) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">การชำระเงินไม่สำเร็จ</h2>
          <p className="text-sm text-muted-foreground">
            {payment?.rejectReason || "กรุณาลองชำระเงินอีกครั้ง หรือติดต่อร้าน"}
          </p>
          <Button onClick={() => window.location.reload()}>ลองใหม่</Button>
        </div>
      </ErrorBoundary>
    )
  }

  // Auto-create payment if it doesn't exist yet
  useEffect(() => {
    if (!payment && orderId && !createPayment.isPending && !createPayment.isError) {
      handleCreatePayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, orderId])

  // No payment yet — show loading or error
  if (!payment && (createPayment.isPending || createPayment.isError)) {
    return (
      <ErrorBoundary>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
          {createPayment.isPending ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">กำลังเตรียมข้อมูลการชำระเงิน...</p>
            </>
          ) : (
            <>
              <p className="text-sm text-destructive">
                {createPayment.error?.message || "ไม่สามารถสร้างข้อมูลการชำระเงินได้"}
              </p>
              <Button onClick={handleCreatePayment}>ลองใหม่</Button>
            </>
          )}
        </div>
      </ErrorBoundary>
    )
  }

  // Payment is pending or awaiting verification
  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <SubPageHeader title="💰 ชำระเงิน" onBack={() => navigate("/cart")} />

        {/* Order Info */}
        {order && (
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">{order.orderNumber}</p>
            <div className="mt-2 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.quantity}× {item.productName}</span>
                  <span>฿{Number(item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Countdown Timer */}
        {payment && payment.createdAt && (
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-center text-sm font-medium">เวลาที่เหลือ</h2>
            <PaymentCountdown
              createdAt={payment.createdAt}
              onExpired={handleExpired}
            />
          </div>
        )}

        {/* PromptPay QR */}
        <PromptPayQR
          qrImageUrl={storeSettings?.promptpayQr ? getUploadUrl(storeSettings.promptpayQr) : ""}
          promptPayNumber={storeSettings?.promptpayNumber ?? storeSettings?.phone ?? "0000000000"}
          amount={order?.total ?? "0"}
        />

        <Separator />

        {/* Slip Upload */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">อัปโหลดสลิปการโอนเงิน <span className="font-normal text-muted-foreground">(Optional)</span></h2>
          <p className="text-xs text-muted-foreground">คุณสามารถอัปโหลดสลิปเพื่อช่วยยืนยันการชำระเงินได้</p>
          <SlipUploader
            onUpload={handleSlipUpload}
            isUploading={uploadSlip.isPending}
            previewUrl={slipPreview || (payment?.slipImage ? getUploadUrl(payment.slipImage) : undefined)}
          />
          {uploadSlip.isError && (
            <p className="text-xs text-destructive">
              {uploadSlip.error?.message || "อัปโหลดไม่สำเร็จ กรุณาลองใหม่"}
            </p>
          )}
        </div>

        <Separator />

        {/* Confirm Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleConfirmPayment}
          disabled={confirmPayment.isPending || !payment}
        >
          {confirmPayment.isPending
            ? "กำลังส่ง..."
            : "ฉันชำระเงินแล้ว ✅"
          }
        </Button>

        {confirmPayment.isError && (
          <p className="text-center text-sm text-destructive">
            {confirmPayment.error?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่"}
          </p>
        )}

        {/* Status info while awaiting verification */}
        {payment?.paymentStatus === "AWAITING_VERIFICATION" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center dark:border-blue-800 dark:bg-blue-950">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ⏳ รอร้านตรวจสอบการชำระเงิน...
            </p>
            <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
              ระบบจะอัปเดตอัตโนมัติเมื่อได้รับการยืนยัน
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
