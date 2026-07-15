# Auan-Auan-Platform

> Feature: LINE Login

## Document Information

| Item         | Value                 |
| ------------ | --------------------- |
| Document     | LINE Login Feature    |
| Version      | 1.0.0                 |
| Status       | Active                |
| Owner        | Project Team          |
| Last Updated | 2026-07-13            |

---

## Purpose

This document defines the LINE Login feature for Auan-Auan-Platform -- the sole authentication mechanism for all customers.

The application is a LINE LIFF food ordering app serving residents of Regent Home Bangson. LINE Login provides passwordless, frictionless authentication by leveraging the customer's existing LINE account identity. Every customer interaction (browsing menus, placing orders, making payments) requires a valid authenticated session established through this feature.

This specification covers the complete authentication flow from LIFF initialization through JWT issuance, including all error states, security requirements, and integration points.

---

## Scope

### Included

- LIFF SDK initialization and lifecycle management
- LINE Login authentication (via LIFF `login()` method)
- LINE ID Token retrieval (via LIFF `getIDToken()`)
- Backend verification of LINE ID Token against LINE API
- Customer auto-creation on first login
- JWT access token generation and issuance (24-hour expiry)
- JWT storage on the client
- Token refresh via re-authentication (no refresh token in MVP)
- Logout flow (client-side token removal)
- Authentication middleware for protected routes
- Loading states and error feedback on all login screens

### Excluded

- Refresh token mechanism (future)
- Multi-factor authentication (future)
- Email/password authentication (explicitly prohibited per `100-security-rules.md`)
- Social login other than LINE (future)
- Admin/staff authentication via LINE Login (future)
- Token revocation / blacklist (future)
- Session dashboard (future)
- Login history tracking (future)
- Device management (future)

---

## Architecture / Flow Explanation

LINE Login follows the **LIFF ID Token Login** pattern, which is the recommended approach for LINE LIFF applications. The flow does not require a custom OAuth redirect; instead, LIFF manages the LINE login internally and provides an ID Token directly to the application.

### Why LIFF ID Token (not OAuth)

The application runs inside the LINE in-app browser as a LIFF app. Using LIFF's built-in `login()` and `getIDToken()` methods provides:

- Seamless in-app experience (no browser redirect outside LINE)
- ID Token obtained without additional HTTP calls to LINE on the client
- Reduced latency compared to full OAuth redirect flow
- Simpler client-side code

### High-Level Flow

```text
Customer opens LIFF App
        |
        v
liff.init({ liffId: LIFF_ID })
        |
        v
Check liff.isLoggedIn()
        |
    +---+---+
    |       |
    v       v
  True    False
    |       |
    v       v
Get ID    liff.login()
Token       |
    |       v
    +<------+
    |
    v
Send ID Token to Backend
(POST /api/v1/auth/login)
        |
        v
Backend verifies ID Token
with LINE API
(POST https://api.line.me/oauth2/v2.1/verify)
        |
    +---+---+
    |       |
    v       v
Valid    Invalid
    |       |
    v       v
Find or   Return 401
Create    (Authentication Error)
Customer
    |
    v
Generate JWT
(userId, role, lineUserId, exp, iat)
        |
        v
Return JWT to Client
        |
        v
Client stores JWT
(Use in Authorization header)
        |
        v
Authenticated Session
```

---

## Functional Requirements

### FR-01: LIFF SDK Initialization

**Priority:** Critical

1. On application load, the frontend must call `liff.init()` with the configured `LIFF_ID`.
2. The `LIFF_ID` must be loaded from an environment variable (`VITE_LIFF_ID` or equivalent), never hardcoded.
3. `liff.init()` must be awaited before any other LIFF API calls.
4. If `liff.init()` fails, the application must display an error message and not proceed: `"Unable to start the application. Please try again."`

**Implementation reference:**

```typescript
await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
```

---

### FR-02: Login State Detection

**Priority:** Critical

1. After successful `liff.init()`, check `liff.isLoggedIn()`.
2. If `true`, proceed to retrieve the ID Token (FR-04).
3. If `false`, display the login screen and initiate login (FR-03).

---

### FR-03: LINE Login Initiation

**Priority:** Critical

1. When the customer taps "Login with LINE" or the auto-login triggers, call `liff.login()`.
2. `liff.login()` redirects the user to LINE's authorization consent screen within the LIFF browser.
3. After the customer authorizes, LIFF redirects back to the application.
4. On return, `liff.isLoggedIn()` must be `true`.
5. If `liff.login()` fails or the user cancels authorization, display: `"Login was cancelled. Please try again."`

**Implementation reference:**

```typescript
if (!liff.isLoggedIn()) {
  liff.login();
}
```

---

### FR-04: ID Token Retrieval

**Priority:** Critical

1. After confirming `liff.isLoggedIn()` is `true`, call `liff.getIDToken()`.
2. The ID Token is a JWT signed by LINE containing the customer's `sub` (LINE User ID), `aud` (LIFF ID), and `exp` (expiration).
3. If `liff.getIDToken()` returns `null` or throws, the customer must re-authenticate by calling `liff.login()` again.

**Implementation reference:**

```typescript
const idToken = liff.getIDToken();
if (!idToken) {
  liff.login();
  return;
}
```

---

### FR-05: Backend Authentication (POST /auth/login)

**Priority:** Critical

1. The frontend sends the LINE ID Token to `POST /api/v1/auth/login`.
2. The backend receives the ID Token in the request body.
3. The backend verifies the ID Token by calling the LINE API verification endpoint.
4. On successful verification, the backend looks up the customer by `line_user_id`.
5. If no customer exists, the backend creates a new customer record.
6. The backend generates a JWT and returns it to the client.

**Detailed steps:**

| Step | Action | Details |
| ---- | ------ | ------- |
| 5.1 | Receive request | Extract `idToken` from request body |
| 5.2 | Validate input | Ensure `idToken` is a non-empty string (Zod validation) |
| 5.3 | Verify with LINE | Call LINE API to verify ID Token |
| 5.4 | Extract claims | Extract `sub` (LINE User ID), `name`, `picture` from LINE response |
| 5.5 | Find customer | Query `customers` table by `line_user_id` |
| 5.6 | Create if new | If not found, create new customer with LINE profile data |
| 5.7 | Generate JWT | Sign JWT with `JWT_SECRET`, include required claims |
| 5.8 | Return response | Return JWT in standard response envelope |

---

### FR-06: Customer Auto-Creation

**Priority:** High

1. When a LINE User ID is not found in the `customers` table, create a new customer record.
2. The customer's `display_name` and `picture_url` must be populated from the LINE ID Token claims.
3. The customer's `role` must default to `"CUSTOMER"`.
4. The customer's `status` must default to `"ACTIVE"`.
5. The `line_user_id` must be stored for future login lookups.
6. A `created_at` and `updated_at` timestamp must be set automatically.

---

### FR-07: JWT Generation

**Priority:** Critical

1. The backend must generate a JWT signed with `JWT_SECRET` (environment variable).
2. The JWT must use the `HS256` algorithm.
3. The JWT must contain the payload fields defined in the Data Requirements section below.
4. The JWT expiration must be **24 hours** from issuance (`exp` = current time + 86400 seconds).
5. The `iat` (issued at) must be the current Unix timestamp.
6. Sensitive customer data (phone, room number, payment info) must **never** be included in the JWT.

**Implementation reference:**

```typescript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  {
    userId: customer.id,
    role: customer.role,
    lineUserId: customer.line_user_id,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    iat: Math.floor(Date.now() / 1000),
  },
  process.env.JWT_SECRET,
  { algorithm: 'HS256' }
);
```

---

### FR-08: Client-Side Token Storage

**Priority:** Critical

1. After receiving the JWT from the backend, the frontend must store it for use in subsequent API requests.
2. The token must be included in the `Authorization` header as `Bearer <token>` for all protected API calls.
3. The token storage mechanism must survive page reloads within the LIFF session.

---

### FR-09: Authentication Middleware

**Priority:** Critical

1. Every protected API endpoint must pass through authentication middleware.
2. The middleware must extract the JWT from the `Authorization: Bearer <token>` header.
3. The middleware must verify:
   - JWT signature is valid
   - JWT has not expired (`exp` > current time)
   - `userId` exists in the `customers` table
   - Customer `status` is `"ACTIVE"`
4. If any check fails, return `401 Unauthorized`.
5. If verification passes, attach the decoded payload to the request context for downstream handlers.

---

### FR-10: Token Expiration Handling

**Priority:** High

1. When a JWT expires, any protected API call returns `401 Unauthorized`.
2. The frontend must detect `401` responses and trigger re-authentication.
3. Re-authentication calls `liff.getIDToken()` (if still logged in to LIFF) and sends a new `POST /auth/login` request.
4. If `liff.isLoggedIn()` is `false`, redirect to the login screen.

---

### FR-11: Logout

**Priority:** High

1. The customer can trigger logout from the profile/settings screen.
2. Logout calls `POST /api/v1/auth/logout` (for audit logging on the backend).
3. The frontend removes the stored JWT.
4. The frontend optionally calls `liff.logout()` to end the LINE LIFF session.
5. The application returns to the login/welcome screen.

---

### FR-12: Login Screen UI

**Priority:** High

The login screen must follow the UI/UX rules defined in `70-ui-ux-rules.md`:

1. **Welcome message:** Display the app name "Auan Auan" and a brief welcome text.
2. **Login button:** A prominent button labeled "Login with LINE" (not "OK", "Submit", or "Click Here" per UI rules).
3. **Loading state:** While `liff.init()` is in progress, display a loading spinner. No blank screen.
4. **Error state:** If LIFF initialization fails, display: `"Unable to start the application. Please try again."` with a retry button.
5. **Auto-login:** If `liff.isLoggedIn()` returns `true`, skip the login screen and proceed directly to authentication (FR-04 through FR-05) silently.
6. **Mobile-first design:** Designed for 320px+ width per responsive design rules.

---

### FR-13: Profile Retrieval (GET /auth/profile)

**Priority:** Medium

1. After login, the frontend may fetch the current customer profile via `GET /api/v1/auth/profile`.
2. This endpoint requires a valid JWT.
3. Returns the customer's profile data (name, picture, room info if set).

---

## Business Rules

### BR-01: LINE Login is the Only Authentication Method

The system must **never** implement username/password authentication, custom password storage, or password reset functionality. This is a security requirement defined in `100-security-rules.md`.

### BR-02: Auto-Registration on First Login

A customer account is created automatically on first successful LINE login. There is no separate registration flow. This minimizes friction for users.

### BR-03: One LINE Account = One Customer

Each LINE User ID maps to exactly one customer record. If a customer logs in again, the existing record is retrieved -- a new record is not created.

### BR-04: Default Role is CUSTOMER

All customers created through LINE Login receive the `CUSTOMER` role. Role elevation (e.g., to OWNER, STAFF) is a separate administrative action not covered by this feature.

### BR-05: JWT Expiration is 24 Hours

The access token expires after 24 hours as defined in `175-authentication-authorization.md`. There is no refresh token in the MVP; the customer must re-authenticate via LINE Login.

### BR-06: Backend Must Always Verify Tokens

Authentication tokens must always be verified by the backend. Client-side role checks are not trusted per `100-security-rules.md`.

### BR-07: Statelessness

The authentication system is stateless. No server-side session storage is used. All authentication state is carried in the JWT per `175-authentication-authorization.md`.

---

## Technical Requirements

### TR-01: LIFF SDK

| Item | Value |
| ---- | ----- |
| SDK | `@line/liff` |
| Version | Latest stable (v2.x) |
| Package | `npm install @line/liff` |
| Documentation | <https://developers.line.biz/en/docs/liff/> |

**Required LIFF SDK calls:**

```typescript
// Initialize LIFF
await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });

// Check login state
const isLoggedIn = liff.isLoggedIn(); // returns boolean

// Initiate LINE Login
liff.login();

// Get ID Token
const idToken = liff.getIDToken(); // returns string | null

// Logout from LIFF
liff.logout();
```

**LIFF ID configuration:**

```text
Environment Variable: VITE_LIFF_ID
Source: LINE Developers Console > LIFF > LIFF App
Scope: Frontend only (never exposed in server-side code)
```

**Required LIFF app settings:**

- LIFF App Type: Full-screen (recommended for food ordering)
- Login Scopes: `profile`, `openid`
- OIDC: Must be enabled for ID Token support

---

### TR-02: LINE API -- ID Token Verification

The backend must verify the ID Token by calling the LINE API:

| Item | Value |
| ---- | ----- |
| Endpoint | `https://api.line.me/oauth2/v2.1/verify` |
| Method | `POST` |
| Content-Type | `application/x-www-form-urlencoded` |

**Request parameters:**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| `id_token` | string | Yes | The ID Token received from the LIFF SDK |
| `client_id` | string | Yes | The LINE Channel ID (from `LINE_CHANNEL_ID` env var) |

**Request example:**

```http
POST /oauth2/v2.1/verify HTTP/1.1
Host: api.line.me
Content-Type: application/x-www-form-urlencoded

id_token=eyJhbGciOiJIUzI1NiIs...&client_id=1234567890
```

**Successful response (200 OK):**

```json
{
  "iss": "https://access.line.me",
  "sub": "U1234567890abcdef1234567890abcdef",
  "aud": "1234567890",
  "exp": 1750000000,
  "iat": 1749913600,
  "nonce": "abc123",
  "amr": ["pwd"],
  "name": "John Doe",
  "picture": "https://profile.line-scdn.net/...",
  "email": "john@example.com"
}
```

**Error responses:**

| HTTP Status | Error | Meaning |
| ------------ | ----- | ------- |
| 400 | `INVALID_ID_TOKEN` | ID Token is malformed or invalid |
| 401 | `INVALID_CLIENT` | `client_id` does not match |
| 401 | `EXPIRED_ID_TOKEN` | ID Token has expired |

**Backend implementation reference:**

```typescript
async function verifyLineIdToken(idToken: string): Promise<LineIdTokenPayload> {
  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      id_token: idToken,
      client_id: process.env.LINE_CHANNEL_ID,
    }),
  });

  if (!response.ok) {
    throw new AuthenticationError('LINE ID Token verification failed');
  }

  return response.json();
}
```

---

### TR-03: JWT Token

| Item | Value |
| ---- | ----- |
| Library | `jsonwebtoken` (Node.js) |
| Algorithm | `HS256` |
| Signing Secret | `JWT_SECRET` environment variable |
| Expiration | 24 hours (86400 seconds) |

**Environment variables:**

```text
JWT_SECRET          # Signing key for JWT (strong random string, minimum 32 characters)
LINE_CHANNEL_ID     # LINE Login channel ID (for ID Token verification)
LINE_CHANNEL_SECRET # LINE Login channel secret (reserved for future use)
```

---

### TR-04: Frontend API Client

All authenticated API requests must include the JWT in the Authorization header:

```typescript
const response = await fetch('/api/v1/orders', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
});
```

The API client (e.g., Axios interceptor or fetch wrapper) must:

1. Attach the `Authorization` header automatically for all requests.
2. Intercept `401` responses and trigger re-authentication.
3. Queue concurrent requests during re-authentication and retry them after successful token refresh.

---

### TR-05: Dependencies

| Dependency | Purpose | Used By |
| ---------- | ------- | ------- |
| `@line/liff` | LIFF SDK for LINE Login | Frontend |
| `jsonwebtoken` | JWT signing and verification | Backend |
| `@line/liff` config in LINE Developers Console | LIFF app registration and configuration | Platform setup |

**Dependent features (this feature must be implemented first):**

- F002: Menu browsing (requires authenticated session for personalized features)
- F003: Product detail (requires authenticated session)
- F004: Cart (requires authenticated session)
- F005: Checkout (requires authenticated session)
- F006: Payment (requires authenticated session)
- F007: Order management (requires authenticated session)

---

## Workflow

```text
+------------------+       +------------------+       +------------------+
|    Customer      |       |   LIFF Frontend  |       |     Backend      |
|   (LINE App)     |       |   (React/Vue)    |       |   (Fastify)      |
+--------+---------+       +--------+---------+       +--------+---------+
         |                          |                          |
         |  1. Open LIFF App       |                          |
         |------------------------->|                          |
         |                          |                          |
         |                          |  2. liff.init()         |
         |                          |-------------------> LIFF |
         |                          |<------------------- LIFF|
         |                          |                          |
         |                          |  3. liff.isLoggedIn()?  |
         |                          |                          |
         |               +----------+----------+               |
         |               | Yes                  | No           |
         |               v                      v              |
         |          4. getIDToken()      5. liff.login()       |
         |               |                      |              |
         |               |              6. User authorizes    |
         |               |                 in LINE              |
         |               |                      |              |
         |               |              7. Redirect back       |
         |               |                      v              |
         |               +----------> 8. getIDToken()          |
         |                          |                          |
         |                          |  9. POST /auth/login    |
         |                          |  { idToken: "..." }     |
         |                          |------------------------->|
         |                          |                          |
         |                          |              10. Verify  |
         |                          |              with LINE   |
         |                          |              API        |
         |                          |                          |
         |                          |              11. Find/   |
         |                          |              Create      |
         |                          |              Customer    |
         |                          |                          |
         |                          |              12. Generate|
         |                          |              JWT         |
         |                          |                          |
         |                          | 13. { success: true,     |
         |                          |       data: { token,     |
         |                          |       user } }           |
         |                          |<-------------------------|
         |                          |                          |
         |                          | 14. Store JWT            |
         |                          |                          |
         |  15. Show authenticated  |                          |
         |      application         |                          |
         |<-------------------------|                          |
         |                          |                          |
```

---

## Data Requirements

### Customer Fields (from LINE ID Token to Database)

| Field | Source | Database Column | Type | Required | Description |
| ----- | ------ | --------------- | ---- | -------- | ----------- |
| `id` | Generated | `id` | UUID | Yes | Primary key, auto-generated |
| `lineUserId` | LINE `sub` | `line_user_id` | VARCHAR | Yes | Unique LINE User ID |
| `displayName` | LINE `name` | `display_name` | VARCHAR | No | Display name from LINE profile |
| `pictureUrl` | LINE `picture` | `picture_url` | VARCHAR | No | Profile picture URL from LINE |
| `role` | Default | `role` | VARCHAR | Yes | Defaults to `"CUSTOMER"` |
| `status` | Default | `status` | VARCHAR | Yes | Defaults to `"ACTIVE"` |
| `createdAt` | System | `created_at` | TIMESTAMP | Yes | Auto-generated on creation |
| `updatedAt` | System | `updated_at` | TIMESTAMP | Yes | Auto-updated on change |

**Note:** Future fields such as `phone`, `room_number`, `building` will be added by the customer profile management feature, not by LINE Login.

### JWT Payload Fields

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `userId` | string (UUID) | Yes | Customer primary key from database |
| `role` | string | Yes | Customer role (e.g., `"CUSTOMER"`, `"OWNER"`) |
| `lineUserId` | string | Yes | LINE User ID for reference and debugging |
| `exp` | number | Yes | Expiration time as Unix timestamp (iat + 86400) |
| `iat` | number | Yes | Issued-at time as Unix timestamp |

**JWT payload example:**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "CUSTOMER",
  "lineUserId": "U1234567890abcdef1234567890abcdef",
  "exp": 1750099999,
  "iat": 1750013600
}
```

**Prohibited in JWT (per `100-security-rules.md` and `175-authentication-authorization.md`):**

- Passwords
- Phone numbers
- Room numbers
- Payment credentials
- Email addresses
- Any personally identifiable information beyond identity reference

---

## Database Considerations

### Customers Table

The `customers` table is defined in `173-database-design.md`. The following indexes are required for LINE Login:

| Index | Column | Purpose |
| ----- | ------ | ------- |
| Primary Key | `id` (UUID) | Standard row lookup |
| Unique Index | `line_user_id` | Fast lookup during login, prevents duplicate LINE accounts |
| Standard Index | `created_at` | Sorting and audit queries |

### Prisma Schema Reference

```prisma
model Customer {
  id            String   @id @default(uuid())
  line_user_id  String   @unique // LINE User ID, unique constraint
  display_name  String?  // From LINE profile
  picture_url   String?  // From LINE profile
  role          String   @default("CUSTOMER")
  status        String   @default("ACTIVE")
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  orders Order[]

  @@map("customers")
}
```

### Index Strategy

Per `173-database-design.md` Index Strategy section, `line_user_id` must have a unique index to:

1. Enforce one-to-one mapping between LINE accounts and customers.
2. Provide fast O(1) lookup during authentication.
3. Prevent race conditions from creating duplicate customers during concurrent first-logins.

### Transaction Considerations

Customer creation during first login should use a database transaction to prevent race conditions if two requests arrive simultaneously for the same `line_user_id`. The unique constraint on `line_user_id` provides a safety net, but transactional `find-or-create` logic is preferred:

```typescript
const customer = await prisma.customer.upsert({
  where: { line_user_id: lineUserId },
  create: {
    line_user_id: lineUserId,
    display_name: displayName,
    picture_url: pictureUrl,
    role: 'CUSTOMER',
    status: 'ACTIVE',
  },
  update: {
    display_name: displayName,
    picture_url: pictureUrl,
    updated_at: new Date(),
  },
});
```

---

## API Considerations

### POST /api/v1/auth/login

Authenticates a customer using a LINE ID Token.

**Classification:** Public (no JWT required)

**Request:**

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `idToken` | string | Yes | LINE ID Token from `liff.getIDToken()` |

**Request example:**

```json
{
  "idToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYiLCJhdWQiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNzUwMDAwMDAwLCJpYXQiOjE3NDk5MTM2MDAsIm5hbWUiOiJKb2huIERvZSIsInBpY3R1cmUiOiJodHRwczovL3Byb2ZpbGUubGluZS1zY2RuLm5ldC8uLi4ifQ.signature"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoiQ1VTVE9NRVIiLCJsaW5lVXNlcklkIjoiVTEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmIiwiZXhwIjoxNzUwMDk5OTk5LCJpYXQiOjE3NTAwMTM2MDB9.signature",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "displayName": "John Doe",
      "pictureUrl": "https://profile.line-scdn.net/...",
      "role": "CUSTOMER",
      "isNewUser": false
    }
  }
}
```

**Error responses:**

| Status | Condition | Response |
| ------ | --------- | -------- |
| `400` | Missing or empty `idToken` | `{ "success": false, "message": "ID Token is required", "error": { "code": "VALIDATION_ERROR" } }` |
| `401` | LINE API rejected the ID Token | `{ "success": false, "message": "Please sign in again.", "error": { "code": "AUTHENTICATION_ERROR" } }` |
| `500` | Internal error during customer creation | `{ "success": false, "message": "Something went wrong. Please try again later.", "error": { "code": "INTERNAL_ERROR" } }` |

---

### POST /api/v1/auth/logout

Logs out the current customer.

**Classification:** Protected (JWT required)

**Request:**

No request body required. JWT must be provided in the `Authorization` header.

**Request example:**

```http
POST /api/v1/auth/logout HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error responses:**

| Status | Condition | Response |
| ------ | --------- | -------- |
| `401` | Missing or invalid JWT | `{ "success": false, "message": "Please sign in again.", "error": { "code": "AUTHENTICATION_ERROR" } }` |

**Note:** In the MVP stateless architecture, logout is primarily a client-side action (token removal). The backend endpoint exists for audit logging purposes (logging the logout event per `175-authentication-authorization.md`).

---

### GET /api/v1/auth/profile

Returns the current authenticated customer's profile.

**Classification:** Protected (JWT required)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "John Doe",
    "pictureUrl": "https://profile.line-scdn.net/...",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2026-07-13T10:00:00.000Z"
  }
}
```

---

## Security Considerations

### SC-01: ID Token Verification is Mandatory

The backend must **always** verify the LINE ID Token with the LINE API before trusting any claims. Never trust a client-supplied `lineUserId` or `role` directly. This is the core zero-trust requirement.

### SC-02: JWT Secret Management

- `JWT_SECRET` must be stored as an environment variable, never in source code.
- Must be a cryptographically strong random string (minimum 32 characters).
- Must be different between development, staging, and production environments.
- Must be rotated periodically in production.

### SC-03: Token Expiration Enforcement

- JWT expiration (`exp` claim) must be checked on **every** protected request.
- Expired tokens must be rejected with `401 Unauthorized`.
- The frontend must not attempt to use an expired token.

### SC-04: LINE Channel Credentials

- `LINE_CHANNEL_ID` and `LINE_CHANNEL_SECRET` must be stored as environment variables.
- These must never be exposed to the frontend.
- The `LINE_CHANNEL_ID` used for ID Token verification is a backend-only value, distinct from the `LIFF_ID` used on the frontend.

### SC-05: No Sensitive Data in JWT

Per `175-authentication-authorization.md`: "Sensitive information must never be stored inside the JWT." The JWT must contain only the minimum fields needed for authorization: `userId`, `role`, `lineUserId`, `exp`, `iat`.

### SC-06: HTTPS Only

Per `100-security-rules.md`: All production traffic must use HTTPS. ID Tokens and JWTs must never be transmitted over unsecured HTTP.

### SC-07: Rate Limiting on Login Endpoint

Per `100-security-rules.md`: The `POST /auth/login` endpoint must be rate-limited to prevent abuse. Recommended: maximum 10 login attempts per IP per minute.

### SC-08: Error Messages Must Not Leak Internal Details

Per `100-security-rules.md`: Error messages must never reveal database schema, stack traces, internal implementation, server paths, or SQL statements. All authentication errors must return the generic message `"Please sign in again."` to the client.

### SC-09: Audit Logging

Per `175-authentication-authorization.md`, the following events must be logged:

| Event | Logged Data |
| ----- | ----------- |
| Successful login | Timestamp, userId, lineUserId |
| Failed login (LINE API rejection) | Timestamp, error type (not token details) |
| Logout | Timestamp, userId |
| Token expired (401) | Timestamp, userId (if extractable) |
| Unauthorized access attempt | Timestamp, endpoint, IP (future) |

**Must never log:** ID Tokens, JWTs, secrets, or any sensitive credential.

### SC-10: CORS Configuration

Per `100-security-rules.md`: CORS origins must be restricted to trusted origins only. The wildcard `*` must never be used in production. Only the LIFF app origin and authorized domains should be allowed.

---

## Testing Considerations

### Unit Tests

| Test Case | Description |
| --------- | ----------- |
| LIFF initialization | `liff.init()` resolves with correct LIFF ID |
| Login state detection | `liff.isLoggedIn()` returns correct boolean |
| Login initiation | `liff.login()` is called when user is not logged in |
| ID Token retrieval | `liff.getIDToken()` returns a non-null string after login |
| JWT generation | JWT contains all required fields and correct expiry |
| JWT signing | JWT signature is valid with `JWT_SECRET` |
| JWT expiration | Expired JWT is rejected by middleware |
| Customer lookup | Existing customer found by `line_user_id` |
| Customer creation | New customer created with correct defaults on first login |
| Duplicate prevention | `upsert` prevents duplicate customer records |

### Integration Tests

| Test Case | Description |
| --------- | ----------- |
| Full login flow | LIFF init -> login -> ID token -> backend verify -> JWT -> authenticated request |
| LINE API verification | Backend correctly calls LINE API and handles success/error responses |
| Auth middleware | Protected endpoint rejects request without valid JWT, accepts with valid JWT |
| 401 interception | Frontend detects 401 and triggers re-authentication |
| Logout flow | Token removal and audit logging |

### Error Scenario Tests

| Test Case | Description |
| --------- | ----------- |
| Invalid ID Token | Backend returns 401 when LINE API rejects ID Token |
| Expired ID Token | Backend returns 401 when LINE API returns `EXPIRED_ID_TOKEN` |
| Missing ID Token | Backend returns 400 when request body lacks `idToken` |
| LIFF init failure | Frontend displays error message and does not crash |
| Network failure during login | Frontend shows "Network connection failed. Please try again." |
| LINE API unavailable | Backend returns generic error, logs internally |
| Concurrent first-logins | Only one customer record created for same LINE User ID |

### Test Environment

- Use a dedicated LINE LIFF ID for testing (never production).
- Use a test `JWT_SECRET` separate from production.
- Mock LINE API responses in integration tests to avoid dependency on external service availability.

---

## Future Expansion

| Feature | Description | Dependency |
| -------- | ----------- | ---------- |
| Refresh Token | 30-day refresh token to avoid repeated LINE logins | Backend token rotation |
| Token Revocation | Ability to invalidate JWTs (blacklist via Redis or database) | Redis or database table |
| Admin LINE Login | Allow staff/manager/admin to authenticate via LINE Login | Role management UI |
| Multi-Device Sessions | Track and manage sessions across devices | Session storage |
| Login History | Show customers their recent login activity | Audit log enhancement |
| Biometric Re-auth | Use device biometrics to re-authenticate without LINE login | Platform API support |
| LINE Notifications | Send order updates via LINE Messaging API | LINE Messaging API setup |
| Progressive Profiling | Prompt new customers to complete profile (room, phone) after first login | Customer profile feature |

---

## References

| Document | Path | Relevance |
| -------- | ---- | ---------- |
| Security Rules | `100-security-rules.md` | Authentication policy, secrets management, logging |
| Authentication & Authorization | `01-system-design/175-authentication-authorization.md` | JWT payload, roles, session model, token expiry |
| System Architecture | `01-system-design/170-system-architecture.md` | Auth module placement, architecture layers |
| UI/UX Rules | `70-ui-ux-rules.md` | Login screen design, mobile-first, error states |
| Database Rules | `80-database-rules.md` | Naming conventions, UUID primary keys, timestamps |
| Database Design | `01-system-design/173-database-design.md` | Customer entity, index strategy |
| API Design | `01-system-design/174-api-design.md` | Endpoint definitions, response format, status codes |
| Error Scenarios | `00-business/160-error-scenarios.md` | Authentication error messages, user-facing text |
| LINE LIFF Documentation | <https://developers.line.biz/en/docs/liff/> | Official LIFF SDK reference |
| LINE ID Token Verification | <https://developers.line.biz/en/docs/line-login/verify-id-token/> | Official LINE API verification reference |
