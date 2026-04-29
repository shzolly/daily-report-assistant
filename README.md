# Daily Report Assistant

Daily Report Assistant is a Next.js app for collecting daily work activity and turning it into polished, manager-ready reports with Google Gemini. The current access model is URL-based: each user has a personalized workspace route such as `/demo`, `/lei`, or `/admin`.

## What Changed Recently

- Removed the login/signup/PIN flow.
- Added personalized dashboard URLs at `/{username}`.
- Added a friendly missing-workspace screen for invalid URLs.
- Admin users still land on their own Daily Report dashboard by default.
- Admin management moved to `/admin-dashboard`.
- The homepage demo button now opens `/demo`.
- Updated the UI toward a cleaner modern productivity style.
- Added backward-compatible loading for older weekly report records that use `day_of_week`.

## Key Features

### User Dashboards

- Personalized URL access, for example `/demo` or `/lei`
- Monday-Friday weekly navigation
- Activity selection by category
- Per-activity time tracking and notes
- Blockers/risks and tomorrow-plan fields
- AI-generated single-paragraph daily reports
- Editable generated reports
- Copy-to-clipboard support
- Friendly screen when a username does not exist or is inactive

### Admin Dashboard

Admin users access their normal report dashboard at their username URL. For example, if the admin username is `admin`, `/admin` opens that admin user's Daily Report dashboard.

Admin management lives at:

```text
/admin-dashboard?user=admin
```

From there, admins can:

- Create users and assign roles
- See each user's personalized access URL
- Activate or deactivate users
- Manage activity categories
- Manage activities
- View submitted reports

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/demo` | Demo user's Daily Report dashboard |
| `/{username}` | Personalized user dashboard |
| `/admin` | Admin user's own Daily Report dashboard, when `admin` is a valid active user |
| `/admin-dashboard?user={adminUsername}` | Admin management dashboard |
| `/dashboard` | Redirects to `/demo` |
| `/login` | Redirects to `/demo` |
| `/signup` | Redirects to `/demo` |

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI and shadcn-style UI components
- Supabase PostgreSQL
- Google Gemini via `@google/genai`
- Vercel Analytics

## Data Model

The app uses these main tables:

- `users`: username, full name, role/admin status, active status
- `categories`: activity category definitions
- `activities`: activities assigned to categories
- `reports`: daily or legacy weekly report records
- `report_activities`: selected activities, notes, hours, and day-of-week metadata

The legacy `pin` column may still exist in older databases, but it is no longer used for access.

## Database Setup

Run the SQL scripts in `scripts/` in order when setting up a fresh Supabase database. For existing installs that are moving from PIN access to URL access, make sure to run:

```text
scripts/011_url_based_access.sql
```

That migration makes the legacy `pin` field nullable and documents the new URL-based username behavior.

You should create at least:

- A `demo` user for the homepage demo button
- An `admin` user with `is_admin = true` if you want `/admin` to open the admin user's dashboard

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Development

Install dependencies:

```bash
pnpm install
```

Start the dev server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Build:

```bash
pnpm build
```

Typecheck:

```bash
pnpm typecheck
```

The project scripts use webpack for Next.js commands:

```json
"dev": "next dev --webpack",
"build": "next build --webpack"
```

This avoids Turbopack process-spawn issues seen in some Windows environments and remains compatible with Vercel.

## Deployment

The app is Vercel-ready. Set the environment variables in Vercel, connect the GitHub repository, and use the default build command:

```bash
pnpm run build
```

## Notes

- User access is intentionally simple: the username in the URL is the workspace selector.
- Admin management requires an active admin user and should be opened with `?user={adminUsername}`.
- Invalid usernames do not show the default Next.js 404; they render a user-friendly workspace-not-found screen.
