# Cycle 1 — Design Specification
## Auth + Vehicle Inventory UI

**Author:** R.R.M.G.H. Rathnayake (UX Designer)
**Date:** 2026-03-25
**Consumes:** cycle1-prd.md (Product Manager)

---

## 1. Design System

### Colour Palette
- **Primary:** Slate/Navy (`hsl(215, 50%, 23%)`) — sidebar, headers, primary buttons
- **Accent:** Orange (`hsl(24, 95%, 53%)`) — CTAs, highlights, active states
- **Background:** White (`hsl(0, 0%, 100%)`)
- **Muted:** Light gray (`hsl(210, 40%, 96%)`) — card backgrounds, table rows
- **Destructive:** Red (`hsl(0, 84%, 60%)`) — delete actions, errors
- **Success:** Green — available badges, success toasts
- **Warning:** Yellow/Amber — reserved badges, warnings

### Typography
- Font: Inter (system fallback: system-ui, Avenir, Helvetica, Arial)
- Headings: semibold, tracking-tight
- Body: regular, text-sm (14px)

### Component Library
Using **shadcn/ui** components: Button, Input, Card, Table, Dialog, Select, Badge, Form, Toast, Skeleton, DropdownMenu, Sheet (mobile sidebar), Separator, Avatar

---

## 2. Page Layouts

### 2.1 Login Page (`/login`)

```
┌──────────────────────────────────────────┐
│              FULL SCREEN                  │
│                                           │
│     ┌─────────────────────┐               │
│     │    AutoDeal Logo    │               │
│     │                     │               │
│     │  ┌───────────────┐  │               │
│     │  │ Email Input   │  │               │
│     │  └───────────────┘  │               │
│     │  ┌───────────────┐  │               │
│     │  │ Password Input│  │               │
│     │  └───────────────┘  │               │
│     │                     │               │
│     │  [ Sign In Button ] │  (orange CTA) │
│     │                     │               │
│     │  Forgot password?   │               │
│     └─────────────────────┘               │
│                                           │
│     Car Sales & Dealership Management     │
└──────────────────────────────────────────┘
```

**Behaviour:**
- Centered card on a slate/navy gradient background
- Email + Password fields with Zod validation (show inline errors)
- Loading spinner on submit button while authenticating
- Error toast for invalid credentials
- On success: redirect to `/dashboard`
- If already authenticated: redirect to `/dashboard` immediately

---

### 2.2 App Shell (authenticated layout)

```
┌────────────┬────────────────────────────────┐
│  SIDEBAR   │          HEADER BAR            │
│  (240px)   │  Breadcrumb    [User] [Logout] │
│            ├────────────────────────────────┤
│  Logo      │                                │
│            │       MAIN CONTENT AREA        │
│  ─────     │                                │
│  Dashboard │                                │
│  Vehicles  │                                │
│  Customers*│                                │
│  Sales*    │                                │
│  Appts*    │                                │
│  Reports*  │                                │
│            │                                │
│  ─────     │                                │
│  Settings  │                                │
│  Logout    │                                │
└────────────┴────────────────────────────────┘
  * = hidden for INVENTORY_STAFF
```

**Sidebar:**
- Fixed left, 240px wide on desktop
- Collapsible to icon-only (64px) on tablet
- Sheet overlay on mobile (< 768px)
- Active link highlighted with orange left border + bg-accent/10
- Navigation items shown/hidden per role (RBAC)
- Logo at top: "AutoDeal" text + car icon

**Header:**
- Sticky top bar
- Left: Breadcrumb trail (e.g., Dashboard > Vehicles > Add)
- Right: User avatar + name + role badge + logout dropdown

---

### 2.3 Dashboard Home (`/dashboard`)

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  Total      │  Available  │  Reserved   │  Sold       │
│  Vehicles   │  Vehicles   │  Vehicles   │  Vehicles   │
│    42       │    28       │    6        │    8        │
│  🚗 +3 new  │  🟢         │  🟡         │  🔴         │
└─────────────┴─────────────┴─────────────┴─────────────┘

(Cycle 1: cards only. Charts added in Cycle 3)
```

**Summary Cards:**
- 4 cards in a responsive grid (4 cols desktop, 2 cols tablet, 1 col mobile)
- Each card: icon + count + label + subtle trend indicator
- Data fetched from `GET /api/vehicles` aggregate or dedicated dashboard endpoint
- Skeleton loading state while fetching

---

### 2.4 Vehicle List Page (`/vehicles`)

```
┌──────────────────────────────────────────────┐
│  Vehicles                     [+ Add Vehicle]│
├──────────────────────────────────────────────┤
│  🔍 Search...    [Status ▼] [Fuel ▼] [Trans ▼]│
│                                    [Table|Grid]│
├──────────────────────────────────────────────┤
│  TABLE VIEW:                                  │
│  Make/Model  │ Year │ Price    │ Status │ Act │
│  ──────────────────────────────────────────── │
│  Toyota Camry│ 2023 │ Rs 12.5M│ 🟢 Avail│ ··· │
│  Honda Civic │ 2022 │ Rs 9.8M │ 🟡 Resv │ ··· │
│  Nissan X-T  │ 2024 │ Rs 18.2M│ 🔴 Sold │ ··· │
│  ...         │      │         │        │     │
├──────────────────────────────────────────────┤
│  ← 1 2 3 ... 5 →    Showing 1-20 of 42      │
└──────────────────────────────────────────────┘
```

**Table View (default):**
- Columns: Make/Model (combined), Year, VIN, Fuel Type, Price, Status, Actions
- Sortable columns (click header to toggle asc/desc)
- Status badges: green "Available", amber "Reserved", red "Sold"
- Actions dropdown (···): View, Edit, Delete (admin only)
- Pagination at bottom with page numbers

**Grid View (toggle):**
- Card layout: 3 cols desktop, 2 tablet, 1 mobile
- Each card: placeholder image area, make/model, year, price, status badge
- Click card → navigate to vehicle detail

**Search:**
- Debounced text input (300ms)
- Searches make, model, VIN

**Filters:**
- Select dropdowns using shadcn Select component
- Status: All, Available, Reserved, Sold
- Fuel Type: All, Petrol, Diesel, Hybrid, Electric
- Transmission: All, Manual, Automatic
- Filters apply immediately on change

---

### 2.5 Vehicle Detail Page (`/vehicles/:id`)

```
┌──────────────────────────────────────────────┐
│  ← Back to Vehicles       [Edit] [Delete]    │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  Make: Toyota              │
│  │              │  Model: Camry              │
│  │  Image       │  Year: 2023               │
│  │  Placeholder │  VIN: JTD...              │
│  │              │  Status: 🟢 Available       │
│  └──────────────┘  Price: Rs 12,500,000      │
│                    Fuel: Petrol              │
│                    Transmission: Automatic   │
│                    Mileage: 15,000 km        │
│                    Colour: Pearl White       │
│                    Listed: 2026-03-01        │
├──────────────────────────────────────────────┤
│  Description                                 │
│  Well-maintained sedan, single owner...      │
└──────────────────────────────────────────────┘
```

---

### 2.6 Add/Edit Vehicle Form (`/vehicles/new`, `/vehicles/:id/edit`)

```
┌──────────────────────────────────────────────┐
│  Add New Vehicle  (or "Edit Vehicle")         │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Make *       │  │ Model *      │          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Year *       │  │ VIN *        │          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Colour *     │  │ Mileage *    │          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Fuel Type ▼  │  │ Transmission▼│          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Price *      │  │ Status ▼     │          │
│  └──────────────┘  └──────────────┘          │
│  ┌─────────────────────────────────┐          │
│  │ Description (textarea)          │          │
│  └─────────────────────────────────┘          │
│                                               │
│  [Cancel]                  [Save Vehicle]     │
└──────────────────────────────────────────────┘
```

**Form Behaviour:**
- 2-column layout on desktop, single column on mobile
- All required fields marked with *
- Inline validation errors (red text below field)
- react-hook-form + Zod resolver
- Select components for Fuel Type, Transmission, Status
- On save: toast "Vehicle created successfully" / "Vehicle updated"
- On cancel: navigate back to vehicle list
- Edit mode: pre-fills all fields from existing vehicle data

---

## 3. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|---------------|
| Desktop | >= 1024px | Full sidebar (240px), 4-col card grid, wide table |
| Tablet | 768-1023px | Collapsed sidebar (icons), 2-col grid, scrollable table |
| Mobile | < 768px | Hidden sidebar (sheet overlay), 1-col grid, card-based list |

---

## 4. Loading & Error States

- **Loading:** Skeleton components matching the layout of the content being loaded
- **Empty state:** Illustration + "No vehicles found" + "Add your first vehicle" CTA
- **Error state:** Red alert banner with retry button
- **Toast notifications:** Bottom-right, auto-dismiss after 5 seconds
  - Success: green left border
  - Error: red left border

---

## 5. Component Inventory (shadcn/ui)

| Component | Used In |
|-----------|---------|
| Button | All pages (primary, secondary, destructive, ghost variants) |
| Input | Login form, vehicle form, search bar |
| Card | Dashboard summary, vehicle grid cards |
| Table | Vehicle list table view |
| Dialog | Delete confirmation |
| Select | Filter dropdowns, form select fields |
| Badge | Status badges, role badges |
| Form | Login, vehicle add/edit (with react-hook-form) |
| Toast | Success/error notifications |
| Skeleton | Loading states |
| DropdownMenu | Actions menu, user menu |
| Sheet | Mobile sidebar |
| Separator | Sidebar sections |
| Avatar | User icon in header |
