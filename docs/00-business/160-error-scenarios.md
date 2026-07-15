# Auan-Auan-Platform

> Error Scenarios

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Error Scenarios |
| Version | 1.0.0 |
| Status | Active |
| Owner | Business Owner |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines all expected error scenarios within Auan-Auan-Platform.

Every known error should be handled gracefully without causing data inconsistency or application crashes.

---

## Design Principles

Error handling must be:

- Predictable
- User-friendly
- Recoverable
- Secure
- Logged
- Traceable

Internal system details must never be exposed to customers.

---

## Error Categories

| Category | Description |
| -------- | ----------- |
| Validation Error | Invalid user input |
| Business Rule Error | Business rule violation |
| Authentication Error | User authentication failed |
| Authorization Error | Permission denied |
| Payment Error | Payment-related issue |
| Product Error | Product unavailable |
| Inventory Error | Inventory problem |
| Order Error | Order processing issue |
| Network Error | Connection failure |
| Server Error | Unexpected system failure |

---

## Validation Errors

### Missing Required Fields

Examples:

- Customer Name
- Building
- Room Number

Response:

```text
Please complete all required fields.
```

---

### Invalid Phone Number

Response:

```text
Please enter a valid phone number.
```

---

### Invalid Building

Response:

```text
Selected building is not supported.
```

---

### Invalid Room Number

Response:

```text
Please enter a valid room number.
```

---

## Product Errors

### Product Not Found

Response:

```text
Product not found.
```

---

### Product Disabled

Response:

```text
This product is currently unavailable.
```

---

### Product Hidden

Hidden products should never be returned by the API.

---

### Out of Stock

Response:

```text
This product is currently out of stock.
```

---

## Product Option Errors

Examples:

- Required option missing
- Invalid option
- Disabled option
- Invalid option combination

Response:

```text
Please review your product selections.
```

---

## Cart Errors

Possible scenarios:

- Empty cart
- Invalid quantity
- Product removed while shopping
- Price changed before checkout

Response:

```text
Your cart has been updated. Please review your order.
```

---

## Pricing Errors

Possible scenarios:

- Price mismatch
- Invalid promotion
- Invalid discount
- Calculation mismatch

The backend is always the source of truth.

Response:

```text
Order total has changed. Please review before payment.
```

---

## Payment Errors

### Payment Timeout

Response:

```text
Payment session has expired.
```

Order Status:

```text
Expired
```

---

### Duplicate Payment

Response:

```text
Payment has already been received.
```

---

### Invalid Payment Amount

Response:

```text
Payment amount does not match the order total.
```

---

### Payment Rejected

Response:

```text
Payment verification failed.
```

---

## Order Errors

### Order Not Found

Response:

```text
Order not found.
```

---

### Order Already Completed

Response:

```text
This order has already been completed.
```

---

### Order Already Cancelled

Response:

```text
This order has already been cancelled.
```

---

### Invalid Status Transition

Example:

```text
Preparing
        ↓
Awaiting Payment
```

This transition is not allowed.

Response:

```text
Invalid order status.
```

---

## Delivery Errors

Possible scenarios:

- Unsupported building
- Invalid room number
- Delivery area unavailable

Response:

```text
Delivery is unavailable for the selected address.
```

---

## Inventory Errors

Possible scenarios:

- Product unavailable
- Ingredient unavailable
- Stock depleted during checkout

Response:

```text
Some items are no longer available.
```

---

## Authentication Errors

Examples:

- Session expired
- Invalid LINE Login
- Missing access token

Response:

```text
Please sign in again.
```

---

## Authorization Errors

Examples:

- Customer accessing admin endpoint
- Staff accessing restricted resources

Response:

```text
You do not have permission to perform this action.
```

---

## Network Errors

Possible scenarios:

- Internet disconnected
- Request timeout
- API unavailable

Response:

```text
Network connection failed. Please try again.
```

---

## Server Errors

Examples:

- Database unavailable
- Unexpected exception
- Internal processing error

Response:

```text
Something went wrong. Please try again later.
```

The system must log detailed technical information internally.

---

## Notification Errors

Possible scenarios:

- LINE API unavailable
- Notification delivery failed
- Duplicate notification

The system should retry automatically according to the retry policy.

---

## Logging Rules

Every error must record:

- Error ID
- Timestamp
- User ID (if available)
- Order ID (if available)
- Error Category
- Error Message
- Stack Trace (Internal Only)

Logs must never expose sensitive information.

---

## Error Severity

| Severity | Description |
| -------- | ----------- |
| Low | Minor issue with no business impact |
| Medium | Feature partially affected |
| High | Important functionality unavailable |
| Critical | Business operation interrupted |

Critical errors should immediately notify the business owner.

---

## Recovery Strategy

Whenever possible, the system should:

- Retry failed operations.
- Roll back incomplete transactions.
- Preserve existing data.
- Prevent duplicate operations.
- Display meaningful error messages.

---

## Business Rules

The system must never:

- Lose customer orders.
- Process duplicate payments.
- Skip required validations.
- Expose sensitive information.
- Crash without logging the error.

---

## Future Error Handling

Future versions may support:

- Automatic Recovery
- Error Monitoring Dashboard
- Alert Notifications
- Centralized Logging
- Distributed Tracing
- AI-assisted Error Analysis

The architecture should support these capabilities without major redesign.

---

## Definition of Done

Error handling is complete when:

- Expected errors are documented.
- Recovery strategies are defined.
- User messages are clear.
- Errors are logged.
- Sensitive information is protected.
- Future expansion is supported.

---

## References

- `100-security-rules.md`
- `150-business-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `157-kitchen-workflow.md`
- `158-order-status.md`
- `159-notification-rules.md`
