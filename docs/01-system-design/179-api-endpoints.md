# Auan-Auan-Platform

> API Endpoints Specification

## Document Information

| Item | Value |
| ---- | ----- |
| Document | API Endpoints Specification |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines every REST API endpoint used by Auan-Auan-Platform.

This document is the source of truth for backend API implementation.

---

## API Version

```text
/api/v1
```

---

## Response Format

Successful Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR"
  }
}
```

---

## Authentication

Authentication:

```text
Bearer JWT
```

Authorization Header

```text
Authorization: Bearer <token>
```

---

## Health

## GET /health

Purpose

Check API status.

Authentication

```text
Public
```

---

Authentication

## POST /auth/login

Purpose

Login with LINE Login.

Authentication

```text
Public
```

---

## POST /auth/logout

Purpose

Logout current user.

Authentication

```text
Required
```

---

## GET /auth/profile

Purpose

Get current user profile.

Authentication

```text
Required
```

---

## Categories

## GET /categories

Purpose

Retrieve all active categories.

Authentication

```text
Public
```

---

## GET /categories/:id

Purpose

Retrieve category details.

Authentication

```text
Public
```

---

## POST /categories

Purpose

Create category.

Authentication

```text
Owner
```

---

## PATCH /categories/:id

Purpose

Update category.

Authentication

```text
Owner
```

---

## DELETE /categories/:id

Purpose

Disable category.

Authentication

```text
Owner
```

---

## Products

## GET /products

Purpose

Retrieve product list.

Authentication

```text
Public
```

Query Parameters

| Parameter | Description |
| --------- | ----------- |
| category | Category ID |
| search | Keyword |
| available | Availability |

---

## GET /products/:id

Purpose

Retrieve product details.

Authentication

```text
Public
```

---

## POST /products

Purpose

Create product.

Authentication

```text
Owner
```

---

## PATCH /products/:id

Purpose

Update product.

Authentication

```text
Owner
```

---

## DELETE /products/:id

Purpose

Disable product.

Authentication

```text
Owner
```

---

## Product Options

## GET /products/:id/options

Purpose

Retrieve available product options.

Authentication

```text
Public
```

---

## POST /products/:id/options

Purpose

Create option group.

Authentication

```text
Owner
```

---

## PATCH /product-options/:id

Purpose

Update product option.

Authentication

```text
Owner
```

---

## DELETE /product-options/:id

Purpose

Disable product option.

Authentication

```text
Owner
```

---

## Customer

## GET /customers/me

Purpose

Retrieve current customer.

Authentication

```text
Required
```

---

## PATCH /customers/me

Purpose

Update customer profile.

Authentication

```text
Required
```

---

## Customer Address

## GET /addresses

Purpose

Retrieve customer addresses.

Authentication

```text
Required
```

---

## POST /addresses

Purpose

Create address.

Authentication

```text
Required
```

---

## PATCH /addresses/:id

Purpose

Update address.

Authentication

```text
Required
```

---

## DELETE /addresses/:id

Purpose

Delete address.

Authentication

```text
Required
```

---

## Cart

## GET /cart

Purpose

Retrieve shopping cart.

Authentication

```text
Required
```

---

## POST /cart/items

Purpose

Add product to cart.

Authentication

```text
Required
```

---

## PATCH /cart/items/:id

Purpose

Update cart item.

Authentication

```text
Required
```

---

## DELETE /cart/items/:id

Purpose

Remove cart item.

Authentication

```text
Required
```

---

## DELETE /cart

Purpose

Clear shopping cart.

Authentication

```text
Required
```

---

## Orders

## GET /orders

Purpose

Retrieve customer orders.

Authentication

```text
Required
```

---

## GET /orders/:id

Purpose

Retrieve order details.

Authentication

```text
Required
```

---

## POST /orders

Purpose

Create order.

Authentication

```text
Required
```

---

## PATCH /orders/:id/cancel

Purpose

Cancel order.

Authentication

```text
Required
```

---

## PATCH /orders/:id/status

Purpose

Update order status.

Authentication

```text
Owner
```

---

## Payments

## GET /payments/:orderId

Purpose

Retrieve payment information.

Authentication

```text
Required
```

---

## POST /payments

Purpose

Create payment.

Authentication

```text
Required
```

---

## POST /payments/upload-slip

Purpose

Upload payment slip.

Authentication

```text
Required
```

---

## POST /payments/verify

Purpose

Verify payment.

Authentication

```text
Owner
```

---

## PATCH /payments/reject

Purpose

Reject payment.

Authentication

```text
Owner
```

---

## Notifications

## GET /notifications

Purpose

Retrieve notifications.

Authentication

```text
Required
```

---

## PATCH /notifications/:id/read

Purpose

Mark notification as read.

Authentication

```text
Required
```

---

## Admin Dashboard

## GET /admin/dashboard

Purpose

Retrieve dashboard summary.

Authentication

```text
Owner
```

---

## Admin Orders

## GET /admin/orders

Purpose

Retrieve all orders.

Authentication

```text
Owner
```

---

## GET /admin/orders/:id

Purpose

Retrieve order details.

Authentication

```text
Owner
```

---

## Admin Products

## GET /admin/products

Purpose

Retrieve all products.

Authentication

```text
Owner
```

---

## Admin Customers

## GET /admin/customers

Purpose

Retrieve customer list.

Authentication

```text
Owner
```

---

## Admin Inventory (Future)

## GET /admin/inventory

Purpose

Retrieve inventory.

Authentication

```text
Owner
```

---

## Admin Reports (Future)

## GET /admin/reports/sales

Purpose

Retrieve sales report.

Authentication

```text
Owner
```

---

## GET /admin/reports/products

Purpose

Retrieve product report.

Authentication

```text
Owner
```

---

## HTTP Status Codes

| Code | Description |
| ---- | ----------- |
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## API Rules

Every endpoint must:

- Validate input with Zod.
- Return standardized responses.
- Use JWT authentication where required.
- Log important operations.
- Never expose internal errors.
- Never trust frontend validation.

---

## Future Endpoints

Future modules may introduce:

- Inventory API
- Supplier API
- Recipe API
- Employee API
- Branch API
- Coupon API
- Loyalty API
- Analytics API
- AI API

---

## Definition of Done

The API specification is complete when:

- Every endpoint is documented.
- Authentication requirements are defined.
- Response formats are standardized.
- Future expansion is supported.

---

## References

- `90-api-rules.md`
- `150-business-rules.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `173-database-design.md`
- `174-api-design.md`
- `175-authentication-authorization.md`
