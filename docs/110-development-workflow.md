# Auan-Auan-Platform

> Development Workflow

## Document Information

| Item         | Value                 |
| ------------ | --------------------- |
| Document     | Development Workflow  |
| Version      | 1.0.0                 |
| Status       | Active                |
| Owner        | Project Team          |
| Last Updated | 2026-07-13            |

## Purpose

This document defines the official development workflow for Auan-Auan-Platform.

All developers and AI assistants must follow this workflow to ensure consistency, code quality, maintainability, and reliable releases.

## Development Philosophy

Every change should be:

- Small
- Incremental
- Reviewable
- Testable
- Reversible

Avoid large, unrelated changes in a single branch.

## Development Lifecycle

```text
Planning
    ↓
Design
    ↓
Implementation
    ↓
Testing
    ↓
Code Review
    ↓
Approval
    ↓
Merge
    ↓
Deployment
```

Every feature must follow this lifecycle.

## Feature Workflow

```text
Requirement
    ↓
Architecture Review
    ↓
Task Breakdown
    ↓
Feature Branch
    ↓
Implementation
    ↓
Testing
    ↓
Pull Request
    ↓
Review
    ↓
Merge
```

Do not skip any step.

## Git Workflow

Branch strategy:

```text
main
    │
    ├── feature/*
    ├── bugfix/*
    ├── hotfix/*
    ├── refactor/*
    ├── docs/*
    ├── test/*
    └── chore/*
```

Direct commits to `main` are prohibited.

## Branch Naming

Use:

```text
feature/add-shopping-cart
feature/order-checkout
bugfix/payment-timeout
hotfix/order-status
refactor/api-validation
docs/update-architecture
test/order-service
chore/update-dependencies
```

Use lowercase letters and kebab-case.

## Commit Convention

Follow Conventional Commits.

Examples:

```text
feat: add shopping cart
fix: resolve payment validation issue
refactor: simplify checkout workflow
docs: update architecture documentation
test: add order service tests
chore: update dependencies
```

Avoid vague commit messages.

Bad

```text
update
fix
change
```

## Pull Request Rules

Each pull request should:

- Solve one problem.
- Remain reasonably small.
- Include a clear description.
- Pass all checks.
- Be reviewed before merging.

## Code Review Checklist

Review:

- Correctness
- Readability
- Maintainability
- Security
- Performance
- Architecture
- Naming
- Error handling
- Documentation

Reviewers should explain requested changes.

## AI Collaboration Workflow

AI assistants should:

- Read project documentation first.
- Understand requirements.
- Ask questions when requirements are unclear.
- Follow architecture.
- Follow coding standards.

AI must never invent business rules.

## Documentation Workflow

Documentation must be updated whenever changes affect:

- Architecture
- APIs
- Database
- User workflow
- Configuration

Documentation is part of the implementation.

## Testing Workflow

Minimum testing sequence:

```text
Unit Test
    ↓
Integration Test
    ↓
Manual Verification
```

Critical business workflows should always be tested.

## Refactoring Workflow

Before refactoring:

- Understand existing behavior.
- Preserve functionality.
- Add tests when necessary.

After refactoring:

- Verify functionality.
- Run all tests.
- Review performance impact.

## Dependency Workflow

Before adding a dependency:

- Check existing solutions.
- Verify maintenance status.
- Review license compatibility.
- Evaluate security risks.

Avoid unnecessary dependencies.

## Migration Workflow

Database changes must follow:

```text
Update Prisma Schema
        ↓
Generate Migration
        ↓
Review Migration
        ↓
Apply Migration
        ↓
Verify Data
```

Never modify production schemas manually.

## Release Workflow

```text
Development
    ↓
Testing
    ↓
Code Review
    ↓
Approval
    ↓
Production Release
```

Every release must be reproducible.

## Rollback Strategy

Every deployment should support rollback.

Rollback procedures should be documented before production releases.

## Issue Management

Every issue should include:

- Description
- Expected behavior
- Actual behavior
- Steps to reproduce
- Priority
- Acceptance criteria

## Definition of Ready

A task is ready when:

- Requirements are clear.
- Acceptance criteria are defined.
- Dependencies are identified.
- Architecture impact is understood.

## Definition of Done

A task is complete only when:

- Requirements implemented.
- Code reviewed.
- Tests passed.
- Lint passed.
- TypeScript passed.
- Documentation updated.
- No known critical issues remain.

## Continuous Improvement

After completing significant work:

- Review implementation.
- Identify improvements.
- Reduce technical debt.
- Update documentation when necessary.

Continuous improvement is part of the development process.

## References

- `00-master-index.md`
- `20-role.md`
- `50-architecture.md`
- `60-coding-standard.md`
- `80-database-rules.md`
- `90-api-rules.md`
- `100-security-rules.md`
