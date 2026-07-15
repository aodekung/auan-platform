# Auan-Auan-Platform

> Product Catalog

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Product Catalog    |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official product catalog structure for Auan-Auan-Platform.

Every product displayed in the customer application must follow these standards.

---

## Product Categories

Current categories:

| Category ID | Category Name |
| ------------ | ------------- |
| MC001 | Mala Skewers |
| SC001 | Sauce |

Future categories may be added without changing the database structure.

---

## Product Status

A product can be in one of the following states.

| Status | Customer Visible | Purchasable |
| ------ | ---------------- | ----------- |
| Available | Yes | Yes |
| Out of Stock | Yes | No |
| Hidden | No | No |
| Disabled | No | No |

---

## Product Information

Every product must contain:

- Product ID
- SKU
- Thai Name
- English Name
- Category
- Description
- Base Price
- Product Image
- Display Order
- Availability Status

---

## Product Identifier

Each product shall have a unique identifier.

Example

```text
PRD-000001
PRD-000002
PRD-000003
```

Product IDs must never be reused.

---

## SKU Format

Recommended format:

```text
MS-001
MS-002
MS-003
```

Where

- MS = Mala Skewer

Future categories may define their own SKU prefixes.

---

## Product Display Order

Products shall be sorted by:

1. Display Order
2. Product Name

The owner may change display order at any time.

---

## Product Images

Each product should include:

- One primary image
- Square aspect ratio
- High resolution
- Consistent background
- Consistent lighting

Recommended size:

```text
1024 × 1024 px
```

Preferred format:

```text
WebP
```

---

## Product Description

Descriptions should include:

- Main ingredient
- Flavor
- Special characteristics

Descriptions should remain concise.

---

## Product Availability

Available products appear in:

- Product List
- Search Results
- Category Pages

Unavailable products:

- Cannot be added to cart.
- Display an "Out of Stock" badge.

Hidden products are completely invisible to customers.

---

## Product Options

Products may support:

- Spice Level
- Sauce Selection
- Future Add-ons

Option behavior is defined in:

```text
152-product-options.md
```

---

## Product Pricing

Every product has:

- Base Price

Additional pricing is calculated using:

- Product Options
- Future Add-ons
- Promotions

Price calculation rules are defined in:

```text
153-pricing-rules.md
```

---

## Search

Customers should be able to search by:

- Product Name
- Category

Search should be case-insensitive.

---

## Sorting

Supported sorting methods:

- Display Order
- Product Name
- Price

Default sorting:

```text
Display Order
```

---

## Product Lifecycle

```text
Draft
    ↓
Available
    ↓
Out of Stock
    ↓
Available
    ↓
Hidden
    ↓
Disabled
```

---

## Product Management

The business owner can:

- Create Products
- Edit Products
- Hide Products
- Disable Products
- Change Prices
- Upload Images
- Update Descriptions
- Change Display Order

---

## Future Product Features

Future versions may support:

- Combo Sets
- Limited-Time Products
- Seasonal Products
- Recommended Products
- Popular Products
- Product Tags
- Product Labels
- Product Ratings
- Customer Favorites

---

## Business Rules

Every product must:

- Belong to exactly one category.
- Have exactly one base price.
- Have one active status.
- Have one primary image.
- Be uniquely identifiable.

Products without prices must never be published.

---

## Definition of Done

A product is considered ready when:

- Product information is complete.
- Price is assigned.
- Image is uploaded.
- Category is assigned.
- Display order is configured.
- Product status is set.

---

## References

- `150-business-rules.md`
- `152-product-options.md`
- `153-pricing-rules.md`
- `154-order-workflow.md`
- `157-kitchen-workflow.md`
