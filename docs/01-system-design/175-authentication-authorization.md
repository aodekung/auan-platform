# Auan-Auan-Platform

> Authentication & Authorization

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Authentication & Authorization |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the authentication and authorization architecture for Auan-Auan-Platform.

The system must securely identify users and restrict access based on permissions.

---

## Design Principles

Authentication and authorization must be:

- Secure
- Stateless
- Scalable
- Auditable
- Least Privilege
- Easy to Extend

---

## Authentication Flow

```text
Customer
        ↓
LINE Login
        ↓
Receive LINE ID Token
        ↓
Backend Verification
        ↓
Create Customer (If New)
        ↓
Generate JWT
        ↓
Authenticated Session
```

---

## Current Authentication

Supported authentication:

- LINE Login
- JWT Access Token

Future support:

- Refresh Token
- Two-Factor Authentication
- Social Login
- Email Login

---

## User Types

Current user types:

| Role | Description |
| ---- | ----------- |
| Customer | Places orders |
| Owner | Full system access |

Future user types:

- Manager
- Kitchen Staff
- Delivery Staff
- Cashier
- Administrator

---

## Authentication Components

```text
LINE Login
        ↓
JWT
        ↓
Authentication Middleware
        ↓
Protected Routes
```

---

## JWT Payload

Example payload:

```json
{
  "userId": "uuid",
  "role": "OWNER",
  "lineUserId": "Uxxxxxxxx",
  "exp": 1780000000
}
```

Sensitive information must never be stored inside the JWT.

---

## Protected Routes

Protected endpoints require:

- Valid JWT
- Active User
- Required Role

Example:

```text
/api/v1/orders
/api/v1/payments
/api/v1/admin/*
```

---

## Public Routes

Public endpoints:

```text
GET /products
GET /categories
POST /auth/login
```

No authentication is required.

---

## Authorization Model

Role-Based Access Control (RBAC)

```text
User
        ↓
Role
        ↓
Permissions
        ↓
Protected Resource
```

---

## Roles

### Customer

Permissions:

- Browse Products
- Manage Cart
- Create Orders
- View Own Orders
- Confirm Payment

---

### Owner

Permissions:

- Full System Access
- Product Management
- Order Management
- Payment Verification
- Inventory Management
- Dashboard Access
- System Configuration

---

## Permission Matrix

| Resource | Customer | Owner |
| -------- | :------: | :---: |
| Products | Read | Read / Write |
| Categories | Read | Read / Write |
| Cart | Full | Full |
| Orders | Own Only | Full |
| Payments | Own Only | Full |
| Dashboard | No | Yes |
| Inventory | No | Yes |
| Settings | No | Yes |

---

## Authentication Middleware

Every protected request must verify:

- JWT Signature
- Token Expiration
- User Exists
- User Status
- Required Permission

Unauthorized requests must return:

```text
401 Unauthorized
```

---

## Authorization Middleware

Every protected endpoint must verify:

- User Role
- Required Permission
- Resource Ownership (If Applicable)

Forbidden requests must return:

```text
403 Forbidden
```

---

## Session Management

Current session model:

```text
Stateless JWT
```

Future improvements:

- Refresh Tokens
- Token Revocation
- Multi-Device Sessions

---

## Token Expiration

Current recommendation:

| Token | Duration |
| ----- | -------- |
| Access Token | 24 Hours |

Future support:

- Refresh Token (30 Days)

---

## Password Policy

Current MVP:

```text
No Passwords
```

Authentication relies entirely on LINE Login.

Future versions supporting passwords must require:

- Minimum 12 Characters
- Uppercase Letter
- Lowercase Letter
- Number
- Special Character

---

## Account Lifecycle

```text
First Login
        ↓
Create Customer
        ↓
Active
        ↓
Suspended (Future)
        ↓
Deleted (Future)
```

---

## Security Rules

The system must:

- Verify every JWT.
- Reject expired tokens.
- Reject modified tokens.
- Prevent privilege escalation.
- Never trust frontend role information.

Authorization must always be enforced by the backend.

---

## Audit Logging

Authentication events:

- Login
- Logout
- Token Expired
- Unauthorized Access
- Forbidden Access

Each event should record:

- Timestamp
- User ID
- IP Address (Future)
- Device Information (Future)

---

## Future Authentication Features

Future improvements:

- Refresh Tokens
- OAuth Providers
- Multi-Factor Authentication
- Device Management
- Single Sign-On (SSO)
- Session Dashboard
- Login History
- Security Alerts

---

## Definition of Done

Authentication and authorization are complete when:

- Authentication flow is documented.
- User roles are defined.
- Permissions are documented.
- Middleware requirements are defined.
- Security rules are enforced.
- Future expansion is supported.

---

## References

- `90-api-rules.md`
- `100-security-rules.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `172-system-modules.md`
- `174-api-design.md`
- `176-development-guideline.md`
- `177-testing-strategy.md`
