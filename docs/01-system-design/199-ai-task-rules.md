# Auan-Auan-Platform

> AI Task Rules

## Document Information

| Item | Value |
| ---- | ----- |
| Document | AI Task Rules |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines the mandatory operating rules for any AI assistant working on Auan-Auan-Platform.

It ensures every AI follows the same development process, minimizes unintended changes, and maintains a stable codebase.

This document is the primary operational guide for:

- GitHub Copilot
- Cline
- Claude Code
- Gemini CLI
- Cursor
- Any future AI coding assistant

---

## Core Principles

Every AI must be:

- Accurate
- Predictable
- Incremental
- Transparent
- Maintainable
- Documentation-Driven

---

# Source of Truth

The `/docs` directory is the only source of truth.

Before writing any code, the AI must read all relevant documentation.

If documentation conflicts are detected:

- Stop immediately.
- Explain the conflict.
- Request clarification.
- Do not guess.

---

# Development Workflow

Every task must follow this order:

```text
Read Documentation

↓

Understand Requirements

↓

Plan Changes

↓

Implement

↓

Run Type Check

↓

Run Linter

↓

Run Build

↓

Fix Errors

↓

Complete Task
```

No step may be skipped.

---

# Scope Control

The AI must only modify files required for the current task.

Never perform unrelated refactoring.

Never change existing architecture without explicit approval.

Never introduce additional features outside the assigned task.

---

# Incremental Development

Large tasks must be divided into smaller logical tasks.

Each task should produce a working application.

Avoid combining multiple unrelated features into a single implementation.

---

# Documentation First

Before implementing a feature, verify:

- Business Rules
- API Design
- Database Design
- UI Flow
- Screen Specifications
- Acceptance Criteria

Implementation must follow documentation exactly.

---

# Architecture Protection

The AI must never modify:

- Folder Structure
- Architecture
- Naming Conventions
- Technology Stack

Unless explicitly instructed.

---

# Business Logic

Business logic belongs only in:

```text
Services
```

Never place business logic inside:

- Controllers
- Routes
- Components
- Pages
- Database Models

---

# Database Rules

The AI must:

- Use Prisma.
- Create proper migrations.
- Preserve data integrity.
- Avoid destructive schema changes.

Never modify production data without approval.

---

# API Rules

Every endpoint must include:

- Validation
- Authentication (when required)
- Authorization (when required)
- Error Handling
- Proper HTTP Status Codes

---

# Frontend Rules

Every UI implementation must:

- Follow Mobile-First Design.
- Use reusable components.
- Use Tailwind CSS.
- Use shadcn/ui components when applicable.
- Follow Design Tokens.

---

# State Management Rules

Use:

- TanStack Query for server state.
- Zustand for global state.
- React Hook Form for forms.
- React local state for component state.

Never duplicate server state.

---

# Security Rules

Never expose:

- Secrets
- JWT Keys
- Database Credentials
- API Keys
- Internal Tokens

Never disable authentication for convenience.

---

# Code Quality

All code must:

- Pass TypeScript.
- Pass ESLint.
- Follow Prettier formatting.
- Avoid duplication.
- Follow SOLID principles.

---

# Testing Requirements

Before completing any task:

- Type Check passes.
- Build succeeds.
- No runtime errors.
- Critical functionality verified.

Future phases:

- Unit Tests
- Integration Tests
- End-to-End Tests

---

# Build Verification

The AI must ensure:

```text
npm install

↓

npm run lint

↓

npm run typecheck

↓

npm run build
```

If any command fails:

- Stop.
- Fix the issue.
- Retry.
- Do not continue until successful.

---

# Error Handling

When an error occurs:

1. Identify the root cause.
2. Explain the issue.
3. Fix only the necessary code.
4. Verify the fix.
5. Continue.

Never hide errors.

Never ignore warnings without justification.

---

# Git Rules

The AI must never:

- Force Push
- Rewrite History
- Delete Branches
- Modify Git Configuration

Suggested workflow:

```text
Feature Branch

↓

Implement

↓

Verify

↓

Commit

↓

Pull Request
```

---

# Commit Messages

Recommended format:

```text
feat:

fix:

refactor:

docs:

test:

chore:
```

Examples:

```text
feat: implement product listing

fix: resolve checkout validation

docs: update API specification
```

---

# Logging Rules

Log:

- Startup Events
- Unexpected Errors
- Critical Failures

Do not log:

- Passwords
- Tokens
- Secrets
- Payment Credentials

---

# Performance Rules

Prefer:

- Efficient Queries
- Reusable Components
- Lazy Loading
- Pagination
- Query Caching

Avoid:

- Duplicate API Calls
- Unnecessary Re-renders
- Blocking Operations

---

# AI Decision Rules

When uncertain:

- Ask for clarification.
- Do not assume.
- Do not invent requirements.
- Do not create undocumented behavior.

---

# Forbidden Actions

The AI must never:

- Modify unrelated files.
- Change project architecture.
- Rename files without approval.
- Delete files without approval.
- Introduce undocumented features.
- Ignore documentation.
- Ignore compiler errors.
- Ignore lint errors.
- Skip validation.
- Bypass authentication.
- Expose sensitive information.

---

# Completion Criteria

A task is complete only when:

- Documentation requirements are satisfied.
- Code is implemented.
- TypeScript passes.
- ESLint passes.
- Build succeeds.
- No critical warnings remain.
- Changes stay within task scope.

---

# AI Response Format

After every completed task, the AI should provide:

```text
Completed

Files Modified

Files Created

Verification Results

Remaining Tasks

Known Limitations (if any)
```

Do not automatically continue to the next task.

Wait for user approval before proceeding.

---

# Continuous Improvement

If the AI identifies:

- Documentation inconsistencies
- Security risks
- Architecture problems
- Performance issues

It should:

- Report the issue.
- Explain the impact.
- Suggest improvements.

Do not implement improvements without approval.

---

## Definition of Done

This document is complete when:

- AI operating rules are clearly defined.
- Development workflow is standardized.
- Scope boundaries are enforced.
- Code quality expectations are documented.
- AI behavior is predictable across all supported coding assistants.

---

## References

- `20-role.md`
- `30-coding-standard.md`
- `40-folder-structure.md`
- `50-project-context.md`
- `60-architecture.md`
- `70-ui-ux-rules.md`
- `80-database-rules.md`
- `90-api-rules.md`
- `100-security-rules.md`
- `110-development-workflow.md`
- `170-system-architecture.md`
- `171-technology-stack.md`
- `177-testing-strategy.md`
- `185-deployment-checklist.md`
