# Auan-Auan-Platform

> Screen Specifications

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Screen Specifications |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines every screen in Auan-Auan-Platform.

It serves as the primary UI specification for frontend development.

---

## Design Principles

Every screen must be:

- Mobile First
- Clean
- Consistent
- Fast
- Easy to Navigate
- Accessible

---

## Customer Screens

### Splash Screen

Purpose

Initialize application.

Components

- Logo
- Loading Indicator

Actions

- Check Authentication
- Load Configuration

Next

```text
Home
OR
Login
```

---

### Login Screen

Purpose

Authenticate customer using LINE Login.

Components

- Logo
- Login Button
- Privacy Policy
- Terms of Service

Actions

- Login

Next

```text
Home
```

---

### Home Screen

Purpose

Display products.

Components

- Search Bar
- Category Tabs
- Product Grid
- Shopping Cart Button
- Profile Button

Actions

- Search Products
- Select Category
- Open Product
- Open Cart

---

### Product Detail Screen

Purpose

Display product information.

Components

- Product Image
- Product Name
- Description
- Price
- Option Groups
- Quantity Selector
- Add To Cart Button

Actions

- Select Options
- Update Quantity
- Add To Cart

---

### Cart Screen

Purpose

Display shopping cart.

Components

- Cart Items
- Quantity Controls
- Remove Button
- Order Summary
- Checkout Button

Actions

- Update Quantity
- Remove Item
- Checkout

---

### Checkout Screen

Purpose

Collect delivery information.

Components

- Customer Name
- Building Selector
- Room Number
- Delivery Note
- Order Summary
- Confirm Button

Actions

- Submit Order

---

### Payment Screen

Purpose

Allow customer payment.

Components

- PromptPay QR
- PromptPay Number
- Total Amount
- Payment Instructions
- "I've Paid" Button

Actions

- Confirm Payment

---

### Waiting Verification Screen

Purpose

Inform customer that payment is under review.

Components

- Status Badge
- Progress Indicator
- Order Summary

Actions

- Refresh Status

---

### Order Tracking Screen

Purpose

Display current order progress.

Components

- Status Timeline
- Estimated Time
- Order Details

Actions

- Refresh
- Contact Store (Future)

---

### Order History Screen

Purpose

Display previous orders.

Components

- Order List
- Status Badge
- Total Price

Actions

- View Details
- Reorder (Future)

---

### Profile Screen

Purpose

Display customer information.

Components

- Avatar
- Display Name
- Phone Number
- Saved Addresses
- Logout Button

Actions

- Edit Profile
- Logout

---

## Admin Screens

### Dashboard

Purpose

Business overview.

Components

- Today's Sales
- Pending Orders
- Active Orders
- Revenue Summary
- Quick Actions

---

### Order List

Purpose

Display all orders.

Components

- Search
- Filters
- Order Cards
- Status Filter

Actions

- View Order
- Update Status

---

### Order Detail

Purpose

Manage order.

Components

- Customer Information
- Ordered Items
- Payment Information
- Status Controls

Actions

- Verify Payment
- Update Status

---

### Product List

Purpose

Manage products.

Components

- Search
- Product Table
- Add Button
- Edit Button

Actions

- Create Product
- Edit Product
- Disable Product

---

### Product Editor

Purpose

Create or edit products.

Components

- Product Name
- Category
- Price
- Description
- Image Upload
- Availability
- Save Button

Actions

- Save
- Cancel

---

### Category Management

Purpose

Manage categories.

Components

- Category List
- Add Button
- Edit Button

Actions

- Create
- Edit
- Disable

---

### Customer Management

Purpose

View customer information.

Components

- Customer List
- Search
- Customer Details

Actions

- View Customer

---

### Notification Center

Purpose

Display system notifications.

Components

- Notification List
- Read Indicator

Actions

- Mark As Read

---

### Settings Screen

Purpose

Manage application settings.

Components

- Store Information
- PromptPay Information
- LINE Configuration
- Save Button

Actions

- Update Settings

---

## Shared Components

Every screen may use:

- App Header
- Bottom Navigation
- Back Button
- Toast
- Dialog
- Loading Spinner
- Skeleton Loader
- Empty State

---

## Loading Screens

The application should provide loading states for:

- Products
- Categories
- Cart
- Checkout
- Orders
- Dashboard

---

## Error Screens

Dedicated screens should exist for:

- Network Error
- Unauthorized
- Forbidden
- Not Found
- Server Error

---

## Empty States

Dedicated empty states should exist for:

- No Products
- Empty Cart
- No Orders
- No Notifications
- No Search Results

---

## Responsive Layout

Customer

```text
Mobile First
```

Admin

```text
Tablet
Desktop
```

---

## Accessibility

Every screen should support:

- Keyboard Navigation (Admin)
- Screen Readers
- High Contrast
- Proper Labels
- Large Touch Targets

---

## Future Screens

Future releases may include:

- Loyalty Dashboard
- Membership
- Coupons
- Favorites
- AI Assistant
- Inventory
- Reports
- Multi-Branch Dashboard

---

## Definition of Done

The screen specification is complete when:

- Every customer screen is documented.
- Every admin screen is documented.
- Shared components are defined.
- Error states are documented.
- Future expansion is supported.

---

## References

- `70-ui-ux-rules.md`
- `170-system-architecture.md`
- `172-system-modules.md`
- `174-api-design.md`
- `175-authentication-authorization.md`
- `180-ui-flow.md`
- `188-component-library.md`
