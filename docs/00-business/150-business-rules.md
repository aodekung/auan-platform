# Auan-Auan-Platform

> Business Rules

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Business-rules     |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official business rules for Auan-Auan-Platform.

Every feature, API, database model, UI, and workflow must follow these business rules. These rules are the single source of truth for the application.

---

## Business Overview

Business Name

- Thai: อ้วนอ้วนหม่าล่าทอด
- English: Auan Auan Mala Fried

Platform Name

- Auan-Auan-Platform

Business Type

- Food and Beverage

Primary Sales Channel

- LINE Official Account
- LINE LIFF

Target Customers

- Residents of Regent Home Bangson Phase 27
- Residents of Regent Home Bangson Phase 28

---

## Business Objectives

The platform shall allow customers to:

- Browse products.
- Customize products.
- Add products to the cart.
- Place an order.
- Pay using PromptPay.
- Receive order status updates.

The platform shall allow the business owner to:

- Receive new orders instantly.
- Manage products.
- Manage inventory.
- Confirm payments.
- Track sales.
- Expand into a complete ERP platform in future phases.

---

## Operating Hours

| Item | Value |
| ---- | ----- |
| Opening Time | 15:00 |
| Closing Time | 22:30 |
| Business Days | Every Day |

Orders may only be placed during business hours.

The system should automatically prevent new orders outside operating hours.

---

## Delivery Area

Orders are accepted only within:

- Regent Home Bangson Phase 27
- Regent Home Bangson Phase 28

Supported Buildings

- Building A
- Building B
- Building C
- Building D

Delivery outside the supported area is not permitted.

---

## Delivery Policy

| Rule | Value |
| ---- | ----- |
| Delivery Fee | Free |
| Minimum Order | None |
| Maximum Distance | Condo Only |

Future delivery expansion should not require major architectural changes.

---

## Customer Information

Every order must include:

- Customer Name
- Phone Number
- Building
- Room Number
- Delivery Note (Optional)

The system must validate required fields before checkout.

---

## Product Rules

Products belong to categories.

Each product must have:

- Product Name
- Category
- Price
- Description
- Availability
- Image

Products may be:

- Available
- Hidden
- Out of Stock
- Disabled

Hidden products must not appear in the customer menu.

Disabled products must not be purchasable.

Out-of-stock products cannot be ordered.

---

## Product Customization

Products may include configurable options.

Supported option types include:

- Spice Level
- Sauce Selection
- Future Add-ons

The system must support optional and required selections.

---

## Shopping Cart Rules

Customers may:

- Add products.
- Remove products.
- Update quantities.
- Modify product options.

The shopping cart shall:

- Persist during the active session.
- Clear automatically after successful payment.

---

## Pricing Rules

Prices are displayed in Thai Baht (THB).

Displayed prices must always match the checkout total.

The backend is responsible for calculating:

- Item subtotal
- Optional add-ons
- Discounts
- Promotions
- Final total

The frontend must never calculate the final payable amount independently.

---

## Promotion Rules

The promotion engine shall support future expansion.

Supported promotion types include:

- Percentage Discount
- Fixed Discount
- Buy X Get Y
- Free Delivery
- Free Sauce
- Coupon
- Member Promotion
- Birthday Promotion

Only one promotion may be applied unless future business rules specify otherwise.

---

## Payment Rules

Supported payment methods:

- PromptPay QR Code

Payment verification is currently performed manually by the business owner.

The payment timeout is:

```text
300 seconds
```

Orders exceeding the payment timeout without confirmation should automatically expire.

---

## Order Lifecycle

The order status lifecycle is defined in `158-order-status.md`.

Summary:

```text
Pending → Awaiting Payment → Awaiting Verification → Paid → Queued → Preparing → Ready → Out for Delivery → Delivered → Completed
```

Alternative paths: Cancelled, Expired, Payment Rejected.

All 13 statuses, transition rules, and validation logic are documented in `158-order-status.md`.

---

## Cancellation Rules

Customers may cancel orders before kitchen preparation begins.

Orders that have entered the preparation stage cannot be cancelled.

Refund policies may be introduced in future phases.

---

## Kitchen Rules

Kitchen staff receive new orders through mobile notifications.

Kitchen workflow:

```text
New Order
    ↓
Payment Confirmed
    ↓
Preparing
    ↓
Ready
```

Estimated preparation time:

```text
20 minutes
```

---

## Inventory Rules

The platform shall support inventory tracking.

Inventory includes:

- Products
- Ingredients
- Skewers
- Sauces

Inventory should automatically decrease after successful payment.

Low-stock notifications should be supported.

---

## Notification Rules

Customers should receive notifications when:

- Order received
- Payment confirmed
- Preparing
- Ready
- Delivered
- Cancelled

Business owner should receive notifications when:

- New order
- Payment received
- Order cancelled
- Low stock detected

---

## Administrative Rules

The business owner currently has full administrative privileges.

Administrative permissions include:

- Product Management
- Price Management
- Inventory Management
- Order Management
- Reporting
- Refund Management

Future versions should support role-based access control.

---

## Reporting Rules

The platform should generate reports for:

- Daily Sales
- Monthly Sales
- Revenue
- Profit
- Top Selling Products
- Cancelled Orders
- Customer Statistics

---

## Business Constraints

The platform currently supports:

- One business
- One owner
- One kitchen
- One delivery zone

Future architecture should allow expansion without redesigning the system.

---

## Future Expansion

Future business capabilities include:

- ERP
- CRM
- Membership
- Loyalty Program
- Coupons
- Analytics
- AI Automation
- Multi-Branch Support
- Multi-Store Support

The current architecture should remain compatible with these future enhancements.

---

## Definition of Done

A business rule is considered complete when:

- The rule is documented.
- Business logic is clearly defined.
- Edge cases are identified.
- Related documentation is updated.
- Architecture reflects the rule.

---

## References

- `149-business-discovery-questionnaire.md`
- `151-product-catalog.md`
- `152-product-options.md`
- `153-pricing-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `157-kitchen-workflow.md`
- `158-order-status.md`
- `159-notification-rules.md`
- `160-error-scenarios.md`
- `161-future-roadmap.md`
