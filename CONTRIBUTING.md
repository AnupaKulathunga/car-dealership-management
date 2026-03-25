# Contributing Guide — CSDMS

## Team Members & Responsibilities

| Member | Role | Primary Area | Branch Prefixes |
|--------|------|-------------|-----------------|
| Anupa Kulathunga | Product Owner | Requirements, Architecture | `plan/*`, `arch/*` |
| Samitha Athurupana | Scrum Master | DevOps, CI/CD, Merges | `qa/*`, `main` (merge only) |
| Gajith Rathnayake | Frontend Developer | UI/UX, React Components | `plan/*` (design), `frontend/*` |
| Sanodya Rajapaksha | Backend Developer | API, Database, Auth | `arch/*` (security), `backend/*` |
| Prabuddhi Gunathilaka | Full-Stack / QA | Testing, Analytics | `qa/*` |

---

## Branch Strategy

### Branch Prefixes

We use **chain-based branch prefixes** that map to SDLC phases:

```
main                              (protected — Samitha merges only)
├── plan/<feature>                (requirements + design docs)
├── arch/<feature>                (architecture + security specs)
├── backend/<feature>             (API implementation)
├── frontend/<feature>            (UI implementation)
└── qa/<feature>                  (tests + CI/CD + analytics)
```

### Naming Convention

```
<prefix>/<cycle>-<feature-slug>
```

**Examples:**
- `plan/cycle1-auth-vehicles`
- `arch/cycle1-auth-vehicles`
- `backend/cycle1-auth-vehicles`
- `frontend/cycle1-auth-vehicles`
- `qa/cycle1-auth-vehicles`

### Chain Execution Order

Branches for the same feature must be created and merged **sequentially**:

```
1. plan/*      → merged first
2. arch/*      → merged after plan
3. backend/*   → merged after arch
4. frontend/*  → merged after backend
5. qa/*        → merged after frontend
```

Each branch builds on what the previous chain delivered.

---

## Workflow

### Creating a Branch

```bash
# Always branch from the latest main
git checkout main
git pull origin main
git checkout -b backend/cycle1-auth-vehicles
```

### Working on a Branch

```bash
# Make changes, then commit with conventional format
git add <specific-files>
git commit -m "feat(auth): add JWT login endpoint"

# Push your branch
git push -u origin backend/cycle1-auth-vehicles
```

### Creating a Pull Request

1. Push your branch to origin
2. Create a PR targeting `main`
3. Add a description of what this chain delivers
4. Request review from Samitha (merge authority)
5. Wait for approval before merging

### Merge to Main

**Only Samitha (Scrum Master) merges PRs to main.** This ensures:
- No merge conflicts between chains
- Sequential chain order is respected
- Code quality checks pass

---

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

### Types

| Type | When to Use |
|------|------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `docs` | Documentation changes |
| `test` | Adding or updating tests |
| `chore` | Build, config, dependency updates |
| `style` | Formatting, no logic change |

### Scopes

| Scope | Area |
|-------|------|
| `auth` | Authentication, JWT, login |
| `vehicles` | Vehicle CRUD, inventory |
| `customers` | Customer management |
| `sales` | Sales workflow, transactions |
| `appointments` | Scheduling, test drives |
| `invoices` | Invoice generation, payment tracking |
| `dashboard` | Dashboard, analytics |
| `api` | General API, middleware, config |
| `ui` | General UI, layout, components |
| `db` | Database, Prisma schema, migrations, seed |
| `ci` | CI/CD, GitHub Actions |
| `docker` | Docker, containerization |

### Examples

```
feat(auth): add JWT login endpoint
feat(vehicles): implement search and filter API
fix(sales): correct vehicle status transition on cancellation
refactor(api): extract pagination utility
docs(api): add Postman collection for auth endpoints
test(auth): add unit tests for token refresh
chore(deps): update @tanstack/react-query to v5.20
```

---

## File Ownership

Each team member owns specific directories. **Only modify files in your area:**

| Member | Owns |
|--------|------|
| Anupa | `docs/requirements/`, `docs/architecture/` |
| Samitha | `docker-compose.yml`, `.github/`, `Dockerfile.*`, `.env.example` |
| Gajith | `client/src/` (all frontend code) |
| Sanodya | `server/src/`, `server/prisma/` (all backend code) |
| Prabuddhi | `**/*.test.ts`, `**/*.test.tsx`, `e2e/` |

If you need to modify files outside your area, coordinate with the owner first.

---

## Code Quality

### Before Committing

- [ ] TypeScript strict mode — no `any` types
- [ ] All Zod validators match the API contract
- [ ] No `console.log` in production code (use logger)
- [ ] Run `npm run lint` and fix warnings
- [ ] Test your changes locally

### Before Creating a PR

- [ ] Branch is up-to-date with main: `git pull origin main --rebase`
- [ ] All existing tests still pass
- [ ] New code has tests (if applicable)
- [ ] API endpoints follow the response format: `{ success, data?, error?, meta? }`

---

## Quick Reference

```bash
# Start new work
git checkout main && git pull
git checkout -b <prefix>/<cycle>-<feature>

# Daily workflow
git add <files>
git commit -m "feat(scope): what you did"
git push

# Before PR
git pull origin main --rebase
npm run lint
npm test
```
