# Auan-Auan-Platform

> Folder Structure

## Document Information

| Item         | Value            |
| ------------ | ---------------- |
| Document     | Folder Structure |
| Version      | 1.0.0            |
| Status       | Active           |
| Owner        | Project Team     |
| Last Updated | 2026-07-13       |

## Purpose

This document defines the official repository structure for the project.

Every developer and AI assistant must follow this structure. New files and folders should only be added when they align with the architecture and documented standards.

## Repository Structure

```text
Auan-Auan-Platform/
│
├── apps/
│   ├── customer/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── lib/
│   │   │   ├── pages/
│   │   │   ├── providers/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   ├── admin/
│   │
│   ├── kitchen/
│   │
│   └── api/
│       ├── prisma/
│       │   ├── migrations/
│       │   └── schema.prisma
│       ├── src/
│       │   ├── common/
│       │   ├── config/
│       │   ├── modules/
│       │   ├── plugins/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── types/
│       │   ├── utils/
│       │   └── server.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── ui/
│   ├── shared/
│   ├── types/
│   ├── utils/
│   ├── eslint-config/
│   ├── tsconfig/
│   └── tailwind-config/
│
├── docs/
│
├── scripts/
│
├── .github/
│   └── workflows/
│
├── .vscode/
│
├── .husky/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── .gitignore
├── .editorconfig
├── .prettierrc
├── .prettierignore
├── eslint.config.js
├── README.md
└── LICENSE
```

## Directory Responsibilities

### apps/

Contains executable applications.

| Directory | Responsibility                 |
| --------- | ------------------------------ |
| customer  | Customer LIFF application      |
| admin     | Administration dashboard       |
| kitchen   | Kitchen management application |
| api       | Backend API server             |

### packages/

Contains reusable code shared across applications.

| Directory | Responsibility |
| --------- | -------------- |
| ui | Shared UI components |
| shared | Shared business logic |
| types | Shared TypeScript types |
| utils | Shared utility functions |
| eslint-config | Shared ESLint configuration |
| tsconfig | Shared TypeScript configuration |
| tailwind-config | Shared Tailwind configuration |

### docs/

Project documentation.

Contains all architectural and development documentation.

### scripts/

Automation scripts.

Examples:

- Database setup
- Seed data
- Build scripts
- Maintenance scripts

### .github/

GitHub configuration.

Contains:

- GitHub Actions
- CI workflows
- Templates

### .vscode/

Recommended VS Code configuration.

Contains:

- Extensions
- Workspace settings
- Debug configurations

## Folder Rules

### General Rules

- Keep folders focused on a single responsibility.
- Avoid deeply nested directories.
- Prefer composition over duplication.
- Reuse shared packages whenever possible.

### Application Rules

Each application must remain independently buildable.

Applications must not directly depend on another application.

Shared code belongs inside `packages/`.

### Package Rules

Packages must be framework-independent whenever possible.

Packages must not depend on application-specific code.

### Import Rules

Allowed:

```text
apps/* -> packages/*
apps/* -> apps/* (same application only)
packages/* -> packages/*
```

Not Allowed:

```text
apps/customer -> apps/admin
apps/customer -> apps/kitchen
packages/* -> apps/*
```

## Naming Convention

Directories:

```text
kebab-case
```

Files:

```text
kebab-case.ts
```

React Components:

```text
PascalCase.tsx
```

Hooks:

```text
useSomething.ts
```

Types:

```text
something.types.ts
```

Constants:

```text
something.constants.ts
```

## Future Expansion

The structure is designed to support additional applications.

Possible future applications:

```text
apps/
├── inventory/
├── analytics/
├── reporting/
├── cashier/
└── mobile/
```

Possible future packages:

```text
packages/
├── auth/
├── database/
├── api-client/
├── logger/
└── config/
```

## References

- `00-master-index.md`
- `10-project-context.md`
- `20-role.md`
- `30-tech-stack.md`
