# Auan-Auan-Platform

> Security Rules

## Document Information

| Item         | Value            |
| ------------ | ---------------- |
| Document     | Security Rules   |
| Version      | 1.0.0            |
| Status       | Active           |
| Owner        | Project Team     |
| Last Updated | 2026-07-13       |

## Purpose

This document defines the official security standards for Auan-Auan-Platform.

Every developer and AI assistant must follow these rules to protect customer data, business data, and system integrity.

## Security Principles

Follow these principles at all times:

- Least Privilege
- Defense in Depth
- Secure by Default
- Fail Securely
- Zero Trust
- Principle of Least Exposure

Security is a design requirement, not a feature.

## Authentication

Authentication is handled exclusively through:

- LINE LIFF Login

The application must never implement:

- Username and password authentication
- Custom password storage
- Password reset functionality

Authentication tokens must always be verified by the backend.

## Authorization

Authorization must always occur on the server.

Never trust:

- Client-side role checks
- Hidden UI elements
- Disabled buttons

Future authorization model:

- Customer
- Staff
- Manager
- Administrator

## HTTPS

All production traffic must use HTTPS.

Never transmit:

- Access tokens
- Session identifiers
- Customer information

over unsecured HTTP.

## Secrets Management

Never store secrets in source code.

Examples:

- API keys
- Database passwords
- LINE Channel Secret
- LINE Channel Access Token
- JWT secrets

Use environment variables.

Production secrets must never be committed to Git.

## Environment Variables

Sensitive configuration belongs in environment variables.

Examples:

```text
DATABASE_URL
LINE_CHANNEL_ID
LINE_CHANNEL_SECRET
LINE_CHANNEL_ACCESS_TOKEN
JWT_SECRET
```

Never expose environment variables to the frontend unless explicitly intended.

## Input Validation

Validate every external input.

Examples:

- Request body
- URL parameters
- Query parameters
- Headers
- Uploaded files

Never trust client input.

## Output Encoding

Always encode output appropriately.

Prevent:

- Cross-Site Scripting (XSS)
- HTML injection

Never render untrusted HTML.

## SQL Injection

Use Prisma ORM for all database access.

Avoid raw SQL whenever possible.

If raw SQL is required:

- Use parameterized queries.
- Never concatenate user input.

## Cross-Site Scripting (XSS)

Prevent XSS by:

- Escaping user-generated content
- Sanitizing HTML when required
- Avoiding unsafe rendering APIs

Never use dangerous HTML rendering unless absolutely necessary.

## Cross-Site Request Forgery (CSRF)

Protect state-changing endpoints against CSRF where applicable.

Review CSRF requirements whenever authentication mechanisms change.

## CORS

Restrict CORS origins.

Never use:

```text
*
```

in production.

Only allow trusted origins.

## File Uploads

Validate:

- File type
- File size
- File extension
- MIME type

Reject executable files.

Store uploaded files outside the application source directory.

## Logging

Log security-relevant events.

Examples:

- Login attempts
- Failed authentication
- Authorization failures
- Payment confirmation
- Administrative actions

Never log:

- Passwords
- Access tokens
- Secrets
- Payment credentials
- Personal sensitive information

## Error Handling

Error messages must never reveal:

- Database schema
- Stack traces
- Internal implementation
- Server paths
- SQL statements

Users should receive only actionable information.

## Session Management

Use secure session handling.

Requirements:

- Expiration
- Secure transmission
- Server-side validation

Invalidate sessions when appropriate.

## Rate Limiting

Protect public endpoints.

Examples:

- Login
- Checkout
- Payment confirmation
- Public APIs

Rate limits should be configurable.

## Dependency Management

Keep dependencies up to date.

Before adding a dependency:

- Verify maintenance status.
- Review security history.
- Minimize unnecessary packages.

Remove unused dependencies.

## Principle of Least Privilege

Every service should have only the permissions it requires.

Avoid granting excessive database or infrastructure privileges.

## Database Security

Use:

- Parameterized queries
- Least privilege accounts
- Backups
- Encryption where applicable

Never expose the database directly to the internet.

## API Security

Every endpoint must:

- Authenticate users when required.
- Authorize every protected action.
- Validate all input.
- Return safe error messages.

## Payment Security

The backend must verify payment status before updating an order.

Never trust payment status reported by the client.

Payment confirmation must be idempotent.

## Audit Logging

Critical operations must be auditable.

Examples:

- Order status changes
- Product updates
- Price changes
- Permission changes
- Payment confirmation

Audit logs should be immutable whenever possible.

## Backup and Recovery

Production systems must support:

- Automated backups
- Restore testing
- Disaster recovery procedures

Backups should be encrypted when stored externally.

## Security Reviews

Perform security reviews:

- Before production releases
- Before major architectural changes
- Before introducing third-party integrations

## Incident Response

Security incidents should follow this process:

```text
Detect
    ↓
Contain
    ↓
Investigate
    ↓
Recover
    ↓
Review
```

Every incident should produce a documented post-incident review.

## Definition of Done

A security-related implementation is complete only when:

- Authentication verified.
- Authorization verified.
- Input validation completed.
- Sensitive data protected.
- Logging reviewed.
- Error messages sanitized.
- Secrets managed correctly.
- Documentation updated.

## References

- `00-master-index.md`
- `30-tech-stack.md`
- `50-architecture.md`
- `80-database-rules.md`
- `90-api-rules.md`
