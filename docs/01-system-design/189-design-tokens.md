# Auan-Auan-Platform

> Design Tokens

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Design Tokens |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the official design tokens for Auan-Auan-Platform.

Design tokens ensure visual consistency across the entire application.

---

## Design Principles

The design system must be:

- Consistent
- Accessible
- Responsive
- Scalable
- Easy to Maintain

---

## Color Palette

### Primary

```text
Primary-50
Primary-100
Primary-200
Primary-300
Primary-400
Primary-500
Primary-600
Primary-700
Primary-800
Primary-900
```

Primary color should represent the Auan-Auan brand.

---

### Secondary

```text
Secondary-50
Secondary-100
Secondary-200
Secondary-300
Secondary-400
Secondary-500
Secondary-600
Secondary-700
Secondary-800
Secondary-900
```

---

### Neutral

```text
Gray-50
Gray-100
Gray-200
Gray-300
Gray-400
Gray-500
Gray-600
Gray-700
Gray-800
Gray-900
```

---

### Semantic Colors

#### Success

```text
Green
```

Used for:

- Success Messages
- Completed Orders
- Paid Status

---

#### Warning

```text
Yellow
```

Used for:

- Pending Payment
- Warnings

---

#### Error

```text
Red
```

Used for:

- Validation Errors
- Failed Payment
- System Errors

---

#### Information

```text
Blue
```

Used for:

- Notifications
- Information Messages

---

## Typography

### Font Family

```text
Inter
```

Fallback

```text
sans-serif
```

---

### Font Weights

| Name | Weight |
| ---- | -----: |
| Light | 300 |
| Regular | 400 |
| Medium | 500 |
| SemiBold | 600 |
| Bold | 700 |

---

### Font Sizes

| Token | Size |
| ----- | ---- |
| xs | 12px |
| sm | 14px |
| base | 16px |
| lg | 18px |
| xl | 20px |
| 2xl | 24px |
| 3xl | 30px |
| 4xl | 36px |

---

### Line Heights

| Token | Value |
| ----- | ----- |
| Tight | 1.2 |
| Normal | 1.5 |
| Relaxed | 1.75 |

---

## Spacing Scale

| Token | Value |
| ----- | ----- |
| 1 | 4px |
| 2 | 8px |
| 3 | 12px |
| 4 | 16px |
| 5 | 20px |
| 6 | 24px |
| 8 | 32px |
| 10 | 40px |
| 12 | 48px |
| 16 | 64px |

Always use spacing tokens instead of hardcoded values.

---

## Border Radius

| Token | Value |
| ----- | ----- |
| sm | 4px |
| md | 8px |
| lg | 12px |
| xl | 16px |
| 2xl | 24px |
| full | 9999px |

---

## Border Width

| Token | Value |
| ----- | ----- |
| Thin | 1px |
| Medium | 2px |
| Thick | 4px |

---

## Shadow

| Token | Usage |
| ----- | ----- |
| sm | Small Cards |
| md | Dialogs |
| lg | Floating Elements |
| xl | Modals |

---

## Opacity

| Token | Value |
| ----- | ----- |
| Disabled | 50% |
| Hover | 90% |
| Active | 100% |

---

## Z-Index

| Token | Value |
| ----- | -----: |
| Base | 0 |
| Dropdown | 100 |
| Sticky | 200 |
| Overlay | 300 |
| Drawer | 400 |
| Modal | 500 |
| Toast | 600 |
| Tooltip | 700 |

---

## Breakpoints

| Device | Width |
| ------ | ----- |
| Mobile | 0px |
| Small | 640px |
| Medium | 768px |
| Large | 1024px |
| Extra Large | 1280px |
| 2XL | 1536px |

---

## Icon Sizes

| Token | Size |
| ----- | ---- |
| xs | 12px |
| sm | 16px |
| md | 20px |
| lg | 24px |
| xl | 32px |

---

## Button Sizes

| Token | Height |
| ----- | ------ |
| Small | 36px |
| Medium | 44px |
| Large | 52px |

---

## Input Sizes

| Token | Height |
| ----- | ------ |
| Small | 36px |
| Medium | 44px |
| Large | 52px |

---

## Animation Duration

| Token | Duration |
| ----- | -------- |
| Fast | 150ms |
| Normal | 250ms |
| Slow | 400ms |

---

## Animation Easing

```text
ease-in

ease-out

ease-in-out
```

---

## Grid System

Customer

```text
1 Column
```

Tablet

```text
2 Columns
```

Desktop

```text
4 Columns
```

---

## Container Width

| Device | Width |
| ------ | ----- |
| Mobile | 100% |
| Tablet | 768px |
| Desktop | 1280px |

---

## Status Colors

| Status | Color |
| ------ | ----- |
| Pending | Yellow |
| Preparing | Blue |
| Ready | Green |
| Completed | Green |
| Cancelled | Gray |
| Rejected | Red |

---

## Accessibility

Every token must support:

- WCAG AA Contrast
- Responsive Design
- Dark Mode Compatibility (Future)
- High Visibility

---

## Naming Convention

Use kebab-case.

Examples

```text
primary-500

gray-100

font-base

space-4

radius-md
```

---

## Future Enhancements

Future versions may include:

- Dark Theme Tokens
- Brand Themes
- Holiday Themes
- Animation Presets
- Motion Tokens

---

## Definition of Done

The design token specification is complete when:

- Colors are standardized.
- Typography is documented.
- Spacing is documented.
- Responsive breakpoints are defined.
- Accessibility requirements are documented.

---

## References

- `70-ui-ux-rules.md`
- `171-technology-stack.md`
- `181-screen-spec.md`
- `188-component-library.md`
