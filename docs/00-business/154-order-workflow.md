# Auan-Auan-Platform

> Order Workflow

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Order Workflow     |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official order workflow for Auan-Auan-Platform.

Every order must follow this workflow from product selection until completion.

---

## Workflow Overview

```text
Browse Menu
        ↓
View Product
        ↓
Select Product Options
        ↓
Add to Cart
        ↓
Review Cart
        ↓
Checkout
        ↓
Customer Information
        ↓
Create Order
        ↓
PromptPay Payment
        ↓
Await Payment Verification
        ↓
Payment Confirmed
        ↓
Kitchen Notification
        ↓
Preparing
        ↓
Ready for Delivery
        ↓
Delivered
        ↓
Completed
```

---

## Step 1 — Browse Menu

Customers access the menu through:

- LINE Official Account
- Rich Menu
- LIFF Application

Customers may:

- Browse categories
- Search products
- View product details

---

## Step 2 — View Product

Each product page displays:

- Product Image
- Product Name
- Description
- Price
- Product Options
- Availability Status

Unavailable products cannot be purchased.

---

## Step 3 — Select Product Options

Customers must select:

- Spice Level
- Sauce

The system validates all required options before allowing the product to be added to the cart.

---

## Step 4 — Add to Cart

The cart stores:

- Product
- Quantity
- Selected Options
- Subtotal

Customers may:

- Continue shopping
- Edit items
- Remove items

---

## Step 5 — Review Cart

The cart page displays:

- Products
- Options
- Quantity
- Subtotal
- Total Price

Customers may modify the cart before checkout.

---

## Step 6 — Checkout

Customers must provide:

- Name
- Phone Number
- Building
- Room Number
- Delivery Note (Optional)

The system validates all required information before creating an order.

---

## Step 7 — Create Order

When checkout is successful:

The backend creates:

- Order
- Order Items
- Selected Options
- Order Total

The system generates:

- Order Number
- Order Timestamp

---

## Step 8 — Payment

The payment page displays:

- PromptPay QR Code
- PromptPay Number
- Total Amount
- Payment Countdown

Current payment timeout:

```text
300 seconds
```

---

## Step 9 — Await Payment Verification

The customer uploads or confirms payment.

The business owner manually verifies the payment.

Order Status:

```text
Awaiting Payment
```

---

## Step 10 — Payment Confirmed

When payment is verified:

The system shall:

- Update Order Status
- Record Payment Time
- Notify Customer
- Notify Kitchen

Inventory should be reduced after payment confirmation.

---

## Step 11 — Kitchen Notification

The kitchen receives:

- Notification
- Customer Name
- Building
- Room Number
- Ordered Items
- Selected Options
- Delivery Note

Kitchen staff begin food preparation.

---

## Step 12 — Preparing

Order Status:

```text
Preparing
```

Estimated preparation time:

```text
20 minutes
```

Orders in preparation cannot be cancelled.

---

## Step 13 — Ready for Delivery

Order Status:

```text
Ready
```

The kitchen confirms that the order is complete.

The delivery process begins.

---

## Step 14 — Delivered

Order Status:

```text
Delivered
```

The customer receives the order.

---

## Step 15 — Completed

Order Status:

```text
Completed
```

Completed orders become part of the sales history.

Historical order information must never be modified.

---

## Order Number

Recommended format:

```text
ORD-20260713-000001
```

Requirements:

- Unique
- Sequential
- Immutable

---

## Order Validation

Before creating an order, the system verifies:

- Business is open.
- Product exists.
- Product is available.
- Required options selected.
- Customer information complete.
- Cart total matches backend calculation.

---

## Payment Timeout

If payment is not confirmed within:

```text
300 seconds
```

The order automatically becomes:

```text
Expired
```

Expired orders cannot be reactivated.

Customers must create a new order.

---

## Cancellation Rules

Customers may cancel orders only before:

```text
Preparing
```

Cancelled orders update inventory only if stock has already been reserved.

---

## Error Handling

The system should handle:

- Product unavailable
- Invalid options
- Invalid customer information
- Payment timeout
- Duplicate payment
- Duplicate order submission
- Network interruption

Errors should return clear, user-friendly messages.

---

## Future Workflow Support

The workflow should support future features:

- Automatic Payment Verification
- Delivery Tracking
- Kitchen Display System
- Rider Assignment
- Scheduled Orders
- Multiple Payment Methods
- Partial Refunds
- Order Reordering

Future features should not require redesigning the order workflow.

---

## Definition of Done

The order workflow is complete when:

- Every workflow step is documented.
- Validation rules are defined.
- Status transitions are documented.
- Error scenarios are identified.
- Future expansion is supported.

---

## References

- `150-business-rules.md`
- `151-product-catalog.md`
- `152-product-options.md`
- `153-pricing-rules.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `157-kitchen-workflow.md`
- `158-order-status.md`
