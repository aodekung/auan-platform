# Auan-Auan-Platform

> Pricing Rules

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Pricing Rules      |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document defines the official pricing rules for Auan-Auan-Platform.

Every displayed price, calculated amount, promotion, and payment total must follow these rules.

---

## Currency

All prices are displayed in:

```text
Thai Baht (THB)
```

---

## Pricing Principles

The pricing system shall be:

- Accurate
- Predictable
- Consistent
- Transparent

Customers must always know the final amount before payment.

---

## Base Product Price

Every product has one base price.

Example

```text
Chicken Skewer
25 THB
```

The base price excludes future optional add-ons.

---

## Option Pricing

Product options may change the final price.

Current options:

| Option Group | Additional Price |
| ------------ | ---------------- |
| Spice Level | 0 THB |
| Sauce | 0 THB |

Future option groups may include additional charges.

---

## Add-on Pricing

Future add-ons may include:

- Extra Cheese
- Fried Egg
- Extra Sauce
- Rice
- Drinks

Each add-on has its own price.

---

## Quantity Calculation

Formula

```text
Subtotal =
Final Product Price × Quantity
```

Example

```text
25 × 4 = 100 THB
```

---

## Cart Total

Formula

```text
Cart Total =
Sum of All Item Subtotals
```

---

## Delivery Fee

Current delivery fee

```text
0 THB
```

Future delivery fees may depend on:

- Distance
- Promotion
- Delivery Zone

---

## Packaging Fee

Current packaging fee

```text
0 THB
```

Future packaging fees may be added without changing the pricing architecture.

---

## Service Charge

Current service charge

```text
0 THB
```

---

## VAT

Current VAT policy

```text
Included in Product Price
```

If tax requirements change, the pricing engine should support tax calculation without modifying existing product prices.

---

## Discounts

Current version does not use discounts.

Future supported discounts include:

- Fixed Amount
- Percentage
- Coupon
- Member Discount
- Promotional Campaign

---

## Promotions

The pricing engine should support:

- Buy X Get Y
- Free Sauce
- Free Delivery
- Percentage Discount
- Fixed Discount
- Seasonal Promotion

Only valid promotions may be applied.

---

## Promotion Priority

If multiple promotions become available in the future, apply them in this order:

```text
Product Promotion
        ↓
Order Promotion
        ↓
Coupon
        ↓
Member Discount
```

Business rules may change this priority in future releases.

---

## Price Calculation

The backend is responsible for all calculations.

Formula

```text
Final Order Total =
Product Total
+ Add-ons
+ Delivery Fee
+ Packaging Fee
+ Service Charge
- Discount
```

The frontend must display values returned by the backend.

---

## Rounding

Current rounding rule

```text
No Rounding
```

Prices are displayed exactly as calculated.

---

## Refund Rules

Refund amount equals the amount successfully received.

Future versions may support:

- Partial Refund
- Full Refund

---

## Payment Validation

Before accepting payment, the system must verify:

- Product exists.
- Product is available.
- Selected options are valid.
- Calculated total matches the backend.
- Payment has not already been completed.

---

## Price History

Price changes must not affect historical orders.

Every completed order stores:

- Product Price
- Option Price
- Quantity
- Order Total

Historical data must remain unchanged.

---

## Administrative Rules

Only the business owner may:

- Change product prices.
- Create promotions.
- Disable promotions.
- Configure pricing rules.

Price changes take effect immediately for new orders.

Existing orders remain unchanged.

---

## Future Pricing Features

The pricing engine should support:

- Dynamic Pricing
- Time-based Pricing
- Happy Hour
- Flash Sale
- Bundle Pricing
- Membership Pricing
- Branch-specific Pricing
- Coupon Engine
- Loyalty Rewards

The architecture should support these features without major redesign.

---

## Definition of Done

Pricing logic is complete when:

- Base prices are configured.
- Option prices are configured.
- Calculations are verified.
- Totals are validated.
- Historical prices are preserved.
- Documentation is updated.

---

## References

- `150-business-rules.md`
- `151-product-catalog.md`
- `152-product-options.md`
- `154-order-workflow.md`
- `155-payment-workflow.md`
