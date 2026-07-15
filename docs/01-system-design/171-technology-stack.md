# Auan-Auan-Platform

> Technology Stack

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Technology Stack |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the official technology stack for Auan-Auan-Platform.

Only technologies listed in this document are approved for production use.

---

## Technology Principles

Technology selection must prioritize:

- Simplicity
- Stability
- Maintainability
- Scalability
- Type Safety
- Developer Experience
- Long-Term Support

---

## Architecture Style

```text
Monorepo
        ↓
Clean Architecture
        ↓
Feature-Based Structure
        ↓
API-First Development
```

---

## Frontend

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| React | Latest Stable | User Interface |
| TypeScript | Latest Stable | Type Safety |
| Vite | Latest Stable | Build Tool |
| Tailwind CSS | Latest Stable | Styling |
| shadcn/ui | Latest Stable | UI Components |
| React Router | Latest Stable | Routing |
| TanStack Query | Latest Stable | Server State |
| React Hook Form | Latest Stable | Form Management |
| Zod | Latest Stable | Validation |

---

## Backend

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| Node.js | LTS | Runtime |
| Fastify | Latest Stable | Web Framework |
| TypeScript | Latest Stable | Type Safety |
| Prisma ORM | Latest Stable | Database ORM |
| Zod | Latest Stable | Validation |

---

## Database

| Technology | Purpose |
| ---------- | ------- |
| PostgreSQL | Primary Database |
| Prisma Migrate | Schema Migration |
| Prisma Studio | Database Inspection |

---

## Authentication

Current authentication:

- LINE Login
- JWT
- HTTP Only Cookies

Future authentication:

- Refresh Tokens
- Multi-Device Sessions
- Two-Factor Authentication

---

## LINE Platform

Current integrations:

- LINE Login
- LINE LIFF
- LINE Messaging API
- Rich Menu

Future integrations:

- LINE Pay
- LINE Webhook

---

## Payment

Current payment method:

- PromptPay Fixed QR Code
- Manual Verification

Future payment methods:

- Dynamic PromptPay QR
- LINE Pay
- Credit Card
- Mobile Banking API

---

## API

API Standard:

```text
REST API
JSON
HTTPS
```

Future support:

- WebSocket
- Server-Sent Events (SSE)

---

## Package Manager

Approved package manager:

```text
pnpm
```

npm and yarn are not used.

---

## Monorepo Tool

Approved tool:

```text
Turborepo
```

---

## Code Quality

Approved tools:

| Tool | Purpose |
| ---- | ------- |
| ESLint | Static Analysis |
| Prettier | Code Formatting |
| Husky | Git Hooks |
| lint-staged | Pre-Commit Checks |

---

## Testing

| Tool | Purpose |
| ---- | ------- |
| Vitest | Unit Testing |
| Playwright | End-to-End Testing |

Testing priorities:

- Business Logic
- API
- Critical User Flows

---

## Documentation

Documentation format:

```text
Markdown (.md)
```

Documentation principles:

- AI-Friendly
- Human-Readable
- Version Controlled

---

## Development Tools

Approved IDE:

- Visual Studio Code

Approved AI Tools:

- GitHub Copilot
- Claude Code
- Gemini CLI
- Cline

---

## Version Control

| Tool | Purpose |
| ---- | ------- |
| Git | Version Control |
| GitHub | Repository Hosting |

---

## Deployment

Current target:

- Docker
- VPS
- Nginx

Future targets:

- Railway
- Render
- Fly.io
- AWS

---

## Logging

Approved logging library:

```text
Pino
```

Future integrations:

- Grafana
- Loki
- OpenTelemetry

---

## Environment Variables

Environment configuration:

```text
.env
.env.local
.env.production
```

Sensitive values must never be committed to Git.

---

## File Storage

Current strategy:

```text
Local Storage
```

Future strategies:

- Amazon S3
- Cloudflare R2
- Google Cloud Storage

---

## Background Jobs

Future job processing:

- BullMQ
- Redis

Current version does not require background workers.

---

## Caching

Future cache technology:

```text
Redis
```

Current version operates without caching.

---

## Monitoring

Future monitoring stack:

- Grafana
- Prometheus
- Sentry

---

## Security

Security technologies:

- HTTPS
- JWT
- Helmet
- CORS
- Rate Limiting
- bcrypt

Future enhancements:

- CSP
- WAF
- Secret Manager

---

## Directory Overview

```text
apps/
packages/
docs/
scripts/
```

---

## Upgrade Policy

Technology upgrades must:

- Maintain backward compatibility.
- Pass automated tests.
- Update documentation.
- Be reviewed before merging.

---

## Approved Technology Summary

| Category | Technology |
| -------- | ---------- |
| Frontend | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Library | shadcn/ui |
| Backend | Fastify |
| Runtime | Node.js LTS |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| API | REST |
| Authentication | LINE Login + JWT |
| Payment | PromptPay |
| Monorepo | Turborepo |
| Package Manager | pnpm |
| Testing | Vitest + Playwright |
| Deployment | Docker + VPS |
| Logging | Pino |

---

## Definition of Done

The technology stack is complete when:

- Approved technologies are documented.
- Unsupported technologies are excluded.
- Upgrade policies are defined.
- Development tools are standardized.
- Future expansion is supported.

---

## References

- `30-tech-stack.md`
- `50-architecture.md`
- `60-coding-standard.md`
- `80-database-rules.md`
- `90-api-rules.md`
- `100-security-rules.md`
- `170-system-architecture.md`
- `174-api-design.md`
