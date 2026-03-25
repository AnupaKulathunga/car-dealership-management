# Cycle 1 — Technical Specification
## Auth + Vehicle Inventory

**Author:** P.M.A.D.N. Kulathunga (CTO/Architect)
**Date:** 2026-03-25
**Consumes:** cycle1-prd.md, cycle1-design-spec.md

---

## 1. Backend Architecture

### Express Application Structure

```
server/src/
├── server.ts                 # Entry: creates app, mounts routes, starts server
├── config/
│   └── env.ts                # Zod-validated environment variables
├── lib/
│   └── prisma.ts             # Prisma client singleton
├── middleware/
│   ├── auth.middleware.ts     # JWT verification, attaches user to req
│   ├── role.middleware.ts     # requireRole(...roles) factory
│   ├── validate.middleware.ts # Zod schema validation factory
│   └── error.middleware.ts    # Global error handler → JSON response
├── modules/
│   ├── auth/
│   │   ├── auth.routes.ts    # POST /login, /register, /refresh, GET /me
│   │   ├── auth.service.ts   # Business logic: hash, verify, sign tokens
│   │   └── auth.validator.ts # Zod schemas: loginSchema, registerSchema
│   └── vehicles/
│       ├── vehicles.routes.ts    # GET /, GET /:id, POST /, PUT /:id, DELETE /:id
│       ├── vehicles.service.ts   # CRUD logic with Prisma, pagination, search
│       └── vehicles.validator.ts # Zod schemas: createVehicle, updateVehicle, queryParams
├── utils/
│   ├── response.ts           # formatSuccess(data, meta?), formatError(message)
│   └── pagination.ts         # buildPagination(page, limit, total)
└── types/
    └── index.ts              # Request extensions, shared interfaces
```

### Middleware Chain (order matters)

```
cors() → helmet() → express.json() → logger →
  [public routes: /auth/login, /auth/refresh] →
  auth.middleware →
  [protected routes] →
  error.middleware (catch-all)
```

---

## 2. API Contracts

### Auth Endpoints

#### POST /api/auth/login
```typescript
// Request
{ email: string, password: string }

// Response 200
{ success: true, data: { accessToken: string, refreshToken: string, user: { id, email, name, role } } }

// Response 401
{ success: false, error: "Invalid email or password" }
```

#### POST /api/auth/register (ADMIN only)
```typescript
// Request (requires auth + ADMIN role)
{ email: string, password: string, name: string, role: "ADMIN" | "MANAGER" | "SALES_AGENT" | "INVENTORY_STAFF", phone?: string }

// Response 201
{ success: true, data: { id, email, name, role, phone, createdAt } }

// Response 409
{ success: false, error: "User with this email already exists" }
```

#### POST /api/auth/refresh
```typescript
// Request
{ refreshToken: string }

// Response 200
{ success: true, data: { accessToken: string, refreshToken: string } }
```

#### GET /api/auth/me (authenticated)
```typescript
// Response 200
{ success: true, data: { id, email, name, role, phone, createdAt } }
```

### Vehicle Endpoints

#### GET /api/vehicles (authenticated)
```typescript
// Query params
?page=1&limit=20&search=toyota&status=AVAILABLE&fuelType=PETROL
&transmission=AUTOMATIC&minPrice=1000000&maxPrice=5000000
&minYear=2020&maxYear=2024&sortBy=createdAt&order=desc

// Response 200
{
  success: true,
  data: Vehicle[],
  meta: { page: number, limit: number, total: number, totalPages: number }
}
```

#### GET /api/vehicles/:id (authenticated)
```typescript
// Response 200
{ success: true, data: Vehicle }

// Response 404
{ success: false, error: "Vehicle not found" }
```

#### POST /api/vehicles (ADMIN, MANAGER, SALES_AGENT, INVENTORY_STAFF)
```typescript
// Request
{
  make: string, model: string, year: number, vin: string,
  colour: string, mileage: number, fuelType: FuelType,
  transmission: Transmission, price: number,
  status?: VehicleStatus, images?: string[], description?: string
}

// Response 201
{ success: true, data: Vehicle }
```

#### PUT /api/vehicles/:id (ADMIN, MANAGER, SALES_AGENT, INVENTORY_STAFF)
```typescript
// Request — all fields optional (partial update)
{ make?: string, model?: string, ... }

// Response 200
{ success: true, data: Vehicle }
```

#### DELETE /api/vehicles/:id (ADMIN only)
```typescript
// Response 200
{ success: true, data: { message: "Vehicle deleted" } }

// Response 400 (if linked to active sale)
{ success: false, error: "Cannot delete vehicle with active sales" }
```

---

## 3. JWT Token Strategy

| Token | Secret Env Var | Expiry | Payload |
|-------|---------------|--------|---------|
| Access Token | `JWT_SECRET` | 15 minutes | `{ userId: number, email: string, role: UserRole }` |
| Refresh Token | `JWT_REFRESH_SECRET` | 7 days | `{ userId: number, tokenVersion: number }` |

- Access token sent in `Authorization: Bearer <token>` header
- Refresh token sent in request body to `/auth/refresh`
- On refresh: issue new access + refresh token pair (rotation)

---

## 4. Service Layer Pattern

```
Route Handler (thin) → Service Function (business logic) → Prisma Client (data)
```

- **Route handlers** only: parse request, call service, format response
- **Services** contain: validation logic, business rules, Prisma queries
- **No Prisma calls in route handlers**

---

## 5. Error Handling

All errors caught by `error.middleware.ts`:

```typescript
// Custom AppError class
class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) { ... }
}

// Middleware catches and formats:
{ success: false, error: message }
```

| Error | Status | When |
|-------|--------|------|
| Validation Error | 400 | Zod validation fails |
| Unauthorized | 401 | Missing/invalid token |
| Forbidden | 403 | Insufficient role |
| Not Found | 404 | Resource doesn't exist |
| Conflict | 409 | Duplicate unique field |
| Internal Error | 500 | Unexpected server error |

---

## 6. ADR

### ADR-001: Use Zod for Request Validation
**Decision:** Use Zod schemas for all request body/query/params validation instead of manual checks.
**Rationale:** Type-safe, shared between client and server, auto-generates TypeScript types.
**Consequence:** All endpoints must define a Zod schema. The `validate` middleware applies it.

### ADR-002: Service Layer Separation
**Decision:** All database operations go through service files. Controllers/route handlers never import Prisma directly.
**Rationale:** Testability (mock services), separation of concerns, reusability.

### ADR-003: Consistent Response Format
**Decision:** All API responses follow `{ success: boolean, data?: T, error?: string, meta?: PaginationMeta }`.
**Rationale:** Frontend can have a single response handler pattern.
