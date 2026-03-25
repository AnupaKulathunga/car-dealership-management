# Cycle 2 — Design Specification
## Customers + Sales + Appointments UI

**Author:** R.R.M.G.H. Rathnayake (UX Designer)
**Date:** 2026-03-25
**Consumes:** cycle2-prd.md

---

## 1. New Navigation Items

Add to sidebar (after Vehicles):
- **Customers** — Users icon — visible to ADMIN, MANAGER, SALES_AGENT
- **Sales** — DollarSign icon — visible to ADMIN, MANAGER, SALES_AGENT
- **Appointments** — Calendar icon — visible to ADMIN, MANAGER, SALES_AGENT

---

## 2. Customer Pages

### 2.1 Customer List (`/customers`)
- Layout matches Vehicle List pattern
- Search: firstName, lastName, email, phone
- Table columns: Name (first + last), Email, Phone, Created, Actions
- Actions: View, Edit, Delete (with confirmation)
- "+ Add Customer" button top right

### 2.2 Customer Detail (`/customers/:id`)
- Header: customer name + contact info
- Two tabs/sections:
  - **Sales History** — table of sales involving this customer
  - **Appointments** — table of appointments for this customer
- Edit + Delete buttons

### 2.3 Customer Form (`/customers/new`, `/customers/:id/edit`)
- Fields: First Name*, Last Name*, Email, Phone*, Address (textarea), Notes (textarea)
- Single column layout (fewer fields than vehicle)

---

## 3. Sales Pages

### 3.1 Sales List (`/sales`)
- Table columns: ID, Vehicle (make/model), Customer (name), Agent (name), Sale Price, Status, Date, Actions
- Status badges: blue (Pending), amber (Negotiation), green (Completed), red (Cancelled)
- Filter: Status dropdown, Date range (optional)
- "+ New Sale" button

### 3.2 Create Sale (`/sales/new`)
- Step-like form:
  1. Select Customer (searchable dropdown or autocomplete)
  2. Select Vehicle (only AVAILABLE vehicles shown, searchable)
  3. Enter Sale Price (pre-filled from vehicle price)
  4. Select Payment Method (Cash, Bank Transfer, Finance, Cheque)
  5. Notes (optional textarea)
- "Create Sale" button → status starts as PENDING

### 3.3 Sale Detail (`/sales/:id`)
- Status progression bar: PENDING → NEGOTIATION → COMPLETED
- Vehicle card (mini summary)
- Customer card (mini summary)
- Agent info
- Sale details: price, payment method, date
- Action buttons based on current status:
  - PENDING: "Move to Negotiation" + "Cancel Sale"
  - NEGOTIATION: "Complete Sale" + "Cancel Sale"
  - COMPLETED: Invoice section shown (amount, tax, total, payment status)
  - CANCELLED: greyed out with cancellation note

---

## 4. Appointment Pages

### 4.1 Appointment List (`/appointments`)
- Table columns: Date/Time, Type (badge), Customer, Vehicle, Agent, Status, Actions
- Type badges: purple (Test Drive), blue (Consultation)
- Status badges: green (Scheduled), gray (Completed), red (Cancelled), amber (No Show)
- Upcoming appointments highlighted
- Filter: Status, Type
- "+ Schedule Appointment" button

### 4.2 Create Appointment (`/appointments/new`)
- Fields:
  - Type: Test Drive / Consultation (radio or select)
  - Customer (searchable select)
  - Vehicle (searchable select, optional for consultations)
  - Date & Time (datetime picker)
  - Notes (textarea)
- Validation: future date only

### 4.3 Appointment Detail / Actions
- Inline status update on list page (dropdown or buttons)
- Or separate detail page with full info + status transition buttons

---

## 5. Dashboard Updates

Add to dashboard home cards:
- **Sales This Month** — count of completed sales in current month
- **Upcoming Appointments** — count of scheduled appointments

(Total: 6 cards now — 4 vehicle + 2 new)

---

## 6. Responsive Considerations

Same breakpoints as Cycle 1. All new pages follow the established patterns:
- Desktop: full table views
- Tablet: scrollable tables
- Mobile: card-based lists
