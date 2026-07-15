# Auan-Auan-Platform

> F002 — Menu Page

## Document Information

| Item         | Value            |
| ------------ | ---------------- |
| Document     | F002 — Menu Page |
| Version      | 1.0.0            |
| Status       | Active           |
| Owner        | Project Team     |
| Last Updated | 2026-07-13       |

---

## Purpose

This document defines the feature specification for the **Menu Page** — the primary product browsing screen customers see after logging in via LINE LIFF.

The Menu Page is the central hub for product discovery. It displays product categories, allows filtering by category, provides search and sort capabilities, and surfaces product cards that link to the Product Detail page (F003).

---

## Scope

### Included

- Category tab/segment navigation at the top of the page
- Product grid displaying all products within the selected category
- Product card component (image, name, price, status indicator)
- Product status display (Available, Out of Stock, Hidden, Disabled)
- Search functionality across product names
- Sort options (display_order, price, name)
- Loading states, empty states, and error states
- API integration for categories and products
- Navigation from Rich Menu to LIFF to Menu page

### Excluded

- Product detail view (covered by F003)
- Add-to-cart interaction (covered by F004)
- Product options configuration (covered by F003)
- Admin product management (admin panel)
- Promotional banners or recommended products
- Customer favorites or wishlists
- Combo sets or seasonal collections

---

## Navigation Flow

```text
LINE Rich Menu
       |
       v
  LINE LIFF Login (F001)
       |
       v
  Menu Page (F002)  <-- This feature
       |
       v
  Product Detail (F003)
       |
       v
  Cart (F004)
```

The Menu Page is the first screen a customer sees after successful LINE LIFF authentication. It must be reachable within **three taps** from the Rich Menu, per the UI/UX navigation rules (70-ui-ux-rules.md).

---

## Page Layout

### Structure

```text
+----------------------------------+
|  Header / App Bar                |
|  (Store name, Cart icon)         |
+----------------------------------+
|  Search Bar                      |
+----------------------------------+
|  Category Tabs / Segments        |
|  [Mala Skewers] [Sauce]          |
+----------------------------------+
|  Sort Dropdown (optional)        |
+----------------------------------+
|  Product Grid                    |
|  +--------+ +--------+          |
|  | Card 1 | | Card 2 |          |
|  +--------+ +--------+          |
|  +--------+ +--------+          |
|  | Card 3 | | Card 4 |          |
|  +--------+ +--------+          |
|  ...                             |
+----------------------------------+
|  Bottom Navigation               |
+----------------------------------+
```

### Layout Rules

Per 70-ui-ux-rules.md:

- Mobile-first design (320px+ primary target)
- Consistent spacing using the 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 scale
- Category tabs must remain sticky at the top during scroll
- Product grid must be scrollable independently
- One-hand reachable layout for primary actions

### Responsive Breakpoints

| Breakpoint | Grid Columns | Notes                            |
| ---------- | ------------ | -------------------------------- |
| 320px+     | 2 columns    | Default mobile layout            |
| 768px+     | 3 columns    | Tablet                           |
| 1024px+    | 4 columns    | Desktop (enhanced, not primary)  |

---

## Categories

### Current Categories

Defined in 151-product-catalog.md:

| Category ID  | Category Name | Description           |
| ------------ | ------------- | --------------------- |
| MC001        | Mala Skewers  | Primary product line  |
| SC001        | Sauce         | Companion sauce items |

### Category Tab Component

- Rendered as horizontally scrollable tabs or segmented controls
- The **first category** (MC001) is selected by default on page load
- Active tab must be visually distinct (bold, underline, or color highlight)
- Tabs should indicate the number of products in each category (optional enhancement)
- Category order follows `display_order` from the API response
- Must support horizontal overflow scroll on mobile if many categories are added in the future

### Category Data Source

Fetched from `GET /categories` on page mount. See API section below.

---

## Product Card Component

Each product card represents a single menu item in the grid.

### Card Elements

Per 70-ui-ux-rules.md Product Cards section:

| Element         | Source Field               | Notes                                                        |
| --------------- | -------------------        | ----------------------------------------                     |
| Product Image   | `imageUrl`                 | Square aspect ratio, lazy-loaded                             |
| Product Name    | `thaiName` / `englishName` | Display Thai name primarily, English as fallback or subtitle |
| Base Price      | `basePrice`                | Formatted as THB currency                                    |
| Status Indicator| `status`                   | Badge or overlay based on status                             |

### Card Layout (Mobile)

```text
+------------------+
|                  |
|   [Image]        |
|   1024x1024      |
|                  |
+------------------+
| Product Name     |
| 40 THB           |
| [Status Badge]   |
+------------------+
```

### Card Interactions

- Tapping the card navigates to Product Detail (F003)
- Disabled cards (Hidden/Disabled status) are not rendered at all
- Out of Stock cards are visible but tap navigates to detail with purchasing disabled

### Image Handling

Per 151-product-catalog.md:

- Format: WebP preferred
- Resolution: 1024 x 1024 px
- Must maintain square aspect ratio
- Lazy-loaded per 70-ui-ux-rules.md performance guidelines
- Include `alt` text with product name for accessibility

---

## Product Status Display

Defined in 151-product-catalog.md:

| Status        | Visible to Customer | Purchasable | UI Behavior                                   |
| ------------- | ------------------- | ----------- | -------------------------------------------- |
| **Available**     | Yes                 | Yes         | Normal card display. No badge.               |
| **Out of Stock**  | Yes                 | No          | Card displayed with "Out of Stock" badge. Tap opens detail but add-to-cart is disabled. |
| **Hidden**        | No                  | No          | Product is completely excluded from the list. Not fetched or filtered out by API. |
| **Disabled**      | No                  | No          | Product is completely excluded from the list. Not fetched or filtered out by API. |

### Status Badge Styling

Per 70-ui-ux-rules.md color usage:

| Status        | Badge Color | Badge Text         |
| ------------- | ----------- | ------------------ |
| Available     | (none)      | (none)             |
| Out of Stock  | Warning     | "Out of Stock"     |

Status indicators must never rely on color alone. Badges must include text labels.

---

## Search Functionality

Per 151-product-catalog.md:

### Search Scope

- Product name (Thai and English)
- Case-insensitive matching

### Search UI

- Search bar positioned below the header, above category tabs
- Debounced input (recommended: 300ms)
- Search icon prefix in the input field
- Clear button (X) when search text is present

### Search Behavior

1. When search text is entered, filter products across **all categories**
2. Category tabs remain visible but do not constrain search results
3. If search yields no results, display the **empty state** (see below)
4. Clearing the search input returns the user to the last active category view

### Search Implementation

```text
?search=chicken
```

Search is performed server-side via the `GET /products` endpoint with the `search` query parameter.

---

## Sort Options

Per 151-product-catalog.md:

| Sort Option    | API Parameter       | Default |
| ------------- | ------------------- | ------- |
| Display Order | `sort=display_order` | Yes     |
| Price         | `sort=price`         | No      |
| Name          | `sort=name`          | No      |

### Sort Direction

```text
?sort=price&order=asc    (low to high)
?sort=price&order=desc   (high to low)
```

Default sort: `display_order` ascending (the order configured by the business owner).

### Sort UI

- Rendered as a dropdown or toggle control near the top of the product grid
- Must indicate the currently active sort option
- Changing sort re-fetches or re-sorts the product list

---

## Loading States

Per 70-ui-ux-rules.md:

### Skeleton Loaders

While data is being fetched, display **skeleton loaders** that match the layout of the actual content:

- **Category tabs**: Rectangular placeholder blocks matching tab width
- **Product cards**: Rectangular placeholder blocks matching card dimensions (image area + text lines)

Skeleton loaders must appear **immediately** on page load, before data arrives. Avoid blank screens at all costs.

### Loading Behavior

| Trigger           | Behavior                                              |
| ---------------- | ----------------------------------------------------- |
| Initial page load| Show skeleton loaders for both categories and products |
| Category switch  | Show skeleton loaders for products only               |
| Search query     | Show skeleton loaders for products after debounce     |
| Sort change      | Show skeleton loaders for products (or optimistic sort) |

---

## Empty States

Per 70-ui-ux-rules.md, every empty screen must explain **why** it is empty and **what the user can do**.

| Scenario              | Message                                    | Action                            |
| --------------------- | ------------------------------------------ | --------------------------------- |
| Category has no products | "No products in this category yet."       | Suggest browsing another category |
| Search has no results | "No products match your search."           | Clear search / suggest keywords    |
| All products unavailable | "No products are available right now."    | Suggest checking back later        |

---

## Error States

Per 70-ui-ux-rules.md, error messages must explain the problem, suggest a solution, and avoid technical terminology.

| Scenario             | User-Facing Message                                   | Action Button        |
| -------------------- | ----------------------------------------------------- | ------------------- |
| Network failure      | "Unable to load the menu. Please check your connection and try again." | "Retry"             |
| Server error (5xx)   | "Something went wrong. Please try again later."       | "Retry"             |
| Categories load fail | "Unable to load categories. Please try again."        | "Retry"             |
| Products load fail   | "Unable to load products. Please try again."          | "Retry"             |

Error states must include a **Retry** button that re-fetches the failed request.

---

## API Integration

All API calls follow the standards defined in 90-api-rules.md and 174-api-design.md.

### Base URL

```text
/api/v1
```

### GET /categories

Retrieve all active product categories.

**Request:**

```text
GET /api/v1/categories
Authorization: Bearer <token>
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid-mc001",
      "categoryId": "MC001",
      "name": "Mala Skewers",
      "displayOrder": 1,
      "productCount": 15
    },
    {
      "id": "uuid-sc001",
      "categoryId": "SC001",
      "name": "Sauce",
      "displayOrder": 2,
      "productCount": 5
    }
  ]
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": {
    "code": "CATEGORIES_FETCH_FAILED",
    "message": "Unable to load categories."
  }
}
```

---

### GET /products

Retrieve products for a given category, with optional search and sort.

**Request:**

```text
GET /api/v1/products?categoryId=MC001&sort=display_order&order=asc&page=1&pageSize=20
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter    | Type   | Required | Description                          |
| ------------ | ------ | -------- | ------------------------------------ |
| `categoryId` | string | Yes      | Category ID (e.g., "MC001")          |
| `search`     | string | No       | Case-insensitive product name search |
| `sort`       | string | No       | `display_order`, `price`, `name`     |
| `order`      | string | No       | `asc` or `desc` (default: `asc`)     |
| `page`       | number | No       | Page number (default: 1)             |
| `pageSize`   | number | No       | Items per page (default: 20)         |

**Response (Success):**

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "uuid-product-1",
      "productId": "PRD-000001",
      "sku": "MS-001",
      "thaiName": "...",
      "englishName": "Chicken Skewer",
      "categoryId": "MC001",
      "description": "Tender chicken with mala seasoning",
      "basePrice": 25,
      "imageUrl": "https://cdn.example.com/products/ms-001.webp",
      "displayOrder": 1,
      "status": "Available"
    },
    {
      "id": "uuid-product-2",
      "productId": "PRD-000002",
      "sku": "MS-002",
      "thaiName": "...",
      "englishName": "Pork Skewer",
      "categoryId": "MC001",
      "description": "Juicy pork with mild spice",
      "basePrice": 30,
      "imageUrl": "https://cdn.example.com/products/ms-002.webp",
      "displayOrder": 2,
      "status": "Out of Stock"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 15,
    "totalPages": 1
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": {
    "code": "PRODUCTS_FETCH_FAILED",
    "message": "Unable to load products."
  }
}
```

**Notes:**

- Products with status `Hidden` or `Disabled` are **excluded** by the API and never sent to the client.
- Only `Available` and `Out of Stock` products appear in the response.
- `productCount` in the categories response reflects the count of customer-visible products.

---

## State Management

### Server State (TanStack Query / React Query)

All data fetched from the API is managed as **server state** using TanStack Query.

| Query Key                     | Endpoint         | Trigger                     |
| ----------------------------- | ---------------- | --------------------------- |
| `["categories"]`             | GET /categories   | Page mount                  |
| `["products", categoryId]`    | GET /products?categoryId=X | Category tab selection |
| `["products", "search", term]`| GET /products?search=X | Search input (debounced) |

### Query Configuration

```text
staleTime:          5 minutes     (categories rarely change during a session)
gcTime:              10 minutes    (keep cache for potential back-navigation)
retry:               2             (retry failed requests up to 2 times)
refetchOnWindowFocus: true         (refresh data when user returns to tab)
```

### Category State

- Active category ID is stored as **client state** (React `useState` or URL search param)
- Default: first category returned by the API (MC001)
- Selecting a tab updates the active category, which triggers the products query

### Search State

- Search text is stored as **client state**
- Debounced (300ms) before triggering the products query
- When search text is non-empty, the query bypasses category filtering

### Sort State

- Current sort option and direction stored as **client state**
- Changing sort triggers a re-fetch or re-sort of the products query

---

## Component Architecture

```text
MenuPage
  |
  +-- MenuHeader
  |     +-- CartIcon (with badge)
  |
  +-- SearchBar
  |     +-- Input (debounced)
  |     +-- ClearButton
  |
  +-- CategoryTabs
  |     +-- CategoryTab (repeated)
  |
  +-- SortControl
  |
  +-- ProductGrid
  |     +-- ProductCard (repeated)
  |           +-- ProductImage
  |           +-- ProductName
  |           +-- ProductPrice
  |           +-- StatusBadge
  |
  +-- LoadingState (skeleton)
  +-- EmptyState
  +-- ErrorState (with Retry)
```

---

## Accessibility

Per 70-ui-ux-rules.md:

- Category tabs must support keyboard navigation (arrow keys, Enter to select)
- Product cards must be focusable and activatable via keyboard
- Images must include `alt` text with the product name
- Status badges must use text labels in addition to color
- Search input must have a visible label or `aria-label`
- Color contrast must meet WCAG AA standards

---

## Performance Considerations

Per 70-ui-ux-rules.md:

- **Lazy load** product images (below-the-fold images load on scroll)
- **Skeleton loaders** shown immediately; no blank screens
- **Debounce** search input to avoid excessive API calls
- **TanStack Query caching** avoids redundant fetches when switching between categories
- **Optimistic UI** for sort changes (sort cached data immediately, re-fetch in background)

---

## Testing Considerations

### Unit Tests

- Product card renders correctly for each status (Available, Out of Stock)
- Hidden and Disabled products are not rendered
- Category tab selection updates active category
- Search input triggers debounced API call
- Sort control applies correct sort parameter
- Empty state renders when no products match criteria
- Error state renders with retry button

### Integration Tests

- Categories load on page mount
- Products load when category is selected
- Search returns filtered results across categories
- Sort re-fetches products with correct parameters
- Error recovery (retry button) re-fetches data successfully

### End-to-End Tests (Future)

- Full navigation flow: Rich Menu -> LIFF Login -> Menu Page -> Product Detail
- Category switching displays correct products
- Search filters products correctly
- Out of Stock badge displays correctly
- Loading skeletons appear during data fetch

### Test Scenarios Summary

| Scenario                              | Expected Result                                |
| ------------------------------------- | ---------------------------------------------- |
| Page loads successfully               | Categories and products (first category) render |
| Category tab tapped                   | Products for that category display               |
| Search with matching products         | Matching products from all categories display   |
| Search with no matches                | Empty state displays                            |
| Sort by price (ascending)             | Products ordered low to high by base price       |
| Sort by name                          | Products ordered alphabetically                  |
| Product is Out of Stock               | Card shows "Out of Stock" badge                 |
| Product is Hidden                     | Card does not appear in the list                |
| Network error during fetch            | Error state displays with "Retry" button        |
| Retry after error                     | Data re-fetches and renders on success          |

---

## Business Rules Reference

From 151-product-catalog.md and 152-product-options.md:

- Every product belongs to exactly one category
- Every product has exactly one base price
- Every product has one active status
- Hidden and Disabled products are never sent to the client
- Products are sorted by display_order first, then product name
- Search is case-insensitive
- Product IDs must never be reused
- Products without prices must never be published

---

## Future Expansion

From 151-product-catalog.md, the following features are planned for future versions:

- **Combo Sets** — Pre-configured product bundles
- **Limited-Time Products** — Seasonal or promotional items
- **Recommended Products** — Staff picks or algorithm-based suggestions
- **Popular Products** — Most-ordered items badge
- **Product Tags** — Filterable tags (e.g., "Spicy", "New")
- **Product Labels** — Visual badges ("Best Seller", "New Arrival")
- **Product Ratings** — Customer review scores
- **Customer Favorites** — Personalized wishlists

### Architecture Considerations for Future Expansion

- Category tab component must handle an arbitrary number of categories without layout breakage
- Product card component must support optional badge overlays (for labels, ratings, popularity)
- Search scope may expand to include tags, descriptions, and ingredients
- Sort options may gain additional criteria (popularity, rating, newest)
- Pagination will become important as the product catalog grows

---

## Definition of Done

F002 (Menu Page) is considered complete when:

- Category tabs display all active categories
- Product grid renders product cards for the selected category
- Product cards display image, name, price, and status indicator correctly
- Search filters products across categories with debounced input
- Sort options (display_order, price, name) function correctly
- Loading states show skeleton loaders (no blank screens)
- Empty states explain the situation and suggest next steps
- Error states provide retry functionality
- TanStack Query manages all server state
- Unit tests cover core rendering and interaction logic
- Integration tests cover API data flow
- All UI follows 70-ui-ux-rules.md standards
- All API calls follow 90-api-rules.md and 174-api-design.md conventions

---

## References

- `151-product-catalog.md` — Product catalog structure, categories, status, pricing
- `152-product-options.md` — Product option groups (Spice Level, Sauce)
- `70-ui-ux-rules.md` — UI/UX standards, layout rules, loading/empty/error states
- `90-api-rules.md` — API response format, error handling, validation
- `174-api-design.md` — API endpoints, HTTP methods, pagination
- `173-database-design.md` — Database entities (Category, Product, ProductOption)
- `30-tech-stack.md` — Technology stack (React, TanStack Query, Tailwind CSS, shadcn/ui)
- `F001-line-login.md` — LINE LIFF login flow (precedes Menu page)
- `F003-product-detail.md` — Product detail page (succeeds Menu page)
- `F004-cart.md` — Shopping cart (accessible from Menu page header)
