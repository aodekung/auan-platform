# Auan-Auan-Platform

> Contributing Guide

## Document Information

| Item         | Value              |
| ------------ | ------------------ |
| Document     | Contributing Guide |
| Version      | 1.0.0              |
| Status       | Active             |
| Owner        | Project Team       |
| Last Updated | 2026-07-13         |

## Purpose

This document defines how developers and AI assistants contribute to Auan-Auan-Platform.

Every contribution should improve the project without reducing code quality, architectural consistency, or maintainability.

## Before You Start

Before implementing any feature, read the documentation in this order:

```text
00-master-index.md
10-project-context.md
20-role.md
30-tech-stack.md
40-folder-structure.md
50-architecture.md
60-coding-standard.md
70-ui-ux-rules.md
80-database-rules.md
90-api-rules.md
100-security-rules.md
110-development-workflow.md
120-ai-operational-rules.md
```

Do not start implementation before understanding the relevant documentation.

## Contribution Principles

Every contribution should:

- Solve one problem.
- Be easy to review.
- Follow project standards.
- Minimize technical debt.
- Preserve architectural consistency.

## Before Writing Code

Confirm the following:

- Requirements are clear.
- Existing implementations have been reviewed.
- No duplicate functionality exists.
- Architecture impact has been evaluated.

If requirements are unclear, request clarification before implementation.

## Implementation Rules

Every implementation must:

- Follow TypeScript strict mode.
- Follow project naming conventions.
- Follow documented folder structure.
- Respect architectural boundaries.
- Be production-ready.

Avoid placeholder implementations unless explicitly requested.

## Documentation Rules

Update documentation whenever changes affect:

- Architecture
- Database
- APIs
- Folder structure
- Configuration
- User workflows
- Development workflow

Documentation must remain synchronized with the codebase.

## Pull Request Requirements

Every pull request should include:

- Clear summary
- Reason for the change
- Scope of the change
- Testing performed
- Documentation updates (if applicable)

One pull request should address one logical change.

## Review Checklist

Before requesting review, verify:

- Project builds successfully.
- ESLint passes.
- TypeScript passes.
- Tests pass.
- No unused code remains.
- Documentation is updated.

## Code Review Expectations

Reviewers should evaluate:

- Correctness
- Readability
- Maintainability
- Security
- Performance
- Architecture
- Naming consistency
- Error handling

Feedback should be constructive and technically justified.

## Dependency Policy

Before adding a dependency:

- Verify necessity.
- Evaluate maintenance status.
- Review security history.
- Consider bundle size.
- Prefer existing project dependencies.

## Refactoring Policy

Refactoring should:

- Improve readability.
- Reduce duplication.
- Preserve behavior.
- Avoid unrelated changes.

Large refactoring should be performed separately from feature development.

## Testing Expectations

Critical business logic should include tests.

Recommended priorities:

- Services
- Utilities
- Business rules
- API endpoints

UI testing may be added as the project evolves.

## Commit Quality

Every commit should:

- Be focused.
- Be reversible.
- Build successfully.
- Follow Conventional Commits.

Examples:

```text
feat: add checkout endpoint
fix: prevent duplicate payment confirmation
refactor: simplify order validation
docs: update api rules
test: add order service tests
```

## Prohibited Contributions

Do not:

- Commit secrets.
- Disable linting rules.
- Ignore TypeScript errors.
- Introduce breaking changes without approval.
- Modify unrelated files.
- Bypass architectural layers.
- Duplicate business logic.

## Continuous Improvement

Contributors are encouraged to:

- Improve readability.
- Reduce complexity.
- Remove duplication.
- Improve documentation.
- Identify technical debt.

Improvements should be incremental and well documented.

## Definition of Success

A contribution is successful when it:

- Solves the intended problem.
- Follows project standards.
- Passes all quality checks.
- Preserves architectural consistency.
- Improves maintainability.
- Keeps documentation up to date.

## References

- `00-master-index.md`
- `20-role.md`
- `50-architecture.md`
- `60-coding-standard.md`
- `110-development-workflow.md`
- `120-ai-operational-rules.md`
