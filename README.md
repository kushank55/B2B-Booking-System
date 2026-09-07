# B2B Appointment Booking

Multi-tenant scheduling for Hanabi Technologies. A **System Owner** onboards businesses. Each **Business Admin** configures one tenant (profile, services, staff, weekly hours). **End customers** book as guests — no customer accounts. They get a unique manage-token link to view or cancel.

Live demo: [https://b2-b-booking-system.vercel.app](https://b2-b-booking-system.vercel.app)

## Demo credentials

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| System Owner | `owner@demo.com` | `OwnerDemo123!` | `/owner` |
| Business Admin | `admin@bright-smiles.demo` | `AdminDemo123!` | Bright Smiles Dental |
| Business Admin | `admin@northside.demo` | `AdminDemo123!` | Northside Barbers |

Public booking (no login):

- [Bright Smiles](https://b2-b-booking-system.vercel.app/book/bright-smiles) — hours in `America/New_York`, Mon–Fri 09:00–17:00
- [Northside Barbers](https://b2-b-booking-system.vercel.app/book/northside-barbers) — hours in `America/Chicago`

After booking, keep `/bookings/[token]`. That URL is how the guest views or cancels.

Suggested reviewer path: owner inspects tenants → admin configures Bright Smiles → guest books a weekday slot → same staff + time is rejected → guest cancels → the slot is free again → admin sees `CANCELLED`.

## Stack

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Prisma
- Auth.js (credentials, JWT session)
- Vitest
- Deployed on Vercel, database on Neon

## Run locally

Needs Node 20+ and PostgreSQL.

```bash
cp .env.example .env
# set DATABASE_URL, AUTH_SECRET, AUTH_URL=http://localhost:3000
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

App: [http://localhost:3000](http://localhost:3000) (redirects to `/login`).

```bash
npm test          # conflict + slot tests (uses DATABASE_URL)
npm run build     # production build
```

`prisma db seed` **deletes all rows** then recreates the two demo tenants. Do not run it against a database you care about.

## Environment

| Variable | Local | Production |
| --- | --- | --- |
| `DATABASE_URL` | Postgres URL | Neon **direct / unpooled** URL (`sslmode=require`, host without `-pooler`) |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) | Same idea, a production secret |
| `AUTH_URL` | `http://localhost:3000` | `https://your-app.vercel.app` |

`.env` is gitignored. Vercel build runs `prisma generate`, `prisma migrate deploy`, then `next build`.

## Architecture

Single Next.js app. Pages and route handlers live under `src/app`. Domain logic is in `src/server` so UI and APIs share the same rules.

| Area | Where |
| --- | --- |
| Auth / session | `src/auth.ts`, `src/middleware.ts` |
| Role guards | `src/server/auth/guards.ts` |
| Tenants (owner) | `src/server/tenants/` |
| Admin config | `src/server/admin/` |
| Slots, booking, conflicts | `src/server/bookings/` |

Routes:

- `/login` — owner and admin only
- `/owner` — onboard businesses, enable/disable
- `/admin` — profile, services, staff, hours, appointments
- `/book/[slug]` — public booking
- `/bookings/[token]` — guest confirmation / cancel

APIs that mutate data re-check the session. Middleware covers pages under `/login`, `/owner`, and `/admin`. APIs return 401/403 themselves instead of an HTML redirect.

## Data model

- **Business** — tenant. Unique `slug`, IANA `timezone`, `ACTIVE` / `DISABLED`
- **User** — `SYSTEM_OWNER` (no business) or `BUSINESS_ADMIN` (exactly one business)
- **Service** / **Staff** — `ACTIVE` or `INACTIVE`; inactive ones are not bookable
- **AvailabilityRule** — weekly hours, `dayOfWeek` 0 = Sunday
- **Appointment** — `CONFIRMED` → `COMPLETED` or `CANCELLED`. Unique `manageToken`

## Tenant and role rules

- Admin tenant id comes from the **session** (`businessId`), never from the client.
- Cross-tenant IDs (service, staff, appointment) resolve as **404**, not 403, so names do not leak.
- A **DISABLED** business cannot sign in as admin (`/login?code=business_disabled`) and public `/book/[slug]` + slots return unavailable.
- Owners cannot use `/admin`. Admins cannot use `/owner`.

## Timezones

- `Business.timezone` is an IANA name (`America/New_York`).
- `Appointment.startAt` / `endAt` are stored in **UTC**.
- Slots are generated and shown in the business timezone.
- Past slots in that timezone are not offered.

## Conflicts

Same staff cannot have overlapping appointments unless the existing one is `CANCELLED`. Different staff can share a time.

Create booking:

1. Slot must still be in the generated open list
2. Serializable Prisma transaction
3. Overlap check (`startAt < other.endAt` AND `endAt > other.startAt`)
4. On overlap or retry conflict (`P2034`) the API returns **409**

Cancelled bookings free the slot immediately.

## Tests

`npm test` runs Vitest against the database (tenant slug `vitest-lab`). Coverage includes slot generation (hours, duration, overlaps, cancelled, past) and `createBooking` (double-book, cancel-then-rebook, other staff, tenant isolation).

## Limitations

Out of scope for this take-home: payments, email/SMS, holiday exceptions, staff calendars, customer accounts, waitlists.

Also not built:

- Date-specific closures (only weekly rules)
- Invite email when onboarding an admin (owner sets a temporary password)
- Connection pooling / Prisma Accelerate (Neon direct URL only)
- Rate limiting on public book

## If I had more time

Reminders and confirmation email, closed dates, a day calendar for staff, pooled Neon + `DIRECT_URL` for serverless, and tighter abuse controls on `/api/bookings`.

## Videos

Implementation recordings and the final walkthrough are submitted with the assignment (not stored in this repo).
