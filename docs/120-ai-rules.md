# Auan-Auan-Platform

> AI Operational Rules

## Document Information

| Item         | Value                |
| ------------ | -------------------- |
| Document     | AI Operational Rules |
| Version      | 1.0.0                |
| Status       | Active               |
| Owner        | Project Team         |
| Last Updated | 2026-07-13           |

## Purpose

This document defines repository-specific operating rules for AI assistants working on Auan-Auan-Platform.

These rules complement `20-role.md` by defining repository workflows, implementation boundaries, and collaboration policies.

## Scope

These rules apply to:

- GitHub Copilot
- ChatGPT
- Claude
- Cursor
- Codex
- Any future AI coding assistant

Every AI assistant must follow these rules before generating code or documentation.

## General Rules

Always:

- Read relevant documentation before implementation.
- Understand the feature before writing code.
- Follow the documented architecture.
- Follow the coding standards.
- Prefer existing implementations over creating new ones.

Never:

- Guess business rules.
- Ignore project standards.
- Modify unrelated files.
- Introduce undocumented architecture.

## Required Reading Order

Before starting implementation, AI should read documents in this order:

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
Relevant Feature Documents
```

Never skip architectural documents.

## Requirement Validation

If requirements are incomplete, AI must:

- Ask clarifying questions.
- Explain assumptions.
- Wait for confirmation before implementing uncertain behavior.

Never invent:

- Business logic
- Database fields
- API endpoints
- User workflows

## File Modification Policy

AI should modify only files related to the requested task.

Avoid unrelated formatting changes.

Avoid unnecessary refactoring.

Avoid modifying generated files unless explicitly requested.

## Documentation Policy

Whenever implementation changes:

- Architecture
- Database
- API
- Folder structure
- Configuration
- User workflow

AI must recommend updating the corresponding documentation.

## Feature Development Workflow

```text
Read Documentation
        ↓
Understand Requirements
        ↓
Identify Affected Files
        ↓
Plan Implementation
        ↓
Implement
        ↓
Review
        ↓
Test
        ↓
Update Documentation
```

## Code Generation Rules

Generated code must:

- Compile successfully.
- Follow TypeScript strict mode.
- Follow project naming conventions.
- Follow architectural boundaries.
- Avoid duplication.

Do not generate placeholder implementations unless explicitly requested.

## Architecture Rules

AI must not:

- Bypass service layers.
- Put business logic inside UI components.
- Access the database directly from controllers.
- Introduce circular dependencies.

Every implementation must respect the documented architecture.

## Refactoring Rules

Before refactoring:

- Verify existing behavior.
- Preserve functionality.
- Minimize breaking changes.

Refactor only when:

- Readability improves.
- Maintainability improves.
- Duplication decreases.
- Complexity decreases.

## Testing Policy

AI should recommend tests for:

- Business logic
- Services
- Utility functions
- Critical workflows

AI should not remove existing tests without justification.

## Dependency Policy

Before suggesting a new dependency:

- Verify whether an existing dependency already solves the problem.
- Consider bundle size.
- Consider maintenance.
- Consider security.
- Explain the trade-offs.

Avoid unnecessary dependencies.

## Security Policy

AI must never:

- Hardcode secrets.
- Store credentials.
- Expose sensitive information.
- Recommend insecure practices.

Security recommendations must align with `100-security-rules.md`.

## Performance Policy

Prefer:

- Efficient algorithms.
- Lazy loading where appropriate.
- Reusable components.
- Minimal database queries.

Avoid premature optimization.

## Error Handling Policy

AI must:

- Handle expected failures.
- Return meaningful errors.
- Avoid leaking implementation details.
- Follow the project's API response format.

## Communication Rules

Responses should be:

- Direct
- Technical
- Concise
- Evidence-based

When disagreeing:

- Explain why.
- Describe the risks.
- Suggest a better alternative.

Do not agree automatically.

## Review Checklist

Before completing any task, AI should verify:

- Requirements satisfied.
- Architecture respected.
- Coding standards followed.
- Security considered.
- Performance reviewed.
- Documentation updated if required.
- No unnecessary changes introduced.

## Prohibited Actions

AI must not:

- Rewrite unrelated files.
- Rename files without reason.
- Change project structure without approval.
- Ignore linting errors.
- Ignore TypeScript errors.
- Remove documentation.
- Introduce breaking changes without discussion.

## Definition of Success

An AI contribution is successful when it:

- Solves the requested problem.
- Improves code quality.
- Preserves architectural consistency.
- Reduces technical debt.
- Produces maintainable code.
- Keeps documentation synchronized.

## References

- `20-role.md`
- `30-tech-stack.md`
- `40-folder-structure.md`
- `50-architecture.md`
- `60-coding-standard.md`
- `70-ui-ux-rules.md`
- `80-database-rules.md`
- `90-api-rules.md`
- `100-security-rules.md`
- `110-development-workflow.md`
