# Auan-Auan-Platform

> Coding Standard

## Document Information

| Item         | Value            |
| ------------ | ---------------- |
| Document     | Coding Standard  |
| Version      | 1.0.0            |
| Status       | Active           |
| Owner        | Project Team     |
| Last Updated | 2026-07-13       |

## Purpose

This document defines the official coding standards for Auan-Auan-Platform.

All source code must follow these standards to ensure consistency, maintainability, readability, and long-term scalability.

## General Principles

- Write code for humans first.
- Prioritize readability over cleverness.
- Prefer explicit behavior over implicit behavior.
- Keep functions small and focused.
- Avoid unnecessary abstractions.
- Minimize technical debt.
- Optimize only after measuring.

## Development Priorities

When making implementation decisions, follow this priority order:

1. Correctness
2. Security
3. Maintainability
4. Simplicity
5. Scalability
6. Performance
7. Developer Experience

## TypeScript Rules

### Required

- Enable `strict` mode.
- Never use `any`.
- Prefer `unknown` over `any`.
- Use explicit return types for exported functions.
- Use interfaces for object contracts.
- Use type aliases for unions and utility types.
- Prefer readonly where applicable.

### Avoid

- `any`
- `@ts-ignore`
- Non-null assertion (`!`) unless absolutely necessary.
- Type assertions without validation.

## Naming Conventions

### Variables

```text
camelCase
```

Example

```ts
const orderTotal = 0;
```

### Functions

```text
camelCase
```

Example

```ts
function calculateTotal() {}
```

### Components

```text
PascalCase
```

Example

```tsx
export function ProductCard() {}
```

### Interfaces

```text
PascalCase
```

Example

```ts
interface Product {}
```

### Types

```text
PascalCase
```

Example

```ts
type ProductStatus = "available" | "soldOut";
```

### Enums

Prefer union types over enums.

Use enums only when interoperability requires them.

### Constants

```text
UPPER_SNAKE_CASE
```

Example

```ts
const MAX_CART_ITEMS = 50;
```

### Files

```text
kebab-case
```

Examples

```text
product-card.tsx
shopping-cart.tsx
order.service.ts
product.repository.ts
```

## Function Design

Functions should:

- Have a single responsibility.
- Be easy to test.
- Be deterministic whenever possible.
- Minimize side effects.

Prefer early returns.

Avoid deeply nested logic.

Maximum recommended function length:

```text
50 lines
```

## Class Design

Prefer functions over classes.

Use classes only when they provide clear architectural benefits.

## React Guidelines

Components should:

- Have a single responsibility.
- Receive data through props.
- Avoid unnecessary state.
- Be reusable.
- Be composable.

Business logic belongs in:

- Hooks
- Services
- Utility functions

Not inside JSX.

## Hooks

Custom hooks must begin with:

```text
use
```

Examples

```text
use-cart.ts
use-auth.ts
use-products.ts
```

Hooks should:

- Encapsulate reusable logic.
- Avoid UI rendering.
- Be independently testable.

## State Management

Prefer local state.

Use Context only when state is shared.

Avoid global state unless justified.

## API Calls

Never perform API calls directly inside UI components.

Use service layers.

Example flow

```text
Component
    ↓
Service
    ↓
API Client
```

## Error Handling

Do not silently ignore errors.

Every caught error must:

- Be handled.
- Be logged when appropriate.
- Return meaningful messages.

Avoid empty catch blocks.

## Async Code

Prefer:

```ts
async/await
```

Avoid chained `.then()` unless required.

Always handle promise failures.

## Validation

Validate:

- User input
- API payloads
- Environment variables
- External responses

Never trust client input.

## Comments

Comments should explain:

- Why
- Trade-offs
- Business reasoning

Avoid comments that explain obvious code.

Bad

```ts
// Increment count
count++;
```

Good

```ts
// Prevent duplicate submission during checkout.
```

## Code Duplication

Follow the DRY principle.

Before creating new logic:

- Search for existing implementations.
- Reuse shared utilities.
- Extract common functionality when appropriate.

## Imports

Import order:

```text
1. Node modules
2. External libraries
3. Internal packages
4. Relative imports
```

Separate groups with one blank line.

## File Size

Recommended maximums:

| File Type | Maximum |
| --------- | ------- |
| Component | 300 lines |
| Service | 300 lines |
| Hook | 200 lines |
| Utility | 200 lines |

Split files before they become difficult to understand.

## Testing

Write tests for:

- Business logic
- Utility functions
- Critical workflows

Testing is recommended before major refactoring.

## Formatting

Formatting is enforced by:

- Prettier
- ESLint

Do not manually format code against project rules.

## Prohibited Practices

Do not:

- Duplicate business logic.
- Use magic numbers.
- Hardcode configuration values.
- Commit commented-out code.
- Leave unused imports.
- Leave dead code.
- Ignore linting errors.
- Disable TypeScript checks.

## Pull Request Checklist

Before submitting code:

- Build passes.
- Lint passes.
- Tests pass.
- No TypeScript errors.
- No duplicated logic.
- Documentation updated if necessary.

## Definition of Done

A feature is considered complete only when:

- Requirements are implemented.
- Code follows project standards.
- Tests pass.
- Lint passes.
- Documentation is updated.
- Code is reviewed.

## References

- `00-master-index.md`
- `20-role.md`
- `30-tech-stack.md`
- `40-folder-structure.md`
- `50-architecture.md`
