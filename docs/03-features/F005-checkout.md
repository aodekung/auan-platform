# Auan-Auan-Platform

> Feature Specification — Checkout

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | F005 Checkout      |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document specifies the **Checkout** feature for Auan-Auan-Platform.

The checkout page is the single point where customers provide delivery information, review their order, and submit it for creation. It is the gateway between the cart and the payment flow.

---

## Scope

### In Scope

- Customer information form (name, phone, building, room, delivery note)
- Building selector with phase-based grouping
- Client-side and server-side form validation
- Business hours enforcement
- Order summary display
- Double-submit prevention
- Order creation via `POST /orders`
- Building list retrieval via `GET /buildings`
- Transition to payment page on success

### Out of Scope

- Payment processing (see `F006-payment.md`)
- Order tracking after payment
- Cart modification (handled by the cart feature)
- Admin-side order management

---

## References

| Document | Relevance |
| -------- | ---------- |
| `150-business-rules.md` | Business hours, required customer fields |
| `153-pricing-rules.md` | Subtotal, delivery fee, total calculation |
| `154-order-workflow.md` | Steps 6-7 (Checkout, Create Order) |
| `155-payment-workflow.md` | Transition to payment after order creation |
| `156-delivery-rules.md` | Supported buildings, delivery area |
| `174-api-design.md` | API conventions, response format, validation |
| `70-ui-ux-rules.md` | Form design, validation feedback, button states |

---

## Page Layout

```text
┌─────────────────────────────────┐
│  Header: Checkout               │
├─────────────────────────────────┤
│                                 │
│  Customer Information Form      │
│  ┌───────────────────────────┐ │
│  │ Name          [________]  │ │
│  │ Phone Number  [________]  │ │
│  │ Building       [dropdown]  │ │
│  │ Room Number    [________]  │ │
│  │ Delivery Note  [________]  │ │
│  └───────────────────────────┘ │
│                                 │
│  Order Summary                  │
│  ┌───────────────────────────┐ │
│  │ Item 1  x2    100 THB    │ │
│  │ Item 2  x1     50 THB    │ │
│  │ ─────────────────────    │ │
│  │ Subtotal         150 THB │ │
│  │ Delivery Fee        0 THB│ │
│  │ ─────────────────────    │ │
│  │ Total           150 THB  │ │
│  └───────────────────────────┘ │
│                                 │
│  [ Place Order ]                │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation (if any)     │
└─────────────────────────────────┘
```

The entire checkout flow should be completed on a **single page** (per `70-ui-ux-rules.md`).

---

## Customer Information Form

### Fields

| Field          | Type     | Required | Validation Rules                       |
| -------------- | -------- | -------- | ------------------------------------- |
| Name           | text     | Yes      | Non-empty, trimmed                    |
| Phone Number   | text     | Yes      | Thai mobile format (see below)        |
| Building       | selector | Yes      | Must be a valid, supported building   |
| Room Number    | text     | Yes      | Non-empty, trimmed                    |
| Delivery Note  | textarea | No       | Max 200 characters                    |

### Validation Rules

#### Name

- Must not be empty after trimming.
- Must not exceed 100 characters.

#### Phone Number (Thai Mobile)

Accepted formats:

```text
0X-XXX-XXXX
0XXXXXXXXX
+66X-XXX-XXXX
+66XXXXXXXXX
```

Pattern:

```text
/^(\+66|66|0)\d{9}$/
```

Before validation, the system should strip whitespace, hyphens, and dashes.

Error message (user-friendly, per `70-ui-ux-rules.md`):

```text
Please enter a valid Thai mobile number (e.g., 081-234-5678).
```

#### Room Number

- Must not be empty after trimming.
- Must not exceed 20 characters.
- No strict format enforcement — room numbering conventions vary by building.

#### Delivery Note

- Optional.
- Max 200 characters.
- Preserved as-is (trimmed of leading/trailing whitespace).

### Validation Behavior

- Validation messages should explain **what is wrong** and **how to fix it**.
- Form input is **preserved after validation errors** — the customer must not re-enter valid fields.
- Required fields must be clearly indicated (e.g., asterisk or label).
- Inline validation is recommended for phone number format to provide immediate feedback.
- Full validation occurs on "Place Order" submission.

---

## Building Selector

The building dropdown groups options by phase.

### Data Structure

```json
[
  {
    "phase": "Phase 27",
    "buildings": ["Building 1", "Building 2", "Building 3", "..."]
  },
  {
    "phase": "Phase 28",
    "buildings": ["Building A", "Building B", "Building C", "Building D"]
  }
]
```

### Supported Buildings

#### Phase 27 — All Buildings

All buildings within Regent Home Bangson Phase 27 are supported. The full list is fetched dynamically from `GET /buildings`.

#### Phase 28 — Buildings A, B, C, D

Per `156-delivery-rules.md`, only Buildings A through D are supported.

### Selector Behavior

- Buildings are grouped under `<optgroup>` elements by phase.
- Default state: no selection (placeholder text: "Select building").
- The selector is disabled while the building list is loading.
- If the building list fails to load, show an error message with a retry option.

---

## Business Hours Check

Per `150-business-rules.md`, orders may only be placed during business hours.

| Item           | Value |
| -------------- | ----- |
| Opening Time   | 15:00 |
| Closing Time   | 22:30 |
| Business Days  | Every day |

### Implementation

- The checkout page should check business hours **on mount**.
- If the current time is outside business hours, the "Place Order" button is disabled and a message is displayed:

```text
Sorry, orders are only accepted between 15:00 and 22:30. Please come back during business hours.
```

- The backend **must also enforce** business hours on `POST /orders` — client-side enforcement alone is insufficient.
- Timezone: all times are in **ICT (UTC+7)**.
- Business hours check uses the server time from the backend, not the device clock, to prevent client-side manipulation.

---

## Order Summary

The order summary is displayed below the customer form. It provides a read-only view of the cart contents and pricing.

### Display Fields

| Field          | Description                                       |
| -------------- | ------------------------------------------------- |
| Item Name      | Product name                                      |
| Options        | Selected options (spice level, sauce)             |
| Quantity       | Number of units ordered                           |
| Item Subtotal  | Product price x quantity (per `153-pricing-rules.md`) |
| Subtotal       | Sum of all item subtotals                         |
| Delivery Fee   | `0 THB` (per `153-pricing-rules.md`)              |
| Total          | Subtotal + Delivery Fee                           |

### Calculation Rules

- The frontend **must not calculate the final total independently**.
- Pricing displayed in the order summary is derived from the cart state (which was previously validated by the backend).
- The backend **recalculates** the total on order creation and rejects mismatches.

### Amount Format

- All amounts displayed in **Thai Baht (THB)**.
- Format: `XXX THB` (no decimal places for whole baht values).
- Per `153-pricing-rules.md`: no rounding is applied.

---

## Double-Submit Prevention

To prevent duplicate orders (per `154-order-workflow.md` error handling):

1. The "Place Order" button enters a **loading state** immediately on click.
   - Button text changes to "Placing Order..."
   - Button is disabled.
   - A loading spinner is displayed.
2. The submit handler returns early if a request is already in flight.
3. On success: navigate to the payment page.
4. On failure: re-enable the button, display the error message, allow retry.

---

## Place Order Button

- Label: **"Place Order"**
- Primary button style (per `70-ui-ux-rules.md`).
- States:
  - **Default**: enabled, full color.
  - **Hover**: visible hover state.
  - **Active**: pressed state.
  - **Disabled**: greyed out (business hours check failed, form invalid, or submitting).
  - **Loading**: spinner + "Placing Order..." text.
- The button must be clearly reachable with one hand (per `70-ui-ux-rules.md` layout rules).

---

## Transition to Payment Page

On successful order creation:

1. The backend returns the created order with embedded PromptPay information.
2. The frontend navigates to the payment page (`F006-payment.md`).
3. Navigation payload includes the `orderId` (passed via route params or state, **not** in the URL path as sensitive data).

### Navigation

```text
/checkout  →  /orders/:orderId/payment
```

- The `orderId` is extracted from the `POST /orders` response.
- If navigation fails (e.g., network issue after order creation), the customer should be able to return to the payment page via order status or a deep link.

---

## API Integration

### POST /orders

Creates an order from the cart contents and customer information.

#### Request

```json
{
  "customerName": "Somchai",
  "phoneNumber": "0812345678",
  "building": "Building A",
  "roomNumber": "1208",
  "deliveryNote": "Leave on the table",
  "items": [
    {
      "productId": "prod_001",
      "productName": "Chicken Skewer",
      "quantity": 2,
      "unitPrice": 25,
      "options": [
        { "optionGroup": "Spice Level", "value": "Medium" },
        { "optionGroup": "Sauce", "value": "Tamarind" }
      ]
    }
  ]
}
```

#### Success Response (201)

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "ORD-20260713-000001",
    "status": "Awaiting Payment",
    "totalAmount": 150,
    "createdAt": "2026-07-13T18:30:00+07:00",
    "payment": {
      "paymentId": "pay_001",
      "promptPayNumber": "098-765-4321",
      "promptPayQR": "https://example.com/qr/promptpay.png",
      "expiresAt": "2026-07-13T18:35:00+07:00"
    }
  }
}
```

#### Error Responses

| Status | Scenario              | Error Message                            |
| ------ | --------------------- | ---------------------------------------- |
| 400    | Validation failed     | Field-specific error details             |
| 400    | Business hours closed | "Orders are accepted 15:00-22:30 only"   |
| 409    | Cart empty / invalid  | "Your cart is empty or invalid"          |
| 422    | Price mismatch        | "Cart total does not match"              |

### GET /buildings

Returns the list of supported buildings grouped by phase.

#### Success Response (200)

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "phase": "Phase 27",
      "buildings": [
        { "id": "p27-b1", "name": "Building 1" },
        { "id": "p27-b2", "name": "Building 2" }
      ]
    },
    {
      "phase": "Phase 28",
      "buildings": [
        { "id": "p28-a", "name": "Building A" },
        { "id": "p28-b", "name": "Building B" },
        { "id": "p28-c", "name": "Building C" },
        { "id": "p28-d", "name": "Building D" }
      ]
    }
  ]
}
```

This data is cached on the client for the session duration.

---

## Error Handling

Per `154-order-workflow.md`, the checkout must handle:

| Scenario              | User-Facing Message                                                     | Action                        |
| --------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| Network failure       | "Unable to place your order. Please check your connection and try again." | Retry button shown            |
| Business hours closed | "Orders are accepted between 15:00 and 22:30 only."                    | Button disabled, message shown |
| Cart empty            | "Your cart is empty. Add items before checking out."                    | Redirect to cart/menu         |
| Price mismatch        | "Your cart total has changed. Please review and try again."             | Refresh cart, retry           |
| Validation failure    | Field-specific messages                                                 | Highlight invalid fields      |
| Server error (500)    | "Something went wrong. Please try again later."                         | Retry button shown            |
| Duplicate submission  | Prevented by double-submit logic                                        | N/A                           |

All error messages follow the guidelines in `70-ui-ux-rules.md` (explain the problem, suggest a solution, avoid technical terminology).

---

## State Management

### Local State (checkout page)

| State Field            | Type     | Default  | Description                           |
| ---------------------- | -------- | -------- | ------------------------------------- |
| customerName           | string   | `""`     | Customer name input                    |
| phoneNumber            | string   | `""`     | Phone number input                    |
| building               | string   | `null`   | Selected building ID                  |
| roomNumber             | string   | `""`     | Room number input                     |
| deliveryNote           | string   | `""`     | Delivery note input                   |
| buildings              | array    | `[]`     | Building list from API               |
| buildingsLoading       | boolean  | `true`   | Whether building list is loading     |
| isSubmitting           | boolean  | `false`  | Whether order is being submitted      |
| error                  | object   | `null`   | Form-level error message              |
| fieldErrors            | object   | `{}`     | Per-field validation errors           |
| isBusinessOpen         | boolean  | `true`   | Whether business is currently open    |

### Pre-population

If the customer has previously placed an order, the system may pre-populate name, phone, building, and room number from their most recent order. The delivery note is never pre-populated.

### Derived State

- `isFormValid`: all required fields pass validation, building is selected.
- `isPlaceOrderDisabled`: `!isFormValid || !isBusinessOpen || isSubmitting`.

---

## Testing Requirements

### Unit Tests

| Test Case                              | Expected Result                             |
| -------------------------------------- | ------------------------------------------ |
| Empty name triggers validation error    | Error shown for name field                 |
| Invalid phone format triggers error    | Error shown with format hint               |
| Valid Thai mobile formats accepted     | 0X-XXX-XXXX, 0XXXXXXXXX, +66 formats pass  |
| Missing building triggers error        | Error shown for building field             |
| Empty room number triggers error        | Error shown for room field                 |
| Delivery note exceeding 200 chars      | Error shown for delivery note field        |
| Optional delivery note can be empty     | Validation passes                          |
| Place Order disabled when form invalid  | Button is disabled                         |
| Place Order disabled when outside hours | Button is disabled, message shown          |
| Submitting state prevents double click  | Button disabled during request             |

### Integration Tests

| Test Case                                  | Expected Result                          |
| ------------------------------------------ | ---------------------------------------- |
| `POST /orders` with valid data returns 201 | Order created, payment info returned     |
| `POST /orders` outside business hours      | Returns 400 with closed-hours message    |
| `POST /orders` with empty cart             | Returns 409                              |
| `POST /orders` with price mismatch         | Returns 422                              |
| `GET /buildings` returns grouped buildings | Phase 27 + Phase 28 groups returned      |
| Successful order navigates to payment page | Correct route with orderId               |

### Edge Cases

- Customer navigates away during submission — handle via double-submit prevention and idempotency.
- Building list API fails — display error with retry; do not block the rest of the form partially.
- Device clock is wrong — rely on server time for business hours check.

---

## Future Expansion

The checkout feature should support future enhancements without major redesign:

- **Delivery fee calculation**: distance-based or zone-based fees (per `153-pricing-rules.md`).
- **Promotions and discount codes**: input field for coupon codes (per `153-pricing-rules.md`).
- **Scheduled delivery**: date/time picker for future orders.
- **Address autocomplete**: smart room/building suggestions for returning customers.
- **Order splitting**: multiple delivery addresses per order.
- **Saved addresses**: customer address book.

---

## Definition of Done

The checkout feature is complete when:

- Customer information form renders with all required fields.
- Building selector groups buildings by phase (Phase 27 all buildings, Phase 28 A-D).
- Form validation works for all fields with user-friendly messages.
- Business hours are enforced (client and server).
- Order summary displays correct pricing.
- Double-submit prevention is implemented.
- `POST /orders` integration is functional.
- `GET /buildings` integration is functional.
- Error handling covers all documented scenarios.
- Transition to payment page works correctly.
- Unit and integration tests pass.

---

## References

- `150-business-rules.md`
- `153-pricing-rules.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
- `156-delivery-rules.md`
- `70-ui-ux-rules.md`
- `174-api-design.md`
- `F006-payment.md`
