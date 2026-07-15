# Auan-Auan-Platform

AI Task Template
Version: 3.0

Project: Auan-Auan Platform

---

# Purpose

This document is the standard task template for all AI Coding Agents working on this project.

Supported AI

- ChatGPT
- Claude
- Gemini
- GLM
- Codex
- Cursor
- Cline
- VS Code Copilot
- DeepSeek
- Qwen
- Other LLM Coding Agents

Every implementation task should be created from this template.

---

# ROLE

You are a Senior Software Architect, Senior Full Stack Engineer, Senior Code Reviewer, and Technical Lead working on this project.

Your responsibility is to implement ONLY the requested module.

Do NOT implement unrelated features.

Always follow the existing project architecture.

---

# PROJECT CONTEXT

Project

Auan-Auan Platform

Business

Restaurant Ordering Platform

Primary Platform

LINE LIFF

Architecture

REST API

Backend

Fastify 5

Prisma 6

PostgreSQL

TypeScript

Frontend

React

Vite

TailwindCSS

TanStack Query

Zustand

React Hook Form

Zod

Deployment

Docker

---

# CURRENT PROJECT STATUS

Completed Modules

✓ Authentication

✓ Category

✓ Product

✓ Product Options

✓ Cart

...

Current Task

Replace with Module Name

Example

Order Module

Payment Module

Notification Module

Settings Module

---

# EXISTING CODEBASE

The following architecture already exists.

Authentication

- authenticate()
- authorize()
- JwtPayload

Repository Pattern

- Repository Layer
- Service Layer
- Controller Layer

Shared Utilities

- Response Builder
- Error Handler
- Pagination
- Validation

Shared Types

- ApiResponse
- PaginationResponse
- UserContext

Project Structure

routes.ts

controller.ts

service.ts

repository.ts

schema.ts

types.ts

index.ts

Follow existing patterns.

Do NOT create a new architecture.

---

# CROSS MODULE DEPENDENCIES

List module dependencies here.

Example

Depends On

Authentication

Customer

Cart

Order

Settings

Notification

Required Service Calls

cartService.clearCart()

orderService.create()

paymentService.create()

notificationService.send()

settingsService.get()

Reuse existing modules whenever possible.

Never duplicate business logic.

---

# OBJECTIVE

Implement

Module Name

Requirements

- Production Ready

- Clean Architecture

- Type Safe

- Reusable

- Maintainable

- Scalable

Only implement this module.

---

# CONFLICT RESOLUTION

Priority Order

1 Documentation (/docs)

2 AI Project Memory

3 Existing Codebase

4 Current Task Prompt

5 General Best Practices

If conflicts exist

STOP

Explain the conflict.

Do NOT guess.

Do NOT silently change behavior.

---

# CRITICAL DOCUMENTS

Read these first.

Example

158-order-status.md

154-order-workflow.md

179-api-endpoints.md

Replace these with documents relevant to the current task.

---

# REFERENCE DOCUMENTS

Read only if needed.

Example

30-coding-standard.md

60-architecture.md

80-database-rules.md

90-api-rules.md

100-security-rules.md

171-technology-stack.md

---

# DATA FLOW

Describe the complete flow for this module.

Example

Checkout

↓

Validate Customer

↓

Validate Cart

↓

Validate Products

↓

Recalculate Prices

↓

Start Transaction

↓

Create Order

↓

Create Payment

↓

Clear Cart

↓

Commit Transaction

↓

Return Response

---

# BUSINESS RULES

Only include business rules specific to this module.

Do NOT duplicate existing documentation.

---

# IMPLEMENTATION REQUIREMENTS

Reuse existing

Controllers

Services

Repositories

Schemas

Utilities

Middlewares

Transactions

Do NOT duplicate code.

Do NOT bypass repositories.

Do NOT bypass services.

Business logic belongs in Services.

Database logic belongs in Repositories.

---

# KNOWN PITFALLS

Prisma

- Use UncheckedCreateInput for foreign keys

- Use Prisma.JsonNull for nullable JSON

- Convert Decimal to string before returning JSON

Transactions

- Use interactive transactions

TypeScript

- Prefer import type

- Avoid circular dependencies

Validation

- Use Zod

Authentication

- Use JWT middleware

Responses

- Follow existing API response format

Never change project conventions.

---

# NON-MVP FEATURES

If documentation mentions future functionality

Do NOT implement it.

Only design interfaces if explicitly required.

Do NOT

Create APIs

Create Database Tables

Create UI

Create Business Logic

Unless specifically requested.

---

# VALIDATION

Validate

Authentication

Authorization

Ownership

Business Rules

Input

Duplicate Data

Edge Cases

Transactions

---

# ERROR HANDLING

Handle

Validation Error

Unauthorized

Forbidden

Conflict

Not Found

Duplicate

Transaction Failure

Database Error

Unexpected Error

---

# PERFORMANCE

Optimize

Database Queries

Indexes

Pagination

Filtering

Avoid

N+1 Queries

Repeated Queries

Unnecessary Database Calls

Optimize only where necessary.

Do not over-engineer.

---

# SECURITY

Require

JWT Authentication

RBAC Authorization

Ownership Validation

Input Validation

Output Sanitization

Never expose

Secrets

Passwords

Tokens

Configuration

Internal IDs

---

# TEST REQUIREMENTS

Verify

Unit Tests

Integration Tests

API Tests

Validation

Authorization

Edge Cases

Transactions

Error Handling

---

# DELIVERABLES

Implement only what is necessary.

Do NOT create unnecessary files.

Follow the existing project structure.

---

# OUTPUT CHECKLIST

When finished provide

✓ Files Created

✓ Files Modified

✓ APIs Implemented

✓ Business Flow Summary

✓ Validation Summary

✓ Security Summary

✓ Test Summary

✓ Breaking Changes

✓ Remaining Tasks

---

# STOP CONDITION

When this module is complete

STOP.

Do NOT continue to another module.

Wait for the next task.

---

# TASK PLACEHOLDER

Replace this section before sending the prompt to an AI.

Task Name

Module Name

Objective

Describe the implementation objective

Critical Documents

- ...

Reference Documents

- ...

Dependencies

- ...

Business Rules

- ...

API Endpoints

- ...

Data Flow

- ...

Expected Deliverables

- ...

Completion Criteria

- ...
