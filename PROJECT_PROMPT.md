# PROJECT KICKOFF PROMPT
# Car Sales and Dealership Management System
# Copy this entire prompt into Claude Code or any AI coding assistant

---

## INSTRUCTIONS

You are scaffolding a **Car Sales and Dealership Management System** — a full-stack web application for an academic project (IT5030 Software Engineering Practices). Build this as a **monorepo** with separate `client/` and `server/` directories.

**Read the attached `schema.prisma` file** — it contains the complete database schema with all models, enums, and relations. Use it exactly as-is for the Prisma setup.

---

## TECH STACK (use exactly these)

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React 18 + Vite + TypeScript      |
| UI             | Tailwind CSS + shadcn/ui          |
| State          | React Query (TanStack Query v5) + React Context for auth |
| Routing        | React Router v6                   |
| Backend        | Node.js + Express + TypeScript    |
| Database       | PostgreSQL 16                     |
| ORM            | Prisma (schema provided)          |
| Auth           | JWT (access + refresh tokens) + bcrypt |
| Validation     | Zod (shared between client/server)|
| Testing        | Jest + React Testing Library      |
| Code Quality   | ESLint + Prettier                 |

---

## PROJECT STRUCTURE

```
car-dealership/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # API client (axios instance, endpoints)
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layout/         # Sidebar, Header, DashboardLayout
│   │   │   └── shared/         # Reusable business components
│   │   ├── features/
│   │   │   ├── auth/           # Login, Register, AuthContext
│   │   │   ├── dashboard/      # Dashboard page + widgets
│   │   │   ├── vehicles/       # Vehicle CRUD pages
│   │   │   ├── customers/      # Customer management pages
│   │   │   ├── sales/          # Sales workflow pages
│   │   │   ├── appointments/   # Scheduling pages
│   │   │   ├── invoices/       # Invoice pages
│   │   │   └── reports/        # Analytics dashboard
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Utilities, constants
│   │   ├── types/              # Shared TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── server/                     # Express + TypeScript backend
│   ├── prisma/
│   │   └── schema.prisma       # USE THE PROVIDED SCHEMA
│   ├── src/
│   │   ├── config/             # env, database, constants
│   │   ├── middleware/          # auth, errorHandler, validation, logger
│   │   ├── modules/
│   │   │   ├── auth/           # auth.controller, auth.service, auth.routes, auth.schema (zod)
│   │   │   ├── users/
│   │   │   ├── vehicles/
│   │   │   ├── customers/
│   │   │   ├── sales/
│   │   │   ├── appointments/
│   │   │   ├── invoices/
│   │   │   └── reports/
│   │   ├── utils/              # helpers, response formatter, pagination
│   │   ├── types/              # express.d.ts, shared types
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Entry point
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example
├── .gitignore
├── README.md
└── package.json                # Root with workspace scripts
```

---

## WHAT TO BUILD (Sprint 1 Scope)

### 1. Project Scaffolding
- Initialise the monorepo with the structure above
- Set up Vite + React + TypeScript for `client/`
- Set up Express + TypeScript with ts-node-dev for `server/`
- Install and configure Tailwind CSS + shadcn/ui
- Set up Prisma with the provided schema, generate client
- Create seed script with sample data (3 users, 10 vehicles, 5 customers)
- Configure ESLint + Prettier for both client and server
- Create `.env.example` with all required variables

### 2. Authentication System
- POST `/api/auth/register` — register user (admin-only route for creating staff)
- POST `/api/auth/login` — returns JWT access token + refresh token
- POST `/api/auth/refresh` — refresh expired access token
- GET `/api/auth/me` — get current user profile
- Auth middleware that extracts and validates JWT
- Role-based middleware: `requireRole('ADMIN', 'MANAGER')`
- Frontend: Login page, AuthContext with persisted tokens, ProtectedRoute component
- Password hashing with bcrypt (salt rounds: 12)

### 3. Vehicle Inventory CRUD
- GET `/api/vehicles` — list all vehicles with pagination, search, filters (status, fuel type, price range, year range)
- GET `/api/vehicles/:id` — single vehicle details
- POST `/api/vehicles` — create vehicle (SALES_AGENT, INVENTORY_STAFF, ADMIN)
- PUT `/api/vehicles/:id` — update vehicle
- DELETE `/api/vehicles/:id` — soft delete or status change (ADMIN only)
- Frontend: Vehicle list page (table + grid view toggle), Vehicle detail page, Add/Edit vehicle form with validation

### 4. Dashboard Layout
- Responsive sidebar navigation with role-based menu items
- Top header with user info and logout
- Dashboard home page with summary cards:
  - Total vehicles (available/sold/reserved counts)
  - Total sales this month
  - Upcoming appointments
  - Recent activity

### 5. Basic Customer Management
- GET `/api/customers` — list with search + pagination
- GET `/api/customers/:id` — customer details with their sales and appointments
- POST `/api/customers` — create customer
- PUT `/api/customers/:id` — update customer
- Frontend: Customer list, customer detail, add/edit form

---

## API CONVENTIONS

- All responses follow: `{ success: boolean, data?: T, error?: string, meta?: { page, limit, total } }`
- Use Zod schemas for request validation
- Pagination: `?page=1&limit=20`
- Search: `?search=toyota`
- Sorting: `?sortBy=createdAt&order=desc`
- All routes prefixed with `/api`
- Error handling middleware that catches all errors and returns consistent format
- Activity logging middleware that records CRUD operations

---

## USER ROLES & PERMISSIONS

| Action                     | ADMIN | MANAGER | SALES_AGENT | INVENTORY_STAFF |
|---------------------------|-------|---------|-------------|-----------------|
| Manage users              | ✅    | ❌      | ❌          | ❌              |
| View all dashboard data   | ✅    | ✅      | ❌          | ❌              |
| Vehicle CRUD              | ✅    | ✅      | Read + Create | ✅            |
| Customer CRUD             | ✅    | ✅      | ✅          | ❌              |
| Process sales             | ✅    | ✅      | ✅          | ❌              |
| Manage appointments       | ✅    | ✅      | ✅          | ❌              |
| Generate invoices         | ✅    | ✅      | ✅          | ❌              |
| View reports              | ✅    | ✅      | Own only    | ❌              |
| View activity logs        | ✅    | ✅      | ❌          | ❌              |

---

## SEED DATA

Create a `prisma/seed.ts` with:

```
Users:
  - admin@autodeal.lk (ADMIN, password: "Admin@123")
  - manager@autodeal.lk (MANAGER, password: "Manager@123")  
  - agent1@autodeal.lk (SALES_AGENT, password: "Agent@123")

Vehicles (10): Mix of Toyota, Honda, Nissan, Suzuki — sedans and SUVs, years 2018-2024, various statuses

Customers (5): Sri Lankan names and addresses

Sales (3): Completed sales linking agents, customers, vehicles

Appointments (4): Mix of test drives and consultations
```

---

## UI/UX REQUIREMENTS

- Clean, professional dealership management aesthetic
- shadcn/ui as the component foundation (use their Button, Input, Table, Dialog, Card, Select, Badge, Form, Toast)
- Tailwind colour scheme: slate/navy primary, with orange accent for CTAs
- Responsive: works on desktop (primary) and tablet
- Data tables with sorting, pagination, and search
- Toast notifications for success/error states
- Loading skeletons for async data
- Form validation with error messages (using react-hook-form + zod)

---

## IMPORTANT NOTES

- Use TypeScript strict mode everywhere
- Every API endpoint must have Zod validation
- Use Prisma's generated types — don't duplicate
- Implement proper error boundaries on the frontend
- All database operations should be in service files, not controllers
- Controllers only handle request/response, services handle business logic
- Use environment variables for all configuration (PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN)
- Include a comprehensive README.md with setup instructions

---

Now scaffold the entire project. Start with the server setup (Express + Prisma + Auth), then the client (Vite + React + shadcn/ui + Login + Dashboard + Vehicles). Build it incrementally and test each part works before moving on.
