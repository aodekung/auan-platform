# Auan-Auan-Platform

> AI-First Documentation Index

---

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Master Index |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

---

## Purpose

This document serves as the master index for the entire project documentation.

Every document inside the `/docs` directory must be referenced here.

This file is considered the single entry point for:

- Developers
- AI Coding Assistants
- Code Reviewers
- Future Contributors

If a document is not listed here, it should be considered unofficial.

---

## Documentation Principles

All documentation must follow these principles.

## 1. Single Source of Truth

Each topic must exist in only one document.

Avoid duplicated information across files.

If documentation overlaps, reference the original document instead.

---

## 2. AI-First Documentation

Documentation must be optimized for both humans and AI assistants.

The project is expected to work with:

- GitHub Copilot
- Cursor
- Claude Code
- ChatGPT
- Future AI Coding Agents

Documents should therefore be:

- Explicit
- Structured
- Consistent
- Machine-readable
- Easy to reference

---

## 3. Production-Oriented

Documentation must reflect production-quality engineering practices.

Avoid temporary solutions unless explicitly marked as experimental.

---

## 4. Incremental Growth

The platform is expected to grow over time.

Documentation should support future modules without requiring major rewrites.

Examples include:

- Customer Application
- Kitchen Display System
- Admin Dashboard
- ERP
- Inventory Management
- Analytics
- Reporting
- AI Automation

---

## Documentation Structure

### Core Documents (root docs/)

| No. | File | Status | Description |
| ----- | ----- | -------- | ------------- |
| 00 | 00-master-index.md | ✅ | Documentation entry point and single source of truth |
| 10 | 10-project-context.md | ✅ | Business context, project vision, scope, and constraints |
| 20 | 20-role.md | ✅ | AI collaboration rules and behavioral guidelines |
| 002 | 002-ai-task-template.md | ✅ | AI task template |
| 003 | 003-ai-session-summary.md | ✅ | AI session summary template |
| 30 | 30-tech-stack.md | ✅ | Technology stack decisions |
| 40 | 40-folder-structure.md | ✅ | Repository structure and organization |
| 50 | 50-architecture.md | ✅ | System architecture (layers, modules, patterns) |
| 60 | 60-coding-standard.md | ✅ | Coding conventions and TypeScript standards |
| 70 | 70-ui-ux-rules.md | ✅ | UI/UX design principles and component rules |
| 80 | 80-database-rules.md | ✅ | Database standards (PostgreSQL, Prisma, naming) |
| 90 | 90-api-rules.md | ✅ | API design standards (REST, JSON, HTTP) |
| 100 | 100-security-rules.md | ✅ | Security guidelines and authentication rules |
| 110 | 110-development-workflow.md | ✅ | Development lifecycle and git workflow |
| 120 | 120-ai-rules.md | ✅ | AI assistant operational rules |
| 130 | 130-feature-roadmap.md | ✅ | Feature roadmap summary (see 161 for details) |
| 140 | 140-contributing-guide.md | ✅ | Contribution guidelines and PR requirements |

### Business Documents (docs/00-business/)

| No. | File | Status | Description |
| ----- | ----- | -------- | ------------- |
| 149 | 149-business-discovery-questionnaire.md | ✅ | Business discovery questionnaire with raw answers |
| 150 | 150-business-rules.md | ✅ | Official business rules (single source of truth) |
| 151 | 151-product-catalog.md | ✅ | Product catalog structure and categories |
| 152 | 152-product-options.md | ✅ | Product option system (spice level, sauce) |
| 153 | 153-pricing-rules.md | ✅ | Pricing rules (THB, calculation, VAT) |
| 154 | 154-order-workflow.md | ✅ | Order workflow (15-step process) |
| 155 | 155-payment-workflow.md | ✅ | Payment workflow (PromptPay QR, manual verification) |
| 156 | 156-delivery-rules.md | ✅ | Delivery rules (Regent Home Bangson) |
| 157 | 157-kitchen-workflow.md | ✅ | Kitchen workflow (single kitchen, queue management) |
| 158 | 158-order-status.md | ✅ | Order status lifecycle (13 statuses, transition matrix) |
| 159 | 159-notification-rules.md | ✅ | Notification system rules (LINE messages) |
| 160 | 160-error-scenarios.md | ✅ | Error scenarios and handling rules |
| 161 | 161-future-roadmap.md | ✅ | Future roadmap (7 development phases) |

### System Design Documents (docs/01-system-design/)

| No. | File | Status | Description |
| ----- | ----- | -------- | ------------- |
| 170 | 170-system-architecture.md | ✅ | System architecture (layers, modules, evolution) |
| 171 | 171-technology-stack.md | ✅ | Detailed technology stack with versions |
| 172 | 172-system-modules.md | ✅ | System modules (Customer, Business, ERP, AI layers) |
| 173 | 173-database-design.md | ✅ | Database design (entities, relationships, naming) |
| 174 | 174-api-design.md | ✅ | API design (endpoints, response format, auth) |
| 175 | 175-authentication-authorization.md | ✅ | Authentication and authorization (LINE + JWT) |
| 176 | 176-deployment-guidelines.md | ✅ | Deployment guidelines (Docker, Nginx, CI/CD) |
| 177 | 177-testing-strategy.md | ✅ | Testing strategy (unit, integration, E2E) |
| 178 | 178-prisma-schema.md | ✅ | Prisma schema design (models, relations, enums) |
| 179 | 179-api-endpoints.md | ✅ | API endpoint reference |
| 180 | 180-ui-flow.md | ✅ | UI flow specifications |
| 181 | 181-screen-spec.md | ✅ | Screen specifications |
| 182 | 182-sequence-diagram.md | ✅ | Sequence diagrams |
| 183 | 183-state-management.md | ✅ | State management design |
| 184 | 184-environment.md | ✅ | Environment configuration |
| 185 | 185-deployment-checklist.md | ✅ | Deployment verification checklist |
| 186 | 186-user-stories.md | ✅ | User stories |
| 187 | 187-acceptance-criteria.md | ✅ | Acceptance criteria |
| 188 | 188-component-library.md | ✅ | Component library reference |
| 189 | 189-design-tokens.md | ✅ | Design tokens |
| 190 | 190-ai-development-guide.md | ✅ | AI-assisted development guide |
| 199 | 199-ai-task-rules.md | ✅ | AI task rules and constraints |

### Operational Documents

| File | Status | Description |
| ----- | -------- | ------------- |
| DEPLOYMENT.md | ✅ | Production deployment guide (Cloudflare + Docker) |
| GETTING-STARTED.md | ✅ | Beginner's step-by-step deployment guide (Thai) |
| OCI-DEPLOYMENT.md | ✅ | OCI Free Tier Singapore setup guide |

### Feature Documents (docs/03-features/)

| No. | File | Status | Description |
| ----- | ----- | -------- | ------------- |
| F001 | F001-line-login.md | ⬜ | LINE LIFF login feature specification |
| F002 | F002-menu.md | ⬜ | Menu page feature specification |
| F003 | F003-product-detail.md | ⬜ | Product detail page feature specification |
| F004 | F004-cart.md | ⬜ | Shopping cart feature specification |
| F005 | F005-checkout.md | ⬜ | Checkout feature specification |
| F006 | F006-payment.md | ⬜ | Payment page feature specification |
| F007 | F007-order-management.md | ⬜ | Order management feature specification |
| F008 | F008-kitchen-display.md | ⬜ | Kitchen display feature specification |

---

## Document Dependency

```text
00-master-index
│
├── Core Documents (root docs/)
│   ├── 10 Project Context
│   ├── 20 Role
│   ├── 30 Tech Stack
│   ├── 40 Folder Structure
│   ├── 50 Architecture
│   ├── 60 Coding Standard
│   ├── 70 UI/UX Rules
│   ├── 80 Database Rules
│   ├── 90 API Rules
│   ├── 100 Security Rules
│   ├── 110 Development Workflow
│   ├── 120 AI Rules
│   ├── 130 Feature Roadmap
│   └── 140 Contributing Guide
│
├── Business Documents (00-business/)
│   ├── 149 Business Discovery Questionnaire
│   ├── 150 Business Rules
│   ├── 151 Product Catalog
│   ├── 152 Product Options
│   ├── 153 Pricing Rules
│   ├── 154 Order Workflow
│   ├── 155 Payment Workflow
│   ├── 156 Delivery Rules
│   ├── 157 Kitchen Workflow
│   ├── 158 Order Status
│   ├── 159 Notification Rules
│   ├── 160 Error Scenarios
│   └── 161 Future Roadmap
│
├── System Design Documents (01-system-design/)
│   ├── 170 System Architecture
│   ├── 171 Technology Stack
│   ├── 172 System Modules
│   ├── 173 Database Design
│   ├── 174 API Design
│   ├── 175 Authentication & Authorization
│   ├── 176 Deployment Guidelines
│   ├── 177 Testing Strategy
│   ├── 178 Prisma Schema
│   ├── 179 API Endpoints
│   ├── 180 UI Flow
│   ├── 181 Screen Spec
│   ├── 182 Sequence Diagram
│   ├── 183 State Management
│   ├── 184 Environment
│   ├── 185 Deployment Checklist
│   ├── 186 User Stories
│   ├── 187 Acceptance Criteria
│   ├── 188 Component Library
│   ├── 189 Design Tokens
│   ├── 190 AI Development Guide
│   └── 199 AI Task Rules
│
├── Operational Documents
│   └── DEPLOYMENT.md
│
└── Feature Documents (03-features/)
    ├── F001 LINE Login
    ├── F002 Menu
    ├── F003 Product Detail
    ├── F004 Cart
    ├── F005 Checkout
    ├── F006 Payment
    ├── F007 Order Management
    └── F008 Kitchen Display
```

---

## Documentation Priority

When conflicts occur, documents should be interpreted using the following priority.

```text
Product Requirements
        ↓
Architecture
        ↓
Coding Standards
        ↓
API Rules
        ↓
Database Rules
        ↓
Development Workflow
        ↓
AI Rules
```

Higher-priority documents override lower-priority documents.

---

## Versioning

Documentation follows Semantic Versioning.

Examples

```text
1.0.0

Major
Major architecture changes

Minor
New documentation

Patch
Grammar fixes
Clarifications
```

---

## Change Management

Every significant documentation update must:

- Explain why the change was made.
- Preserve consistency across documents.
- Avoid conflicting rules.
- Update dependent documents when necessary.

---

## Future Expansion

The documentation structure intentionally leaves numbering gaps.

Future documents may include:

- CI/CD Pipeline
- Monitoring (Prometheus/Grafana/Sentry)
- Logging
- Multi-Store Architecture
- ERP Integration

without renumbering existing files.

---

## Notes

This documentation is intended to remain maintainable for long-term development.

Every future document must align with the principles defined in this file.

This file is the authoritative index of the entire documentation system.
