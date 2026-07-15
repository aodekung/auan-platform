# Auan-Auan-Platform

> UI Flow

## Document Information

| Item | Value |
| ---- | ----- |
| Document | UI Flow |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines every user interface flow within Auan-Auan-Platform.

It serves as the primary reference for frontend development, UI implementation, and user experience design.

---

## Design Principles

Every user flow should be:

- Simple
- Fast
- Predictable
- Mobile-First
- Touch-Friendly
- Easy to Understand

Customers should complete an order with the fewest possible steps.

---

## Overall Customer Journey

```text
LINE Official Account
        │
        ▼
Rich Menu
        │
        ▼
Open LIFF
        │
        ▼
LINE Login
        │
        ▼
Home
        │
        ▼
Category
        │
        ▼
Product Detail
        │
        ▼
Select Options
        │
        ▼
Add To Cart
        │
        ▼
Cart
        │
        ▼
Checkout
        │
        ▼
PromptPay QR
        │
        ▼
Waiting Payment Verification
        │
        ▼
Preparing
        │
        ▼
Ready
        │
        ▼
Completed
```

---

## Rich Menu Flow

```text
Customer
        │
        ▼
Tap Rich Menu
        │
        ▼
Open LIFF
```

---

## Login Flow

```text
Open LIFF
        │
        ▼
Check Login
        │
        ├───────────────► Already Logged In
        │                        │
        │                        ▼
        │                    Home
        │
        ▼
LINE Login
        │
        ▼
Create Customer (If New)
        │
        ▼
Home
```

---

## Home Flow

```text
Home
│
├── Categories
├── Popular Products
├── Promotions
├── Search
└── Shopping Cart
```

---

## Product Browsing Flow

```text
Home
        │
        ▼
Select Category
        │
        ▼
Product List
        │
        ▼
Product Detail
```

---

## Product Detail Flow

```text
Product Detail
│
├── Product Image
├── Description
├── Price
├── Product Options
├── Quantity
└── Add To Cart
```

---

## Product Option Flow

```text
Product Detail
        │
        ▼
Select Required Options
        │
        ▼
Select Optional Extras
        │
        ▼
Quantity
        │
        ▼
Price Update
        │
        ▼
Add To Cart
```

---

## Shopping Cart Flow

```text
Cart
│
├── Product List
├── Update Quantity
├── Remove Item
├── Order Summary
└── Checkout
```

---

## Checkout Flow

```text
Cart
        │
        ▼
Checkout
        │
        ├── Customer Name
        ├── Building
        ├── Room Number
        ├── Delivery Note
        ├── Order Summary
        └── Confirm Order
```

---

## Payment Flow

```text
Confirm Order
        │
        ▼
Generate Order
        │
        ▼
Display PromptPay QR
        │
        ▼
Display PromptPay Number
        │
        ▼
Customer Pays
        │
        ▼
Tap "I've Paid"
        │
        ▼
Waiting Verification
```

---

## Order Tracking Flow

```text
Pending Payment
        │
        ▼
Payment Verification
        │
        ▼
Preparing
        │
        ▼
Ready
        │
        ▼
Completed
```

---

## Order History Flow

```text
Profile
        │
        ▼
Order History
        │
        ▼
Order Detail
```

---

## Admin Login Flow

```text
Owner Login
        │
        ▼
Dashboard
```

---

## Admin Dashboard Flow

```text
Dashboard
│
├── Orders
├── Products
├── Categories
├── Customers
├── Reports
└── Settings
```

---

## Order Management Flow

```text
Dashboard
        │
        ▼
Orders
        │
        ▼
Order Detail
        │
        ▼
Verify Payment
        │
        ▼
Preparing
        │
        ▼
Ready
        │
        ▼
Completed
```

---

## Product Management Flow

```text
Dashboard
        │
        ▼
Products
        │
        ├── Create
        ├── Edit
        ├── Disable
        └── Delete (Future)
```

---

## Category Management Flow

```text
Dashboard
        │
        ▼
Categories
        │
        ├── Create
        ├── Edit
        └── Disable
```

---

## Notification Flow

```text
New Order
        │
        ▼
Owner Notification
        │
        ▼
Verify Payment
        │
        ▼
Customer Notification
```

---

## Error Flow

```text
Validation Error
        │
        ▼
Display Error Message
        │
        ▼
User Corrects Input
        │
        ▼
Continue
```

---

## Empty States

The UI should provide dedicated screens for:

- Empty Cart
- No Products
- No Orders
- No Notifications
- No Search Results

---

## Loading States

Every API request should display:

- Skeleton Loader
- Loading Spinner
- Disabled Buttons

The UI must prevent duplicate actions during loading.

---

## Success States

Examples:

- Product Added
- Order Created
- Payment Submitted
- Profile Updated

Each success state should provide immediate visual feedback.

---

## Responsive Design

Primary target:

```text
Mobile First
```

Supported devices:

- Mobile
- Tablet
- Desktop (Admin)

---

## Accessibility

Every screen should support:

- Proper Labels
- Large Touch Targets
- Color Contrast
- Keyboard Navigation (Admin)

---

## Future UI Flows

Future releases may include:

- Loyalty Program
- Membership
- Coupons
- Favorites
- Reorder
- Multi-Branch
- AI Assistant

---

## Definition of Done

The UI flow is complete when:

- Every customer journey is documented.
- Every admin flow is documented.
- Error flows are defined.
- Loading states are defined.
- Future expansion is supported.

---

## References

- `70-ui-ux-rules.md`
- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `158-order-status.md`
- `170-system-architecture.md`
- `174-api-design.md`
