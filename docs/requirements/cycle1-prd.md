# Cycle 1 — Product Requirements Document
## Auth + Vehicle Inventory (US01, US02, US03, US04)

**Author:** P.M.A.D.N. Kulathunga (Product Owner)
**Date:** 2026-03-25
**Sprint:** 2 (catch-up for Sprint 1 scope)

---

## 1. Overview

Cycle 1 delivers the authentication system and vehicle inventory management — the foundation that all other features depend on. Users must be able to log in securely and manage vehicle listings.

---

## 2. User Stories & Acceptance Criteria

### US01 — User Authentication
> As an admin, I want to register and log in securely so that I can access the system based on my role.

**Acceptance Criteria:**
- [ ] Users can log in with email and password
- [ ] Passwords are hashed with bcrypt (12 salt rounds)
- [ ] Login returns a JWT access token (15 min expiry) and refresh token (7 day expiry)
- [ ] Expired access tokens can be refreshed without re-login
- [ ] `GET /api/auth/me` returns the current user's profile from the token
- [ ] Only ADMIN users can register new users via `POST /api/auth/register`
- [ ] Invalid credentials return a 401 error with a clear message
- [ ] All auth endpoints validate input with Zod schemas
- [ ] Frontend stores tokens and redirects to login when expired
- [ ] Role-based redirect: after login, users see their appropriate dashboard

**Roles with access:** All roles can log in. Only ADMIN can register new users.

---

### US02 — Add Vehicles to Inventory
> As a sales agent, I want to add new vehicles to the inventory with all specifications so that listings are up to date.

**Acceptance Criteria:**
- [ ] `POST /api/vehicles` creates a new vehicle with all required fields
- [ ] Required fields: make, model, year, VIN, colour, mileage, fuelType, transmission, price, status
- [ ] Optional fields: images (JSON array of URLs), description
- [ ] VIN must be unique — duplicate VIN returns 409 error
- [ ] Default status is `AVAILABLE`
- [ ] Year must be between 1900 and current year + 1
- [ ] Price must be greater than 0
- [ ] Mileage must be >= 0
- [ ] All fields validated with Zod
- [ ] Response follows standard format: `{ success: true, data: vehicle }`

**Roles with access:** ADMIN, MANAGER, SALES_AGENT, INVENTORY_STAFF

---

### US03 — View, Search, and Filter Vehicles
> As a sales agent, I want to view, search, and filter vehicle listings so that I can quickly find cars matching customer needs.

**Acceptance Criteria:**
- [ ] `GET /api/vehicles` returns paginated list (default: page=1, limit=20)
- [ ] Search by `?search=toyota` matches make, model, or VIN (case-insensitive)
- [ ] Filter by status: `?status=AVAILABLE`
- [ ] Filter by fuel type: `?fuelType=PETROL`
- [ ] Filter by transmission: `?transmission=AUTOMATIC`
- [ ] Filter by price range: `?minPrice=1000000&maxPrice=5000000`
- [ ] Filter by year range: `?minYear=2020&maxYear=2024`
- [ ] Sort by any field: `?sortBy=price&order=asc`
- [ ] Response includes meta: `{ page, limit, total, totalPages }`
- [ ] `GET /api/vehicles/:id` returns a single vehicle with full details
- [ ] Frontend shows vehicles in a data table with sorting and pagination
- [ ] Toggle between table view and grid (card) view
- [ ] Search bar with debounced input
- [ ] Filter dropdowns for status, fuel type, transmission
- [ ] Status badges: green (Available), yellow (Reserved), red (Sold)

**Roles with access:** All authenticated roles can view vehicles

---

### US04 — Edit and Update Vehicle Details
> As a sales agent, I want to edit and update vehicle details and status so that inventory reflects current availability.

**Acceptance Criteria:**
- [ ] `PUT /api/vehicles/:id` updates vehicle fields
- [ ] Only provided fields are updated (partial update)
- [ ] VIN uniqueness enforced on update
- [ ] Status transitions follow business rules (see .ai/RULES.md Rule B1)
- [ ] `DELETE /api/vehicles/:id` — ADMIN only, soft delete (set status to a deleted state or restrict if linked to active sale)
- [ ] Frontend shows pre-filled edit form
- [ ] Success/error toast notifications on save

**Roles with access:**
- ADMIN, MANAGER: Full CRUD
- SALES_AGENT: Read + Create + Update (no delete)
- INVENTORY_STAFF: Full CRUD

---

## 3. Dashboard Requirements (Cycle 1 scope)

The dashboard shell is needed to house the vehicle pages:
- Responsive sidebar with navigation links (role-based visibility)
- Top header bar with user name, role badge, and logout button
- Main content area with breadcrumbs
- Summary cards on dashboard home: total vehicles, available count, reserved count, sold count

---

## 4. Out of Scope (Cycle 1)

- Customer management (Cycle 2)
- Sales workflow (Cycle 2)
- Appointment scheduling (Cycle 2)
- Invoice generation (Cycle 2)
- Analytics charts (Cycle 3)
- Activity logging (Cycle 3)
- Notifications (Cycle 3)

---

## 5. Priority

All US01-US04 are **Must Have** (MoSCoW). This cycle is the critical path — nothing else works without auth and vehicle inventory.
