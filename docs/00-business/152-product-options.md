# Auan-Auan-Platform

> Product Options

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Product Options    |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official product option system for Auan-Auan-Platform.

Every configurable product must follow these rules.

---

## Design Principles

The product option system shall be:

- Flexible
- Reusable
- Scalable
- Easy to maintain

The same option can be reused across multiple products.

---

## Option Groups

Current option groups:

| Option Group ID | Name | Required | Multiple Selection |
| --------------- | ---- | -------- | ------------------ |
| OG001 | Spice Level | Yes | No |
| OG002 | Sauce | Yes | No |

Future option groups may be added without modifying the existing database structure.

---

## Option Group Structure

Every option group must include:

- Option Group ID
- Name
- Display Order
- Required
- Multiple Selection
- Active Status

---

## Option Structure

Every option must include:

- Option ID
- Option Name
- Additional Price
- Display Order
- Active Status

---

## Spice Level

### Rules

Customers must select exactly one spice level.

The default selection is:

```text
None
```

### Available Options

| Display Order | Option | Additional Price |
| ------------- | ------ | ---------------- |
| 1 | None | 0 THB |
| 2 | Mild | 0 THB |
| 3 | Medium | 0 THB |
| 4 | Hot | 0 THB |
| 5 | Extra Hot | 0 THB |

---

## Sauce Selection

Rules

Customers must select exactly one sauce.

The default selection is:

```text
Mala Powder
```

Available Options

| Display Order | Option | Additional Price |
| ------------- | ------ | ---------------- |
| 1 | Mala Powder | 0 THB |
| 2 | Sesame Sauce | 0 THB |
| 3 | Sesame Mala Sauce | 0 THB |
| 4 | Sesame Peanut Sauce | 0 THB |
| 5 | Mala Dipping Sauce | 0 THB |

---

## Required Options

Current required option groups:

- Spice Level
- Sauce

Customers cannot proceed to checkout until all required options have been selected.

---

## Optional Options

There are currently no optional option groups.

Future optional groups may include:

- Extra Cheese
- Fried Egg
- Extra Sauce
- Rice
- Drinks

---

## Option Availability

An option may be:

| Status | Customer Visible | Selectable |
| ------ | ---------------- | ---------- |
| Active | Yes | Yes |
| Disabled | No | No |

Disabled options must not appear in the customer interface.

---

## Option Pricing

Additional prices are added to the base product price.

Formula:

```text
Final Price =
Base Price
+ Option Price
+ Add-on Price
- Promotion
```

---

## Display Rules

Option groups should appear in this order:

1. Spice Level
2. Sauce

Display order must remain consistent across all products.

---

## Validation Rules

Before adding a product to the cart:

The system must verify:

- Required options selected.
- Selected options are active.
- Selected options belong to the correct option group.

Invalid option selections must be rejected.

---

## Cart Rules

The shopping cart stores:

- Product ID
- Product Name
- Base Price
- Selected Spice Level
- Selected Sauce
- Quantity
- Subtotal

Changing an option creates a new cart configuration.

---

## Order Rules

Selected options become part of the order.

Options must never change after payment.

Historical orders must preserve the original selections.

---

## Future Expansion

The option system should support:

- Multiple Choice
- Checkbox Options
- Quantity-based Add-ons
- Required Minimum Selection
- Maximum Selection
- Combo Options
- Time-limited Options
- Seasonal Options

No architectural redesign should be required.

---

## Definition of Done

A product option is considered complete when:

- Option group exists.
- Options are configured.
- Validation rules are implemented.
- Display order is configured.
- Pricing is verified.
- Documentation is updated.

---

## References

- `150-business-rules.md`
- `151-product-catalog.md`
- `153-pricing-rules.md`
- `154-order-workflow.md`
- `157-kitchen-workflow.md`
