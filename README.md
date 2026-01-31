# Flight School Finder

MVP web app for aspiring pilots to discover and compare flight schools, then request an intro. Built from the Phase 2 design spec.

## Stack

- **Next.js 14** (App Router), TypeScript, Tailwind CSS
- In-memory data store (resets on server restart); seed data includes 3 demo schools

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

**Student:** Sign up at `/login` with any email and password (min 8 chars). Complete onboarding, then see ranked results.

**School:** Log in at `/school/login` with:
- `school1@example.com` / `demo1234` (Skyline Aviation)
- `school2@example.com` / `demo1234` (Cloud Nine)
- `school3@example.com` / `demo1234` (Metro Flyers)

Or sign up as a new school; you’ll get a blank profile to edit and publish.

## Routes (MVP)

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/login` | Student signup/login |
| `/onboarding` | Student onboarding (3 steps) |
| `/results` | Ranked schools (student) |
| `/school/:id` | School profile (public) |
| `/compare` | Compare 2–4 schools |
| `/contact/:schoolId` | Request intro form |
| `/contact/confirmation` | Request sent confirmation |
| `/school/login` | School signup/login |
| `/school/dashboard` | Redirect to profile or leads |
| `/school/profile` | School profile editor (3 steps) |
| `/school/leads` | Leads inbox |
| `/school/leads/:id` | Lead detail |

## Adding flight schools

The app has **no real database** yet—schools live in memory in `src/lib/store.ts`. You can add schools in two ways:

1. **School signup (production-style)**  
   Go to **List your school** → sign up at `/school/login` with the school’s email and a password. Then complete the 3-step profile at `/school/profile` and publish. That school is then in the “database” until the server restarts.

2. **Seed data (for demos)**  
   Edit the `seed()` function in `src/lib/store.ts`. Copy one of the existing school objects (e.g. `sch_1`, `sch_2`, `sch_3`), give it a new `id` (e.g. `sch_4`), set `ownerEmail`, `passwordHash` (e.g. `"demo1234"`), and fill in name, address, phone, programs, ratings, pricing, description, etc. Add it to the `schools = [ ... ]` array. New schools appear after you restart the dev server (`npm run dev`).

To use a **real database** (e.g. PostgreSQL, SQLite), replace the in-memory logic in `src/lib/store.ts` with your DB client and add migrations/scripts to insert or import schools.

## Data

- **Matching/ranking:** Weighted score (distance 40%, goal match 30%, part match 15%, budget 15%). Hard filters: within radius, goal overlap, Part 61/141 if specified.
- **Persistence:** In-memory only. Replace `src/lib/store.ts` with a real DB for production.

See `PHASE-2-SPEC.md` for full design, data models, and UX checklist.
