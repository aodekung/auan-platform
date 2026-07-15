# Auan-Auan-Platform

> State Management Strategy

## Document Information

| Item | Value |
| ---- | ----- |
| Document | State Management Strategy |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the official frontend state management architecture for Auan-Auan-Platform.

The goal is to keep state predictable, maintainable, and scalable.

---

## Design Principles

State management must be:

- Simple
- Predictable
- Type Safe
- Minimal
- Performant
- Easy to Debug

Avoid unnecessary global state.

---

## Technology Stack

| Purpose | Technology |
| ------- | ---------- |
| Server State | TanStack Query |
| Global State | Zustand |
| Local State | React Hooks |
| Forms | React Hook Form |
| Validation | Zod |

---

## State Categories

```text
Application State
│
├── Server State
├── Global State
├── UI State
├── Form State
└── Local Component State
```

---

## Server State

Managed by:

```text
TanStack Query
```

Examples:

- Products
- Categories
- Orders
- Customer Profile
- Notifications

Server state should never be duplicated.

---

## Global State

Managed by:

```text
Zustand
```

Examples:

- Authentication
- Shopping Cart
- Theme
- Current Customer
- Application Settings

Global state should remain small.

---

## Local State

Managed by:

```text
React useState
```

Examples:

- Modal Visibility
- Selected Tab
- Dropdown
- Search Input
- Dialog Status

Local state should not be shared across pages.

---

## Form State

Managed by:

```text
React Hook Form
```

Validation:

```text
Zod
```

Examples:

- Checkout Form
- Product Form
- Category Form
- Login Form

---

## UI State

Examples:

- Loading
- Error
- Success
- Empty State
- Skeleton

UI state belongs to individual screens.

---

## Authentication Store

Purpose

Store authenticated user information.

State

```text
User
JWT
Login Status
Loading
```

Actions

- Login
- Logout
- Refresh User

---

## Shopping Cart Store

Purpose

Store customer cart.

State

```text
Cart Items
Subtotal
Total
Item Count
```

Actions

- Add Item
- Remove Item
- Update Quantity
- Clear Cart

---

## Customer Store

Purpose

Store customer information.

State

```text
Customer
Addresses
Profile
```

Actions

- Update Profile
- Refresh Customer

---

## Settings Store

Purpose

Store application configuration.

State

```text
Store Name
PromptPay Number
Business Hours
```

Future additions:

- Language
- Theme
- Currency

---

## Notification Store

Purpose

Manage notifications.

State

```text
Unread Count
Notification List
```

Actions

- Fetch Notifications
- Mark As Read

---

## TanStack Query Structure

```text
Products
Categories
Orders
Customer
Payments
Notifications
```

Each resource should have its own query key.

---

## Query Key Convention

Examples:

```text
products

products-detail

categories

orders

order-detail

customer

notifications
```

---

## Cache Strategy

Recommended cache durations:

| Resource | Cache |
| -------- | ----- |
| Categories | 30 Minutes |
| Products | 5 Minutes |
| Orders | 30 Seconds |
| Customer | 5 Minutes |

Critical data should be refreshed automatically.

---

## Mutation Strategy

Mutations should:

- Validate Input
- Call API
- Handle Errors
- Invalidate Queries
- Update UI

Optimistic updates may be added in future versions.

---

## Error Handling

Every state update must handle:

- Validation Errors
- API Errors
- Network Errors
- Timeout Errors
- Unauthorized Errors

Errors should never crash the application.

---

## Loading Strategy

Every asynchronous operation should expose:

```text
Loading

Success

Error
```

Loading indicators should always be visible during API requests.

---

## Folder Structure

```text
src
│
├── stores
│   ├── auth.store.ts
│   ├── cart.store.ts
│   ├── customer.store.ts
│   ├── settings.store.ts
│   └── notification.store.ts
│
├── hooks
│
├── services
│
└── queries
```

---

## State Ownership

| State | Owner |
| ----- | ----- |
| Products | TanStack Query |
| Categories | TanStack Query |
| Orders | TanStack Query |
| Cart | Zustand |
| Auth | Zustand |
| Modal | Local State |
| Form | React Hook Form |

---

## Best Practices

Always:

- Keep state minimal.
- Avoid duplicated data.
- Derive computed values when possible.
- Prefer server state over global state.
- Keep business logic inside services.

Never:

- Store API responses in multiple stores.
- Store derived values unnecessarily.
- Mix UI state with business state.
- Mutate state directly.

---

## Future Enhancements

Future improvements may include:

- Offline Support
- Persistent Cache
- Background Synchronization
- WebSocket State
- Push Notifications
- Multi-Tab Synchronization

---

## Definition of Done

The state management strategy is complete when:

- State ownership is defined.
- State categories are documented.
- Global stores are identified.
- Server state strategy is documented.
- Folder structure is defined.
- Future scalability is supported.

---

## References

- `70-ui-ux-rules.md`
- `90-api-rules.md`
- `171-technology-stack.md`
- `172-system-modules.md`
- `174-api-design.md`
- `179-api-endpoints.md`
- `180-ui-flow.md`
- `181-screen-spec.md`
