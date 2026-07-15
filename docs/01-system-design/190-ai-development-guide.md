# Auan-Auan-Platform

> Coding Examples

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Coding Examples |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document provides official coding examples and best practices for Auan-Auan-Platform.

These examples define the preferred implementation style for the project.

---

## Design Principles

All code should be:

- Simple
- Readable
- Type Safe
- Maintainable
- Testable
- Consistent

---

## Folder Example

```text
src
│
├── app
├── components
├── hooks
├── services
├── stores
├── routes
├── pages
├── layouts
├── utils
├── types
└── lib
```

---

## React Component

```tsx
type ProductCardProps = {
  name: string;
  price: number;
};

export function ProductCard({
  name,
  price,
}: ProductCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{price}</p>
    </div>
  );
}
```

---

## Page Component

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Home</h1>
    </main>
  );
}
```

---

## Custom Hook

```tsx
export function useCart() {
  return {};
}
```

---

## Zustand Store

```tsx
type CartState = {
  total: number;
};

export const useCartStore = create<CartState>(() => ({
  total: 0,
}));
```

---

## TanStack Query

```tsx
const { data } = useQuery({
  queryKey: ["products"],
  queryFn: getProducts,
});
```

---

## API Service

```ts
export async function getProducts() {
  return api.get("/products");
}
```

---

## Fastify Route

```ts
app.get("/products", async () => {
  return [];
});
```

---

## Controller

```ts
export async function getProducts() {
  return [];
}
```

---

## Prisma Query

```ts
const products = await prisma.product.findMany();
```

---

## Validation

```ts
const schema = z.object({
  name: z.string(),
  price: z.number(),
});
```

---

## Type Definition

```ts
export interface Product {
  id: string;
  name: string;
}
```

---

## Enum

```ts
export enum OrderStatus {
  Pending = "Pending",
  Preparing = "Preparing",
  Ready = "Ready",
  Completed = "Completed",
}
```

---

## Error Handling

```ts
try {
  // business logic
} catch (error) {
  throw error;
}
```

---

## Async Function

```ts
export async function createOrder() {}
```

---

## Environment Variable

```ts
const apiUrl = process.env.API_URL;
```

---

## Naming Convention

Variables

```text
camelCase
```

Functions

```text
camelCase
```

Components

```text
PascalCase
```

Files

```text
kebab-case
```

Types

```text
PascalCase
```

Enums

```text
PascalCase
```

Constants

```text
UPPER_SNAKE_CASE
```

---

## Import Order

```text
1. External Libraries

2. Internal Modules

3. Relative Imports

4. Styles
```

---

## Function Rules

Functions should:

- Perform one responsibility.
- Return early.
- Avoid deep nesting.
- Be easy to test.

---

## Component Rules

Components should:

- Be reusable.
- Be small.
- Receive typed props.
- Avoid business logic.

---

## API Rules

Controllers should:

- Validate input.
- Call services.
- Return responses.

Controllers should not:

- Contain business logic.
- Access the database directly.

---

## Service Rules

Services should:

- Contain business logic.
- Call repositories.
- Throw domain errors.

---

## Database Rules

Repositories should:

- Access Prisma.
- Return typed objects.
- Avoid business logic.

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed"
}
```

---

## Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## Logging

Always log:

- Server startup
- Errors
- Unexpected exceptions

Never log:

- Passwords
- JWT Secrets
- Tokens
- Payment credentials

---

## Comments

Write comments only when explaining:

- Business rules
- Complex algorithms
- Non-obvious behavior

Avoid redundant comments.

---

## Code Review Checklist

Before merging:

- TypeScript passes.
- ESLint passes.
- Formatting passes.
- Tests pass.
- Documentation updated.
- No duplicated code.

---

## Future Improvements

Future versions may include:

- Architecture Decision Records
- Example Repository
- Style Guide
- Code Templates
- CLI Scaffolding

---

## Definition of Done

The coding examples are complete when:

- Common patterns are documented.
- Naming conventions are demonstrated.
- Best practices are illustrated.
- Team members can follow consistent implementation patterns.

---

## References

- `30-coding-standard.md`
- `90-api-rules.md`
- `171-technology-stack.md`
- `173-database-design.md`
- `174-api-design.md`
- `183-state-management.md`
