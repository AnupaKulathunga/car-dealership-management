# Cycle 2 — Technical Specification
## Customers + Sales + Appointments

**Author:** P.M.A.D.N. Kulathunga (CTO/Architect)
**Date:** 2026-03-25

---

## New Modules

```
server/src/modules/
├── customers/
│   ├── customers.routes.ts
│   ├── customers.service.ts
│   └── customers.validator.ts
├── sales/
│   ├── sales.routes.ts
│   ├── sales.service.ts
│   └── sales.validator.ts
├── appointments/
│   ├── appointments.routes.ts
│   ├── appointments.service.ts
│   └── appointments.validator.ts
└── invoices/
    ├── invoices.routes.ts
    └── invoices.service.ts
```

## API Contracts

### Customers: GET/POST/PUT/DELETE `/api/customers`
- Search: `?search=` matches firstName, lastName, email, phone
- GET /:id includes relations: sales (with vehicle), appointments

### Sales: GET/POST/PUT `/api/sales`
- POST creates sale → vehicle status = RESERVED
- PUT /:id/status transitions: PENDING → NEGOTIATION → COMPLETED/CANCELLED
- On COMPLETED: vehicle → SOLD, auto-create invoice (amount + 12% tax)
- On CANCELLED: vehicle → AVAILABLE
- GET /:id includes: vehicle, customer, agent, invoice

### Appointments: GET/POST/PUT/DELETE `/api/appointments`
- Conflict detection: no double-booking (vehicle or agent at same dateTime)
- Future dateTime only
- Status transitions: SCHEDULED → COMPLETED/CANCELLED/NO_SHOW

### Invoices: GET `/api/invoices/:id`
- Read-only (auto-created by sales service)

## Sale Status Machine

```
PENDING ──► NEGOTIATION ──► COMPLETED (terminal)
   │              │
   └──────────────┴──► CANCELLED (terminal)
```
