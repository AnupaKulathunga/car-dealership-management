# Project Kickoff Assets
## Car Sales and Dealership Management System — Group 10

### Files in this bundle:

| File | Purpose |
|------|---------|
| `PROJECT_PROMPT.md` | **The main prompt** — paste this into Claude Code / Claude / Cursor to scaffold the project |
| `schema.prisma` | Complete Prisma database schema — attach this alongside the prompt |
| `.env.example` | Environment variable template — will be placed in the project root |

### How to use:

1. Open **Claude Code** (or any AI coding assistant) in an empty project directory
2. Paste the contents of `PROJECT_PROMPT.md` as your first message
3. Attach `schema.prisma` as a file alongside the prompt
4. Let it scaffold the full project
5. Copy `.env.example` to `.env` and update `DATABASE_URL` with your local PostgreSQL credentials
6. Run `npx prisma migrate dev` to create the database tables
7. Run `npx prisma db seed` to populate sample data

### Prerequisites:
- Node.js 18+ 
- PostgreSQL 16 running locally
- npm or yarn
