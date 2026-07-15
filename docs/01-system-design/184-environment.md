# Auan-Auan-Platform

> Environment Configuration

## Document Information

| Item | Value |
| ---- | ----- |
| Document | Environment Configuration |
| Version | 1.0.0 |
| Status | Active |
| Owner | Project Team |
| Last Updated | 2026-07-13 |

---

## Purpose

This document defines all required environment variables for Auan-Auan-Platform.

Every sensitive configuration must be stored outside the source code.

---

## Design Principles

Environment variables must be:

- Secure
- Centralized
- Versioned
- Documented
- Environment-Specific

Secrets must never be committed to Git.

---

## Environment Files

Development

```text
.env
```

Production

```text
.env.production
```

Example Template

```text
.env.example
```

---

## Application

```text
NODE_ENV=development

PORT=3000

APP_NAME=Auan-Auan-Platform

APP_URL=http://localhost:3000

API_URL=http://localhost:3000/api/v1

FRONTEND_URL=http://localhost:5173
```

---

## Database

```text
DATABASE_URL=postgresql://username:password@localhost:5432/auan_auan_platform
```

Prisma uses:

```text
DATABASE_URL
```

---

## Authentication

```text
JWT_SECRET=your_super_secret_key

JWT_EXPIRES_IN=24h
```

Future

```text
JWT_REFRESH_SECRET=your_refresh_secret

JWT_REFRESH_EXPIRES_IN=30d
```

---

## LINE Login

```text
LINE_CHANNEL_ID=

LINE_CHANNEL_SECRET=

LINE_LIFF_ID=
```

Required for:

- LINE Login
- LIFF
- Customer Authentication

---

## LINE Messaging API

```text
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN=

LINE_MESSAGING_CHANNEL_SECRET=
```

Required for:

- Order Notifications
- Status Updates
- Customer Messages

---

## PromptPay

```text
PROMPTPAY_TYPE=PHONE

PROMPTPAY_ACCOUNT=0812345678

PROMPTPAY_NAME=Auan Auan
```

Future

```text
PROMPTPAY_DYNAMIC_QR=false
```

---

## Store Information

```text
STORE_NAME=Auan-Auan

STORE_PHONE=

STORE_EMAIL=

STORE_ADDRESS=
```

---

## Upload Configuration

```text
UPLOAD_PROVIDER=local

UPLOAD_PATH=uploads

MAX_UPLOAD_SIZE=5242880
```

Future providers:

- S3
- Cloudinary

---

## Logging

```text
LOG_LEVEL=info
```

Available values:

```text
error

warn

info

debug
```

---

## CORS

```text
CORS_ORIGIN=http://localhost:5173
```

Production should explicitly define allowed origins.

---

## Rate Limiting

```text
RATE_LIMIT_MAX=100

RATE_LIMIT_WINDOW=60000
```

Units:

```text
Milliseconds
```

---

## Cache

Future

```text
REDIS_HOST=

REDIS_PORT=

REDIS_PASSWORD=
```

---

## Email

Future

```text
SMTP_HOST=

SMTP_PORT=

SMTP_USERNAME=

SMTP_PASSWORD=

SMTP_FROM=
```

---

## Storage

Future

```text
AWS_ACCESS_KEY_ID=

AWS_SECRET_ACCESS_KEY=

AWS_REGION=

AWS_BUCKET=
```

---

## Monitoring

Future

```text
SENTRY_DSN=

OTEL_EXPORTER_ENDPOINT=
```

---

## Analytics

Future

```text
GOOGLE_ANALYTICS_ID=
```

---

## Feature Flags

```text
ENABLE_AI=false

ENABLE_ANALYTICS=false

ENABLE_REDIS=false
```

Future flags should follow:

```text
ENABLE_<FEATURE_NAME>
```

---

## Environment Validation

Every application startup must validate:

- Required Variables
- Empty Values
- Invalid Formats
- Duplicate Configuration

Application startup must fail if required variables are missing.

---

## Secret Management

Sensitive values include:

- JWT Secrets
- Database Passwords
- LINE Credentials
- API Keys
- SMTP Passwords
- Cloud Storage Credentials

Secrets must never appear in:

- Source Code
- Git Repository
- Logs
- Client Applications

---

## Environment Naming Rules

Use:

```text
UPPER_SNAKE_CASE
```

Examples:

```text
DATABASE_URL

JWT_SECRET

LINE_CHANNEL_ID

PROMPTPAY_ACCOUNT
```

Do not use:

```text
databaseUrl

jwtSecret

lineChannelId
```

---

## .env.example

The repository must include a sanitized:

```text
.env.example
```

It must contain:

- All required variables
- Placeholder values
- No secrets

---

## Production Checklist

Before deployment:

- All required variables exist.
- Secrets are securely stored.
- Production URLs are configured.
- CORS is verified.
- JWT secrets are unique.
- Database connection is tested.
- LINE credentials are verified.

---

## Future Enhancements

Future versions may include:

- Secret Manager Integration
- Docker Secrets
- Kubernetes Secrets
- Vault Integration
- Environment Encryption

---

## Definition of Done

The environment configuration is complete when:

- All variables are documented.
- Required secrets are identified.
- Naming conventions are defined.
- Validation requirements are documented.
- Production requirements are documented.

---

## References

- `100-security-rules.md`
- `171-technology-stack.md`
- `173-database-design.md`
- `175-authentication-authorization.md`
- `176-deployment-guidelines.md`
