# Auan-Auan-Platform

> Notification Rules

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Notification Rules |
| Version | 1.0.0 |
| Status | Active |
| Owner | Business Owner |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the official notification system for Auan-Auan-Platform.

The notification system keeps customers and the business owner informed throughout the entire order lifecycle.

---

## Design Principles

The notification system shall be:

- Reliable
- Timely
- Consistent
- Non-duplicated
- Event-driven

Every notification must be triggered by a business event.

---

## Notification Channels

### Customer

Current channel:

- LINE Official Account

Future channels:

- Push Notification
- Email
- SMS

---

### Business Owner

Current channels:

- LINE Official Account
- LINE Notify (Future)
- Admin Dashboard (Future)

---

## Notification Flow

```text
Order Created
        ↓
Payment Required
        ↓
Payment Verified
        ↓
Kitchen Preparing
        ↓
Ready for Delivery
        ↓
Out for Delivery
        ↓
Delivered
        ↓
Completed
```

---

## Customer Notifications

Customers should receive notifications for the following events.

| Event | Notify |
| ------ | ------ |
| Order Created | Yes |
| Awaiting Payment | Yes |
| Payment Verified | Yes |
| Payment Rejected | Yes |
| Payment Expired | Yes |
| Preparing | Yes |
| Ready | Yes |
| Out for Delivery | Yes |
| Delivered | Yes |
| Order Completed | Yes |
| Order Cancelled | Yes |

---

## Business Owner Notifications

The business owner should receive notifications for:

| Event | Notify |
| ------ | ------ |
| New Order | Yes |
| Customer Paid | Yes |
| Payment Waiting Verification | Yes |
| Payment Rejected | Yes |
| Payment Expired | Yes |
| Kitchen Ready | Yes |
| Order Cancelled | Yes |
| Delivery Completed | Yes |
| Low Stock | Yes |
| System Error | Yes |

---

## Notification Content

Every notification should contain:

- Order Number
- Customer Name
- Current Status
- Timestamp

Where applicable, include:

- Building
- Room Number
- Order Total

---

## Customer Notification Examples

### Order Created

```text
Your order has been created successfully.

Order Number:
ORD-20260713-000001

Please complete your payment within 5 minutes.
```

---

### Payment Verified

```text
Payment received successfully.

Your order is now being prepared.
```

---

### Preparing

```text
Your food is currently being prepared.
```

---

### Ready

```text
Your order is ready for delivery.
```

---

### Out for Delivery

```text
Your order is on the way.
```

---

### Delivered

```text
Your order has been delivered.

Enjoy your meal.
```

---

### Cancelled

```text
Your order has been cancelled.
```

---

### Payment Expired

```text
Payment time has expired.

Please create a new order.
```

---

## Business Notification Examples

### New Order

```text
New Order Received

Order:
ORD-20260713-000001

Customer:
John Doe

Building:
C

Room:
1208
```

---

### Payment Waiting Verification

```text
Payment submitted.

Please verify the payment.
```

---

### Kitchen Ready

```text
Kitchen has completed the order.

Ready for delivery.
```

---

### Low Stock

```text
Inventory Alert

One or more products are running low.
```

---

## Notification Triggers

| Event | Trigger |
| ------ | ------- |
| Order Created | Checkout completed |
| Awaiting Payment | Order created |
| Payment Verified | Manual verification successful |
| Payment Rejected | Manual verification failed |
| Preparing | Kitchen starts preparation |
| Ready | Kitchen completes preparation |
| Out for Delivery | Delivery begins |
| Delivered | Delivery completed |
| Completed | Order closed |
| Cancelled | Order cancelled |
| Low Stock | Inventory threshold reached |

---

## Delivery Rules

Notifications should be sent:

- Immediately after the triggering event.
- Exactly once per event.
- In chronological order.

Duplicate notifications must be prevented.

---

## Retry Policy

If notification delivery fails:

- Retry automatically.
- Log every retry attempt.
- Mark notification as failed after the maximum retry count.

Future versions may support configurable retry policies.

---

## Notification History

Every notification must store:

- Notification ID
- Order ID
- Recipient
- Notification Type
- Delivery Status
- Sent At
- Delivered At (Future)

Notification history must never be deleted.

---

## Notification Status

Supported statuses:

| Status | Description |
| ------ | ----------- |
| Pending | Waiting to send |
| Sending | Currently sending |
| Sent | Successfully sent |
| Failed | Delivery failed |
| Cancelled | Notification cancelled |

---

## Security Rules

Notifications must never expose:

- Internal system errors
- Database identifiers
- API keys
- Authentication tokens
- Sensitive payment information

Only information relevant to the recipient should be included.

---

## Future Features

Future notification capabilities may include:

- Push Notifications
- Email Notifications
- SMS Notifications
- Rich LINE Flex Messages
- Scheduled Notifications
- Marketing Campaigns
- Customer Reminders
- Broadcast Messages

The notification architecture should support multiple channels without major redesign.

---

## Definition of Done

The notification system is complete when:

- Notification events are documented.
- Notification recipients are defined.
- Trigger conditions are documented.
- Retry policy is defined.
- Notification history is preserved.
- Future expansion is supported.

---

## References

- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `157-kitchen-workflow.md`
- `158-order-status.md`
- `160-error-scenarios.md`
