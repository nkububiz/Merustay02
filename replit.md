# Reome Rentals

A browser-only rental discovery prototype with interactive listings, search, favorites, and a guided renter questionnaire.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/reome-rentals run dev` — run the Reome Rentals prototype
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

- The rental listings and search behavior are a browser-only simulation, not live inventory.
- The renter brief and saved homes persist in localStorage; the 98% score represents simulated brief completeness, not an AI match guarantee.
- Vite is only the development/build shell; the interface is plain HTML, CSS, and vanilla JavaScript.

## Product

Renters can browse demo homes, filter by neighborhood, type, budget, and bedrooms, and save favorites. A guided six-step renter brief collects timing, location, budget, home type, bedrooms, and priorities, then lets renters review or edit answers and apply the brief to listings.

## User preferences

- Keep this app implemented with plain HTML, CSS, and vanilla JavaScript only.
- Keep the rental search and questionnaire simulated in the browser; do not add a backend or external API.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
