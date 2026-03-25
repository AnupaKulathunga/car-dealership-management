# Cycle 2 — Product Requirements Document
## Customers + Sales + Appointments (US05, US06, US07, US08)

**Author:** P.M.A.D.N. Kulathunga (Product Owner)
**Date:** 2026-03-25
**Sprint:** 2

---

## 1. Overview

Cycle 2 delivers the core dealership workflow: managing customers, processing vehicle sales through a status-driven pipeline, and scheduling test drive/consultation appointments. These features connect the vehicle inventory (Cycle 1) to revenue-generating transactions.

---

## 2. User Stories & Acceptance Criteria

### US05 — Create and Manage Customer Profiles
> As a sales agent, I want to create and manage customer profiles so that I can track interactions and preferences.

**Acceptance Criteria:**
- [ ] `POST /api/customers` creates a customer with: firstName, lastName, email (optional, unique), phone (required), address, notes
- [ ] `GET /api/customers` returns paginated list with search (firstName, lastName, email, phone)
- [ ] `GET /api/customers/:id` returns customer with their sales and appointments
- [ ] `PUT /api/customers/:id` updates customer fields
- [ ] `DELETE /api/customers/:id` — only if no active sales (PENDING/NEGOTIATION)
- [ ] Frontend: Customer list page with search + pagination
- [ ] Frontend: Customer detail page showing sales history and appointments
- [ ] Frontend: Add/Edit customer form with validation

**Roles:** ADMIN, MANAGER, SALES_AGENT (INVENTORY_STAFF cannot access customers)

---

### US06 — Record a Vehicle Sale
> As a sales agent, I want to record a vehicle sale with customer and payment details so that transactions are documented.

**Acceptance Criteria:**
- [ ] `POST /api/sales` creates a sale linking: vehicle, customer, agent, salePrice, paymentMethod
- [ ] Creating a sale sets the vehicle status to RESERVED
- [ ] `GET /api/sales` returns paginated list with filters (status, agent, date range)
- [ ] `GET /api/sales/:id` returns sale with vehicle, customer, agent, and invoice details
- [ ] `PUT /api/sales/:id` updates sale status following the state machine:
  - PENDING → NEGOTIATION → COMPLETED or CANCELLED
  - COMPLETED: vehicle → SOLD, auto-generate invoice
  - CANCELLED: vehicle → AVAILABLE
- [ ] Completed sales cannot be cancelled
- [ ] Invoice auto-generated: amount = salePrice, tax = 12%, total = amount + tax
- [ ] Frontend: Sales list with status badges and filters
- [ ] Frontend: Create sale form (select customer + vehicle + payment method)
- [ ] Frontend: Sale detail page with status progression

**Roles:** ADMIN, MANAGER, SALES_AGENT

---

### US07 — Book a Test Drive Appointment
> As a customer, I want to book a test drive appointment so that I can evaluate a vehicle before purchasing.

**Acceptance Criteria:**
- [ ] `POST /api/appointments` creates an appointment: customer, vehicle (optional for consultation), agent, type (TEST_DRIVE/CONSULTATION), dateTime, notes
- [ ] No double-booking: same vehicle at same dateTime
- [ ] No agent double-booking: same agent at same dateTime
- [ ] dateTime must be in the future
- [ ] `GET /api/appointments` with filters (status, type, agent, date range)
- [ ] `PUT /api/appointments/:id` — update status (SCHEDULED → COMPLETED/CANCELLED/NO_SHOW)
- [ ] Frontend: Appointment list with upcoming highlighted
- [ ] Frontend: Create appointment form (select customer, vehicle, date/time)

**Roles:** ADMIN, MANAGER, SALES_AGENT

---

### US08 — View Appointments and Upcoming Test Drives
> As a sales agent, I want to view my appointments and upcoming test drives so that I can prepare accordingly.

**Acceptance Criteria:**
- [ ] SALES_AGENT sees only their own appointments by default
- [ ] ADMIN/MANAGER can see all appointments
- [ ] Sort by dateTime ascending (upcoming first)
- [ ] Status filter: Scheduled, Completed, Cancelled, No Show
- [ ] Frontend: appointment list integrated into the dashboard sidebar navigation

**Roles:** ADMIN, MANAGER, SALES_AGENT

---

## 3. Business Rules (from .ai/RULES.md)

- **Sale Status Machine:** PENDING → NEGOTIATION → COMPLETED/CANCELLED
- **Vehicle Sync:** Sale created → vehicle RESERVED, sale completed → SOLD, sale cancelled → AVAILABLE
- **Invoice:** Auto-created on COMPLETED, amount + 12% tax, initial status UNPAID
- **Appointments:** No double-booking (vehicle or agent), future dates only

---

## 4. Out of Scope (Cycle 2)

- Analytics dashboard charts (Cycle 3)
- Sales agent performance tracking (Cycle 3)
- Inventory reports (Cycle 3)
- Notifications, CSV export, vehicle comparison (Cycle 4)
