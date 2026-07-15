# Auan-Auan-Platform

A modern AI-first food ordering platform designed for **LINE Official Account + LINE LIFF**, with a long-term roadmap toward a complete ERP ecosystem.

---

## Vision

Build a scalable, maintainable, and production-ready platform that starts as a LINE food ordering system and gradually evolves into a complete business management platform.

Future modules include:

- Customer Ordering
- Kitchen Display System (KDS)
- Admin Dashboard
- Inventory Management
- Sales Analytics
- Reporting
- ERP
- AI Automation

---

## Phase Roadmap

| Phase | Description | Status |
| ------ | ----------- | ------ |
| Phase 1 | Customer Ordering System (LINE LIFF) | 🚧 In Progress |
| Phase 2 | Admin Dashboard | ⏳ Planned |
| Phase 3 | Inventory & Reporting | ⏳ Planned |
| Phase 4 | ERP Platform | ⏳ Planned |

---

## Technology Stack

| Category | Technology |
| -------- | ---------- |
| Language | TypeScript |
| Frontend | React |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Fastify |
| Runtime | Node.js (LTS) |
| ORM | Prisma |
| Database | PostgreSQL |
| Package Manager | pnpm |
| Monorepo | Turborepo |

---

## Repository Structure

```text
Auan-Auan-Platform/
├── apps/
├── packages/
├── docs/
├── scripts/
├── .github/
├── .vscode/
└── README.md
```

---

## Documentation

Project documentation is located in the `docs/` directory.

### Documentation Order

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
120-ai-rules.md
        ↓
140-contributing.md
```

---

## Development Principles

The project follows these engineering principles:

- AI-First Development
- Clean Architecture
- SOLID Principles
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Documentation-Driven Development
- Security by Default
- Mobile-First Design

---

## Development Workflow

```text
Planning
    ↓
Architecture
    ↓
Implementation
    ↓
Testing
    ↓
Code Review
    ↓
Documentation
    ↓
Deployment
```

---

## Branch Naming

```text
feature/*
bugfix/*
hotfix/*
refactor/*
docs/*
test/*
chore/*
```

---

## Commit Convention

Follow Conventional Commits.

Examples:

```text
feat: add shopping cart
fix: resolve payment validation
refactor: simplify order service
docs: update architecture
test: add checkout tests
```

---

## Definition of Done

A feature is complete only when:

- Requirements are implemented.
- Code builds successfully.
- ESLint passes.
- TypeScript passes.
- Tests pass.
- Documentation is updated.
- Architecture remains consistent.

---

## License

This repository is private.

All source code, documentation, assets, business logic, and related materials are proprietary and may not be copied, modified, distributed, or reused without explicit permission from the project owner.
