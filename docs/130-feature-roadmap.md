# Auan-Auan-Platform

> Feature Roadmap

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Feature Roadmap |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document provides a summary of the platform development phases.

For the complete and authoritative roadmap, see `00-business/161-future-roadmap.md`.

---

## Phase Overview

### Phase 1 — MVP (Current)

Customer ordering system via LINE LIFF.

Scope:

- LINE Login
- Product Catalog
- Product Options
- Shopping Cart
- Checkout
- PromptPay Payment
- Manual Payment Verification
- Kitchen Notification
- Order Tracking

### Phase 2 — Operations

Admin dashboard and operational tools.

### Phase 3 — Business Management

Purchase orders, suppliers, recipes, cost management.

### Phase 4 — ERP

Accounting, employees, multi-branch.

### Phase 5 — Customer Experience

Membership, loyalty, coupons, referrals.

### Phase 6 — AI Platform

Forecasting, AI assistant, insights.

### Phase 7 — Platform Expansion

Multi-tenant, multi-branch.

---

## References

- `00-business/161-future-roadmap.md`
- `10-project-context.md`

---

## Legacy Content

The previous content of this file was a project README overview.

That content has been preserved for reference purposes.

The authoritative project overview is now maintained in `10-project-context.md`.

---

## Overview

Auan-Auan-Platform is a full-stack food ordering platform built for a small business with a long-term vision of evolving into a complete business management ecosystem.

The platform is designed with an AI-first development workflow, allowing both developers and AI assistants to collaborate using a shared set of engineering standards, architectural guidelines, and documentation.

The first production goal is a LINE LIFF ordering system that allows customers to browse products, customize menu items, place orders, and pay via PromptPay. Future phases will expand the platform into a complete ERP solution.

---

## Project Goals

### Phase 1

- Customer Ordering System
- LINE Official Account Integration
- LINE LIFF Application
- Shopping Cart
- PromptPay Payment
- Kitchen Order Notification

### Phase 2

- Admin Dashboard
- Order Management
- Product Management
- Category Management

### Phase 3

- Inventory Management
- Sales Analytics
- Reporting
- Customer Management

### Phase 4

- ERP
- Purchasing
- Accounting Integration
- Supplier Management
- AI Automation

---

## Technology Stack

| Category | Technology |
| -------- | ---------- |
| Language | TypeScript |
| Frontend | React |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Fastify |
| Runtime | Node.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Monorepo | Turborepo |
| Package Manager | pnpm |

---

## Repository Structure

```text
apps/
packages/
docs/
scripts/
.github/
.vscode/
```

---

## Documentation Structure

| File | Purpose |
| ---- | ------- |
| `00-master-index.md` | Documentation Index |
| `10-project-context.md` | Business Context |
| `20-role.md` | AI Role |
| `30-tech-stack.md` | Technology Stack |
| `40-folder-structure.md` | Repository Structure |
| `50-architecture.md` | System Architecture |
| `60-coding-standard.md` | Coding Standards |
| `70-ui-ux-rules.md` | UI / UX Standards |
| `80-database-rules.md` | Database Standards |
| `90-api-rules.md` | API Standards |
| `100-security-rules.md` | Security Standards |
| `110-development-workflow.md` | Development Workflow |
| `120-ai-operational-rules.md` | AI Operational Rules |

---

## Documentation Reading Order

Developers and AI assistants should read the documentation in the following order.

```text
00-master-index.md
        ↓
10-project-context.md
        ↓
20-role.md
        ↓
30-tech-stack.md
        ↓
40-folder-structure.md
        ↓
50-architecture.md
        ↓
60-coding-standard.md
        ↓
70-ui-ux-rules.md
        ↓
80-database-rules.md
        ↓
90-api-rules.md
        ↓
100-security-rules.md
        ↓
110-development-workflow.md
        ↓
120-ai-operational-rules.md
```

---

## Development Principles

The project follows these principles:

- AI-First Development
- Clean Architecture
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- SOLID Principles
- Security by Default
- Mobile-First Design
- Documentation-Driven Development

---

## Coding Standards

Every implementation must:

- Follow TypeScript strict mode.
- Pass ESLint.
- Pass Prettier formatting.
- Follow documented architecture.
- Avoid duplicate business logic.
- Keep documentation synchronized.

---

## Git Workflow

Branch naming:

```text
feature/*
bugfix/*
hotfix/*
refactor/*
docs/*
test/*
chore/*
```

Commit messages follow Conventional Commits.

Example

```text
feat: add shopping cart
fix: resolve payment validation
docs: update architecture
```

---

## Definition of Done

A feature is complete only when:

- Requirements are implemented.
- Code review is completed.
- Tests pass.
- Lint passes.
- TypeScript passes.
- Documentation is updated.
- Architecture remains consistent.

---

## Future Roadmap

The platform is designed to support future expansion without major architectural changes.

Planned modules include:

- Customer Application
- Kitchen Display System
- Admin Dashboard
- Inventory Management
- Reporting
- ERP
- Analytics
- AI Automation

---

## License

This repository is private.

All source code, documentation, assets, and business logic are proprietary and may not be copied, distributed, or reused without explicit permission from the project owner.
