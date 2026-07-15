# Auan-Auan-Platform

> Sequence Diagrams

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Sequence Diagrams |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the sequence diagrams for all critical business workflows in Auan-Auan-Platform.

It illustrates how each component communicates throughout the system.

---

## Participants

```text
Customer
LINE LIFF
Frontend
Backend API
Database
LINE Messaging API
Owner
```

---

## Customer Login

```text
Customer
    │
    ▼
LINE LIFF
    │
    ▼
LINE Login
    │
    ▼
Backend API
    │
    ▼
Verify LINE Token
    │
    ▼
Database
    │
    ▼
Create Customer (If New)
    │
    ▼
Generate JWT
    │
    ▼
Frontend
    │
    ▼
Home Screen
```

---

## Load Product List

```text
Customer
    │
    ▼
Frontend
    │
GET /products
    │
    ▼
Backend API
    │
    ▼
Database
    │
    ▼
Products
    │
    ▼
Backend API
    │
    ▼
Frontend
    │
    ▼
Display Products
```

---

## View Product Detail

```text
Customer
    │
    ▼
Frontend
    │
GET /products/:id
    │
    ▼
Backend API
    │
    ▼
Database
    │
    ▼
Product
    │
    ▼
Frontend
```

---

## Add Product To Cart

```text
Customer
    │
    ▼
Frontend
    │
POST /cart/items
    │
    ▼
Backend API
    │
Validate Product
    │
    ▼
Database
    │
Save Cart
    │
    ▼
Frontend
    │
Update Cart
```

---

## Checkout

```text
Customer
    │
    ▼
Frontend
    │
POST /orders
    │
    ▼
Backend API
    │
Validate Cart
    │
Validate Address
    │
Calculate Total
    │
    ▼
Database
    │
Create Order
    │
Create Order Items
    │
    ▼
Frontend
```

---

## Payment

```text
Customer
    │
    ▼
Frontend
    │
Display PromptPay QR
    │
Customer Pays
    │
Tap "I've Paid"
    │
    ▼
POST /payments
    │
    ▼
Backend API
    │
Create Payment Record
    │
    ▼
Database
```

---

## Owner Payment Verification

```text
Owner
    │
    ▼
Admin Dashboard
    │
    ▼
Verify Payment
    │
    ▼
PATCH /payments/verify
    │
    ▼
Backend API
    │
Update Payment
    │
Update Order Status
    │
    ▼
Database
```

---

## Kitchen Workflow

```text
Payment Verified
        │
        ▼
Backend API
        │
        ▼
Database
        │
        ▼
Order Status
        │
        ▼
Kitchen Dashboard
        │
        ▼
Preparing
        │
        ▼
Ready
```

---

## Delivery Workflow

```text
Kitchen
    │
Ready
    │
    ▼
Owner
    │
Deliver Order
    │
    ▼
Completed
    │
    ▼
Database
```

---

## Order Status Update

```text
Owner
    │
    ▼
PATCH /orders/:id/status
    │
    ▼
Backend API
    │
Validate Transition
    │
    ▼
Database
    │
Update Status
    │
    ▼
Notification Service
```

---

## Customer Notification

```text
Order Status Changed
        │
        ▼
Notification Service
        │
        ▼
LINE Messaging API
        │
        ▼
Customer
```

---

## Product Management

```text
Owner
    │
    ▼
Admin Dashboard
    │
Create Product
    │
    ▼
Backend API
    │
Validate Data
    │
    ▼
Database
    │
Save Product
```

---

## Category Management

```text
Owner
    │
    ▼
Admin Dashboard
    │
Create Category
    │
    ▼
Backend API
    │
    ▼
Database
```

---

## Authentication

```text
Protected Request
        │
        ▼
Authentication Middleware
        │
Verify JWT
        │
        ▼
Authorization Middleware
        │
Check Permission
        │
        ▼
Controller
```

---

## Error Handling

```text
Frontend
    │
API Request
    │
    ▼
Backend API
    │
Validation Error
    │
    ▼
Error Response
    │
    ▼
Frontend
    │
Display Error
```

---

## Future Payment Automation

```text
Customer
    │
PromptPay
    │
    ▼
Bank API
    │
Webhook
    │
    ▼
Backend API
    │
Verify Payment
    │
Update Order
    │
Notify Customer
```

---

## Future Inventory Workflow

```text
Order Completed
        │
        ▼
Inventory Service
        │
Deduct Ingredients
        │
        ▼
Database
        │
Low Stock Check
        │
        ▼
Owner Notification
```

---

## Future AI Workflow

```text
Sales Data
    │
    ▼
AI Service
    │
Forecast Demand
    │
Generate Insights
    │
    ▼
Dashboard
```

---

## Design Rules

All sequence diagrams must:

- Follow chronological order.
- Clearly define participants.
- Avoid circular communication.
- Keep business logic inside the backend.
- Keep the frontend responsible only for presentation.

---

## Definition of Done

Sequence diagrams are complete when:

- All critical workflows are documented.
- System interactions are clearly defined.
- Future integrations are considered.
- Backend responsibilities are clearly separated.

---

## References

- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `157-kitchen-workflow.md`
- `170-system-architecture.md`
- `172-system-modules.md`
- `174-api-design.md`
- `180-ui-flow.md`
