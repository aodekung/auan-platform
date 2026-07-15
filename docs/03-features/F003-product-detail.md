# Auan-Auan-Platform

> F003 — Product Detail

## Document Information

| Item         | Value                |
| ------------ | -------------------- |
| Document     | Product Detail       |
| Feature ID   | F003                 |
| Version      | 1.0.0                |
| Status       | Active               |
| Owner        | Project Team         |
| Last Updated | 2026-07-13           |

---

## Purpose

This feature displays the complete product detail page for a single product, enabling customers to view product information, configure options, and add the item to their shopping cart.

This is the page a customer lands on after tapping a product card from the menu screen (F002).

---

## Scope

### In Scope

- Product detail page layout and rendering
- Product image display
- Product information display (name, description, price)
- Option group selection (Spice Level, Sauce)
- Required option validation
- Price calculation (base price + option prices)
- Quantity selector
- Add to Cart action with feedback
- Product status handling (Available, Out of Stock, Hidden)
- API integration: `GET /products/:id`
- State management for selected options and quantity

### Out of Scope

- Product editing or management (admin feature)
- Product reviews or ratings
- Product recommendations
- Search from the detail page
- Combo or bundle configuration

---

## Page Layout

The product detail page uses a single-column, vertically stacked layout optimized for mobile (LINE LIFF).

### Layout Structure

```text
+------------------------------------+
|  [Back]          Product Detail    |  <- Header
+------------------------------------+
|                                    |
|         [Product Image]            |  <- Full-width, square
|                                    |
+------------------------------------+
|  Product Name                      |
|  Product Description               |
|  Base Price: 25 THB                |
+------------------------------------+
|  Spice Level *                     |
|  ( ) None  ( ) Mild  ( ) Medium   |
|  ( ) Hot  ( ) Extra Hot           |
+------------------------------------+
|  Sauce *                           |
|  (o) Mala Powder  ( ) Sesame      |
|  ( ) Sesame Mala  ( ) Sesame      |
|  ( ) Mala Dipping                  |
+------------------------------------+
|  Quantity                          |
|  [ - ]  1  [ + ]                  |
+------------------------------------+
|  [     Add to Cart — 25 THB    ]  |  <- Fixed bottom
+------------------------------------+
```

### Component Breakdown

| Component             | Description                                                      |
| --------------------- | ---------------------------------------------------------------- |
| Header                | Back button + page title                                         |
| Product Image         | Full-width square image (WebP, 1024x1024 recommended)             |
| Product Name          | Thai name primary, English name secondary                        |
| Product Description   | Concise description of ingredients and flavor                   |
| Product Price         | Base price displayed in THB                                      |
| Option Group (OG001)  | Spice Level selector with radio-style options                    |
| Option Group (OG002)  | Sauce selector with radio-style options                          |
| Quantity Selector     | Increment/decrement controls with numeric display                |
| Add to Cart Button    | Fixed at bottom, shows final price, disabled when invalid       |

---

## Option Groups

### OG001 — Spice Level

| Field           | Value                              |
| --------------- | ---------------------------------- |
| Option Group ID | OG001                              |
| Name            | Spice Level                        |
| Required        | Yes                                |
| Multiple Select | No                                 |
| Default         | None                               |

Available options:

| Order | Option     | Additional Price |
| ----- | ---------- | ---------------- |
| 1     | None       | 0 THB            |
| 2     | Mild       | 0 THB            |
| 3     | Medium     | 0 THB            |
| 4     | Hot        | 0 THB            |
| 5     | Extra Hot  | 0 THB            |

### OG002 — Sauce

| Field           | Value                              |
| --------------- | ---------------------------------- |
| Option Group ID | OG002                              |
| Name            | Sauce                              |
| Required        | Yes                                |
| Multiple Select | No                                 |
| Default         | Mala Powder                        |

Available options:

| Order | Option              | Additional Price |
| ----- | ------------------- | ---------------- |
| 1     | Mala Powder         | 0 THB            |
| 2     | Sesame Sauce        | 0 THB            |
| 3     | Sesame Mala Sauce   | 0 THB            |
| 4     | Sesame Peanut Sauce | 0 THB            |
| 5     | Mala Dipping Sauce | 0 THB            |

### Option Group Display Order

Option groups must appear in this order on the page:

1. Spice Level (OG001)
2. Sauce (OG002)

This order must be consistent across all products.

### Required vs Optional Options

Both OG001 and OG002 are **required** option groups.

- The customer must select exactly one option from each required group before adding to cart.
- Default selections are pre-selected on page load (None for Spice Level, Mala Powder for Sauce).
- The "Add to Cart" button must be disabled if any required option is missing.
- No optional option groups exist in Phase 1.

---

## Price Calculation

### Phase 1 Pricing

All options in Phase 1 have an additional price of 0 THB. The final displayed price equals the base product price.

```text
Final Product Price =
    Base Price
    + Spice Level Price (0 THB in Phase 1)
    + Sauce Price (0 THB in Phase 1)
```

Example:

```text
Chicken Skewer (25 THB)
+ Spice Level: Medium (0 THB)
+ Sauce: Sesame Mala Sauce (0 THB)
= Final Price: 25 THB
```

### Per-Item Subtotal (used when adding to cart)

```text
Item Subtotal = Final Product Price x Quantity
```

### Price Display Rules

- The base price is displayed next to the product name.
- The "Add to Cart" button shows the **per-unit final price** (not the subtotal).
- The Add to Cart button label format: `Add to Cart — {price} THB`.
- All prices use Thai Baht (THB) with no rounding.
- Prices are integers; no decimal places.

---

## Quantity Selector

### Behavior

| Field    | Value  |
| -------- | ------ |
| Minimum  | 1      |
| Default  | 1      |
| Maximum  | Unlimited |

Per business rules (150-business-rules), there is no maximum quantity cap per item.

### UI Controls

- Decrement button (`-`): decreases quantity by 1. Disabled when quantity equals 1.
- Numeric display: shows current quantity value.
- Increment button (`+`): increases quantity by 1.

### Validation

- Quantity must always be an integer greater than or equal to 1.
- Non-integer or zero/negative values must be rejected.
- The quantity value must be included in the cart item payload.

---

## Product Status Handling

### Status Matrix

| Product Status  | Page Behavior                                                        |
| --------------- | -------------------------------------------------------------------- |
| Available       | Normal display. All interactions enabled.                            |
| Out of Stock    | Product displayed with "Out of Stock" badge. "Add to Cart" button is disabled. Quantity selector is disabled. Options are visible but not selectable. |
| Hidden          | Customer should not reach this page. If navigated (e.g., stale link), redirect to menu screen (F002) with an informational message. |
| Disabled        | Same behavior as Hidden. Redirect to menu screen.                   |

### Out of Stock State

When a product is out of stock:

- Product image, name, and description remain visible.
- Base price remains visible.
- Option groups remain visible (read-only) to communicate what the product normally includes.
- The "Add to Cart" button is displayed with a disabled style and label: "Out of Stock".
- The quantity selector is disabled.
- A prominent "Out of Stock" badge or banner is displayed near the product image or name.

### Redirect Behavior (Hidden / Disabled)

If a customer navigates to a hidden or disabled product:

- Do not render the product detail page.
- Redirect to the menu screen (F002).
- Display a transient message: "This product is currently unavailable."

---

## Add to Cart Action

### Prerequisites

Before the "Add to Cart" button is enabled, the system must verify:

1. Product status is **Available**.
2. All required option groups have a selection.
3. Selected options are **active**.
4. Quantity is a valid integer >= 1.

### Button States

| State          | Button Appearance                                                 |
| -------------- | ----------------------------------------------------------------- |
| Ready          | Solid primary color, label: `Add to Cart — {price} THB`           |
| Loading        | Spinner or skeleton, label: `Adding...`, disabled                  |
| Success        | Brief flash of checkmark icon or green confirmation, label: `Added to Cart` |
| Error          | Shake animation or red highlight, label: `Add to Cart — {price} THB`, toast message with error details |
| Disabled       | Muted/gray, not clickable                                         |

Disabled conditions:
- Product is out of stock.
- Required options not selected (should not occur with defaults, but guarded).

### Animation and Feedback

Per UI/UX rules (70-ui-ux-rules):

1. **Tap feedback**: The button shows a pressed state on touch start.
2. **Loading state**: While the API call is in progress, the button shows a spinner with the text "Adding..." and is disabled to prevent double submission.
3. **Success feedback**: On successful cart addition:
   - The button briefly transitions to a green/success state with a checkmark icon and the text "Added to Cart" for approximately 1.5 seconds.
   - The button then reverts to its default state, allowing another add action (e.g., to add more of the same configuration or change options).
   - A subtle haptic vibration or visual pulse reinforces confirmation.
4. **Error feedback**: On failure:
   - A toast/snackbar message appears at the bottom of the screen with a user-friendly error message (e.g., "Unable to add to cart. Please try again.").
   - The button reverts to its default enabled state.
   - Avoid technical error messages per UI/UX rules.

### Double-Submit Prevention

- The "Add to Cart" button must be disabled during the API call.
- A debounce or lock mechanism prevents multiple rapid submissions.
- If the user taps the button multiple times before the first request completes, only one cart addition should result.

---

## API Integration

### Endpoint

```
GET /api/v1/products/:id
```

### Request

| Field   | Type   | Description               |
| ------- | ------ | ------------------------- |
| :id     | string | Product ID (e.g., PRD-000001) |

Requires authentication header:

```
Authorization: Bearer <token>
```

### Expected Response (200 OK)

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "PRD-000001",
    "sku": "MS-001",
    "thaiName": "ไก่",
    "englishName": "Chicken Skewer",
    "category": {
      "id": "MC001",
      "name": "Mala Skewers"
    },
    "description": "Tender chicken skewer with authentic mala flavor",
    "basePrice": 25,
    "image": "https://cdn.example.com/products/PRD-000001.webp",
    "status": "available",
    "optionGroups": [
      {
        "id": "OG001",
        "name": "Spice Level",
        "required": true,
        "multipleSelection": false,
        "displayOrder": 1,
        "options": [
          { "id": "OPT001", "name": "None", "additionalPrice": 0, "displayOrder": 1 },
          { "id": "OPT002", "name": "Mild", "additionalPrice": 0, "displayOrder": 2 },
          { "id": "OPT003", "name": "Medium", "additionalPrice": 0, "displayOrder": 3 },
          { "id": "OPT004", "name": "Hot", "additionalPrice": 0, "displayOrder": 4 },
          { "id": "OPT005", "name": "Extra Hot", "additionalPrice": 0, "displayOrder": 5 }
        ]
      },
      {
        "id": "OG002",
        "name": "Sauce",
        "required": true,
        "multipleSelection": false,
        "displayOrder": 2,
        "options": [
          { "id": "OPT101", "name": "Mala Powder", "additionalPrice": 0, "displayOrder": 1 },
          { "id": "OPT102", "name": "Sesame Sauce", "additionalPrice": 0, "displayOrder": 2 },
          { "id": "OPT103", "name": "Sesame Mala Sauce", "additionalPrice": 0, "displayOrder": 3 },
          { "id": "OPT104", "name": "Sesame Peanut Sauce", "additionalPrice": 0, "displayOrder": 4 },
          { "id": "OPT105", "name": "Mala Dipping Sauce", "additionalPrice": 0, "displayOrder": 5 }
        ]
      }
    ]
  }
}
```

### Error Responses

| Status | Condition                                          | Behavior                                            |
| ------ | -------------------------------------------------- | --------------------------------------------------- |
| 401    | Missing or invalid token                           | Redirect to login                                   |
| 404    | Product not found                                  | Redirect to menu with "Product not found" message   |
| 500    | Server error                                       | Show error screen with retry option                 |

### Add to Cart Payload

When the customer taps "Add to Cart", the following payload is sent to `POST /api/v1/cart/items` (see F004):

```json
{
  "productId": "PRD-000001",
  "productName": "Chicken Skewer",
  "basePrice": 25,
  "selectedOptions": [
    { "optionGroupId": "OG001", "optionId": "OPT003", "optionName": "Medium" },
    { "optionGroupId": "OG002", "optionId": "OPT103", "optionName": "Sesame Mala Sauce" }
  ],
  "quantity": 1,
  "subtotal": 25
}
```

---

## State Management

### Local Component State

The product detail page manages the following state:

| State Field        | Type    | Default                     | Description                          |
| ------------------ | ------- | --------------------------- | ------------------------------------ |
| productId          | string  | From route params           | The product being viewed             |
| product            | object  | null                        | Full product data from API           |
| isLoading          | boolean | true                        | True while fetching product data     |
| error              | string  | null                        | Error message if fetch fails         |
| selectedOptions    | object  | `{ OG001: "OPT001", OG002: "OPT101" }` | Currently selected option per group |
| quantity           | number  | 1                           | Selected quantity                    |
| isAddingToCart     | boolean | false                       | True while add-to-cart API is in progress |
| addToCartError     | string  | null                        | Error message if add-to-cart fails   |
| addToCartSuccess   | boolean | false                       | True briefly after successful add    |

### Derived State

| Derived Field      | Calculation                                                       |
| ------------------ | ----------------------------------------------------------------- |
| finalPrice         | basePrice + sum of selected options' additionalPrice              |
| canAddToCart       | product.status === "available" AND all required options selected  |
| subtotal           | finalPrice * quantity                                             |

### Default Selections on Page Load

When the page loads and product data is received:

1. Iterate through option groups in display order.
2. For each required option group, pre-select the first option (by display order).
   - OG001 Spice Level: pre-select "None" (display order 1).
   - OG002 Sauce: pre-select "Mala Powder" (display order 1).
3. Set quantity to 1.

This ensures the "Add to Cart" button is immediately enabled for available products.

---

## Navigation

### Entry Points

- From product card tap on menu screen (F002).
- From deep link or URL with product ID.

### Exit Points

| Action            | Destination                        | Trigger                              |
| ----------------- | ---------------------------------- | ------------------------------------ |
| Back button       | Menu screen (F002)                 | Header back button tap               |
| Swipe back        | Menu screen (F002)                 | Platform back gesture                |
| Add to Cart       | Same page (with feedback)          | Stay on product detail after success |
| Redirect          | Menu screen (F002)                 | Hidden/disabled product detected     |

---

## Loading States

| Scenario           | Behavior                                                          |
| ------------------ | ----------------------------------------------------------------- |
| Initial page load  | Skeleton loader for product image, name, description, options.   |
| Image loading      | Placeholder/blur-up while image loads. Lazy loaded.               |
| API error          | Error screen with "Unable to load product" message and retry button. |

---

## Testing

### Unit Tests

| Test Case                                          | Expected Result                                           |
| -------------------------------------------------- | --------------------------------------------------------- |
| Page loads with available product                   | Product details rendered, options pre-selected, button enabled |
| Page loads with out-of-stock product                | Product rendered, button disabled, badge shown           |
| Page loads with hidden product                      | Redirects to menu screen                                  |
| Page loads with disabled product                    | Redirects to menu screen                                  |
| Default options pre-selected                        | Spice Level: None; Sauce: Mala Powder                    |
| User changes spice level selection                 | Selection updates, price recalculated                     |
| User changes sauce selection                       | Selection updates, price recalculated                     |
| Quantity increment                                  | Quantity increases, subtotal recalculated                 |
| Quantity decrement at 1                             | Button disabled, quantity stays at 1                     |
| Quantity decrement below 1                         | Prevented (validation)                                   |
| Add to Cart with valid state                        | API called with correct payload, success feedback shown  |
| Add to Cart with missing required option            | Button is disabled (should not occur with defaults)      |
| Double-tap on Add to Cart                           | Only one API call made, button locked during request      |
| Add to Cart API failure                             | Error toast shown, button re-enabled                      |
| Image fails to load                                 | Placeholder or fallback image displayed                    |
| API returns 401                                    | Redirect to login                                        |
| API returns 404                                    | Redirect to menu with error message                       |
| API returns 500                                    | Error screen with retry                                    |

### Integration Tests

| Test Case                                          | Expected Result                                           |
| -------------------------------------------------- | --------------------------------------------------------- |
| Navigate from menu to product detail and back      | Correct product loaded, back returns to menu position     |
| Add to cart, then navigate to cart page            | Cart item appears with correct product, options, quantity |
| Add to cart multiple times with same config         | Cart quantity updates (or new item added per cart rules)  |
| Add to cart with different options for same product | Separate cart entries created                             |

---

## Future Expansion

Potential future enhancements for this feature:

- **Product images gallery**: Multiple images with swipe/carousel.
- **Product reviews and ratings**: Star rating display and review list.
- **Recommended / related products**: "You might also like" section.
- **Nutritional information**: Calorie count and allergen warnings.
- **Favorite / bookmark**: Save products for quick reordering.
- **Option additional prices**: Non-zero option prices when add-ons are introduced.
- **Combo / bundle builder**: Select multiple products as a set.
- **Special instructions per product**: Text input for cooking preferences.
- **Stock quantity display**: "Only 3 left" indicators.
- **Recently viewed products**: Quick access from menu.

These features must not require architectural changes to the current product detail page structure.

---

## References

- `151-product-catalog.md` — Product structure and status definitions
- `152-product-options.md` — Option groups, available options, and validation rules
- `153-pricing-rules.md` — Price calculation formulas
- `70-ui-ux-rules.md` — UI/UX standards, feedback, loading states, accessibility
- `174-api-design.md` — API conventions and endpoint definitions
- `150-business-rules.md` — Business rules and constraints
- `F002-menu.md` — Menu screen (entry point)
- `F004-cart.md` — Cart feature (destination after add)
