# Auan-Auan-Platform

> Payment Workflow

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Payment WorkFlow   |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official payment workflow for Auan-Auan-Platform.

Every payment must follow this workflow to ensure accurate order processing and prevent fraud or duplicate payments.

---

## Supported Payment Methods

Current supported payment method:

- PromptPay QR Code

Future payment methods:

- Credit Card
- Debit Card
- LINE Pay
- TrueMoney Wallet
- Cash
- Mobile Banking

---

## Payment Flow

```text
Checkout
        ↓
Create Order
        ↓
Generate Order Number
        ↓
Display PromptPay QR
        ↓
Display PromptPay Number
        ↓
Customer Makes Payment
        ↓
Customer Presses "I've Paid"
        ↓
Await Manual Verification
        ↓
Payment Confirmed
        ↓
Notify Kitchen
        ↓
Start Preparing
```

---

## Payment Page

The payment page displays:

- Order Number
- Order Summary
- Item List
- Total Amount
- Fixed PromptPay QR Code
- PromptPay Number
- Payment Countdown
- Payment Confirmation Button

---

## PromptPay QR Code

The system uses:

```text
Fixed PromptPay QR Code
```

The customer manually enters the payment amount in their banking application.

Future versions may support:

- Dynamic PromptPay QR
- QR Payload Generation

---

## PromptPay Information

Display the following information:

- PromptPay Number
- Account Name
- QR Code Image

Customers should be able to copy the PromptPay number if needed.

---

## Payment Timeout

Current timeout:

```text
300 seconds
```

Countdown starts immediately after the order is created.

If the countdown expires before payment is confirmed:

Order Status becomes:

```text
Expired
```

---

## Customer Confirmation

After completing payment, the customer presses:

```text
I've Paid
```

The system updates the order status to:

```text
Awaiting Verification
```

---

## Manual Verification

The business owner verifies:

- Payment Amount
- Payment Time
- Payment Destination
- Duplicate Payment

If valid:

```text
Payment Confirmed
```

If invalid:

```text
Payment Rejected
```

---

## Successful Payment

After payment confirmation, the system shall:

- Record Payment Time
- Record Payment Method
- Record Payment Status
- Notify Customer
- Notify Kitchen
- Reduce Inventory
- Begin Order Preparation

---

## Failed Payment

Payment is considered failed when:

- Timeout expires.
- Wrong amount is transferred.
- Duplicate payment detected.
- Invalid transfer.

Order Status:

```text
Payment Failed
```

---

## Duplicate Payment Protection

The system should prevent:

- Double-click payment confirmation.
- Multiple payment confirmations for one order.
- Duplicate payment records.

Each order may have only one successful payment.

---

## Payment Validation

Before confirming payment, verify:

- Order exists.
- Order is not expired.
- Order is unpaid.
- Payment amount matches order total.
- Order has not been cancelled.

---

## Payment Record

Each payment stores:

- Payment ID
- Order ID
- Payment Method
- Payment Amount
- Payment Status
- Payment Time
- Verified By
- Verification Time

Payment records must never be deleted.

---

## Payment Status

Supported payment statuses:

| Status | Description |
| ------ | ----------- |
| Pending | Waiting for customer payment |
| Awaiting Verification | Customer confirmed payment |
| Paid | Payment verified |
| Rejected | Payment rejected |
| Failed | Payment failed |
| Expired | Payment timeout |
| Refunded | Payment returned |

---

## Customer Notifications

Notify customer when:

- Payment page created.
- Payment received.
- Payment verified.
- Payment rejected.
- Payment expired.
- Refund completed.

---

## Business Notifications

Notify the business owner when:

- New payment waiting verification.
- Payment verified.
- Payment rejected.
- Payment timeout.
- Duplicate payment detected.

---

## Security Rules

The system must:

- Validate payment amount.
- Prevent duplicate payments.
- Prevent replay requests.
- Store payment history.
- Record verification timestamps.
- Log every payment event.

Sensitive payment information must never be exposed to customers.

---

## Future Payment Features

Future versions may support:

- Automatic QR Generation
- Webhook Verification
- Bank API Integration
- Slip Verification
- Automatic Refund
- Multiple Payment Methods
- Split Payment
- Partial Payment

The architecture should support these features without redesign.

---

## Definition of Done

The payment workflow is complete when:

- Payment flow is documented.
- Validation rules are implemented.
- Timeout rules are defined.
- Notifications are documented.
- Security requirements are satisfied.
- Future expansion is supported.

---

## References

- `150-business-rules.md`
- `153-pricing-rules.md`
- `154-order-workflow.md`
- `156-delivery-rules.md`
- `158-order-status.md`
- `159-notification-rules.md`
- `160-error-scenarios.md`
- `100-security-rules.md`
