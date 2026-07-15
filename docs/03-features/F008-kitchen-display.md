# Auan-Auan-Platform

> Kitchen Display (F008)

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Kitchen Display |
| Feature | F008 |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the business owner's kitchen display feature for Auan-Auan-Platform.

The kitchen display is the central dashboard used by the business owner to manage incoming orders, track preparation progress, and coordinate delivery. It presents the order queue, allows status transitions, and provides real-time visibility into kitchen operations.

---

## Scope

This feature covers the kitchen-facing order management interface. It is designed for the business owner's use, either via a separate web application or via the LINE LIFF app with owner-role detection.

Included:

- Kitchen order queue display
- Order card design and layout
- Preparation status transitions (Queued, Preparing, Ready)
- Delivery status transitions (Out for Delivery, Delivered, Completed)
- Urgency-based color coding
- Sound and vibration notifications for new orders
- Real-time order updates

Excluded:

- Customer-facing order management (F007)
- Menu and product management
- Payment verification flow
- Inventory management
- Delivery route planning

---

## Design Principles

The kitchen display must be:

- Scannable at a glance
- Fast to interact with (minimal taps)
- Optimized for a fixed-screen or tablet context
- Resilient to intermittent connectivity
- Consistent with the order status lifecycle defined in `158-order-status.md`
- Aligned with the kitchen workflow defined in `157-kitchen-workflow.md`

---

## Entry and Access

### Entry Points

The kitchen display is accessible through one of:

1. **Separate Web Application**: A standalone web app optimized for desktop or tablet, accessible via a direct URL.
2. **LINE LIFF with Owner Role Detection**: The same LINE LIFF app used by customers, but the UI switches to the kitchen display when the authenticated user has the owner role.

### Role Detection

```text
User opens LINE LIFF
        |
        ↓
LINE Login authentication
        |
        ↓
Check user role
        |
        +-- Role: Customer  →  Customer UI (default)
        |
        +-- Role: Owner    →  Kitchen Display UI
```

### Permission Model

| Role | Access |
| ---- | ------ |
| Customer | No access to kitchen display |
| Owner | Full access to kitchen display |

All kitchen display endpoints must verify the owner role server-side. Per `174-api-design.md`, protected endpoints must validate JWT and permissions.

---

## Page Layout

### Overall Structure

```text
[Header: "Kitchen Display"]
[New Order Count Badge (if unread orders exist)]

[Order Queue]
  +-- [Order Card: Queued]
  +-- [Order Card: Preparing]
  +-- [Order Card: Preparing]
  ...

[Empty State] (if no orders in queue)
```

The layout is single-column on mobile and may use a multi-column layout on tablet or desktop for better space utilization.

### Desktop / Tablet Layout (Recommended)

```text
[Header: "Kitchen Display"]

[Column 1: Queued]      [Column 2: Preparing]     [Column 3: Ready]
+--------------------+ +--------------------+ +--------------------+
| Order Card         | | Order Card         | | Order Card         |
| ORD-001            | | ORD-003            | | ORD-005            |
| 5 min ago          | | 12 min ago         | | 18 min ago         |
| ...                | | ...                | | ...                |
+--------------------+ +--------------------+ +--------------------+
| Order Card         | |                    | |                    |
| ORD-002            | |                    | |                    |
| 8 min ago          | |                    | |                    |
| ...                | |                    | |                    |
+--------------------+ +--------------------+ +--------------------+
```

Each column corresponds to a kitchen status. Orders move between columns as their status changes.

### Mobile Layout

On mobile, orders are displayed in a single list sorted by queue priority. Each order card shows its current status prominently.

---

## Order Queue

### Queue Sorting

Per `157-kitchen-workflow.md`, orders are processed using **first-paid-first-prepared** priority:

| Priority Level | Criteria |
| -------------- | -------- |
| 1 (Highest) | Payment confirmation time (earliest first) |
| 2 (Fallback) | Order creation time (earliest first) |

Kitchen staff should never see unpaid orders in the queue. Only orders that have reached at least the **Paid** status appear on the kitchen display.

### Eligible Statuses

The kitchen display manages orders in the following statuses:

| Status | Queue Column | Display |
| ------ | ------------ | ------- |
| Queued | Queued | Yes |
| Preparing | Preparing | Yes |
| Ready | Ready | Yes |

Orders in statuses outside this range (Pending, Awaiting Payment, Awaiting Verification, Paid, Out for Delivery, Delivered, Completed, Cancelled, Expired, Payment Rejected) are not displayed on the kitchen queue.

### Order Arrival

When payment is confirmed and the order transitions to **Queued**, the order appears in the kitchen queue. The business owner receives a notification per `159-notification-rules.md`.

---

## Order Card Design

### Card Header

Each order card displays the following header information:

| Field | Description | Example |
| ----- | ----------- | ------- |
| Order Number | Unique order identifier | ORD-20260713-000001 |
| Elapsed Time | Time since payment confirmation | 8 min ago |
| Customer Name | Customer display name | John Doe |
| Building | Delivery building | Building C |
| Room Number | Delivery room number | Room 1208 |

### Card Body (Order Items)

Each item in the order card shows:

| Field | Description | Example |
| ----- | ----------- | ------- |
| Product Name | Product label | Pad Thai |
| Options | Selected options, each on its own line | Spice Level: Medium |
| Quantity | Number ordered | 2x |

Example card body:

```text
Pad Thai
  Spice Level: Medium
  Extra Egg
  Qty: 2x

Tom Yum Soup
  Size: Large
  Qty: 1x
```

### Card Footer (Actions)

The footer contains action buttons relevant to the current status:

| Current Status | Available Actions |
| -------------- | ----------------- |
| Queued | [Start Preparing] |
| Preparing | [Quality Check] [Ready] |
| Ready | [Out for Delivery] |

### Urgency Color Coding

Order cards are color-coded based on elapsed time since payment confirmation to visually indicate urgency:

| Elapsed Time | Color | Urgency Level |
| ------------ | ----- | ------------- |
| 0-10 min | Success (green) | Normal |
| 10-20 min | Warning (amber) | Moderate |
| 20-30 min | Error (red/orange) | Urgent |
| 30+ min | Error (dark red) | Critical |

The urgency timer should update in real time (or on each refresh cycle).

### Expandable Cards

By default, order cards show the header and a summary (e.g., "3 items"). Tapping a card expands it to reveal:

- Full item list with options
- Delivery note (if provided)
- Payment confirmation timestamp
- Elapsed time (live counter)

Tapping again collapses the card.

### Card Interactions

| Interaction | Behavior |
| ----------- | --------- |
| Tap card (collapsed) | Expand to show full details |
| Tap card (expanded) | Collapse |
| Tap action button | Execute status transition |

---

## Preparation Actions

### Status Transition Flow

Per `158-order-status.md` and `157-kitchen-workflow.md`, the kitchen manages the following transitions:

```text
Queued
    |
    |  [Start Preparing]
    ↓
Preparing
    |
    |  [Ready]
    ↓
Ready
    |
    |  [Out for Delivery]
    ↓
Out for Delivery
    |
    |  [Delivered]
    ↓
Completed
```

### Action Details

#### Start Preparing

| Field | Value |
| ----- | ----- |
| Trigger | Business owner taps "Start Preparing" |
| Current Status (Before) | Queued |
| New Status (After) | Preparing |
| API Call | PATCH /orders/:id/status |
| Validation | Order must be in Queued status |
| Confirmation | Not required (quick action) |

This action marks the beginning of the kitchen preparation process.

#### Ready

| Field | Value |
| ----- | ----- |
| Trigger | Business owner taps "Ready" |
| Current Status (Before) | Preparing |
| New Status (After) | Ready |
| API Call | PATCH /orders/:id/status |
| Validation | Order must be in Preparing status |
| Confirmation | Not required (quick action) |

This action signals that preparation is complete and the order is ready for delivery. The system notifies both the business owner and the customer per `159-notification-rules.md`.

Per `157-kitchen-workflow.md`, the kitchen should perform a quality check before marking an order as Ready. The quality check is a manual step performed by kitchen staff -- the app does not enforce it programmatically, but the UI label may reflect this step.

#### Quality Check Step (Optional UI Enhancement)

The "Ready" button may optionally be split into two steps for clearer workflow alignment with `157-kitchen-workflow.md`:

```text
Preparing
    |
    |  [Quality Check]  (internal step, optional in UI)
    ↓
Ready
```

In the initial version, "Ready" is a single button tap. Future versions may add an explicit quality check confirmation step.

---

## Delivery Actions

### Out for Delivery

| Field | Value |
| ----- | ----- |
| Trigger | Business owner taps "Out for Delivery" |
| Current Status (Before) | Ready |
| New Status (After) | Out for Delivery |
| API Call | PATCH /orders/:id/status |
| Validation | Order must be in Ready status |
| Confirmation | Not required (quick action) |

This action marks the start of delivery. The customer is notified per `159-notification-rules.md`.

### Delivered

| Field | Value |
| ----- |
| Trigger | Business owner taps "Delivered" |
| Current Status (Before) | Out for Delivery |
| New Status (After) | Delivered |
| API Call | PATCH /orders/:id/status |
| Validation | Order must be in Out for Delivery status |
| Confirmation | Not required (quick action) |

The customer is notified per `159-notification-rules.md`.

### Order Completion Flow

After marking an order as Delivered, the system should automatically transition to **Completed**. This may happen:

1. **Automatically**: Backend transitions Delivered to Completed after a short delay (e.g., 60 seconds).
2. **Manually**: Business owner taps a "Complete" button (less preferred).

The recommended approach is automatic transition to reduce manual steps.

---

## Sound and Vibration Notifications

### Purpose

Alert the business owner when new orders arrive in the kitchen queue, even when the screen is not actively being viewed.

### Notification Triggers

| Event | Sound | Vibration | Description |
| ----- | ----- | --------- | ----------- |
| New order queued | Yes | Yes | Order has entered Queued status |
| Order awaiting verification | Yes | Yes | Payment submitted, needs verification |

### Sound Behavior

- Sound should be audible in a kitchen environment (consider ambient noise).
- Different sounds may be used for different event types.
- Sound should play once per event (no repeated alerts).
- Business owner should be able to mute sounds via a toggle in the header.

### Vibration Behavior

- Vibration pattern should be distinct from standard notification vibrations.
- Not applicable on desktop web browsers.

### Mute Control

A toggle in the header allows the business owner to:

- Mute sounds only
- Mute sounds and vibrations
- Unmute all

The mute preference should be persisted in local storage.

---

## Real-Time Updates

### Current Approach: Polling

The kitchen display updates order data using periodic polling:

| Setting | Value |
| ------- | ----- |
| Polling Interval | 10 seconds |
| Endpoint | GET /kitchen/orders |
| Method | Auto-refresh in background |

Polling continues as long as the kitchen display page is open and the browser tab is active. Polling pauses when the tab is inactive (using `document.visibilitychange`).

### Future Approach: WebSocket

Future versions should replace polling with WebSocket connections for true real-time updates:

```text
WebSocket Connection
        |
        +-- New order event
        +-- Status change event
        +-- Queue reorder event
```

The architecture should support this migration without redesigning the order card or queue components.

---

## API Integration

### Endpoints Used

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | /kitchen/orders | List queued, preparing, and ready orders |
| PATCH | /orders/:id/status | Transition order status |

All endpoints follow the REST conventions defined in `174-api-design.md`.

### GET /kitchen/orders

Purpose: Retrieve all orders currently in kitchen queue (Queued, Preparing, Ready).

```text
GET /kitchen/orders
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "order_id",
      "orderNumber": "ORD-20260713-000001",
      "status": "Queued",
      "customerName": "John Doe",
      "building": "C",
      "room": "1208",
      "deliveryNote": "Please leave on the table",
      "paymentConfirmedAt": "2026-07-13T12:35:00Z",
      "elapsedMinutes": 8,
      "items": [
        {
          "productName": "Pad Thai",
          "options": [
            { "name": "Spice Level", "value": "Medium" },
            { "name": "Extra Egg", "value": "Yes", "additionalPrice": 20 }
          ],
          "quantity": 2
        }
      ]
    },
    {
      "id": "order_id_2",
      "orderNumber": "ORD-20260713-000002",
      "status": "Preparing",
      "customerName": "Jane Smith",
      "building": "A",
      "room": "505",
      "deliveryNote": null,
      "paymentConfirmedAt": "2026-07-13T12:30:00Z",
      "elapsedMinutes": 13,
      "items": [
        {
          "productName": "Tom Yum Soup",
          "options": [
            { "name": "Size", "value": "Large" }
          ],
          "quantity": 1
        }
      ]
    }
  ]
}
```

Orders are sorted server-side by:

1. Payment confirmation time (ascending)
2. Order creation time (ascending)

The `elapsedMinutes` field is calculated server-side from `paymentConfirmedAt` to the current time.

### PATCH /orders/:id/status

Purpose: Transition an order to the next status.

```text
PATCH /orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:

```json
{
  "status": "Preparing"
}
```

Valid status transitions initiated from the kitchen display:

| Current Status | Next Status (payload) |
| -------------- | --------------------- |
| Queued | Preparing |
| Preparing | Ready |
| Ready | Out for Delivery |
| Out for Delivery | Delivered |

Response (success):

```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "order_id",
    "status": "Preparing",
    "updatedAt": "2026-07-13T12:45:00Z"
  }
}
```

Response (failure - invalid transition):

```json
{
  "success": false,
  "message": "Invalid status transition",
  "error": {
    "code": "INVALID_STATUS_TRANSITION"
  }
}
```

The backend must validate every transition against the status transition matrix defined in `158-order-status.md`.

---

## Error Handling

### Error States

| Scenario | Error Message | Recovery |
| -------- | ------------- | -------- |
| Network error loading queue | "Unable to load orders. Retrying..." | Auto-retry on next poll cycle |
| Status transition failed | "Unable to update order status. Please try again." | Retry button on order card |
| Unauthorized access | "You do not have permission to access this page." | Redirect to login |
| Order no longer in queue | "This order has been updated. Refreshing..." | Refresh queue |

Error messages must follow the rules in `70-ui-ux-rules.md`: explain the problem, suggest a solution, avoid technical terminology.

---

## Loading States

| Scenario | Loading Behavior |
| -------- | ---------------- |
| Initial load of queue | Skeleton loader for order cards |
| Polling refresh | Silent update (no loading indicator) |
| Status transition | Button shows loading spinner, disabled state |
| Page visible again (tab switch) | Quick refresh indicator |

Per `70-ui-ux-rules.md`, blank screens must be avoided during loading.

---

## Empty State

When no orders are in the queue (no Queued, Preparing, or Ready orders):

- Display an illustration or icon
- Text: "No orders in queue"
- Subtext: "New orders will appear here when they are paid and confirmed"

---

## Responsive Design

Per `70-ui-ux-rules.md`, all interfaces must support:

| Device | Minimum Width | Layout |
| ------ | ------------- | ------ |
| Mobile | 320px | Single column, stacked cards |
| Tablet | 768px | Multi-column (Queued / Preparing / Ready) |
| Desktop | 1024px | Multi-column, wider cards with more detail visible |

The multi-column layout is the recommended default for kitchen use (tablet mounted in the kitchen).

---

## Accessibility

Per `70-ui-ux-rules.md`:

- Urgency color coding must not rely on color alone. Include text labels (e.g., "8 min ago") and consider a border or icon for critical urgency.
- Action buttons must have descriptive labels.
- Sufficient color contrast must be maintained.
- The mute toggle must be keyboard accessible.

---

## State Management

### Local State

| State | Type | Source |
| ----- | ---- | ------ |
| Order queue | Order[] | GET /kitchen/orders |
| Loading | boolean | UI interaction |
| Error | Error \| null | API response |
| Sound muted | boolean | Local storage |
| Last poll time | number | Timer tracking |

### Refresh Strategy

| Trigger | Behavior |
| ------- | -------- |
| Initial mount | Fetch queue immediately |
| Polling timer (10s) | Silent fetch, merge updates |
| Tab becomes visible | Fetch immediately |
| Manual pull-to-refresh | Fetch with loading indicator |
| Status transition success | Update local state optimistically, confirm on next poll |

### Optimistic Updates

When a status transition action is performed:

1. Update the order card immediately (optimistic).
2. Send the API request.
3. If the API succeeds, keep the update.
4. If the API fails, revert to the previous state and show an error.

This provides a snappy, responsive feel even with a 10-second polling interval.

---

## Performance Considerations

- The polling endpoint should return only the minimum necessary data (no full order history, no payment details).
- Order card components should be lightweight; avoid heavy animations on frequently-refreshed elements.
- The elapsed time counter should update locally (client-side timer) rather than re-fetching every second.
- Images are not required on the kitchen display, reducing bandwidth.

---

## Testing

### Unit Tests

| Test Case | Description |
| --------- | ----------- |
| Queue renders ordered cards | Orders appear sorted by payment confirmation time |
| Urgency color coding | Correct color applied based on elapsed time |
| Action button visibility | Only valid actions shown for each status |
| Card expand and collapse | Tapping toggles expanded state |
| Mute toggle | Sound mute state toggles correctly |
| Elapsed time counter | Timer increments correctly |

### Integration Tests

| Test Case | Description |
| --------- | ----------- |
| Load kitchen queue | GET /kitchen/orders returns correct data |
| Start Preparing transition | PATCH transitions Queued to Preparing |
| Ready transition | PATCH transitions Preparing to Ready |
| Out for Delivery transition | PATCH transitions Ready to Out for Delivery |
| Delivered transition | PATCH transitions Out for Delivery to Delivered |
| Invalid transition rejected | PATCH returns error for invalid status change |
| Unauthorized access blocked | Non-owner role receives 403 |

### E2E Tests

| Test Case | Description |
| --------- | ----------- |
| Full preparation flow | Order appears in queue, start preparing, mark ready |
| Full delivery flow | Mark out for delivery, mark delivered |
| Auto-refresh | New order appears after polling interval |
| Sound on new order | Alert sounds when new order arrives |
| Empty queue state | No orders displays empty state correctly |

---

## Future Expansion

Future versions of this feature may include:

- **WebSocket Real-Time Updates**: Replace polling with persistent WebSocket connections
- **Kitchen Display System (KDS)**: Dedicated hardware integration
- **Multiple Kitchen Stations**: Assign orders to specific preparation stations
- **Cooking Priority Levels**: Manual priority override for urgent orders
- **Preparation Timer**: Per-order countdown timer with alerts
- **Kitchen Analytics**: Average preparation time, throughput metrics
- **Auto Queue Assignment**: Intelligent order distribution across stations
- **Recipe Reference**: Quick-access recipe cards linked to menu items
- **Ingredient Shortcuts**: One-tap ingredient shortage flag
- **Order Bump**: Ability to reorder queue manually
- **Batch Actions**: Process multiple orders at once
- **Printing Support**: Print order tickets directly from the display
- **Rider Assignment**: Assign delivery person when using third-party delivery

The architecture should support these features without major redesign.

---

## Definition of Done

The kitchen display feature is complete when:

- Order queue displays all Queued, Preparing, and Ready orders
- Orders are sorted by first-paid-first-prepared priority
- Order cards show order number, elapsed time, customer name, building, room, and items with options
- Urgency color coding updates based on elapsed time
- Start Preparing, Ready, Out for Delivery, and Delivered actions work correctly
- Each action transitions the order status per the transition matrix
- Sound and vibration notifications fire for new orders
- Polling refreshes the queue every 10 seconds
- Mute toggle controls sound alerts
- Owner-only access is enforced
- Empty state displays when no orders are in queue
- Error states display user-friendly messages
- Loading states use skeleton loaders
- All tests pass

---

## References

- `157-kitchen-workflow.md` -- Kitchen queue, preparation rules, quality control
- `158-order-status.md` -- Order status lifecycle and transition matrix
- `159-notification-rules.md` -- Notification events for business owner
- `156-delivery-rules.md` -- Delivery workflow, status, and confirmation
- `70-ui-ux-rules.md` -- UI/UX standards and conventions
- `174-api-design.md` -- REST API conventions and endpoints
