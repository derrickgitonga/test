# SmartSeason Field Monitoring System

A web application for tracking crop progress across multiple fields during a growing season. Coordinators manage fields and monitor agent activity; field agents log stage updates and observations on their assigned fields.

## Tech Stack

- **Backend**: Node.js with Express and TypeScript. Express was chosen for its straightforward request handling without the overhead of a larger framework.
- **Database**: PostgreSQL with Prisma as the ORM. Prisma gives type-safe database access and makes schema changes easy to reason about in TypeScript.
- **Frontend**: React with TypeScript, bundled with Vite. Vite reduces development friction with fast rebuilds during iteration.
- **Styling**: Tailwind CSS. Used to build a consistent, custom visual style without pulling in a component library.
- **Authentication**: JWT. Stateless tokens work well here since there is no need for server-side session management.

## How to Run Locally

### Prerequisites

- Node.js v18 or higher
- A running PostgreSQL instance on port 5432

If you are using Docker:

```bash
docker run --name smartseason-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=smartseason -p 5432:5432 -d postgres
```

Set your `DATABASE_URL` in `backend/.env` to:

```
postgresql://postgres:postgres@localhost:5432/smartseason
```

If you have PostgreSQL installed natively with the default user `postgres` and password `postgres`, the `.env.example` defaults will work without changes.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

### Frontend

Open a new terminal window.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Field Status Logic

Each field's status is computed in `field.service.ts` at the time fields are fetched, rather than stored as a column. This keeps the logic in one place and means status always reflects the current state of the data without requiring background jobs or manual updates.

A field is **Completed** if its current stage is `HARVESTED`. A field is **At Risk** if it has gone more than 21 days without any logged update, or if it was planted more than 120 days ago and has not yet been harvested. Either condition is sufficient. Everything else is **Active**.

## Demo Credentials

| Name | Email | Password | Role |
|---|---|---|---|
| Sarah Kimani | sarah.kimani@smartseason.com | Admin@2026 | Admin |
| James Mwangi | james.mwangi@smartseason.com | Agent@2026 | Field Agent |
| Amina Hassan | amina.hassan@smartseason.com | Agent@2026 | Field Agent |
| Peter Otieno | peter.otieno@smartseason.com | Agent@2026 | Field Agent |
| Grace Wanjiku | grace.wanjiku@smartseason.com | Agent@2026 | Field Agent |

## Assumptions

1. Field status is computed at request time rather than stored in the database. For a ruleset this simple, computing on the fly is straightforward and avoids keeping a stored value in sync with changing data.
2. Field agents can only move a field's stage forward and add notes. They cannot edit the planting date, crop type, or any other field metadata after creation.
3. The signup form only creates Field Agent accounts. Admin accounts are created through the user management interface by an existing admin, or via the seed script.
4. The password reset endpoint requires only a known email address and a new password. There is no token or email confirmation step. This is a known limitation accepted for the scope of this assessment.