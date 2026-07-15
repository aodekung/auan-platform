# Auan-Auan-Platform

> UI / UX Rules

## Document Information

| Item         | Value          |
| ------------ | -------------- |
| Document     | UI / UX Rules  |
| Version      | 1.0.0          |
| Status       | Active         |
| Owner        | Project Team   |
| Last Updated | 2026-07-13     |

## Purpose

This document defines the official UI and UX standards for Auan-Auan-Platform.

Every screen, component, interaction, and user flow must follow these rules to provide a consistent, intuitive, and maintainable user experience.

## Design Principles

The user interface must always be:

- Simple
- Consistent
- Responsive
- Accessible
- Predictable
- Fast
- Mobile-first

Avoid unnecessary animations, decorative elements, and interactions that do not improve usability.

## Design Priorities

When design decisions conflict, follow this priority:

1. Usability
2. Accessibility
3. Readability
4. Consistency
5. Performance
6. Visual Appeal

## Mobile-First

All interfaces must be designed for mobile devices first.

Primary target:

- LINE LIFF
- Smartphone users

Desktop layouts should enhance the experience without changing user workflows.

## Responsive Design

Support at minimum:

| Device  | Width        |
| ------- | ------------ |
| Mobile  | 320px+       |
| Tablet  | 768px+       |
| Desktop | 1024px+      |

Layouts must adapt smoothly across screen sizes.

## Layout Rules

Every page should follow a consistent layout:

```text
Header

Content

Bottom Navigation (if applicable)
```

Avoid unnecessary scrolling.

Important actions should remain easily reachable with one hand.

## Navigation

Navigation must be:

- Simple
- Predictable
- Consistent

Users should never need more than three taps to reach a primary feature.

Avoid deep navigation hierarchies.

## Color Usage

Colors must communicate meaning.

| Purpose | Meaning |
| -------- | ------- |
| Primary | Main actions |
| Success | Completed actions |
| Warning | Caution |
| Error | Failures |
| Neutral | Secondary information |

Do not rely solely on color to communicate important information.

## Typography

Typography should prioritize readability.

Rules:

- Use a consistent font family.
- Limit font sizes.
- Maintain sufficient line spacing.
- Avoid decorative fonts.

Text alignment:

- Left-aligned by default.
- Center only when appropriate.

## Spacing

Use a consistent spacing system.

Recommended spacing scale:

```text
4
8
12
16
24
32
48
64
```

Avoid arbitrary spacing values.

## Icons

Icons must:

- Support text
- Be universally recognizable
- Remain consistent throughout the application

Icons must never replace important labels.

## Buttons

Buttons must clearly communicate their purpose.

Every button should have:

- Visible label
- Hover state
- Active state
- Disabled state
- Loading state (when applicable)

Avoid vague labels such as:

- OK
- Submit
- Click Here

Prefer:

- Add to Cart
- Confirm Order
- Save Changes

## Forms

Forms should:

- Minimize required input.
- Validate immediately when appropriate.
- Display clear validation messages.
- Preserve user input after validation errors.

Required fields should be clearly indicated.

## Input Validation

Validation must occur:

- Before submission
- During input when appropriate

Validation messages should explain:

- What is wrong
- How to fix it

Avoid technical error messages.

## Feedback

Every important user action should produce feedback.

Examples:

- Loading indicator
- Success message
- Error message
- Confirmation dialog

Users should never wonder whether an action succeeded.

## Loading States

Long-running operations must display loading feedback.

Examples:

- Skeleton loaders
- Progress indicators
- Loading spinners

Avoid blank screens.

## Empty States

Every empty screen should explain:

- Why it is empty
- What the user can do next

Examples:

- Empty cart
- No orders
- No search results

## Error States

Error messages must:

- Explain the problem
- Suggest a solution
- Avoid technical terminology

Bad:

```text
500 Internal Server Error
```

Good:

```text
Unable to load your orders.

Please try again.
```

## Confirmation

Require confirmation before:

- Deleting data
- Cancelling orders
- Resetting settings

Avoid unnecessary confirmation dialogs.

## Accessibility

The interface should:

- Support keyboard navigation where applicable.
- Maintain sufficient color contrast.
- Include descriptive labels.
- Support screen readers.

Never use color alone to indicate status.

## Images

Images should:

- Load efficiently.
- Maintain aspect ratio.
- Include alternative text where appropriate.
- Never distort.

## Performance

Optimize for perceived performance.

Guidelines:

- Lazy load images.
- Lazy load routes.
- Minimize layout shifts.
- Avoid blocking rendering.

## Product Cards

Each product card should consistently display:

- Product image
- Product name
- Short description
- Price
- Available options
- Add to Cart button

Avoid overcrowding.

## Shopping Cart

The shopping cart must always display:

- Product list
- Quantity
- Item subtotal
- Total price
- Additional options
- Special instructions
- Checkout button

Users must always understand the current order.

## Checkout

Checkout should display:

- Customer information
- Delivery location
- Payment method
- Order summary
- Final total

The checkout flow should be completed on a single page whenever possible.

## Payment

Payment instructions must clearly display:

- PromptPay QR Code
- PromptPay Number
- Payment amount
- Payment confirmation instructions

Users should never need to search for payment information.

## Notifications

Notifications should:

- Be short
- Be actionable
- Disappear automatically when appropriate

Avoid interrupting users unnecessarily.

## Animation

Animations should:

- Support usability
- Be subtle
- Be fast

Avoid animations that delay user interaction.

## Consistency

All screens must maintain consistency in:

- Colors
- Typography
- Spacing
- Icons
- Buttons
- Form behavior
- Navigation

Consistency is more important than creativity.

## Definition of Success

The UI is considered successful when users can:

- Find products quickly.
- Customize orders easily.
- Complete checkout without confusion.
- Understand every screen without instructions.
- Recover from errors without assistance.

## References

- `00-master-index.md`
- `10-project-context.md`
- `30-tech-stack.md`
- `50-architecture.md`
- `60-coding-standard.md`
