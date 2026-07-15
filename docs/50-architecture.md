# Auan-Auan-Platform

> System Architecture

## Document Information

| Item         | Value               |
| ------------ | ------------------- |
| Document     | Architecture        |
| Version      | 1.0.0               |
| Status       | Active              |
| Owner        | Project Team        |
| Last Updated | 2026-07-13          |

## Purpose

This document defines the official system architecture for Auan-Auan-Platform.

All implementations must follow this architecture. Any architectural changes require documented review and approval before implementation.

## Architecture Principles

- Keep the architecture simple.
- Prioritize maintainability over short-term convenience.
- Design for scalability from the beginning.
- Avoid tight coupling.
- Prefer composition over inheritance.
- Every layer must have a single responsibility.

## High-Level Architecture

```text
Customer
    │
    ▼
LINE Official Account
    │
    ▼
LIFF Application
    │
    ▼
React Application
    │
    ▼
REST API
    │
    ▼
Fastify Server
    │
    ▼
Business Logic
    │
    ▼
Prisma ORM
    │
    ▼
PostgreSQL
```

## Layered Architecture

```text
Presentation Layer
        │
        ▼
Application Layer
        │
        ▼
Domain Layer
        │
        ▼
Infrastructure Layer
        │
        ▼
Database
```

## Layer Responsibilities

### Presentation Layer

Responsibilities:

- User Interface
- User Interaction
- Routing
- Input Validation
- State Presentation

Must not contain:

- Business Rules
- Database Access
- SQL
- Authentication Logic

---

### Application Layer

Responsibilities:

- Use Cases
- Workflow Coordination
- Request Processing
- Response Mapping

Must not contain:

- UI Logic
- SQL Queries

---

### Domain Layer

Responsibilities:

- Business Rules
- Domain Models
- Validation Rules
- Business Policies

Must not depend on:

- React
- Fastify
- Prisma
- Database

---

### Infrastructure Layer

Responsibilities:

- Database Access
- External Services
- File Storage
- API Integrations

May depend on:

- Prisma
- Fastify Plugins
- External SDKs

## Frontend Architecture

```text
Pages
   │
   ▼
Features
   │
   ▼
Components
   │
   ▼
Shared Packages
```

### Responsibilities

#### Pages

- Route entry points
- Compose features
- Minimal logic

#### Features

- Business functionality
- State management
- User interaction

#### Components

- Reusable UI
- Presentation only

#### Shared Packages

- Shared utilities
- Shared types
- Shared components

## Backend Architecture

```text
Routes
    │
    ▼
Controllers
    │
    ▼
Services
    │
    ▼
Repositories
    │
    ▼
Prisma
```

Responsibilities

Routes

- Register endpoints
- Apply middleware

Controllers

- Parse requests
- Validate input
- Return responses

Services

- Business logic
- Transactions
- Use cases

Repositories

- Database abstraction
- Data access
- Query execution

## Data Flow

```text
Customer

↓

React

↓

REST API

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL
```

## Dependency Rules

Allowed

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

Not Allowed

```text
Infrastructure
    ↑
Presentation
```

```text
Database
    ↑
React
```

```text
Controller
    ↓
Prisma
```

Services must access the database only through repositories.

## Shared Package Rules

Shared packages must never depend on application code.

Allowed

```text
apps/*
    ↓
packages/*
```

Not Allowed

```text
packages/*
    ↓
apps/*
```

## State Management

Current approach:

- React Context
- React Hooks

Future evaluation:

- TanStack Query
- Zustand

Redux is intentionally excluded unless justified by project complexity.

## Error Handling

Use centralized error handling.

Requirements:

- Consistent error format
- Structured logging
- User-friendly messages
- No internal implementation leakage

## Logging

Every backend request should support logging.

Logging should include:

- Timestamp
- Request ID
- Endpoint
- Execution Time
- Status Code

Sensitive information must never be logged.

## Security Architecture

Authentication:

- LINE LIFF Login

Authorization:

- Role-based access control (Future)

Passwords are not stored because authentication is delegated to LINE.

## Scalability

The architecture must support future modules:

```text
Customer
Kitchen
Admin
ERP
Inventory
Analytics
Reporting
```

Without major refactoring.

## Architecture Constraints

The following are prohibited without architectural review:

- Direct database access from controllers
- Business logic inside React components
- Business logic inside routes
- Circular dependencies
- Global mutable state
- Duplicate business logic

## Definition of Success

The architecture is successful when:

- Features can be added independently.
- Modules remain loosely coupled.
- Code remains easy to understand.
- Business logic is reusable.
- Testing is straightforward.
- Refactoring has minimal impact.

## References

- `00-master-index.md`
- `10-project-context.md`
- `20-role.md`
- `30-tech-stack.md`
- `40-folder-structure.md`
