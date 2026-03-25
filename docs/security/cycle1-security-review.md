# Cycle 1 — Security Review
## Auth + Vehicle Inventory

**Author:** H.M.S.N. Rajapaksha (Security Engineer)
**Date:** 2026-03-25
**Consumes:** cycle1-tech-spec.md (CTO/Architect)

---

## 1. Authentication Security

### Password Handling
- [x] bcrypt with 12 salt rounds (config via `BCRYPT_SALT_ROUNDS` env var)
- [x] Passwords never logged or returned in API responses
- [x] Minimum password length: 8 characters (Zod validation)
- [x] Password must contain: uppercase, lowercase, number, special character

### JWT Configuration
- [x] Access token: 15 min expiry — short-lived to limit damage from token theft
- [x] Refresh token: 7 day expiry — longer-lived but rotated on each use
- [x] Secrets stored in environment variables, never hardcoded
- [x] `JWT_SECRET` and `JWT_REFRESH_SECRET` must be different values
- [x] Token payload: minimal data (userId, email, role) — no sensitive info

### Token Storage (Frontend)
- [x] Access token: stored in memory (React state) — not localStorage
- [x] Refresh token: stored in localStorage (acceptable for this scope)
- [x] Tokens cleared on logout
- [x] Axios interceptor auto-refreshes on 401 response

---

## 2. RBAC Matrix — Cycle 1 Endpoints

| Endpoint | ADMIN | MANAGER | SALES_AGENT | INVENTORY_STAFF |
|----------|-------|---------|-------------|-----------------|
| POST /auth/login | Public | Public | Public | Public |
| POST /auth/register | Yes | No | No | No |
| POST /auth/refresh | Public | Public | Public | Public |
| GET /auth/me | Yes | Yes | Yes | Yes |
| GET /vehicles | Yes | Yes | Yes | Yes |
| GET /vehicles/:id | Yes | Yes | Yes | Yes |
| POST /vehicles | Yes | Yes | Yes | Yes |
| PUT /vehicles/:id | Yes | Yes | Yes | Yes |
| DELETE /vehicles/:id | Yes | No | No | No |

---

## 3. Input Validation (OWASP)

### SQL Injection Prevention
- [x] Prisma ORM uses parameterized queries — SQL injection not possible through normal Prisma API
- [x] No raw SQL queries (`prisma.$queryRaw`) unless absolutely necessary

### XSS Prevention
- [x] helmet middleware sets security headers (Content-Security-Policy, X-XSS-Protection)
- [x] React auto-escapes rendered content
- [x] Zod validates input types — strings are strings, numbers are numbers

### Validation Rules (Zod)
- [x] Email: valid email format via `z.string().email()`
- [x] VIN: string, max 17 characters, alphanumeric
- [x] Year: integer, min 1900, max current year + 1
- [x] Price: positive number
- [x] Mileage: non-negative integer
- [x] Enums (status, fuelType, transmission): restricted to valid Prisma enum values
- [x] No unexpected fields: Zod `.strict()` on request bodies

---

## 4. CORS Configuration

```typescript
cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

---

## 5. Rate Limiting (recommended)

For this academic scope: not implemented in Cycle 1 but recommended for production:
- Login endpoint: 5 attempts per minute per IP
- API endpoints: 100 requests per minute per user

---

## 6. Security Checklist

- [x] Passwords hashed before storage
- [x] JWT secrets in env vars
- [x] Access tokens short-lived (15 min)
- [x] Refresh token rotation on use
- [x] RBAC middleware on all protected routes
- [x] Input validated with Zod on all endpoints
- [x] Helmet middleware for security headers
- [x] CORS restricted to frontend origin
- [x] No sensitive data in JWT payload
- [x] Error messages don't leak internal details
- [x] Prisma prevents SQL injection by default

**Status: APPROVED — Backend and Frontend chains may proceed.**
