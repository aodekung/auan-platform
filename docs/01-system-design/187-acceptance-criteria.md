# Auan-Auan-Platform

> Acceptance Criteria

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Acceptance Criteria |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the acceptance criteria for every MVP feature of Auan-Auan-Platform.

Each feature is considered complete only when all acceptance criteria are satisfied.

---

## Acceptance Format

All acceptance criteria follow the Gherkin format.

```text
Given <context>

When <action>

Then <expected result>
```

---

## Authentication

### Customer Login

```text
Given the customer opens the LIFF application

When the customer signs in using LINE Login

Then the customer is authenticated and redirected to the Home screen.
```

---

### Existing Customer

```text
Given the customer has previously signed in

When authentication succeeds

Then the existing customer account is reused.
```

---

### New Customer

```text
Given the customer does not exist

When authentication succeeds

Then a new customer account is created automatically.
```

---

## Product Browsing

### View Categories

```text
Given categories exist

When the customer opens the Home screen

Then all active categories are displayed.
```

---

### View Products

```text
Given products exist

When a category is selected

Then only available products within that category are displayed.
```

---

### Search Products

```text
Given products exist

When the customer searches using a keyword

Then matching products are displayed.
```

---

## Product Details

### View Product

```text
Given a product exists

When the customer opens the product page

Then all product information is displayed.
```

---

### Product Options

```text
Given a product contains option groups

When the customer opens the product page

Then all required and optional options are displayed.
```

---

### Required Options

```text
Given required options exist

When the customer attempts to add the product to the cart

Then all required options must be selected before continuing.
```

---

## Shopping Cart

### Add Product

```text
Given the customer has selected valid options

When the customer taps "Add To Cart"

Then the selected product is added to the shopping cart.
```

---

### Update Quantity

```text
Given a product exists in the cart

When the quantity changes

Then the subtotal is recalculated immediately.
```

---

### Remove Product

```text
Given a product exists in the cart

When the customer removes the product

Then it no longer appears in the cart.
```

---

### Empty Cart

```text
Given no products remain

When the last item is removed

Then the empty cart screen is displayed.
```

---

## Checkout

### Create Order

```text
Given the shopping cart contains products

When checkout is completed

Then an order is created successfully.
```

---

### Address Validation

```text
Given the customer submits the checkout form

When required address fields are missing

Then validation errors are displayed.
```

---

### Order Summary

```text
Given checkout is displayed

When the customer reviews the order

Then the total amount is calculated correctly.
```

---

## Payment

### PromptPay QR

```text
Given an order has been created

When the payment screen opens

Then the PromptPay QR Code and account information are displayed.
```

---

### Payment Submission

```text
Given payment has been completed

When the customer taps "I've Paid"

Then the payment record is created.
```

---

### Payment Verification

```text
Given payment is awaiting verification

When the owner approves the payment

Then the order status changes to Preparing.
```

---

### Payment Rejection

```text
Given payment verification fails

When the owner rejects the payment

Then the customer is informed and the payment status becomes Rejected.
```

---

## Order Status

### Preparing

```text
Given payment has been verified

When preparation begins

Then the order status becomes Preparing.
```

---

### Ready

```text
Given food preparation is complete

When the owner marks the order as ready

Then the order status becomes Ready.
```

---

### Completed

```text
Given the customer receives the order

When delivery is complete

Then the order status becomes Completed.
```

---

### Cancel Order

```text
Given the order has not entered preparation

When the customer cancels the order

Then the order status becomes Cancelled.
```

---

## Admin

### Product Management

```text
Given the owner creates a new product

When all required information is valid

Then the product is available in the product list.
```

---

### Update Product

```text
Given a product exists

When the owner edits product information

Then the updated information is displayed immediately.
```

---

### Category Management

```text
Given the owner creates a category

When the category is saved

Then it appears in the category list.
```

---

### Dashboard

```text
Given the owner opens the dashboard

When data loads successfully

Then business statistics are displayed.
```

---

## Notifications

### New Order

```text
Given a customer creates an order

When the order is saved

Then the owner receives a notification.
```

---

### Status Update

```text
Given the order status changes

When the update is completed

Then the customer receives a notification.
```

---

## Error Handling

### Network Failure

```text
Given the network connection fails

When an API request is sent

Then a user-friendly error message is displayed.
```

---

### Unauthorized Access

```text
Given authentication is invalid

When a protected endpoint is requested

Then HTTP 401 is returned.
```

---

### Forbidden Access

```text
Given the authenticated user lacks permission

When a protected operation is attempted

Then HTTP 403 is returned.
```

---

## Performance

### Product Loading

```text
Given the customer opens the Home screen

When products are requested

Then product data should load within an acceptable response time.
```

---

Checkout

```text
Given checkout is submitted

When validation succeeds

Then order creation completes without duplicate submissions.
```

---

## MVP Completion Criteria

The MVP is considered complete when:

- LINE Login works.
- Products are displayed.
- Categories are displayed.
- Product options work correctly.
- Shopping cart functions correctly.
- Checkout succeeds.
- PromptPay QR is displayed.
- Payment verification works.
- Order tracking works.
- Owner can manage products.
- Owner can manage orders.

---

## Definition of Done

A feature is complete only when:

- Acceptance criteria pass.
- Business rules are satisfied.
- Manual testing passes.
- Automated tests pass (where applicable).
- Documentation is updated.

---

## References

- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `177-testing-strategy.md`
- `179-api-endpoints.md`
- `180-ui-flow.md`
- `181-screen-spec.md`
- `186-user-stories.md`
