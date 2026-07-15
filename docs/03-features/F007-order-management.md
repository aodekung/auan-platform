# Auan-Auan-Platform

> Order Management (F007)

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Order Management |
| Feature | F007 |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the customer-facing order management feature for Auan-Auan-Platform.

Customers use this feature to track their active orders in real time, view order history, access order details, and cancel orders when permitted.

---

## Scope

This feature covers the customer-facing order management interface within the LINE LIFF application. It does not cover the business owner dashboard, kitchen display, or admin order management.

Included:

- Active Order view (current in-progress order)
- Order History view (all past orders)
- Order Detail view (full order information)
- Order cancellation flow
- Notification deep links into the order view
- Pull-to-refresh behavior

Excluded:

- Order creation and checkout (F005)
- Payment flow (F006)
- Kitchen order management (F008)
- Admin order management

---

## Design Principles

The order management interface must be:

- Clear and instantly scannable
- Consistent with the 13-status lifecycle defined in `158-order-status.md`
- Mobile-first (LINE LIFF primary target)
- Non-intrusive: customers see what they need without unnecessary taps
- Optimistic where appropriate with graceful fallback

---

## View Architecture

### Navigation Flow

```text
Bottom Tab: Orders
        |
        +-- Active Order (if order is in progress)
        |       |
        |       +-- Order Detail (expanded)
        |       +-- Cancel Order (dialog)
        |
        +-- Order History (default when no active order)
                |
                +-- Order Detail (tap to expand)
```

If the customer has an active order, the Active Order view is shown by default. If no active order exists, the Order History view is shown instead.

---

## Active Order View

### Purpose

Displays the customer's current in-progress order with a real-time status timeline.

### Eligible Statuses

The Active Order view is displayed when the order status is one of:

| Status | Displayed |
| ------ | --------- |
| Pending | Yes |
| Awaiting Payment | Yes |
| Awaiting Verification | Yes |
| Paid | Yes |
| Queued | Yes |
| Preparing | Yes |
| Ready | Yes |
| Out for Delivery | Yes |
| Delivered | Yes |

Once the order reaches **Completed**, **Cancelled**, **Expired**, or **Payment Rejected**, it moves to Order History.

### Layout

```text
[Header: "My Order"]

[Status Timeline]

[Order Number]
[Created At timestamp]

[Order Items]
  - Item name
  - Options
  - Quantity x Price

[Divider]

[Delivery Address]
  - Building
  - Room Number
  - Delivery Note (if provided)

[Cancel Button] (conditional)

[Pull-to-refresh indicator]
```

### Order Items Display

Each item in the order must show:

| Field | Example |
| ----- | ------- |
| Product Name | Pad Thai |
| Options | Spice Level: Medium, Extra Egg |
| Quantity | 2x |
| Subtotal | 180 THB |

Items should be displayed in the same order they were added to the cart.

### Delivery Address Display

| Field | Source |
| ----- | ------ |
| Building | Customer address from order |
| Room Number | Customer address from order |
| Delivery Note | Customer address from order (optional) |

If no delivery note was provided, this field should be omitted entirely (not shown as empty).

### Timestamps Display

| Timestamp | Label |
| --------- | ----- |
| Created At | "Ordered at" |
| Current Status Changed At | "Updated at" |

All timestamps should use a human-readable format (e.g., "13 Jul 2026, 14:30").

---

## Status Timeline Component

### Purpose

Provides a visual vertical timeline showing all 13 statuses in the order lifecycle. The customer's current status is highlighted; past statuses are shown as completed; future statuses are shown as pending.

### Timeline Layout

```text
  [Icon]  Pending                    -- (completed, gray check)
    |
  [Icon]  Awaiting Payment           -- (completed, gray check)
    |
  [Icon]  Awaiting Verification       -- (current, colored dot + label)
    |
  [Icon]  Paid                       -- (upcoming, gray outline)
    |
  [Icon]  Queued                     -- (upcoming, gray outline)
    |
  [Icon]  Preparing                  -- (upcoming, gray outline)
    |
  [Icon]  Ready                      -- (upcoming, gray outline)
    |
  [Icon]  Out for Delivery           -- (upcoming, gray outline)
    |
  [Icon]  Delivered                  -- (upcoming, gray outline)
    |
  [Icon]  Completed                  -- (upcoming, gray outline)
```

Alternative-path statuses (**Cancelled**, **Expired**, **Payment Rejected**) are not shown on the main timeline by default. If the order enters one of these terminal states, the timeline is replaced with a status summary view.

### Visual States

Each timeline node has three visual states:

| State | Indicator | Color | Description |
| ----- | --------- | ----- | ----------- |
| Completed | Filled circle with checkmark | Success (green) | Status has been reached |
| Current | Filled circle, pulsing | Primary (brand color) | Order is currently at this status |
| Upcoming | Outline circle | Neutral (gray) | Status has not been reached yet |
| Skipped | Dashed circle | Neutral (gray) | Status was bypassed (e.g., order cancelled before this stage) |

The connecting vertical line between nodes should be colored:

- Solid and colored for segments between completed nodes
- Dashed and gray for segments between upcoming nodes

### Timeline Labels

Each node displays:

- Status name (e.g., "Preparing")
- Timestamp when the status was reached (only for completed nodes)

### Color Coding by Status Group

Statuses are grouped for visual consistency:

| Group | Statuses | Color Theme |
| ----- | -------- | ----------- |
| Pre-Payment | Pending, Awaiting Payment, Awaiting Verification | Warning (amber) |
| Kitchen | Queued, Preparing, Ready | Primary (brand color) |
| Delivery | Out for Delivery, Delivered | Success (green) |
| Terminal | Completed | Success (green) |

### Alternative Path Display

If the order enters an alternative terminal status:

| Status | Display Behavior |
| ------ | ---------------- |
| Cancelled | Show last completed status, then red "Cancelled" banner at bottom |
| Expired | Show last completed status, then gray "Expired" banner at bottom |
| Payment Rejected | Show last completed status, then red "Payment Rejected" banner at bottom |

---

## Order History View

### Purpose

Displays a chronological list of all the customer's past orders that have reached a terminal status.

### Eligible Statuses

Orders appear in history when their status is one of:

- Completed
- Cancelled
- Expired
- Payment Rejected

### Layout

```text
[Header: "Order History"]

[Order Card 1]
  Order Number: ORD-20260713-000001
  Date: 13 Jul 2026, 12:30
  Total: 350 THB
  Status: Completed (badge)

[Order Card 2]
  Order Number: ORD-20260712-000005
  Date: 12 Jul 2026, 19:15
  Total: 180 THB
  Status: Cancelled (badge)

...

[Load More] (if pagination exists)

[Empty State] (if no orders)
```

### Order Card Design

Each order card in the history list displays:

| Field | Description |
| ----- | ----------- |
| Order Number | Format: ORD-YYYYMMDD-NNNNNN |
| Date | Human-readable creation date |
| Total | Order total in THB |
| Final Status | Status badge with appropriate color |

Status badge colors:

| Status | Badge Color |
| ------ | ----------- |
| Completed | Success (green) |
| Cancelled | Error (red) |
| Expired | Neutral (gray) |
| Payment Rejected | Error (red) |

### Sorting

Orders are sorted by creation date in descending order (newest first).

### Pagination

Orders are loaded with pagination:

```text
GET /orders?page=1&pageSize=20
```

A "Load More" button or infinite scroll should be supported.

### Empty State

When no past orders exist, the screen must display:

- An illustration or icon
- Text: "No past orders"
- Subtext: "Your completed orders will appear here"

Per `70-ui-ux-rules.md`, empty states must explain why the screen is empty and what the user can do next.

---

## Order Detail View

### Purpose

Displays the complete information for a single order. Accessible by tapping an order card in Order History or by expanding the Active Order view.

### Layout

```text
[Header: "Order Detail"]
[Back button]

[Order Number]
[Status Badge]

[Status Timeline] (same component as Active Order)

[Order Items]
  - Item name
  - Options (each on its own line)
  - Quantity x Price
  - Item subtotal

[Divider]

[Order Summary]
  - Subtotal
  - Delivery Fee: 0 THB
  - Total

[Delivery Address]
  - Building
  - Room Number
  - Delivery Note (if provided)

[Status History]
  - Status name
  - Changed At timestamp
```

### Order Items Detail

Each item must display:

| Field | Example |
| ----- | ------- |
| Product Name | Pad Thai |
| Options | Spice Level: Medium |
| Options | Extra Egg: +20 THB |
| Quantity | 2x |
| Unit Price | 80 THB |
| Item Subtotal | 160 THB |

### Order Summary

| Field | Description |
| ----- | ----------- |
| Subtotal | Sum of all item subtotals |
| Delivery Fee | Currently 0 THB per `156-delivery-rules.md` |
| Total | Subtotal + Delivery Fee |

### Status History

A chronological list of all status transitions for the order:

| Field | Description |
| ----- | ----------- |
| Status Name | The status label |
| Changed At | Timestamp of the transition |

This data is sourced from the status history records defined in `158-order-status.md`.

---

## Order Cancellation

### Purpose

Allows customers to cancel an order when cancellation is permitted by the business rules.

### Cancellation Rules (from `158-order-status.md`)

Customer-initiated cancellation is allowed only when the current status is one of:

| Status | Cancellation Allowed |
| ------ | -------------------- |
| Pending | Yes |
| Awaiting Payment | Yes |
| Awaiting Verification | Yes |
| Paid | Yes |
| Queued | Yes |
| Preparing | No |
| Ready | No |
| Out for Delivery | No |
| Delivered | No |
| Completed | No |
| Cancelled | No |
| Expired | No |
| Payment Rejected | No |

Once the order enters **Preparing** status, customer cancellation is no longer allowed. The cancellation button must be hidden or disabled for statuses where cancellation is not permitted.

### Cancellation Flow

```text
Customer taps "Cancel Order" button
        |
        ↓
Confirmation Dialog
  "Are you sure you want to cancel this order?"
  [Cancel Order]  [Keep Order]
        |
        ↓ (Confirm)
Loading State
        |
        ↓
Success: Order status changed to Cancelled
  Navigate to Order History
        |
        ↓ (or Failure)
Error message: "Unable to cancel this order. Please try again."
```

### Confirmation Dialog

Per `70-ui-ux-rules.md`, confirmation is required before cancelling orders. The dialog must:

- Clearly state the action being performed
- Provide a cancel option to dismiss
- Use explicit labels ("Cancel Order", "Keep Order")

### Cancel Button Visibility

| Condition | Button State |
| --------- | ------------ |
| Status allows cancellation | Visible, enabled |
| Status does not allow cancellation | Hidden |
| API call in progress | Disabled, loading state |

---

## Notification Deep Links

### Purpose

When a customer taps a LINE push notification about their order, the app should navigate directly to the relevant order view.

### Deep Link Behavior

| Notification Event | Deep Link Target |
| ------------------ | ---------------- |
| Order Created | Active Order view |
| Payment Verified | Active Order view |
| Preparing | Active Order view |
| Ready | Active Order view |
| Out for Delivery | Active Order view |
| Delivered | Active Order view |
| Completed | Order Detail view |
| Cancelled | Order Detail view |
| Payment Rejected | Order Detail view |
| Payment Expired | Order Detail view |

Active order events navigate to the Active Order view. Terminal events navigate to the Order Detail view within Order History.

---

## Pull-to-Refresh

### Purpose

Allows customers to manually refresh the active order data.

### Behavior

- Swipe down triggers a refresh indicator
- API call to `GET /orders/:id` is made for the active order
- Loading indicator displayed during the request
- Order data and status timeline update on success
- Error message displayed on failure
- The active order ID should be cached locally so the refresh targets the correct order

---

## Error Handling

### Error States

| Scenario | Error Message | Recovery |
| -------- | ------------- | -------- |
| Network error loading orders | "Unable to load your orders. Please try again." | Retry button |
| Network error loading order detail | "Unable to load order details. Please try again." | Retry button |
| Cancellation failed | "Unable to cancel this order. Please try again." | Dismiss, retry |
| Order not found | "This order could not be found." | Navigate to Order History |
| Unauthorized | "Please log in to view your orders." | Redirect to login |

Error messages must follow the rules in `70-ui-ux-rules.md`: explain the problem, suggest a solution, avoid technical terminology.

---

## Loading States

| Scenario | Loading Behavior |
| -------- | ---------------- |
| Loading orders list | Skeleton loader for order cards |
| Loading order detail | Skeleton loader for detail sections |
| Cancelling order | Loading spinner on cancel button |
| Refreshing active order | Pull-to-refresh spinner |

Per `70-ui-ux-rules.md`, blank screens must be avoided during loading.

---

## API Integration

### Endpoints Used

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | /orders | List customer orders (history) |
| GET | /orders/:id | Get single order detail |
| POST | /orders/:id/cancel | Cancel an order |

All endpoints follow the REST conventions defined in `174-api-design.md`.

### GET /orders

Purpose: Retrieve the customer's order list.

```text
GET /orders?page=1&pageSize=20
Authorization: Bearer <token>
```

Response includes:

```json
{
  "success": true,
  "data": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "items": [
      {
        "id": "order_id",
        "orderNumber": "ORD-20260713-000001",
        "status": "Completed",
        "total": 350,
        "createdAt": "2026-07-13T12:30:00Z"
      }
    ]
  }
}
```

This endpoint is used primarily for the Order History view.

### GET /orders/:id

Purpose: Retrieve full detail for a single order.

```text
GET /orders/:id
Authorization: Bearer <token>
```

Response includes:

```json
{
  "success": true,
  "data": {
    "id": "order_id",
    "orderNumber": "ORD-20260713-000001",
    "status": "Preparing",
    "total": 350,
    "deliveryFee": 0,
    "createdAt": "2026-07-13T12:30:00Z",
    "updatedAt": "2026-07-13T12:45:00Z",
    "deliveryAddress": {
      "building": "C",
      "room": "1208",
      "deliveryNote": "Please leave on the table"
    },
    "items": [
      {
        "productName": "Pad Thai",
        "options": [
          { "name": "Spice Level", "value": "Medium" },
          { "name": "Extra Egg", "value": "Yes", "additionalPrice": 20 }
        ],
        "quantity": 2,
        "unitPrice": 80,
        "subtotal": 160
      }
    ],
    "statusHistory": [
      {
        "status": "Pending",
        "changedAt": "2026-07-13T12:30:00Z"
      },
      {
        "status": "Paid",
        "changedAt": "2026-07-13T12:35:00Z"
      }
    ]
  }
}
```

This endpoint is used for:

- Active Order view
- Order Detail view

### POST /orders/:id/cancel

Purpose: Request order cancellation.

```text
POST /orders/:id/cancel
Authorization: Bearer <token>
```

Request body:

```json
{
  "reason": "Changed my mind"
}
```

Response (success):

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order_id",
    "status": "Cancelled"
  }
}
```

Response (failure - status does not allow cancellation):

```json
{
  "success": false,
  "message": "This order cannot be cancelled in its current status",
  "error": {
    "code": "INVALID_STATUS_TRANSITION"
  }
}
```

The backend must validate the status transition per `158-order-status.md` before processing the cancellation.

---

## State Management

### Local State

| State | Type | Source |
| ----- | ---- | ------ |
| Active order ID | string \| null | Cached after order creation |
| Active order data | Order \| null | GET /orders/:id |
| Order history list | Order[] | GET /orders |
| History pagination | { page, pageSize, total } | GET /orders response |
| Loading states | boolean | UI interaction |
| Error states | Error \| null | API responses |

### Cache Strategy

- Active order ID should be persisted in local storage so the app can recover the active order across sessions.
- Order history should be fetched fresh each time the view is mounted but cached briefly to avoid redundant requests.

### Refresh Strategy

- Active Order: pull-to-refresh (manual), plus notification-triggered deep link refresh.
- Order History: refresh on tab navigation.

---

## Responsive Design

Per `70-ui-ux-rules.md`, all interfaces must support:

| Device | Minimum Width |
| ------ | ------------- |
| Mobile | 320px |
| Tablet | 768px |
| Desktop | 1024px |

On larger screens, the order detail view may use a wider layout with items and summary side-by-side, but the status timeline should remain vertical.

---

## Accessibility

Per `70-ui-ux-rules.md`:

- Status timeline must not rely on color alone. Completed, current, and upcoming nodes must have distinct shapes or patterns in addition to color.
- All interactive elements must have descriptive labels.
- Sufficient color contrast must be maintained.
- The cancel button must be accessible via keyboard navigation where applicable.

---

## Testing

### Unit Tests

| Test Case | Description |
| --------- | ----------- |
| Status timeline renders 13 nodes | All statuses appear in the correct order |
| Current status highlighted | The active status node uses the "Current" visual state |
| Completed statuses shown | All statuses before the current one use "Completed" state |
| Cancel button visibility | Cancel button is visible only for allowable statuses |
| Cancel button hidden | Cancel button is hidden for Preparing, Ready, and beyond |
| Timestamp formatting | All dates render in human-readable format |
| Empty history state | Correct empty state message displayed when no orders |

### Integration Tests

| Test Case | Description |
| --------- | ----------- |
| Load active order | GET /orders/:id returns correct order data |
| Load order history | GET /orders returns paginated list |
| Cancel order success | POST /orders/:id/cancel transitions status to Cancelled |
| Cancel order rejected | POST /orders/:id/cancel returns error for invalid status |
| Deep link navigation | Notification deep link opens correct view |

### E2E Tests

| Test Case | Description |
| --------- | ----------- |
| Full active order flow | View active order, see status timeline, pull to refresh |
| Full cancellation flow | Tap cancel, confirm, verify status update |
| Order history flow | Navigate to history, tap order, view detail |
| Notification deep link | Tap notification, land on correct order view |

---

## Future Expansion

Future versions of this feature may include:

- **Order Reorder**: One-tap reorder from order detail or history
- **Order Rating**: Rate and review delivered orders
- **Delivery Tracking**: Real-time delivery progress map
- **Scheduled Orders**: View and manage scheduled future orders
- **Receipt Download**: Download a PDF receipt for completed orders
- **WebSocket Updates**: Real-time status changes without manual refresh
- **Order Search**: Search order history by date, status, or order number
- **Estimated Time Display**: Show ETA for preparation and delivery stages

The architecture should support these features without major redesign.

---

## Definition of Done

The order management feature is complete when:

- Active Order view displays correct order data and status timeline
- All 13 statuses are rendered on the timeline with correct visual states
- Order History displays paginated list of past orders
- Order Detail shows full order information and status history
- Cancellation works for allowed statuses and is blocked for disallowed statuses
- Notification deep links navigate to the correct view
- Pull-to-refresh works for the active order
- Error states display user-friendly messages
- Loading states use skeleton loaders
- All tests pass

---

## References

- `158-order-status.md` -- Order status lifecycle and transition matrix
- `159-notification-rules.md` -- Notification events and deep links
- `156-delivery-rules.md` -- Delivery address, fee, and status
- `70-ui-ux-rules.md` -- UI/UX standards and conventions
- `174-api-design.md` -- REST API conventions and endpoints
- `157-kitchen-workflow.md` -- Kitchen queue and preparation flow
