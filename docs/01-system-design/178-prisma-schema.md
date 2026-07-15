# Auan-Auan-Platform

> Prisma Schema Design

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Prisma Schema Design |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the official Prisma data model for Auan-Auan-Platform.

This document is the source of truth for the `schema.prisma` file.

Every database model must be derived from this specification.

---

## Design Principles

The Prisma schema must be:

- Type Safe
- Normalized
- Scalable
- Maintainable
- AI-Friendly
- Future-Proof

Business logic must never exist inside Prisma models.

---

## Database Provider

| Item | Value |
| ---- | ----- |
| Database | PostgreSQL |
| ORM | Prisma ORM |
| Primary Key | UUID |
| Time Zone | UTC |

---

## Naming Convention

### Models

Use PascalCase.

Examples:

```text
Customer
Product
Order
OrderItem
Payment
```

---

### Fields

Use camelCase.

Examples:

```text
firstName
lineUserId
createdAt
updatedAt
```

---

### Enums

Use PascalCase.

Examples:

```text
OrderStatus
PaymentStatus
ProductStatus
```

---

## Required Base Fields

Every model must include:

| Field | Type |
| ---- | ---- |
| id | UUID |
| createdAt | DateTime |
| updatedAt | DateTime |

Future ERP models may also include:

- createdBy
- updatedBy
- deletedAt

---

## Current Models

### Customer

Purpose:

Store customer information obtained from LINE Login.

Fields:

- id
- lineUserId
- displayName
- pictureUrl
- phone
- createdAt
- updatedAt

Relations:

```text
Customer
    │
    └──────< Order
```

---

### Category

Purpose:

Store product categories.

Fields:

- id
- name
- description
- displayOrder
- isActive
- createdAt
- updatedAt

Relations:

```text
Category
    │
    └──────< Product
```

---

### Product

Purpose:

Store menu items.

Fields:

- id
- categoryId
- name
- description
- imageUrl
- price
- status
- displayOrder
- isAvailable
- createdAt
- updatedAt

Relations:

```text
Product
    │
    ├────── Category
    ├──────< ProductOptionGroup
    └──────< OrderItem
```

---

### ProductOptionGroup

Purpose:

Group selectable product options.

Examples:

```text
Spice Level

Extra

Sauce
```

Fields:

- id
- productId
- name
- required
- multiple
- displayOrder

Relations:

```text
Product
    │
    └──────< ProductOptionGroup
                    │
                    └──────< ProductOption
```

---

### ProductOption

Purpose:

Store selectable options.

Examples:

```text
Extra Egg

Extra Rice

Cheese

Large Size
```

Fields:

- id
- optionGroupId
- name
- additionalPrice
- displayOrder
- isActive

---

### CustomerAddress

Purpose:

Store delivery addresses.

Fields:

- id
- customerId
- building
- roomNumber
- note
- isDefault

Relations:

```text
Customer
    │
    └──────< CustomerAddress
```

---

### Cart

Purpose:

Temporary shopping cart.

Fields:

- id
- customerId
- createdAt
- updatedAt

Relations:

```text
Customer
    │
    └────── Cart
```

---

### CartItem

Fields:

- id
- cartId
- productId
- quantity
- unitPrice
- subtotal

---

### Order

Purpose:

Store customer orders.

Fields:

- id
- customerId
- orderNumber
- addressId
- subtotal
- total
- orderStatus
- paymentStatus
- note
- createdAt
- updatedAt

Relations:

```text
Customer
        │
        └──────< Order
                    │
                    ├──────< OrderItem
                    └────── Payment
```

---

### OrderItem

Fields:

- id
- orderId
- productId
- quantity
- unitPrice
- subtotal

---

### OrderItemOption

Purpose:

Selected options.

Example:

```text
Egg +10

Extra Cheese +20
```

Fields:

- id
- orderItemId
- optionName
- additionalPrice

---

### Payment

Purpose:

Store payment information.

Fields:

- id
- orderId
- method
- amount
- paymentStatus
- slipImage
- paidAt
- verifiedAt

Relations:

```text
Order
    │
    └────── Payment
```

---

Enums

### ProductStatus

```text
ACTIVE

DISABLED
```

---

### OrderStatus

```text
PENDING_PAYMENT

PAYMENT_VERIFICATION

PREPARING

READY

DELIVERING

COMPLETED

CANCELLED

EXPIRED
```

---

### PaymentStatus

```text
UNPAID

PENDING

PAID

REJECTED

REFUNDED
```

---

### PaymentMethod

```text
PROMPTPAY
```

Future:

```text
LINEPAY

CREDIT_CARD
```

---

## Relationships

```text
Customer
    │
    ├──────< CustomerAddress
    ├────── Cart
    └──────< Order
                    │
                    ├────── Payment
                    └──────< OrderItem
                                │
                                ├────── Product
                                └──────< OrderItemOption

Category
    │
    └──────< Product
                    │
                    └──────< ProductOptionGroup
                                │
                                └──────< ProductOption
```

---

## Indexes

Recommended indexes:

- lineUserId
- orderNumber
- categoryId
- productId
- customerId
- orderStatus
- paymentStatus
- createdAt

---

## Constraints

The schema must enforce:

- Unique LINE User ID
- Unique Order Number
- Required Foreign Keys
- Non-Negative Prices
- Non-Negative Quantity
- Valid Enum Values

---

## Migration Policy

Schema changes must follow:

```text
Update Documentation
        ↓
Update schema.prisma
        ↓
Generate Migration
        ↓
Review Migration
        ↓
Apply Migration
```

Direct database modification is prohibited.

---

## Future Models

Future ERP modules may introduce:

- Inventory
- Ingredient
- Recipe
- Supplier
- PurchaseOrder
- StockMovement
- Employee
- Role
- Permission
- Branch
- Coupon
- Membership
- LoyaltyPoint
- Expense
- Income

The current schema must remain backward compatible.

---

## Definition of Done

The Prisma schema design is complete when:

- All models are defined.
- Relationships are documented.
- Enums are defined.
- Constraints are documented.
- Naming conventions are enforced.
- Future ERP expansion is supported.

---

## References

- `80-database-rules.md`
- `150-business-rules.md`
- `151-product-catalog.md`
- `152-product-options.md`
- `154-order-workflow.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `173-database-design.md`
- `174-api-design.md`
- `175-authentication-authorization.md`
