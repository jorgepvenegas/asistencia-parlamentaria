## Purpose
Keep changes minimal, verifiable, scoped.

## Key Conventions

- **Data flow**: Astro pages fetch server-side → pass to React components via `client:load`
- **Types**: Shared schemas from `@quienatiende/shared`, frontend-specific in `src/types/`
- **Styles**: Inline styles + Tailwind (migrating to Tailwind)
- **Colors**: `ATTENDANCE_COLORS` in `constants/colors.ts` - single source of truth
- **Validation**: Zod schemas for all API responses
- **Routing**: Year-based static paths (2022-2025)

## Guardrails

- No unrelated refactors
- No public interface changes without explicit need
- Reuse utilities before adding abstractions
- No new deps without justification
- Preserve TypeScript strictness

## Validation

- Frontend: `pnpm -F @quienatiende/frontend lint test`
- API: `pnpm -F @quienatiende/api lint test`
- Shared: `pnpm -F @quienatiende/shared test`
- Full suite: `pnpm lint && pnpm test`

## Safety

- Never run deploy commands unless requested
- Schema changes = high impact, document migration
- Prefer non-destructive git operations

## Context

- Monorepo: pnpm workspaces
- Packages: frontend (Astro+React+Tailwind), api (Hono+Drizzle+CF Workers), shared (types/schemas), automation (scraping)
