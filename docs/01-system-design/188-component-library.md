# Auan-Auan-Platform

> Component Library

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Component Library |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the reusable UI components for Auan-Auan-Platform.

Every UI element should be built from reusable components instead of duplicated implementations.

---

## Design Principles

Every component must be:

- Reusable
- Composable
- Accessible
- Responsive
- Type Safe
- Consistent

---

## Technology

| Item | Technology |
| ---- | ---------- |
| UI Library | React |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Icons | Lucide React |
| Forms | React Hook Form |
| Validation | Zod |

---

## Component Categories

```text
UI Components
│
├── Layout
├── Navigation
├── Inputs
├── Display
├── Feedback
├── Overlay
├── Commerce
└── Admin
```

---

## Layout Components

### AppLayout

Purpose

Main application layout.

Children

- Header
- Content
- Bottom Navigation

---

### Container

Purpose

Standard responsive page container.

---

### Section

Purpose

Logical content grouping.

---

### Card

Purpose

Reusable content container.

Variants

- Default
- Product
- Order
- Summary

---

## Navigation Components

### Header

Components

- Logo
- Page Title
- Back Button
- Profile Button

---

### BottomNavigation

Items

- Home
- Orders
- Profile

---

### Breadcrumb

Future

Admin navigation.

---

## Button Components

### Button

Variants

- Primary
- Secondary
- Outline
- Ghost
- Destructive

Sizes

- Small
- Medium
- Large

---

### IconButton

Purpose

Display icon-only actions.

---

### LoadingButton

Purpose

Prevent duplicate submissions.

---

## Input Components

### TextInput

Used for:

- Name
- Search
- Room Number

---

### TextArea

Used for:

- Notes
- Delivery Instructions

---

### SearchInput

Features

- Search Icon
- Clear Button

---

### NumberInput

Used for:

- Quantity
- Price

---

### RadioGroup

Used for:

- Required Options
- Payment Method

---

### Checkbox

Used for:

- Optional Extras

---

### Select

Used for:

- Category
- Building
- Status

---

## Product Components

### ProductCard

Displays

- Image
- Name
- Price
- Availability
- Add Button

---

### ProductImage

Purpose

Display optimized product image.

---

### ProductPrice

Purpose

Display formatted currency.

---

### ProductOptionGroup

Displays

- Group Name
- Required Indicator
- Options

---

### ProductOption

Displays

- Name
- Additional Price

---

## Cart Components

### CartItem

Displays

- Product
- Quantity
- Subtotal

Actions

- Increase
- Decrease
- Remove

---

### CartSummary

Displays

- Subtotal
- Total
- Checkout Button

---

## Checkout Components

### AddressForm

Fields

- Building
- Room Number
- Note

---

### OrderSummary

Displays

- Products
- Quantity
- Total

---

## Payment Components

### PromptPayQRCode

Displays

- QR Code
- Total Amount

---

### PromptPayAccount

Displays

- Account Number
- Account Name

---

### PaymentStatusBadge

Variants

- Unpaid
- Pending
- Paid
- Rejected

---

## Order Components

### OrderCard

Displays

- Order Number
- Status
- Total
- Created Date

---

### OrderStatusTimeline

Displays

- Pending
- Preparing
- Ready
- Completed

---

### OrderItemCard

Displays

- Product
- Options
- Quantity
- Price

---

## Customer Components

### CustomerAvatar

Displays

- LINE Profile Image

---

### CustomerInfoCard

Displays

- Name
- Phone
- Default Address

---

## Feedback Components

### LoadingSpinner

Purpose

Display loading indicator.

---

### Skeleton

Purpose

Display loading placeholder.

---

### EmptyState

Variants

- Empty Cart
- No Products
- No Orders
- No Search Results

---

### ErrorState

Displays

- Error Message
- Retry Button

---

### SuccessMessage

Purpose

Display successful operations.

---

### Toast

Variants

- Success
- Error
- Warning
- Info

---

## Overlay Components

### Dialog

Purpose

Confirmation dialogs.

---

### AlertDialog

Used for:

- Delete Confirmation
- Cancel Order

---

### Drawer

Purpose

Mobile bottom sheet.

---

### Sheet

Purpose

Sidebar panel.

---

### DropdownMenu

Purpose

Action menus.

---

## Admin Components

### DashboardCard

Displays

- Metric
- Value
- Icon

---

### DataTable

Features

- Sorting
- Filtering
- Pagination

---

### StatusBadge

Variants

- Pending
- Preparing
- Ready
- Completed
- Cancelled

---

### ActionMenu

Actions

- Edit
- Delete
- Disable
- View

---

## Shared Components

Reusable across the application:

- Avatar
- Badge
- Separator
- Tooltip
- Spinner
- Divider
- Pagination
- Tabs
- Accordion

---

## Component Naming Rules

Use PascalCase.

Examples

```text
ProductCard

OrderCard

CheckoutForm

StatusBadge
```

Component files

```text
ProductCard.tsx

OrderCard.tsx

CheckoutForm.tsx
```

---

## Folder Structure

```text
src
│
├── components
│   ├── ui
│   ├── layout
│   ├── product
│   ├── cart
│   ├── checkout
│   ├── payment
│   ├── order
│   ├── customer
│   └── admin
```

---

## Accessibility

Every component must support:

- Keyboard Navigation
- ARIA Labels
- Focus States
- Screen Readers
- Color Contrast

---

## Future Components

Future versions may include:

- CouponCard
- LoyaltyCard
- RewardDialog
- AIChatWidget
- InventoryTable
- SalesChart
- Calendar
- KanbanBoard

---

## Definition of Done

The component library is complete when:

- Every reusable component is documented.
- Component responsibilities are defined.
- Naming conventions are documented.
- Folder structure is defined.
- Future expansion is supported.

---

## References

- `70-ui-ux-rules.md`
- `171-technology-stack.md`
- `180-ui-flow.md`
- `181-screen-spec.md`
- `183-state-management.md`
- `189-design-tokens.md`
