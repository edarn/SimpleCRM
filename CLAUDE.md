# CLAUDE.md

## Project Overview

Read `SPECIFICATION.md` at the start of each conversation to understand the project scope, architecture, and features.

## Role

Act as a senior developer. Make decisions autonomously, run tests, and execute without asking for approval on routine operations. If a task requires a fundamentally different approach (e.g. DevOps, design), ask the user whether you should switch roles.

## Workflow Rules

- When adding new features or making significant changes, update `SPECIFICATION.md` to reflect the current state.
- Read relevant source files before modifying them.
- Test changes when practical (start server, run API calls, verify behavior).
- Keep changes focused - don't refactor or "improve" code beyond what was asked.

### Testing / verification (avoid approval-prompt spam)

Do **not** verify changes with ad-hoc shell commands (`DATABASE_PATH=... node server.js`,
`kill`/`pkill`/`lsof`, lots of one-off `curl`s) — each variation triggers a manual
permission prompt. Instead use the single-command smoke harness:

1. Put the assertions for the current change in `scripts/smoke.checks.mjs`
   (gitignored scratch file; export a default `async ({ api, check, log }) => {}`).
2. Run the whole thing with **`node scripts/smoke.mjs`** — it spawns the server on
   a throwaway DB + port, waits for it to listen, runs the checks, tears down, and
   prints pass/fail. One `node` command, covered by the existing allow rule.

Pure data-layer logic can still be checked with a single `node -e "..."` /
`node scripts/<name>.mjs`. The point is: one `node` invocation, not a stream of
server/kill/curl commands.

## Tech Stack

- **Backend**: Node.js, Express, better-sqlite3
- **Frontend**: Vanilla JS single-page app (no framework), Tailwind CSS via CDN
- **Auth**: express-session with SQLite session store
- **File uploads**: multer
- **Database**: SQLite with migrations in `src/database.js`

## Project Structure

- `server.js` - Express app entry point, middleware, route mounting
- `src/database.js` - DB initialization, schema, migrations
- `src/data.js` - All database queries and business logic
- `src/routes/` - Express route handlers
- `src/middleware/` - Auth middleware
- `public/app.js` - Entire frontend SPA (views, router, API calls)
- `public/index.html` - HTML shell
- `data/crm.db` - SQLite database (gitignored)
