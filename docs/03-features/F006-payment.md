# Auan-Auan-Platform

> Feature Specification — Payment

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | F006 Payment       |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document specifies the **Payment** feature for Auan-Auan-Platform.

The payment page displays PromptPay payment instructions to the customer after an order is created. The customer pays externally via their banking app, then confirms payment within the allotted time. The business owner manually verifies each payment.

---

## Scope

### In Scope

- Order summary display
- PromptPay QR code image display
- PromptPay number with copy-to-clipboard button
- Payment amount display
- 300-second countdown timer (client-side + backend validation)
- "I've Paid" confirmation button
- Waiting state after payment confirmation
- Payment timeout handling (redirect to order status, "Expired" message)
- Payment verification result handling (navigate to tracking, or show error)
- API: `GET /payments/:id`, `POST /payments/:id/confirm`
- Security: no sensitive data in URLs, immutable payment records

### Out of Scope

- Automatic payment verification (future feature)
- Dynamic QR code generation (future feature)
- Bank API integration or webhook verification
- Multiple payment methods
- Refund handling
- Admin-side payment verification (handled by admin features)

---

## References

| Document | Relevance |
| -------- | ---------- |
| `150-business-rules.md` | Payment rules, 300-second timeout |
| `154-order-workflow.md` | Steps 8-9 (Payment, Await Verification) |
| `155-payment-workflow.md` | Full payment flow, statuses, manual verification |
| `156-delivery-rules.md` | Delivery after payment confirmation |
| `70-ui-ux-rules.md` | Payment page layout, button states, loading states |
| `174-api-design.md` | API conventions, response format, status codes |

---

## Page Layout

```text
┌─────────────────────────────────┐
│  Header: Payment               │
├─────────────────────────────────┤
│                                 │
│  Order: ORD-20260713-000001    │
│                                 │
│  Order Summary                  │
│  ┌───────────────────────────┐ │
│  │ Item 1  x2    100 THB    │ │
│  │ Item 2  x1     50 THB    │ │
│  │ ─────────────────────    │ │
│  │ Total           150 THB  │ │
│  └───────────────────────────┘ │
│                                 │
│  PromptPay Payment             │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │     [ QR Code Image ]     │ │
│  │                           │ │
│  │  PromptPay Number:        │ │
│  │  098-765-4321  [Copy]     │ │
│  │                           │ │
│  │  Amount: 150 THB          │ │
│  └───────────────────────────┘ │
│                                 │
│  Time Remaining: 04:32         │
│                                 │
│  [ I've Paid ]                 │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation (if any)     │
└─────────────────────────────────┘
```

---

## Payment Flow (Per `155-payment-workflow.md`)

```text
Customer lands on Payment Page
        |
        v
View Order Summary + PromptPay QR + Amount
        |
        v
Customer opens banking app externally
        |
        v
Customer transfers payment manually
        |
        v
Customer presses "I've Paid" button
        |
        v
POST /payments/:id/confirm
        |
        v
Status: Awaiting Verification
        |
        v
Customer sees Waiting State (spinner)
        |
        v
Business Owner verifies manually
        |
        +-- Verified --> Navigate to Order Tracking
        +-- Rejected --> Show Error, Allow Retry
        +-- Timeout  --> Redirect to Order Status, "Expired"
```

Key characteristics of this flow:

- The QR code is **fixed** — the customer must manually enter the correct amount.
- Payment happens **externally** (banking app, mobile banking, etc.).
- Verification is **manual** — the business owner checks their bank records.
- The system does not automatically detect payment.

---

## Order Summary

The top section displays a read-only summary of the order.

| Field       | Description                          |
| ----------- | ------------------------------------ |
| Order Number | e.g., `ORD-20260713-000001`         |
| Items       | Product names, options, quantities    |
| Total       | Final payable amount in THB          |

The order summary data is passed from the checkout page response (see `POST /orders` response in `F005-checkout.md`).

---

## PromptPay QR Code

Per `155-payment-workflow.md`, the system uses a **fixed PromptPay QR code**.

### Display

- QR code image is loaded from the URL returned by the backend.
- The image should be centered and large enough to scan (recommended: 240x240px minimum).
- If the image fails to load, display a fallback message:

```text
Unable to load QR code. Please use the PromptPay number below.
```

### Behavior

- The QR code is the same for all orders (fixed).
- The customer must manually enter the payment amount in their banking app.
- The amount is displayed prominently below the QR code.

---

## PromptPay Number with Copy Button

### Display

```text
PromptPay Number: 098-765-4321  [Copy]
```

### Copy Button Behavior

1. Customer taps "Copy".
2. The PromptPay number is copied to the device clipboard.
3. Button text briefly changes to "Copied!" (duration: 2 seconds).
4. Button text reverts to "Copy".

### Formatting

- PromptPay number is displayed in a readable format: `XXX-XXX-XXXX`.
- The copied value should be the raw digits only (no dashes): `0987654321`.

---

## Payment Amount

The payment amount is displayed prominently below the PromptPay section.

```text
Amount to Pay: 150 THB
```

- The amount is derived from the order total returned by the backend.
- It is displayed in large, bold text.
- The customer must enter this exact amount in their banking app.

---

## 300-Second Countdown Timer

Per `150-business-rules.md` and `155-payment-workflow.md`, the payment timeout is **300 seconds (5 minutes)**.

### Timer Behavior

1. The countdown starts immediately when the payment page mounts.
2. The countdown is **client-side** (JavaScript interval).
3. Display format: `MM:SS` (e.g., `04:32`).
4. When remaining time is under 60 seconds, the timer turns **red** (warning color per `70-ui-ux-rules.md`).
5. When the timer reaches `00:00`:
   - The countdown stops.
   - The "I've Paid" button is disabled.
   - A timeout message is displayed (see Timeout Handling below).
   - The page auto-redirects to the order status page after 3 seconds.

### Backend Validation

- The client-side timer is a **UX aid only**. The backend enforces the timeout independently.
- If the customer presses "I've Paid" after the backend timeout has expired, the API returns an error (order already expired).
- The countdown end time (`expiresAt`) is provided in the `POST /orders` response to ensure client and server are synchronized.

### Timer Edge Cases

- Customer switches apps to make payment — the timer continues in the background.
- Customer returns after timeout — the page detects the expired state and redirects.
- Network latency on "I've Paid" — the backend validation determines the final outcome.

---

## "I've Paid" Button

Per `155-payment-workflow.md`, after completing payment, the customer presses "I've Paid".

### Button States

| State          | Behavior                                    |
| -------------- | ------------------------------------------- |
| Default        | Enabled, primary button style               |
| Hover          | Visible hover state                         |
| Active         | Pressed state                               |
| Disabled       | Greyed out (timer expired, already confirmed, or submitting) |
| Loading        | Spinner + "Confirming..." text              |

### Double-Click Prevention

- The button is disabled immediately on first tap.
- The submit handler returns early if a request is already in flight.
- Per `155-payment-workflow.md` duplicate payment protection rules.

### Action

When pressed, the button calls:

```text
POST /payments/:id/confirm
```

On success, the payment status changes to **Awaiting Verification** and the page enters the Waiting State.

---

## Waiting State (After "I've Paid")

After the customer presses "I've Paid" and the API responds successfully:

### Display

```text
┌─────────────────────────────────┐
│                                 │
│   [ Loading Spinner ]           │
│                                 │
│   Payment Received             │
│   Waiting for verification...  │
│                                 │
│   Please wait while the        │
│   business owner verifies      │
│   your payment.                │
│                                 │
└─────────────────────────────────┘
```

### Behavior

1. The "I've Paid" button is replaced by the waiting state UI.
2. A loading spinner is displayed (per `70-ui-ux-rules.md` loading states).
3. The countdown timer continues running.
4. The page polls the backend periodically for payment status updates (see Polling Strategy below).

### Polling Strategy

| Config          | Value  |
| --------------- | ------ |
| Endpoint         | `GET /payments/:id` |
| Interval         | Every 10 seconds |
| Stop conditions  | Payment verified, payment rejected, payment expired, or customer navigates away |

If polling detects a status change:

- **Paid (Verified)**: navigate to order tracking page.
- **Rejected**: show error message, allow retry (see Rejected Payment below).
- **Expired**: redirect to order status page (see Timeout Handling below).

---

## Payment Timeout Handling

When the countdown reaches zero or the backend reports the order has expired:

### Client-Side (Timer Expires)

1. The countdown stops at `00:00`.
2. The "I've Paid" button is disabled.
3. A timeout banner is displayed:

```text
Your payment time has expired. This order has been cancelled.
```

4. After 3 seconds, auto-redirect to the order status page.

### Backend-Side (Order Expired)

If the customer's "I've Paid" request arrives after the backend timeout:

```json
{
  "success": false,
  "message": "Payment time has expired",
  "error": {
    "code": "PAYMENT_EXPIRED"
  }
}
```

The frontend handles this the same way as the client-side timeout — shows the expired message and redirects.

### Order Status Page Redirect

```text
/orders/:orderId/status
```

The order status page displays the "Expired" status prominently.

---

## Payment Verified

When polling detects that the business owner has verified the payment:

### Backend Response

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_001",
    "status": "Paid",
    "verifiedAt": "2026-07-13T18:33:00+07:00"
  }
}
```

### Frontend Action

1. Stop polling immediately.
2. Show a brief success message: "Payment confirmed! Preparing your order..."
3. Navigate to the order tracking page after 1.5 seconds.

```text
/orders/:orderId/tracking
```

---

## Payment Rejected

When polling detects that the business owner has rejected the payment:

### Backend Response

```json
{
  "success": true,
  "data": {
    "paymentId": "pay_001",
    "status": "Rejected",
    "rejectedReason": "Incorrect amount"
  }
}
```

### Frontend Action

1. Stop polling.
2. Display an error panel:

```text
┌─────────────────────────────────┐
│                                 │
│   Payment Rejected             │
│                                 │
│   Reason: Incorrect amount      │
│                                 │
│   Please contact the business   │
│   or place a new order.         │
│                                 │
│   [ Place New Order ]          │
│                                 │
└─────────────────────────────────┘
```

3. The "Place New Order" button navigates to the menu/home page.

---

## API Integration

### GET /payments/:id

Retrieves the current payment status and details.

#### Endpoint

```text
GET /api/v1/payments/:id
```

#### Success Response (200)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "paymentId": "pay_001",
    "orderId": "ORD-20260713-000001",
    "status": "Awaiting Verification",
    "method": "PromptPay",
    "amount": 150,
    "promptPayNumber": "098-765-4321",
    "promptPayQR": "https://example.com/qr/promptpay.png",
    "createdAt": "2026-07-13T18:30:00+07:00",
    "expiresAt": "2026-07-13T18:35:00+07:00",
    "verifiedAt": null,
    "verifiedBy": null
  }
}
```

#### Error Responses

| Status | Scenario        | Error Message                    |
| ------ | --------------- | -------------------------------- |
| 404    | Payment not found | "Payment record not found"      |
| 401    | Unauthorized    | "Authentication required"       |

### POST /payments/:id/confirm

Customer confirms they have completed payment. Changes status from Pending to Awaiting Verification.

#### Endpoint

```text
POST /api/v1/payments/:id/confirm
```

#### Request Body

No request body required. The payment ID is in the URL.

#### Success Response (200)

```json
{
  "success": true,
  "message": "Payment confirmed. Awaiting verification.",
  "data": {
    "paymentId": "pay_001",
    "status": "Awaiting Verification",
    "confirmedAt": "2026-07-13T18:32:00+07:00"
  }
}
```

#### Error Responses

| Status | Scenario               | Error Message                            |
| ------ | ---------------------- | ---------------------------------------- |
| 400    | Already confirmed       | "Payment has already been confirmed"     |
| 400    | Payment expired         | "Payment time has expired"               |
| 404    | Payment not found       | "Payment record not found"              |
| 409    | Order cancelled         | "This order has been cancelled"          |

---

## Security

Per `155-payment-workflow.md` security rules and `174-api-design.md`:

### No Sensitive Data in URLs

- The PromptPay number and QR code URL are **never** included as URL query parameters.
- Payment amounts are **never** passed in URLs.
- The `paymentId` in the URL is an opaque identifier — not guessable or sequential.

### Payment Record Immutability

- Once created, payment records must **never be modified** — only status transitions are allowed.
- All payment events are logged with timestamps.
- Payment history must be preserved for auditing.

### Duplicate Payment Protection

Per `155-payment-workflow.md`:

- Double-click on "I've Paid" is prevented by button disable logic.
- Multiple confirmations for the same payment return `400 Already confirmed`.
- Each order may have only one successful payment.

### Input Validation

- All API inputs are validated using Zod (per `174-api-design.md`).
- Payment IDs are validated against expected format.
- All responses are sanitized — no sensitive banking data is exposed to the customer.

---

## State Management

### Local State (payment page)

| State Field            | Type     | Default           | Description                                  |
| ---------------------- | -------- | ----------------- | -------------------------------------------- |
| orderId                | string   | from route params  | The order being paid for                     |
| paymentId              | string   | from route params  | The payment record ID                        |
| payment                | object   | `null`            | Payment details from API                     |
| paymentStatus          | string   | `"Pending"`       | Current payment status                       |
| timeRemaining          | number   | 300              | Seconds remaining (client-side countdown)   |
| isConfirming           | boolean  | `false`          | Whether "I've Paid" is being submitted      |
| isCopied               | boolean  | `false`          | Whether PromptPay number was just copied     |
| copyTimeout            | number   | `null`           | Timeout ID for "Copied!" text revert        |
| pollInterval           | number   | `null`           | Interval ID for status polling              |
| error                  | object   | `null`           | Page-level error                             |
| pagePhase              | string   | `"payment"`      | `"payment"`, `"waiting"`, `"expired"`, `"rejected"` |

### State Transitions

```text
payment --[I've Paid clicked]--> waiting
payment --[Timer expires]--> expired
waiting --[Poll: Paid]--> navigate to tracking
waiting --[Poll: Rejected]--> rejected
waiting --[Poll: Expired]--> expired
waiting --[Timer expires]--> expired
rejected --[Place New Order]--> navigate to menu
expired --[auto-redirect]--> navigate to order status
```

---

## Error Handling

| Scenario                   | User-Facing Message                                                | Action                              |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Payment page load fails    | "Unable to load payment details. Please try again."                | Retry button                        |
| QR code image fails to load| QR hidden, message: "Unable to load QR code. Use the number below." | Fallback to PromptPay number only   |
| "I've Paid" request fails  | "Unable to confirm payment. Please check your connection."         | Retry button                        |
| Payment already confirmed  | "Payment already confirmed. Awaiting verification."              | Enter waiting state                 |
| Payment expired            | "Payment time has expired. This order has been cancelled."        | Redirect to order status            |
| Order cancelled            | "This order has been cancelled."                                  | Navigate to order status            |
| Payment not found          | "Payment record not found."                                       | Navigate to home                    |
| Network error during poll | Silently retry on next poll interval (do not show error for polling failures) | Continue polling |

---

## Testing Requirements

### Unit Tests

| Test Case                                        | Expected Result                           |
| ------------------------------------------------ | ----------------------------------------- |
| Countdown starts at 300 seconds                  | Timer displays `05:00` on mount           |
| Countdown decrements every second                | `04:59`, `04:58`, etc.                    |
| Timer turns red below 60 seconds                  | Warning color applied                     |
| Timer reaches zero                               | Button disabled, expired message shown    |
| Copy button copies raw digits                     | Clipboard contains `0987654321`           |
| Copy button shows "Copied!" for 2 seconds         | Button text reverts after timeout         |
| "I've Paid" disabled when timer expired           | Button greyed out                         |
| "I've Paid" disabled during submission           | Button in loading state                   |
| Double-click prevention works                     | Only one API call fired                   |

### Integration Tests

| Test Case                                        | Expected Result                           |
| ------------------------------------------------ | ----------------------------------------- |
| `GET /payments/:id` returns payment details       | QR code, PromptPay number, amount displayed|
| `GET /payments/:id` for non-existent payment     | Returns 404, error message shown           |
| `POST /payments/:id/confirm` success             | Status becomes Awaiting Verification       |
| `POST /payments/:id/confirm` already confirmed   | Returns 400, enters waiting state         |
| `POST /payments/:id/confirm` after expiry         | Returns 400, expired message shown         |
| Polling detects status change to Paid            | Navigates to order tracking               |
| Polling detects status change to Rejected         | Shows rejection message                   |
| Polling detects status change to Expired          | Redirects to order status                 |

### Edge Cases

- Customer opens payment page in multiple browser tabs — only one tab should be active; the second tab should detect the awaiting status.
- Customer navigates back from payment page — prompt to stay or confirm leaving.
- Page is backgrounded during countdown — timer continues via JavaScript `setInterval` (may drift slightly; backend is authoritative).
- Customer force-closes the app — payment remains pending; they can return via order status and resume.
- Backend and client clocks slightly out of sync — countdown is initialized from `expiresAt` timestamp, not absolute time.

---

## Future Expansion

The payment feature should support future enhancements without major redesign:

- **Dynamic PromptPay QR**: server-generated QR with embedded amount (per `155-payment-workflow.md`).
- **Automatic payment verification**: bank API or webhook integration.
- **Slip/OCR verification**: customer uploads payment slip for automated checking.
- **Multiple payment methods**: LINE Pay, TrueMoney, credit/debit card (per `155-payment-workflow.md`).
- **Push notifications**: real-time updates instead of polling.
- **Partial refund**: refund processing for verified payments.
- **Retry payment**: allow customer to re-attempt payment on rejected orders.

---

## Definition of Done

The payment feature is complete when:

- Payment page displays order summary, QR code, PromptPay number, and amount.
- Copy-to-clipboard works for PromptPay number.
- 300-second countdown timer functions correctly with visual warnings.
- "I've Paid" button triggers `POST /payments/:id/confirm` successfully.
- Double-submit prevention is implemented.
- Waiting state displays spinner and status message.
- Polling detects status changes (verified, rejected, expired).
- Timeout handling redirects to order status with expired message.
- Payment verified navigates to order tracking.
- Payment rejected shows error with retry option.
- Security rules are enforced (no sensitive data in URLs, immutable records).
- Error handling covers all documented scenarios.
- Unit and integration tests pass.

---

## References

- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `70-ui-ux-rules.md`
- `174-api-design.md`
- `F005-checkout.md`
