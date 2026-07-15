# Auan-Auan-Platform

> API Design

## Document Information

| Item | Value |
| ---- | ----- |
| Document | API Design |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the API architecture and REST conventions used throughout Auan-Auan-Platform.

All backend APIs must follow these standards.

---

## Design Principles

The API must be:

- RESTful
- Stateless
- Predictable
- Versioned
- Secure
- Type Safe
- Well Documented

---

## Base URL

Development

```text
http://localhost:3000/api/v1
```

Production

```text
https://api.example.com/api/v1
```

---

## API Structure

```text
/api/v1
    ├── auth
    ├── customers
    ├── categories
    ├── products
    ├── cart
    ├── orders
    ├── payments
    ├── notifications
    └── admin
```

---

## HTTP Methods

| Method | Purpose |
| ------ | ------- |
| GET | Retrieve data |
| POST | Create resources |
| PUT | Replace resources |
| PATCH | Partial update |
| DELETE | Remove resources |

---

## Standard Response

Successful response:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR"
  }
}
```

---

## Authentication

Current authentication:

```text
LINE Login
        ↓
JWT
        ↓
Protected API
```

Authorization header:

```text
Authorization: Bearer <token>
```

---

## API Modules

Current modules:

- Authentication
- Customers
- Categories
- Products
- Cart
- Orders
- Payments
- Notifications

Future modules:

- Inventory
- Suppliers
- Employees
- Reports
- ERP

---

## Authentication API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| GET | /auth/profile | Current User |

---

## Customer API

| Method | Endpoint |
| ------ | -------- |
| GET | /customers/me |
| PATCH | /customers/me |

---

## Category API

| Method | Endpoint |
| ------ | -------- |
| GET | /categories |
| GET | /categories/:id |

---

## Product API

| Method | Endpoint |
| ------ | -------- |
| GET | /products |
| GET | /products/:id |
| GET | /products/category/:categoryId |

---

## Cart API

| Method | Endpoint |
| ------ | -------- |
| GET | /cart |
| POST | /cart/items |
| PATCH | /cart/items/:id |
| DELETE | /cart/items/:id |

---

## Order API

| Method | Endpoint |
| ------ | -------- |
| POST | /orders |
| GET | /orders |
| GET | /orders/:id |
| PATCH | /orders/:id/status |

---

## Payment API

| Method | Endpoint |
| ------ | -------- |
| POST | /payments/confirm |
| GET | /payments/:orderId |

---

## Notification API

| Method | Endpoint |
| ------ | -------- |
| GET | /notifications |
| PATCH | /notifications/:id/read |

---

## Admin API

Protected endpoints:

```text
/api/v1/admin/*
```

Examples:

- Products
- Categories
- Orders
- Inventory
- Dashboard

---

## Pagination

Standard query parameters:

```text
?page=1
&pageSize=20
```

Example response:

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 120,
  "items": []
}
```

---

## Filtering

Supported query parameters:

```text
?category=...
?status=...
?search=...
```

---

## Sorting

Standard format:

```text
?sort=createdAt
&order=desc
```

---

## Validation

Every request must be validated using:

```text
Zod
```

Invalid requests must return:

```text
400 Bad Request
```

---

## Status Codes

| Code | Meaning |
| ---- | ------- |
| 200 | Success |
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

---

## Versioning

API version format:

```text
/api/v1
```

Future versions:

```text
/api/v2
/api/v3
```

Older versions should remain supported during migration.

---

## Rate Limiting

Future limits:

- Anonymous Requests
- Authenticated Requests
- Admin Requests

Rate limiting should be configurable.

---

## Security

Every protected endpoint must:

- Validate JWT
- Validate permissions
- Validate request body
- Sanitize inputs
- Log important actions

---

## Logging

Every API request should record:

- Request ID
- User ID
- Endpoint
- Method
- Status Code
- Response Time

Sensitive data must never be logged.

---

## Future API Features

Future improvements:

- OpenAPI Specification
- Swagger UI
- WebSocket
- Server-Sent Events
- GraphQL Gateway
- API Gateway
- API Analytics

---

## Definition of Done

The API design is complete when:

- REST conventions are documented.
- Endpoints are defined.
- Response format is standardized.
- Security requirements are documented.
- Validation rules are defined.
- Future expansion is supported.

---

## References

- `90-api-rules.md`
- `100-security-rules.md`
- `150-business-rules.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `173-database-design.md`
- `177-testing-strategy.md`
