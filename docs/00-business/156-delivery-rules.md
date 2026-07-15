# Auan-Auan-Platform

> Delivery Rules

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Delivery Rules     |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official delivery rules for Auan-Auan-Platform.

The delivery system is designed specifically for residents within Regent Home Bangson and should be scalable for future expansion.

---

## Delivery Model

Current delivery model:

```text
Store
    ↓
Customer
```

The business owner delivers every completed order.

No third-party delivery service is used.

---

## Supported Delivery Area

Current delivery area:

- Regent Home Bangson Phase 27
- Regent Home Bangson Phase 28

Orders outside these locations are not accepted.

---

## Supported Buildings

Current supported buildings:

### Phase 27

- All Buildings

### Phase 28

- Building A
- Building B
- Building C
- Building D

Future buildings can be added without modifying the delivery architecture.

---

## Delivery Fee

Current delivery fee:

```text
0 THB
```

Future versions may support:

- Distance-based Fee
- Zone-based Fee
- Free Delivery Promotion

---

## Customer Address

Every order must include:

- Building
- Room Number

Optional:

- Delivery Note

Example:

```text
Building C
Room 1208

Please leave the order on the table.
```

---

## Address Validation

Before creating an order, the system validates:

- Building exists.
- Building is supported.
- Room number is provided.

Invalid addresses must prevent checkout.

---

## Delivery Workflow

```text
Order Paid
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

---

## Delivery Status

Supported delivery statuses:

| Status | Description |
| ------ | ----------- |
| Waiting | Waiting for preparation |
| Preparing | Food is being prepared |
| Ready | Ready for delivery |
| Out for Delivery | Courier is delivering |
| Delivered | Customer received the order |
| Completed | Order closed |

---

## Estimated Delivery Time

Target delivery time:

```text
10–20 minutes
```

Preparation time is not included.

Actual delivery time depends on:

- Kitchen workload
- Order volume
- Walking distance

---

## Delivery Priority

Orders are delivered based on:

1. Payment Confirmation Time
2. Order Creation Time

First paid orders are delivered first.

---

## Delivery Confirmation

Delivery is completed when:

- Customer receives the order.

Future versions may support:

- Customer confirmation
- QR confirmation
- PIN confirmation

---

## Failed Delivery

Delivery may fail if:

- Customer cannot be contacted.
- Incorrect room number.
- Incorrect building.
- Customer refuses delivery.

Failed deliveries require manual handling by the business owner.

---

## Customer Notifications

Notify customer when:

- Order is ready.
- Delivery has started.
- Order has been delivered.

---

## Business Notifications

Notify the business owner when:

- Delivery starts.
- Delivery completed.
- Delivery failed.

---

## Delivery Restrictions

Current restrictions:

- Delivery only inside supported condominium areas.
- One delivery address per order.
- Address cannot be changed after preparation begins.

---

## Future Delivery Features

Future versions may support:

- Delivery Tracking
- GPS Location
- Rider Assignment
- Multiple Delivery Zones
- Scheduled Delivery
- Delivery ETA
- Multi-Branch Delivery
- Third-Party Delivery Integration

The current architecture should support these features without major redesign.

---

## Business Rules

The delivery system must:

- Accept only supported delivery areas.
- Validate address information.
- Deliver paid orders only.
- Preserve delivery history.
- Record delivery completion time.

---

## Definition of Done

The delivery workflow is complete when:

- Delivery areas are documented.
- Address validation rules are defined.
- Delivery statuses are documented.
- Notification rules are defined.
- Future expansion is supported.

---

## References

- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `157-kitchen-workflow.md`
- `158-order-status.md`
- `159-notification-rules.md`
- `160-error-scenarios.md`
