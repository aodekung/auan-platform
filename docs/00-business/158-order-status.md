# Auan-Auan-Platform

> Order Status

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Order Status |
| Version | 1.0.0 |
| Status | Active |
| Owner | Business Owner |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the official order status lifecycle used throughout Auan-Auan-Platform.

Every order must always have exactly one current status.

---

## Design Principles

The order status system must be:

- Predictable
- Consistent
- Traceable
- Immutable for completed history
- Easy to expand

Every status transition must be recorded.

---

## Order Lifecycle

```text
Pending
        ↓
Awaiting Payment
        ↓
Awaiting Verification
        ↓
Paid
        ↓
Queued
        ↓
Preparing
        ↓
Ready
        ↓
Out for Delivery
        ↓
Delivered
        ↓
Completed
```

Alternative paths:

```text
Pending
        ↓
Expired
```

```text
Awaiting Verification
        ↓
Payment Rejected
```

```text
Pending
        ↓
Cancelled
```

```text
Paid
        ↓
Cancelled (Admin Only)
```

---

## Status Definitions

| Status | Description |
| ------ | ----------- |
| Pending | Order has been created. |
| Awaiting Payment | Waiting for customer payment. |
| Awaiting Verification | Customer submitted payment, waiting for manual verification. |
| Paid | Payment successfully verified. |
| Queued | Waiting in kitchen queue. |
| Preparing | Kitchen is preparing the order. |
| Ready | Order is ready for delivery. |
| Out for Delivery | Order is on the way to the customer. |
| Delivered | Customer has received the order. |
| Completed | Order is fully completed. |
| Cancelled | Order cancelled before completion. |
| Expired | Payment timeout exceeded. |
| Payment Rejected | Payment verification failed. |

---

## Status Flow Rules

### Pending

Entry Conditions

- Customer completes checkout.

Allowed Next Status

- Awaiting Payment
- Cancelled

---

### Awaiting Payment

Entry Conditions

- Order successfully created.

Allowed Next Status

- Awaiting Verification
- Expired
- Cancelled

---

### Awaiting Verification

Entry Conditions

- Customer confirms payment.

Allowed Next Status

- Paid
- Payment Rejected
- Expired

---

### Paid

Entry Conditions

- Business owner verifies payment.

Allowed Next Status

- Queued
- Cancelled (Admin Only)

---

### Queued

Entry Conditions

- Payment confirmed.

Allowed Next Status

- Preparing

---

### Preparing

Entry Conditions

- Kitchen starts preparing.

Allowed Next Status

- Ready

Customer cancellation is no longer allowed.

---

### Ready

Entry Conditions

- Kitchen preparation completed.

Allowed Next Status

- Out for Delivery

---

### Out for Delivery

Entry Conditions

- Delivery begins.

Allowed Next Status

- Delivered

---

### Delivered

Entry Conditions

- Customer receives the order.

Allowed Next Status

- Completed

---

### Completed

Entry Conditions

- Delivery successfully finished.

Allowed Next Status

None.

Completed orders become read-only.

---

### Cancelled

Entry Conditions

- Customer cancels before preparation.
- Business owner cancels.

Allowed Next Status

None.

---

### Expired

Entry Conditions

- Payment timeout exceeded.

Allowed Next Status

None.

Customers must create a new order.

---

### Payment Rejected

Entry Conditions

- Payment verification failed.

Allowed Next Status

- Awaiting Verification
- Cancelled

---

## Status Transition Matrix

| Current Status | Allowed Next Status |
| -------------- | ------------------- |
| Pending | Awaiting Payment, Cancelled |
| Awaiting Payment | Awaiting Verification, Expired, Cancelled |
| Awaiting Verification | Paid, Payment Rejected, Expired |
| Paid | Queued, Cancelled (Admin Only) |
| Queued | Preparing |
| Preparing | Ready |
| Ready | Out for Delivery |
| Out for Delivery | Delivered |
| Delivered | Completed |
| Completed | None |
| Cancelled | None |
| Expired | None |
| Payment Rejected | Awaiting Verification, Cancelled |

---

## Status History

Every status change must record:

- Order ID
- Previous Status
- New Status
- Changed By
- Changed At
- Reason (Optional)

Status history must never be deleted.

---

## Notification Rules

Customers should be notified when:

- Payment verified
- Order preparing
- Order ready
- Out for delivery
- Delivered
- Cancelled
- Payment rejected
- Payment expired

Business owner should be notified when:

- New order created
- Payment awaiting verification
- Payment rejected
- Order cancelled
- Delivery completed

---

## Validation Rules

The system must prevent:

- Invalid status transitions
- Skipping required statuses
- Multiple active statuses
- Reopening completed orders

All status changes must be validated by the backend.

---

## Audit Rules

Every status transition must be logged.

Logs should include:

- Timestamp
- User
- IP Address (Future)
- Device Information (Future)

Audit records must be immutable.

---

## Future Expansion

Future versions may support:

- Scheduled Orders
- On Hold
- Refund Pending
- Refunded
- Delivery Failed
- Returned
- Kitchen Paused
- Rider Assigned
- Rider Arrived

The architecture should support additional statuses without breaking existing workflows.

---

## Definition of Done

The order status system is complete when:

- Every status is documented.
- Every transition is defined.
- Validation rules are implemented.
- Notification rules are documented.
- Status history is preserved.
- Audit logging is supported.

---

## References

- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `157-kitchen-workflow.md`
- `159-notification-rules.md`
- `160-error-scenarios.md`
