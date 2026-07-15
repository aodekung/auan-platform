# Auan-Auan-Platform

> Technology Stack

## Document Information

| Item            | Value                |
| --------------- | -------------------- |
| Document        | Technology Stack     |
| Version         | 1.0.0                |
| Status          | Active               |
| Owner           | Project Team         |
| Last Updated    | 2026-07-13           |

## Purpose

This document defines the official technology stack used throughout the project.

All developers and AI assistants must follow the technologies specified in this document unless a documented architectural decision supersedes them.

## Technology Selection Principles

Every technology adopted by this project must satisfy the following requirements:

- Stable and actively maintained
- Strong community support
- Excellent TypeScript support
- Production-ready
- Easy to maintain
- Scalable
- AI-friendly for modern coding assistants

Avoid selecting technologies solely because they are popular.

## Core Technology Stack

| Category           | Technology          |
| ------------------ | ------------------- |
| Language           | TypeScript          |
| Runtime            | Node.js (LTS)       |
| Package Manager    | pnpm                |
| Monorepo           | Turborepo           |
| Frontend Framework | React               |
| Build Tool         | Vite                |
| UI Styling         | Tailwind CSS        |
| UI Components      | shadcn/ui           |
| Backend Framework  | Fastify             |
| ORM                | Prisma              |
| Database           | PostgreSQL          |
| Authentication     | LINE LIFF           |
| API Style          | REST API            |
| Version Control    | Git                 |
| Repository Hosting | GitHub              |

## Frontend Stack

### Framework

React is the official frontend framework.

Reasons:

- Mature ecosystem
- Excellent TypeScript integration
- Large community
- Strong AI tooling support
- Component-based architecture

### Build Tool

Vite is used for development and production builds.

Reasons:

- Fast startup
- Fast Hot Module Replacement (HMR)
- Lightweight configuration
- Excellent React support

### Styling

Tailwind CSS is the official styling solution.

Reasons:

- Utility-first workflow
- Consistent design
- Easy maintenance
- Excellent developer experience

### Component Library

The project uses shadcn/ui.

Reasons:

- Accessible components
- Source code ownership
- Easy customization
- No vendor lock-in

## Backend Stack

### Runtime

Node.js LTS

Framework

Fastify

Reasons:

- High performance
- Type-safe ecosystem
- Plugin architecture
- Low overhead

## Database

The production database is PostgreSQL.

Reasons:

- ACID compliance
- Relational modeling
- Excellent scalability
- Strong ecosystem

## ORM

Prisma is the official ORM.

Reasons:

- Type-safe queries
- Migration support
- Excellent developer experience
- Strong TypeScript integration

## Authentication

Authentication uses LINE Login through LIFF.

Customers must authenticate before placing an order.

No custom authentication system will be implemented.

## API

The platform uses REST APIs.

General principles:

- Stateless
- Predictable
- Resource-oriented
- JSON-based

## Development Tools

| Category         | Tool                |
| ---------------- | ------------------- |
| IDE              | Visual Studio Code  |
| AI Assistant     | GitHub Copilot      |
| AI Collaboration | ChatGPT             |
| Formatter        | Prettier            |
| Linter           | ESLint              |
| Markdown Linter  | markdownlint        |

## Testing Strategy

Primary testing:

- Unit Tests

Future expansion:

- Integration Tests
- End-to-End Tests

## Technologies Not Used

The following technologies are intentionally excluded:

- Angular
- Vue
- Express
- jQuery
- Bootstrap
- MongoDB
- Firebase
- Sequelize

These technologies may only be introduced after architectural review.

## Upgrade Policy

Always prefer stable releases.

Avoid adopting experimental technologies in production.

Major version upgrades should be evaluated before implementation.

## References

- `00-master-index.md`
- `10-project-context.md`
- `20-role.md`
