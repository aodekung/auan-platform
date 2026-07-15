# Auan-Auan-Platform

> API Rules

## Document Information

| Item         | Value          |
| ------------ | -------------- |
| Document     | API Rules       |
| Version      | 1.0.0          |
| Status       | Active         |
| Owner        | Project Team   |
| Last Updated | 2026-07-13     |

## Purpose

This document defines the official API standards for Auan-Auan-Platform.

All APIs must follow these rules to ensure consistency, maintainability, scalability, security, and predictable behavior.

## API Principles

Every API should be:

- Consistent
- Predictable
- Stateless
- Versionable
- Secure
- Easy to consume
- Easy to test

## API Style

The project uses:

- REST API
- JSON
- HTTPS

GraphQL is not used unless approved through an architectural review.

## API Versioning

All APIs must include a version.

Example

```text
/api/v1
```

Future versions

```text
/api/v2
/api/v3
```

Do not introduce breaking changes within the same API version.

## Resource Naming

Use plural nouns.

Good

```text
/products
/orders
/customers
```

Bad

```text
/getProducts
/createOrder
```

Use HTTP methods to describe actions.

## HTTP Methods

| Method | Purpose |
| ------- | ------- |
| GET | Retrieve data |
| POST | Create data |
| PUT | Replace data |
| PATCH | Partially update data |
| DELETE | Remove data |

## URL Rules

Use:

```text
/products/{id}
/orders/{id}
/customers/{id}
```

Avoid verbs in URLs.

Avoid deeply nested resources.

Recommended maximum depth:

```text
2 levels
```

## Request Format

All requests must use JSON unless uploading files.

Example

```json
{
  "productId": "uuid",
  "quantity": 2
}
```

## Response Format

Successful responses should follow this structure.

```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

Error responses should follow this structure.

```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found."
  }
}
```

Do not expose internal implementation details.

## HTTP Status Codes

Use standard HTTP status codes.

| Status | Meaning |
| ------- | ------- |
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

Avoid returning HTTP 200 for failed requests.

## Validation

Validate:

- Request body
- Path parameters
- Query parameters
- Headers

Validation must occur before business logic executes.

## Pagination

Collections must support pagination.

Recommended query parameters

```text
?page=1
?pageSize=20
```

Response example

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

## Filtering

Use query parameters.

Example

```text
/products?category=food
/products?status=available
```

## Sorting

Example

```text
/products?sort=name
/products?sort=-createdAt
```

A leading minus sign indicates descending order.

## Authentication

Authentication uses:

- LINE LIFF Login

Protected endpoints must require a valid access token.

Public endpoints must be explicitly documented.

## Authorization

Authorization is role-based.

Future roles include:

- Customer
- Staff
- Manager
- Administrator

Authorization logic belongs in the backend.

Never trust client-side authorization.

## Idempotency

PUT and DELETE operations must be idempotent.

Payment-related endpoints should support idempotency keys when appropriate.

## Error Handling

Errors must:

- Be consistent
- Be descriptive
- Be machine-readable

Example

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_OUT_OF_STOCK",
    "message": "The requested product is unavailable."
  }
}
```

## Logging

Log:

- Request ID
- Endpoint
- Method
- Response time
- Status code

Never log:

- Passwords
- Tokens
- Secrets
- Payment credentials

## Rate Limiting

Rate limiting should be enabled for public endpoints.

Recommended strategies:

- Per IP
- Per User
- Per Access Token

## API Documentation

Every endpoint must document:

- Purpose
- Method
- URL
- Parameters
- Request Example
- Response Example
- Error Responses
- Authentication Requirements

## API Naming

Use camelCase for JSON properties.

Example

```json
{
  "productId": "uuid",
  "productName": "Chicken Skewer",
  "unitPrice": 25
}
```

## Business Rules

Business rules belong in:

- Services

Business rules must never exist in:

- Controllers
- Routes
- React Components

## Performance

Avoid:

- Over-fetching
- Under-fetching
- Duplicate queries

Only return fields required by the client.

## Security

Every API must:

- Validate input
- Sanitize data
- Prevent injection attacks
- Use HTTPS
- Verify authentication
- Verify authorization

## Backward Compatibility

Avoid breaking changes.

If breaking changes are required:

- Create a new API version.
- Deprecate the previous version.
- Document migration guidance.

## Definition of Done

An API endpoint is complete only when:

- Validation implemented.
- Authentication verified.
- Authorization verified.
- Error handling implemented.
- Logging implemented.
- Tests completed.
- Documentation updated.

## References

- `00-master-index.md`
- `30-tech-stack.md`
- `50-architecture.md`
- `60-coding-standard.md`
- `80-database-rules.md`
