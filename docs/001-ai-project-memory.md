# Auan-Auan Platform

# AI Project Memory

Version: 1.1

This document is the permanent memory of the project.

Every AI assistant must read this file before making any code changes.

If this document conflicts with temporary prompts, this document wins unless the documentation explicitly states otherwise.

---

# Project Goal

Build a production-ready restaurant ordering platform for LINE LIFF.

Primary goals

- Clean Architecture

- Maintainable

- Scalable

- Type Safe

- Production Ready

Future goals

- Multi Store

- ERP

- AI Integration

These are NOT part of the MVP.

---

# Tech Stack

Backend

- Fastify 5

- Prisma 6

- PostgreSQL

- TypeScript

Frontend

- React 19

- Vite 6

- TailwindCSS 4

- TanStack Query

- Zustand

- React Router 7

- React Hook Form

Frontend Apps

- Customer (LINE LIFF ordering)
- Admin (Dashboard, Staff management)

Validation

- Zod

Authentication

- JWT (Customer via LINE Login)
- JWT (Staff via email/password)

Monorepo

- pnpm + Turborepo

Deployment

- Docker + Docker Compose

- Nginx (reverse proxy + static files)

- Cloudflare Free Tier (HTTPS, CDN, DDoS protection, rate limiting)

Production Architecture

- Cloudflare → Nginx → Fastify API → PostgreSQL

- Customer served at /

- Admin served at /admin/

---

# Architecture

Always use

Routes

↓

Controllers

↓

Services

↓

Repositories

↓

Prisma

Never bypass layers.

Business Logic belongs inside Services.

Database access belongs inside Repositories.

---

# Repository Pattern

Repositories are responsible only for

- Query

- Insert

- Update

- Delete

Never place business logic inside repositories.

---

# Service Layer

Services contain

Business Rules

Validation

Transactions

Coordination between modules

Never put SQL logic inside services.

---

# Controllers

Controllers only

Receive Request

Call Service

Return Response

Controllers must remain thin.

---

# Prisma Rules

Always use

UncheckedCreateInput

for foreign keys.

Use

Prisma.JsonNull

instead of plain null.

Decimal values

must be converted to string before returning JSON.

Always use transactions for

Checkout

Payment

Order

Inventory

---

# Validation

Use

Zod

for all request validation.

Never trust client input.

Always validate

Ownership

Permissions

Business Rules

---

# Authentication

JWT Authentication

RBAC Authorization

Owner validation

Never trust role sent from frontend.

---

# API Response Format

Always return

Success

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

Error

```json
{
  "success": false,
  "message": "...",
  "errors": []
}
```

---

# Error Handling

Use centralized error handler.

Never expose

Stack Trace

Database Errors

Internal Paths

---

# Naming Convention

Files

kebab-case

Variables

camelCase

Types

PascalCase

Enums

PascalCase

Constants

UPPER_CASE

---

# Folder Convention

Follow existing project structure.

Do not introduce a new architecture.

---

# Dependency Rules

Always reuse existing modules.

Never duplicate

Service

Repository

Utilities

Validation

---

# Transaction Rules

Use interactive transactions.

Rollback on failure.

Never perform partial writes.

---

# Performance Rules

Avoid

N+1 Queries

Repeated Queries

Unnecessary Mapping

Use pagination where appropriate.

---

# Security Rules

Always validate

Authentication

Authorization

Ownership

Input

Never expose

Secrets

Passwords

Tokens

Configuration

---

# Logging

Log

Authentication

Orders

Payments

Errors

Critical Actions

Never log

Passwords

JWT

Secrets

---

# Testing

Every module should include

Unit Test

Integration Test

Validation Test

Authorization Test

Edge Cases

---

# Non-MVP Features

Do NOT implement

AI

ERP

Multi Store

Mobile App

Payment Gateway

unless explicitly requested.

Only design interfaces when required.

---

# Conflict Resolution

Priority

1 Documentation

2 AI Project Memory

3 Existing Code

4 Current Task Prompt

5 General Best Practices

If conflicts exist

STOP

Explain the issue.

Never guess.

---

# Things Never Do

Never change architecture.

Never create duplicate services.

Never duplicate repositories.

Never skip validation.

Never bypass repositories.

Never bypass services.

Never hardcode configuration.

Never expose secrets.

Never ignore existing documentation.

---

# Definition of Done

A task is complete only if

✓ Business Rules implemented

✓ Validation complete

✓ Authorization complete

✓ Error Handling complete

✓ Transactions correct

✓ API follows standard

✓ TypeScript passes

✓ Lint passes

✓ Tests pass

✓ Documentation updated

Otherwise

The task is NOT complete.
