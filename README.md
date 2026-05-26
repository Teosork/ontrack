# OnTrack

Nutrition tracking web app. Log calories, protein, carbs, and fat against personal daily targets. Look up foods by barcode (via Open Food Facts) or create them manually.

## Status

Early development. Building toward v1.

## Tech stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: React, TypeScript, Vite, TanStack Query, Tailwind CSS
- **Auth**: JWT (access token) + HTTP-only refresh cookie
- **External data**: Open Food Facts (backend-mediated, local DB is source of truth)
- **Package manager**: pnpm (monorepo workspaces)

## Repository layout

```
ontrack/
├── server/    # NestJS backend
└── client/    # React frontend
```