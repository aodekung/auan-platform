# Auan-Auan-Platform

> Database Design

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Database Design |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the logical database design for Auan-Auan-Platform.

The database is designed to support future ERP expansion while keeping the MVP simple.

---

## Design Principles

The database must be:

- Normalized
- Scalable
- Maintainable
- Extensible
- Auditable

Business logic must never reside inside the database.

---

## Database Engine

| Item | Value |
| ---- | ----- |
| Database | PostgreSQL |
| ORM | Prisma |
| Character Set | UTF-8 |
| Time Zone | UTC |

---

## Entity Relationship Overview

```text
Customer
    │
    ├────────────┐
    │            │
    ▼            ▼
Order      CustomerAddress
    │
    ├──────────────┐
    │              │
    ▼              ▼
OrderItem      Payment
    │
    ▼
Product
    │
    ├──────────────┐
    │              │
    ▼              ▼
Category     ProductOption
```

---

## Core Entities

Current MVP entities:

- Customer
- Category
- Product
- ProductOption
- Order
- OrderItem
- Payment

Future entities:

- Inventory
- Supplier
- Recipe
- Employee
- Branch
- Promotion
- Coupon
- Membership

---

## Customer Table

Purpose:

Store customer profile information.

Primary Key:

```text
id (UUID)
```

Relationships:

- One Customer → Many Orders

---

## Category Table

Purpose:

Store product categories.

Primary Key:

```text
id (UUID)
```

Relationships:

- One Category → Many Products

---

## Product Table

Purpose:

Store menu items.

Primary Key:

```text
id (UUID)
```

Relationships:

- One Product → Many OrderItems
- One Product → Many ProductOptions

---

## ProductOption Table

Purpose:

Store selectable product options.

Examples:

- Spice Level
- Sauce

Primary Key:

```text
id (UUID)
```

---

## Order Table

Purpose:

Store customer orders.

Primary Key:

```text
id (UUID)
```

Relationships:

- One Order → Many OrderItems
- One Order → One Payment

---

## OrderItem Table

Purpose:

Store ordered products.

Primary Key:

```text
id (UUID)
```

Relationships:

- Many OrderItems → One Product
- Many OrderItems → One Order

---

## Payment Table

Purpose:

Store payment records.

Primary Key:

```text
id (UUID)
```

Relationships:

- One Payment → One Order

---

## Primary Keys

Every table uses a single primary key:

```text
id (UUID)
```

Foreign keys reference other tables using the pattern `{entity}_id` (e.g., `customer_id`, `order_id`, `product_id`).

---

## Timestamp Columns

Every table must include:

- created_at
- updated_at

Soft-delete tables should also include:

- deleted_at

---

## Audit Columns

Future ERP tables should include:

- created_by
- updated_by
- deleted_by

---

## Status Fields

Recommended status fields:

| Entity | Status |
| ------ | ------ |
| Product | Active / Disabled |
| Order | Order Status |
| Payment | Payment Status |

Status values should be stored as descriptive strings at the application layer (TypeScript union types). Use Prisma `String` type with TypeScript enums.

> **Note:** Database-level enums are reserved for future ERP modules.

---

## Relationships

```text
Customer
    │
    └──────< Order
                │
                └──────< OrderItem
                            │
                            └────── Product
```

---

## Naming Convention

Tables:

```text
snake_case
```

Examples:

- customers
- products
- order_items

Columns:

```text
snake_case
```

Examples:

- first_name
- product_name
- created_at

---

> **Note:** Prisma models use PascalCase (e.g., `Customer`). Database tables use snake_case via `@@map` (e.g., `customers`). The diagrams in this document use Prisma model names (PascalCase) for clarity, but all actual database table names follow snake_case.

---

## Constraints

Every foreign key must:

- Reference an existing record.
- Prevent orphaned data.
- Maintain referential integrity.

---

## Index Strategy

Indexes should exist for:

- Primary Keys
- Foreign Keys
- LINE User ID
- Order Number
- Product Name
- Created Date

Future indexes should be added only after performance analysis.

---

## Soft Delete Policy

Current MVP:

```text
Soft delete is not implemented in MVP.
```

Future modules should support soft delete with a `deleted_at` column.

---

## Transactions

The following operations must use database transactions:

- Order Creation
- Payment Confirmation
- Inventory Deduction
- Order Cancellation
- Refund Processing

---

## Data Integrity

The database must prevent:

- Duplicate Orders
- Duplicate Payments
- Invalid Foreign Keys
- Negative Quantities
- Invalid Status Values

---

## Future Database Expansion

Future tables:

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
- LoyaltyPoint

The schema should support expansion without breaking existing tables.

---

## Backup Strategy

Future production deployments should include:

- Daily Backup
- Point-in-Time Recovery
- Disaster Recovery Plan

---

## Definition of Done

The database design is complete when:

- Core entities are defined.
- Relationships are documented.
- Naming conventions are established.
- Constraints are defined.
- Future expansion is supported.

---

## References

- `80-database-rules.md`
- `150-business-rules.md`
- `151-product-catalog.md`
- `152-product-options.md`
- `154-order-workflow.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `174-api-design.md`
