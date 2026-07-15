# Auan-Auan-Platform

> Database Rules

## Document Information

| Item         | Value            |
| ------------ | ---------------- |
| Document     | Database Rules   |
| Version      | 1.0.0            |
| Status       | Active           |
| Owner        | Project Team     |
| Last Updated | 2026-07-13       |

## Purpose

This document defines the official database standards for Auan-Auan-Platform.

All database schemas, models, relationships, migrations, and queries must follow these rules to ensure consistency, maintainability, scalability, and data integrity.

## Database Philosophy

The database is the single source of truth.

Business rules belong in the application layer.

Database design should prioritize:

- Data integrity
- Normalization
- Performance
- Maintainability
- Scalability

## Database Engine

Production Database

- PostgreSQL

ORM

- Prisma

Development Database

- PostgreSQL

SQLite may be used only for isolated local experiments and must never become part of the production architecture.

## Naming Convention

### Tables

Use:

```text
snake_case
```

Examples

```text
products
orders
order_items
customers
payment_transactions
```

### Columns

Use:

```text
snake_case
```

Examples

```text
product_name
created_at
updated_at
unit_price
```

### Primary Keys

Every table must use:

```text
id
```

Type

```text
UUID
```

Avoid auto-increment integer IDs unless there is a documented performance requirement.

### Foreign Keys

Format

```text
<entity>_id
```

Examples

```text
order_id
product_id
customer_id
```

## Timestamp Columns

Every table must include:

```text
created_at
updated_at
```

Soft-delete tables must additionally include:

```text
deleted_at
```

Use UTC for all timestamps.

## Data Types

Preferred types

| Purpose | Type |
| ------- | ---- |
| Identifier | UUID |
| Money | DECIMAL |
| Quantity | INTEGER |
| Boolean | BOOLEAN |
| Date & Time | TIMESTAMP |
| Long Text | TEXT |
| Short Text | VARCHAR |

Avoid storing numbers as strings.

## Monetary Values

Never use floating-point types for currency.

Use:

```text
DECIMAL
```

Store values in the smallest supported precision defined by the business requirements.

## Relationships

Prefer normalized relationships.

Examples

```text
Customer
    │
    ▼
Order
    │
    ▼
Order Item
    │
    ▼
Product
```

Avoid duplicated business data.

## Normalization

Target:

Third Normal Form (3NF)

Denormalization is allowed only when justified by measured performance requirements.

## Constraints

Use database constraints whenever possible.

Examples

- PRIMARY KEY
- FOREIGN KEY
- UNIQUE
- CHECK
- NOT NULL

Never rely solely on application validation.

## Indexes

Create indexes for:

- Foreign keys
- Frequently searched columns
- Frequently sorted columns
- Frequently filtered columns

Avoid unnecessary indexes.

Review index usage periodically.

## Transactions

Use transactions for operations involving multiple related writes.

Examples

- Checkout
- Order creation
- Inventory updates
- Payment recording

Transactions must be atomic.

## Soft Delete

Prefer soft delete for business data.

Use:

```text
deleted_at
```

Avoid permanently deleting business records unless legally required.

## Cascade Rules

Avoid automatic cascading deletes.

Prefer explicit deletion logic inside the application layer.

## Status Fields

Prefer enums at the application layer.

Store status values as descriptive strings.

Example

```text
pending
paid
preparing
completed
cancelled
```

Avoid numeric status codes.

## JSON Columns

Use JSON columns only for:

- Flexible metadata
- Third-party payloads
- Temporary integrations

Core business data must remain relational.

## Migrations

All schema changes must use Prisma Migrations.

Never modify production databases manually.

Migration files must remain in version control.

## Seed Data

Seed scripts should contain:

- Development data
- Demo data
- Testing data

Production data must never be committed.

## Query Rules

Prefer Prisma Client.

Avoid raw SQL unless:

- Performance requires it.
- Prisma cannot express the query.

Raw SQL must be documented.

## Performance

Avoid:

- N+1 queries
- Unnecessary joins
- Selecting unused columns

Always retrieve only required fields.

## Data Integrity

Validate:

- Foreign key relationships
- Required fields
- Business constraints

Data integrity is more important than convenience.

## Auditability

Critical business actions should remain traceable.

Examples:

- Order creation
- Payment confirmation
- Product updates
- Price changes

Audit history should never overwrite historical records.

## Backup Strategy

Production databases must support:

- Scheduled backups
- Point-in-time recovery
- Restore verification

Backups should be tested periodically.

## Security

Never store:

- Plain-text passwords
- API secrets
- Access tokens

Sensitive information must be encrypted when stored.

## Multi-Tenant Support

Phase 1 supports a single business.

Future schema design should avoid assumptions that prevent multi-tenant expansion.

## Definition of Done

A database change is complete only when:

- Prisma schema updated.
- Migration created.
- Migration tested.
- Indexes reviewed.
- Relationships validated.
- Documentation updated.

## References

- `00-master-index.md`
- `30-tech-stack.md`
- `50-architecture.md`
- `60-coding-standard.md`
- `90-api-rules.md`
