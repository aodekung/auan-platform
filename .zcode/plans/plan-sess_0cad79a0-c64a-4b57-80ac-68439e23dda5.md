
# Auan-Auan Customer Frontend + Backend Completion Plan

## Scope
- **Frontend**: Production-ready customer app (React 19 + Vite 6 + Tailwind 4)
- **Backend**: Complete 4 missing modules (Product Options, Addresses, Orders, Payments)
- **Out of scope**: Admin Dashboard, Kitchen app, LINE LIFF

---

## Phase 0: Foundation & Conflict Resolution

### 0.1 Wire AuthProvider
- Wrap `<App />` with `<AuthProvider>` in `App.tsx`
- AuthProvider already exists at `providers/auth-provider.tsx` — just needs to be connected

### 0.2 Add @auan/types dependency
- Add `"@auan/types": "workspace:*"` to `apps/customer/package.json`
- Replace any local type definitions with shared types

### 0.3 Load Fonts
- Add Google Fonts `<link>` for "Noto Sans Thai" (400,500,600,700) + "Inter" (400,500,600,700) in `index.html`
- Font stack: `"Noto Sans Thai", "Inter", sans-serif`
- Fix: globals.css already declares this font-family, just needs the actual font loaded

### 0.4 Fix Bottom Navigation
- Remove Kitchen tab and `/kitchen` route from `routes/index.tsx`
- Change to 3 tabs: **Menu** (home icon), **Orders** (package icon), **Profile** (user icon)
- Replace raw `<a>` tags with React Router `<Link>` + active state styling

### 0.5 Fix Design Token Font Conflict
- Update `189-design-tokens.md` to specify "Noto Sans Thai" as primary font (not Inter)
- Inter becomes fallback for Latin characters only

---

## Phase 1: Backend — Product Options Module

**Why first?** Product detail page needs to display options (spice level, sauce) before user can add to cart.

### Files to create (`apps/api/src/modules/product-options/`):
- `index.ts` — barrel export
- `product-options.routes.ts` — Fastify routes
- `product-options.controller.ts` — thin handlers
- `product-options.service.ts` — business logic (validate required/active options)
- `product-options.schema.ts` — Zod validation
- `product-options.types.ts` — DTOs

### Endpoints:
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/products/:productId/options` | Public | Get option groups + options for a product |
| POST | `/api/v1/products/:productId/options` | Owner | Create option group |
| PATCH | `/api/v1/product-options/:id` | Owner | Update option group |
| DELETE | `/api/v1/product-options/:id` | Owner | Soft-disable option group |
| POST | `/api/v1/product-options/:groupId/options` | Owner | Add option to group |
| PATCH | `/api/v1/product-options/:groupId/options/:id` | Owner | Update option |
| DELETE | `/api/v1/product-options/:groupId/options/:id` | Owner | Disable option |

### DB models already exist:
- `ProductOptionGroup` (id, productId, name, required, multiple, displayOrder)
- `ProductOption` (id, optionGroupId, name, additionalPrice, displayOrder, isActive)

### Register in `server.ts`:
- Import and register `productOptionRoutes`

### Also update Product Detail endpoint:
- Modify `GET /api/v1/products/:id` to include option groups + options in response

---

## Phase 2: Backend — Addresses Module

### Files to create (`apps/api/src/modules/addresses/`):
- `index.ts`, `addresses.routes.ts`, `addresses.controller.ts`, `addresses.service.ts`, `addresses.schema.ts`, `addresses.types.ts`

### Endpoints:
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/addresses` | Required | List customer addresses |
| POST | `/api/v1/addresses` | Required | Create address (building A/B/C/D, room, note) |
| PATCH | `/api/v1/addresses/:id` | Required | Update address |
| DELETE | `/api/v1/addresses/:id` | Required | Delete address |
| PATCH | `/api/v1/addresses/:id/default` | Required | Set as default address |

### Validation rules:
- `building`: enum "A" | "B" | "C" | "D" (Regent Home Bangson Phase 27 & 28 only)
- `roomNumber`: string, required
- `note`: optional, max 500 chars
- One address must be default at all times

### DB model already exists: `CustomerAddress`

---

## Phase 3: Backend — Orders Module

### Files to create (`apps/api/src/modules/orders/`):
- `index.ts`, `orders.routes.ts`, `orders.controller.ts`, `orders.service.ts`, `orders.schema.ts`, `orders.types.ts`
- `database/repositories/order.repository.ts`
- `database/repositories/order-item.repository.ts`
- `database/repositories/order-status-history.repository.ts`

### Endpoints (Customer):
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/orders` | Required | Create order from cart |
| GET | `/api/v1/orders` | Required | List customer orders (paginated, filterable by status) |
| GET | `/api/v1/orders/:id` | Required | Order detail with items, options, status history |
| PATCH | `/api/v1/orders/:id/cancel` | Required | Cancel order (only if status ≤ AWAITING_VERIFICATION) |

### Endpoints (Owner/Admin):
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/api/v1/orders/:id/status` | Owner | Update order status (follow transition matrix) |

### Business logic in `orders.service.ts`:
1. **Create Order**:
   - Validate business is open (check settings for operating hours)
   - Validate cart is not empty
   - Validate all products are available and active
   - Validate required options are selected for each cart item
   - Snapshot prices from cart (never trust client-sent prices — recalculate from DB)
   - Generate order number: `ORD-YYYYMMDD-XXXXXX` (sequential)
   - Create Order, OrderItems, OrderItemOptions records
   - Clear customer cart after successful creation
   - Set initial status: `AWAITING_PAYMENT`
   - Create OrderStatusHistory entry
   - Send notification to customer + owner

2. **Cancel Order**:
   - Validate current status allows cancellation (only PENDING, AWAITING_PAYMENT, AWAITING_VERIFICATION, PAID)
   - Cannot cancel once PREPARING or later
   - Update status → CANCELLED
   - Log status history with reason

3. **Status Transition**:
   - Validate against 13-status transition matrix from `158-order-status.md`
   - Reject invalid transitions with clear error

### Order number generation:
- Format: `ORD-20260714-000001`
- Query last order of the day, increment counter
- Unique constraint on `orderNumber`

---

## Phase 4: Backend — Payments Module

### Files to create (`apps/api/src/modules/payments/`):
- `index.ts`, `payments.routes.ts`, `payments.controller.ts`, `payments.service.ts`, `payments.schema.ts`, `payments.types.ts`
- `database/repositories/payment.repository.ts`

### Endpoints (Customer):
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/payments` | Required | Create payment for order (returns PromptPay QR + number) |
| GET | `/api/v1/payments/:orderId` | Required | Get payment status + details |
| POST | `/api/v1/payments/:id/upload-slip` | Required | Upload payment slip image (multipart) |
| POST | `/api/v1/payments/:id/confirm` | Required | Customer presses "I've Paid" → AWAITING_VERIFICATION |

### Endpoints (Owner/Admin):
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/payments/:id/verify` | Owner | Verify payment → PAID |
| POST | `/api/v1/payments/:id/reject` | Owner | Reject payment → PAYMENT_REJECTED |

### Business logic:
1. **Create Payment**:
   - Validate order exists, status is AWAITING_PAYMENT
   - Fetch PromptPay number + QR image URL from settings
   - Set 300-second timeout (from settings or default)
   - Create Payment record with status PENDING
   - Start background timeout check (or check on subsequent requests)

2. **Upload Slip**:
   - Accept multipart file (image/jpeg, image/png, max 5MB)
   - Save to local storage (per current architecture)
   - Update payment record with slip image path

3. **Customer Confirm ("I've Paid")**:
   - Validate payment status is PENDING or AWAITING_VERIFICATION
   - Update status → AWAITING_VERIFICATION
   - Notify owner

4. **Owner Verify**:
   - Validate payment status is AWAITING_VERIFICATION
   - Update status → PAID, set verifiedAt + verifiedBy
   - Update order status → PAID (which triggers → QUEUED → PREPARING flow)
   - Send notifications

5. **Owner Reject**:
   - Validate payment status is AWAITING_VERIFICATION
   - Update status → REJECTED, set rejectReason
   - Notify customer (can retry payment)
   - Update order status → PAYMENT_REJECTED

6. **Timeout Handling**:
   - Check if payment has expired (300s since creation)
   - If expired: payment status → EXPIRED, order status → EXPIRED
   - Check on every payment status request (lazy check, no background job needed per current architecture)

### Register in `server.ts`:
- Import and register `paymentRoutes` after `orderRoutes`

---

## Phase 5: Frontend — Foundation

### 5.1 Zustand Stores (`src/stores/`)
- `cart.store.ts` — Cart state (items, add, remove, update quantity, clear, persist to localStorage)
- `ui.store.ts` — UI state (bottom sheet open/close, loading overlays)

### 5.2 React Query Hooks (`src/hooks/`)
- `use-categories.ts` — GET /categories
- `use-products.ts` — GET /products, GET /products/:id, GET /products/:id/options
- `use-cart.ts` — GET /cart, POST /cart/items, PATCH /cart/items/:id, DELETE /cart/items/:id
- `use-orders.ts` — GET /orders, GET /orders/:id, POST /orders, PATCH /orders/:id/cancel
- `use-payments.ts` — GET /payments/:orderId, POST /payments, POST upload-slip, POST confirm
- `use-addresses.ts` — GET /addresses, POST, PATCH, DELETE addresses
- `use-settings.ts` — GET /settings/store, GET /settings/business-hours
- `use-notifications.ts` — GET /notifications, GET unread-count, PATCH read, PATCH read-all

### 5.3 Route Guards (`src/components/guards/`)
- `ProtectedRoute.tsx` — redirect to login if not authenticated
- `PublicRoute.tsx` — redirect to home if already authenticated

### 5.4 Domain Components (`src/components/`)
Create subdirectories: `product/`, `cart/`, `order/`, `payment/`, `layout/`

**Product components:**
- `ProductCard` — image, name, price, availability, add button
- `ProductImageCarousel` — image gallery
- `OptionSelector` — radio group for required options (spice, sauce)
- `QuantitySelector` — +/- buttons

**Cart components:**
- `CartItem` — product name, options, quantity controls, subtotal, remove
- `CartSummary` — subtotal, total, checkout button
- `EmptyCart` — illustration + CTA

**Order components:**
- `OrderCard` — order number, status badge, date, total, items preview
- `OrderStatusTimeline` — visual timeline of status progression
- `StatusBadge` — color-coded status badge (13 statuses)

**Payment components:**
- `PromptPayQRCode` — display QR + PromptPay number + amount
- `PaymentCountdown` — 300s countdown timer (server-synced)
- `SlipUploader` — image upload for payment slip

**Layout components:**
- `Header` — logo, page title, back button, profile
- `BottomNav` — 3 tabs with active state (replace current)
- `Container` — responsive page wrapper
- `ErrorBoundary` — catch rendering errors gracefully

**Feedback components:**
- `EmptyState` — reusable empty state with icon + message + CTA
- `ErrorState` — error message + retry button
- `LoadingSkeleton` — skeleton loaders for each page type

### 5.5 Additional shadcn/ui components needed
Install via shadcn CLI: Dialog, Sheet/Drawer, RadioGroup, Select, Textarea, DropdownMenu, Separator, Tabs, Toast/Sonner

### 5.6 Fix `routes/index.tsx`
- Remove `/kitchen` route
- Add `/profile` route
- Add `/store` route (store information page)
- Wrap protected routes with `<ProtectedRoute>`

---

## Phase 6: Frontend — Home + Menu + Product Detail

### 6.1 Home Page (`/`)
- Fetch store settings (name, logo, isOpen status)
- If closed: show "ร้านปิด" banner with next opening time
- Show categories grid
- Show popular/featured products
- Search bar (filter products by name)
- Link to cart icon in header

### 6.2 Menu Page (`/menu`)
- Fetch categories + products (with pagination)
- Category filter tabs
- Product grid (responsive: 1 col mobile, 2 col tablet)
- Search functionality
- Product cards link to detail

### 6.3 Product Detail Page (`/product/:id`)
- Fetch product detail + options
- Product image
- Name, description, price
- Option groups (Spice Level radio, Sauce radio)
- Required option validation before adding to cart
- Quantity selector
- "Add to Cart" button → updates Zustand store + calls API
- Navigate to cart after adding (with toast confirmation)

### User restrictions (per user request):
- Prices displayed read-only (no editable inputs)
- No access to DevTools control from UI
- Options limited to what API returns
- Building dropdown limited to A, B, C, D only

---

## Phase 7: Frontend — Cart + Checkout + Payment

### 7.1 Cart Page (`/cart`)
- Fetch cart from API
- List cart items with quantity controls (+/-)
- Remove item button
- Cart summary: subtotal, total
- "Checkout" button → navigate to checkout
- Empty cart state with CTA to menu

### 7.2 Checkout Page (`/checkout`)
- Protected route (must be logged in)
- Form fields (React Hook Form + Zod):
  - Name (auto-filled from profile)
  - Phone (auto-filled from profile)
  - Building select (A, B, C, D only)
  - Room number
  - Delivery note (optional)
- Saved address selection (if any)
- Order summary (read-only, from cart)
- "Confirm Order" button
- On confirm: POST /orders → redirect to payment page

### 7.3 Payment Page (`/payment/:orderId`)
- Protected route
- Display: Order number, items summary, total amount
- Display: Static PromptPay QR Code (from settings)
- Display: PromptPay number
- Payment countdown timer (300s, server-synced)
- "Upload Slip" button → file picker
- "I've Paid" button → POST confirm
- Auto-check payment status (polling every 5s)
- On success: redirect to order tracking
- On timeout: show expired message, link to reorder
- On rejection: show rejection reason, option to retry

---

## Phase 8: Frontend — Order Tracking + Order History

### 8.1 Order Tracking Page (`/orders/:id`)
- Order detail with status timeline
- Status progression visualization (13 statuses, highlight current)
- Order items list with options
- Delivery address
- Payment status
- Cancel button (only if status allows cancellation)
- Real-time status polling (every 10s)

### 8.2 Order History Page (`/orders`)
- List of customer orders (paginated)
- Filter by status
- Order cards with: order number, date, status badge, total
- Tap → order detail
- Empty state for no orders

---

## Phase 9: Frontend — Profile + Store Info + Polish

### 9.1 Profile Page (`/profile`)
- Customer info: name, phone, avatar from LINE
- Login status
- Logout button
- Notification preferences
- Address management (link to addresses)

### 9.2 Store Information Page (`/store`)
- Store name, description, phone
- Operating hours (from API)
- Delivery zone info (Phase 27 & 28, Buildings A-D)

### 9.3 Polish
- Error boundaries on all routes
- Loading skeletons for all data-dependent pages
- Empty states for cart, orders, notifications
- Toast notifications for actions (add to cart, order placed, etc.)
- Dark mode readiness (tokens already defined, just needs toggle)

---

## File Count Estimate

| Area | New Files | Modified Files |
|------|-----------|----------------|
| Backend modules | ~25 | 1 (server.ts) |
| Backend repos | ~4 | 1 (repositories/index.ts) |
| Frontend stores | ~2 | 0 |
| Frontend hooks | ~8 | 0 |
| Frontend components | ~20 | ~3 (routes, layout, App) |
| Frontend pages | ~10 | 0 |
| Frontend config | ~2 | ~3 (package.json, index.html, tsconfig) |
| **Total** | **~71 new** | **~8 modified** |

---

## Key Decisions

1. **No MSW needed** — backend modules will be implemented, frontend connects to real API
2. **No Splash Page** — replaced with skeleton loading on Home page
3. **Cart in localStorage (Zustand persist)** — for session persistence, synced with server cart on login
4. **Backend validates ALL prices** — frontend displays prices read-only, backend recalculates on order creation
5. **Lazy timeout check for payments** — no background jobs, check expiry on status request
6. **Font: Noto Sans Thai primary** — Inter as Latin fallback
7. **Operating hours from API** — GET /settings/business-hours, show "closed" UI when outside hours
