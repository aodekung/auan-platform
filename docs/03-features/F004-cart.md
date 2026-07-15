# Auan-Auan-Platform

> F004 — Shopping Cart

## Document Information

| Item         | Value                |
| ------------ | -------------------- |
| Document     | Shopping Cart        |
| Feature ID   | F004                 |
| Version      | 1.0.0                |
| Status       | Active               |
| Owner        | Project Team         |
| Last Updated | 2026-07-13           |

---

## Purpose

This feature provides the shopping cart screen where customers review their selected items before proceeding to checkout. The cart displays all added products with their configured options, quantities, and subtotals, and allows quantity adjustments and item removal.

The cart is the central transition point between product selection (F002 / F003) and checkout (F005).

---

## Scope

### In Scope

- Cart page layout and rendering
- Cart item list display (image, name, options, quantity, subtotal)
- Quantity increment and decrement controls per item
- Item removal with confirmation
- Cart total calculation and display
- Empty cart state
- Clear Cart option
- Cart persistence via localStorage during active session
- "Continue Shopping" and "Proceed to Checkout" buttons
- API integration for cart CRUD operations
- State management for cart items and totals

### Out of Scope

- Checkout flow (covered by F005)
- Payment processing (covered by F006)
- Promotions, discounts, or coupons
- Delivery fee or packaging fee calculation
- Order history or past order reordering
- Cart sharing or saved carts across sessions

---

## Page Layout

The cart page uses a single-column layout optimized for mobile (LINE LIFF) with a fixed bottom action bar.

### Layout Structure

```text
+------------------------------------+
|  [Back]            Cart (3)        |  <- Header with item count badge
+------------------------------------+
|                                    |
|  [img] Chicken Skewer             |
|        Medium / Sesame Mala       |
|        [-] 4 [+]           100 THB |
|        [Remove]                    |
|  ─────────────────────────────     |
|  [img] Pork Skewer                |
|        None / Mala Powder         |
|        [-] 2 [+]            50 THB |
|        [Remove]                    |
|  ─────────────────────────────     |
|                                    |
+------------------------------------+
|  Total                 150 THB     |
|  [  Clear Cart  ]                 |
+------------------------------------+
|  [ Continue Shopping ]             |
|  [ Proceed to Checkout ]          |  <- Fixed bottom
+------------------------------------+
```

### Component Breakdown

| Component              | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| Header                 | Back button + "Cart" title + item count badge                  |
| Cart Item              | Repeatable component for each unique cart entry                |
| Cart Item Image        | Thumbnail of product (square, small)                           |
| Cart Item Name         | Product name                                                    |
| Cart Item Options      | Summary of selected options (e.g., "Medium / Sesame Mala")    |
| Cart Item Quantity     | Decrement / count / increment controls                          |
| Cart Item Subtotal     | Price for this line item (final price x quantity)               |
| Cart Item Remove       | Remove button or swipe-to-delete                               |
| Cart Total Section     | Sum of all item subtotals                                       |
| Clear Cart Button      | Removes all items from cart                                     |
| Fixed Bottom Bar       | Contains Continue Shopping and Proceed to Checkout buttons     |

---

## Cart Item Component

Each item in the cart is rendered by a reusable CartItem component.

### Item Data Structure

| Field              | Type     | Example                     |
| ------------------ | -------- | --------------------------- |
| cartItemId         | string   | "CI-000001"                 |
| productId          | string   | "PRD-000001"                |
| productName        | string   | "Chicken Skewer"           |
| productImage       | string   | URL to product image       |
| basePrice          | number   | 25                          |
| selectedOptions    | array    | See below                   |
| quantity           | number   | 4                           |
| unitPrice          | number   | 25 (base + option prices)  |
| subtotal           | number   | 100 (unitPrice x quantity)  |

### Selected Options Array

```json
[
  { "optionGroupId": "OG001", "optionName": "Medium" },
  { "optionGroupId": "OG002", "optionName": "Sesame Mala Sauce" }
]
```

### Display Format

Options summary is displayed as a single line joining option names with a separator:

```text
Medium / Sesame Mala Sauce
```

Only the option names are displayed, not the group names.

---

## Quantity Controls

### Behavior

| Field    | Value      |
| -------- | ---------- |
| Minimum  | 1          |
| Maximum  | Unlimited  |

Per business rules, there is no maximum quantity cap per item in the cart.

### Increment / Decrement

| Action      | Behavior                                                     |
| ----------- | ------------------------------------------------------------ |
| Increment   | Quantity increases by 1. Subtotal recalculated. API called. |
| Decrement   | Quantity decreases by 1. Minimum is 1. Button disabled at 1. |
| At quantity 1, decrement | The decrement button is visually disabled. Tapping it does nothing. |

### Quantity Update Flow

1. User taps increment or decrement.
2. Local state updates immediately (optimistic UI).
3. API call to `PATCH /cart/items/:id` with new quantity.
4. On success: cart total recalculated, UI stays.
5. On failure: revert to previous quantity, show error toast.

---

## Remove Item

### Trigger

The user taps the "Remove" button on a cart item.

### Confirmation

Per UI/UX rules, destructive actions require confirmation.

A confirmation dialog appears:

```text
Title: Remove Item
Message: Remove "Chicken Skewer" from your cart?
Buttons: [Cancel] [Remove]
```

- **Cancel**: Closes dialog, no action taken.
- **Remove**: Initiates removal.

### Removal Flow

1. User taps "Remove" in the confirmation dialog.
2. Item is immediately removed from local state (optimistic UI).
3. API call to `DELETE /cart/items/:id`.
4. On success: cart total recalculated.
5. On failure: item is restored to cart, error toast shown.

### Edge Cases

- Removing the last item: cart transitions to empty state.
- Removing during API call in progress: queue or reject, never corrupt state.

---

## Cart Total Calculation

### Formula

```text
Cart Total = Sum of All Item Subtotals
```

Where each item subtotal:

```text
Item Subtotal = (Base Price + Option Prices) x Quantity
```

### Phase 1 Calculation

Since all option prices are 0 THB in Phase 1:

```text
Cart Total = Sum of (Base Price x Quantity) for each item
```

Example:

```text
Chicken Skewer:  25 THB x 4 = 100 THB
Pork Skewer:     25 THB x 2 =  50 THB
───────────────────────────────────
Cart Total:                   150 THB
```

### Calculation Rules

- All values are integers (no decimal places).
- Currency is Thai Baht (THB).
- No rounding is applied.
- The cart total is recalculated after every quantity change or item removal.
- In Phase 1, delivery fee, packaging fee, and service charge are all 0 THB and are not displayed.

---

## Empty Cart State

When the cart contains zero items, the cart page displays an empty state.

### Layout

```text
+------------------------------------+
|  [Back]            Cart            |
+------------------------------------+
|                                    |
|           [Cart Icon]              |
|                                    |
|       Your cart is empty           |
|                                    |
|    Browse our menu to add          |
|    your favorite skewers.          |
|                                    |
+------------------------------------+
|  [ Continue Shopping ]             |
+------------------------------------+
```

### Requirements

Per UI/UX rules (70-ui-ux-rules), the empty state must:
- Explain why the cart is empty.
- Suggest what the user can do next.
- Provide a clear action button ("Continue Shopping") to navigate to the menu (F002).

### Conditions That Trigger Empty State

- All items have been removed individually.
- "Clear Cart" action was performed.
- Cart data was lost (localStorage cleared or session expired).

---

## Clear Cart

### Purpose

Allows the customer to remove all items from the cart in a single action.

### Trigger

A "Clear Cart" button is displayed above the bottom action bar, only when the cart has one or more items.

### Confirmation

Per UI/UX rules, destructive actions require confirmation.

A confirmation dialog appears:

```text
Title: Clear Cart
Message: Remove all items from your cart?
Buttons: [Cancel] [Clear]
```

- **Cancel**: Closes dialog, no action taken.
- **Clear**: Removes all items.

### Clear Flow

1. User taps "Clear" in the confirmation dialog.
2. All items removed from local state (optimistic UI).
3. API calls to delete each cart item, or a single batch endpoint if available.
4. On success: empty cart state is displayed.
5. On failure: items restored, error toast shown.

### Visibility

- The "Clear Cart" button is hidden when the cart is empty.
- It is always shown when one or more items exist in the cart.

---

## Cart Persistence

### Strategy

The cart is persisted to **localStorage** during the active session.

### Behavior

| Event                    | Action                                                      |
| ------------------------ | ----------------------------------------------------------- |
| Item added               | Cart updated in localStorage immediately after API success.  |
| Quantity changed         | Cart updated in localStorage immediately after API success.  |
| Item removed             | Cart updated in localStorage immediately after API success.  |
| Cart cleared             | Cart in localStorage cleared.                                |
| Page load / navigation    | Cart loaded from localStorage and validated against API.   |
| Session end (LIFF close)  | localStorage data remains until browser clears it.          |

### Synchronization

On cart page load:

1. Load cart from localStorage.
2. Call `GET /cart` to retrieve the server-side cart.
3. Compare and reconcile:
   - If server cart is authoritative (e.g., after price changes or out-of-stock updates), use the server version and update localStorage.
   - If server cart is empty but localStorage has items, treat as a new session and use localStorage as the source of truth.
4. Display the reconciled cart.

### Session Scope

- Cart data does **not** persist across LIFF sessions (app close and reopen).
- Cart is considered temporary for a single ordering session.
- Future versions may support saved carts or persistent carts per customer account.

### localStorage Key

```text
auan-cart
```

### Stored Format

```json
{
  "items": [
    {
      "cartItemId": "CI-000001",
      "productId": "PRD-000001",
      "productName": "Chicken Skewer",
      "productImage": "https://cdn.example.com/products/PRD-000001.webp",
      "basePrice": 25,
      "selectedOptions": [
        { "optionGroupId": "OG001", "optionName": "Medium" },
        { "optionGroupId": "OG002", "optionName": "Sesame Mala Sauce" }
      ],
      "quantity": 4,
      "unitPrice": 25,
      "subtotal": 100
    }
  ],
  "total": 100,
  "updatedAt": "2026-07-13T12:00:00Z"
}
```

---

## Navigation Buttons

### Continue Shopping

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| Label       | Continue Shopping                       |
| Style       | Secondary / outlined                    |
| Action      | Navigate to menu screen (F002)          |
| Position    | Fixed bottom bar, left or top button   |

Behavior:
- Navigates back to the menu screen.
- Cart state is preserved; user can return to the cart later.

### Proceed to Checkout

| Field       | Value                                  |
| ----------- | -------------------------------------- |
| Label       | Proceed to Checkout                     |
| Style       | Primary / solid                         |
| Action      | Navigate to checkout screen (F005)      |
| Position    | Fixed bottom bar, right or bottom button |
| Disabled    | When cart is empty                      |

Behavior:
- Only enabled when the cart contains one or more items.
- Navigates to the checkout screen (F005).
- Cart data is passed to checkout for order summary.

---

## API Integration

### GET /cart

Retrieve the current customer's cart.

#### Request

```
GET /api/v1/cart
Authorization: Bearer <token>
```

#### Expected Response (200 OK)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": "CI-000001",
        "productId": "PRD-000001",
        "productName": "Chicken Skewer",
        "productImage": "https://cdn.example.com/products/PRD-000001.webp",
        "basePrice": 25,
        "selectedOptions": [
          { "optionGroupId": "OG001", "optionId": "OPT003", "optionName": "Medium" },
          { "optionGroupId": "OG002", "optionId": "OPT103", "optionName": "Sesame Mala Sauce" }
        ],
        "quantity": 4,
        "unitPrice": 25,
        "subtotal": 100
      },
      {
        "id": "CI-000002",
        "productId": "PRD-000002",
        "productName": "Pork Skewer",
        "productImage": "https://cdn.example.com/products/PRD-000002.webp",
        "basePrice": 25,
        "selectedOptions": [
          { "optionGroupId": "OG001", "optionId": "OPT001", "optionName": "None" },
          { "optionGroupId": "OG002", "optionId": "OPT101", "optionName": "Mala Powder" }
        ],
        "quantity": 2,
        "unitPrice": 25,
        "subtotal": 50
      }
    ],
    "total": 150
  }
}
```

#### Error Responses

| Status | Condition           | Behavior                              |
| ------ | ------------------- | ------------------------------------- |
| 401    | Unauthorized        | Redirect to login                     |
| 500    | Server error        | Show error with retry option         |

---

### POST /cart/items

Add a new item to the cart.

#### Request

```
POST /api/v1/cart/items
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "productId": "PRD-000001",
  "productName": "Chicken Skewer",
  "basePrice": 25,
  "selectedOptions": [
    { "optionGroupId": "OG001", "optionId": "OPT003", "optionName": "Medium" },
    { "optionGroupId": "OG002", "optionId": "OPT103", "optionName": "Sesame Mala Sauce" }
  ],
  "quantity": 1
}
```

#### Expected Response (201 Created)

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "CI-000003",
    "productId": "PRD-000001",
    "productName": "Chicken Skewer",
    "basePrice": 25,
    "selectedOptions": [
      { "optionGroupId": "OG001", "optionId": "OPT003", "optionName": "Medium" },
      { "optionGroupId": "OG002", "optionId": "OPT103", "optionName": "Sesame Mala Sauce" }
    ],
    "quantity": 1,
    "unitPrice": 25,
    "subtotal": 25
  }
}
```

#### Existing Configuration Merge

If the cart already contains an item with the same product ID and identical selected options, the backend should increment the existing item's quantity rather than creating a duplicate entry.

---

### PATCH /cart/items/:id

Update the quantity of an existing cart item.

#### Request

```
PATCH /api/v1/cart/items/CI-000001
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "quantity": 5
}
```

#### Expected Response (200 OK)

```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": "CI-000001",
    "productId": "PRD-000001",
    "productName": "Chicken Skewer",
    "selectedOptions": [
      { "optionGroupId": "OG001", "optionId": "OPT003", "optionName": "Medium" },
      { "optionGroupId": "OG002", "optionId": "OPT103", "optionName": "Sesame Mala Sauce" }
    ],
    "quantity": 5,
    "unitPrice": 25,
    "subtotal": 125
  }
}
```

#### Validation

| Rule                       | Behavior                                    |
| -------------------------- | ------------------------------------------- |
| quantity < 1               | Return 422 Validation Error                |
| quantity is not an integer  | Return 422 Validation Error                |
| Item not found             | Return 404 Not Found                        |
| Item belongs to another user | Return 403 Forbidden                       |

---

### DELETE /cart/items/:id

Remove an item from the cart.

#### Request

```
DELETE /api/v1/cart/items/CI-000001
Authorization: Bearer <token>
```

#### Expected Response (200 OK)

```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "items": [ ... ],
    "total": 50
  }
}
```

Returns the updated cart state after removal.

---

## State Management

### Cart State

| State Field   | Type    | Default | Description                                   |
| ------------- | ------- | ------- | --------------------------------------------- |
| items         | array   | []      | Array of cart item objects                    |
| total         | number  | 0       | Sum of all item subtotals                     |
| isLoading     | boolean | false   | True while fetching cart from API             |
| error         | string  | null    | Error message if API fails                    |
| isSyncing     | boolean | false   | True while a cart update is in progress       |

### Derived State

| Derived Field     | Calculation                                      |
| ----------------- | ------------------------------------------------ |
| itemCount         | Sum of all item quantities                        |
| isEmpty           | items.length === 0                                |
| cartTotal         | items.reduce((sum, item) => sum + item.subtotal, 0) |

### Item Count in Header

The header badge displays the total number of individual items (sum of quantities), not the number of unique cart entries.

Example: 4 Chicken Skewers + 2 Pork Skewers = badge shows **6**.

---

## Navigation

### Entry Points

| Source              | Trigger                                           |
| ------------------- | ------------------------------------------------- |
| Menu screen (F002)  | Tap cart icon or cart badge in header             |
| Product detail (F003) | After "Add to Cart" success, user navigates       |
| Checkout (F005)      | Back button from checkout                         |
| Bottom navigation   | Cart tab (if applicable)                          |

### Exit Points

| Action               | Destination              | Trigger                       |
| -------------------- | ------------------------ | ----------------------------- |
| Continue Shopping    | Menu screen (F002)       | "Continue Shopping" button    |
| Proceed to Checkout  | Checkout screen (F005)   | "Proceed to Checkout" button  |
| Back                 | Previous screen           | Header back button or gesture |
| Tap product name     | Product detail (F003)     | Optional: tap item to view/edit details |

---

## Loading States

| Scenario               | Behavior                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| Initial cart load      | Skeleton loader for cart item list and total section.             |
| Quantity update in progress | Spinner on the specific item's quantity controls, other items remain interactive. |
| Item removal in progress | Fading out animation on the item being removed.                 |
| API error on load      | Error message with retry button. "Unable to load your cart. Please try again." |

---

## Error Handling

| Error                        | User Message                                  | Recovery Action           |
| ---------------------------- | --------------------------------------------- | ------------------------ |
| Cart fetch fails             | "Unable to load your cart. Please try again."  | Retry button             |
| Quantity update fails        | "Unable to update quantity. Please try again." | Revert to previous value |
| Item removal fails           | "Unable to remove item. Please try again."     | Restore removed item     |
| Add to cart fails           | "Unable to add to cart. Please try again."     | Retry from product page  |
| Product became unavailable   | "This item is no longer available."            | Item auto-removed        |
| Unauthorized (401)           | Redirect to login                              | Re-authenticate          |

---

## Testing

### Unit Tests

| Test Case                                              | Expected Result                                        |
| ------------------------------------------------------ | ------------------------------------------------------ |
| Cart renders with items                                | All items displayed with correct name, options, qty, subtotal |
| Cart renders empty                                      | Empty state displayed with "Continue Shopping" button |
| Increment quantity                                      | Quantity increases by 1, subtotal recalculated         |
| Decrement quantity                                      | Quantity decreases by 1, subtotal recalculated         |
| Decrement quantity at 1                                 | Decrement button disabled, quantity stays at 1         |
| Remove item with confirmation (confirm)                 | Item removed, total recalculated                       |
| Remove item with confirmation (cancel)                  | No change                                              |
| Remove last item                                        | Empty state displayed                                  |
| Clear cart with confirmation (confirm)                  | All items removed, empty state displayed               |
| Clear cart with confirmation (cancel)                   | No change                                              |
| Cart total calculation                                  | Total equals sum of all subtotals                      |
| Item count badge in header                             | Shows sum of all quantities                            |
| "Proceed to Checkout" disabled when cart is empty       | Button is visually disabled and not tappable           |
| "Proceed to Checkout" enabled when cart has items      | Button is enabled and navigates to checkout            |
| "Continue Shopping" navigates to menu                   | Menu screen (F002) is displayed                         |

### Integration Tests

| Test Case                                              | Expected Result                                        |
| ------------------------------------------------------ | ------------------------------------------------------ |
| Add item from product detail, verify it appears in cart | Cart shows the item with correct options and quantity  |
| Add same product with different options                | Two separate cart entries for the same product        |
| Add same product with same options                     | Quantity merged on existing entry                      |
| Update quantity, navigate away and back                | Updated quantity persists                              |
| Remove item, navigate away and back                    | Item remains removed                                   |
| Clear cart, navigate away and back                     | Cart remains empty                                     |
| localStorage cleared, reload cart                      | Cart re-fetches from API, displays server state        |
| Add to cart when product goes out of stock during session | Out-of-stock item flagged, option to remove            |

---

## Future Expansion

Potential future enhancements for this feature:

- **Swipe to delete**: Swipe gesture to remove cart items (mobile UX improvement).
- **Edit item options**: Tap a cart item to return to product detail and change options.
- **Special instructions per item**: Add cooking notes or requests.
- **Saved carts**: Persistent cart across sessions tied to customer account.
- **Promo code / coupon input**: Discount code field above the total.
- **Delivery fee and packaging fee display**: When fees are introduced.
- **Estimated delivery time**: Display based on current kitchen load.
- **Item suggestions**: "Frequently bought together" upsell section.
- **Cart sharing**: Share cart with another LINE user.
- **Quantity limits**: Per-item maximum enforced from inventory.
- **Drag to reorder**: Manual item ordering.

These features must not require architectural changes to the current cart page structure.

---

## References

- `151-product-catalog.md` — Product structure and status definitions
- `152-product-options.md` — Option groups and cart rules
- `153-pricing-rules.md` — Price calculation formulas
- `70-ui-ux-rules.md` — UI/UX standards, empty states, confirmation dialogs, accessibility
- `174-api-design.md` — API conventions and endpoint definitions
- `150-business-rules.md` — Business rules and constraints
- `F002-menu.md` — Menu screen (Continue Shopping destination)
- `F003-product-detail.md` — Product detail (Add to Cart source)
- `F005-checkout.md` — Checkout screen (Proceed to Checkout destination)
