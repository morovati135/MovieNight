# MovieNight Frontend Instructions

## Scope

- Keep the frontend in `src/` and use the Next.js App Router.
- Use TypeScript, Tailwind CSS, and shadcn/ui. Add dependencies only when a current sprint requires them.
- Keep application code explicit and feature-oriented; do not add abstraction layers prematurely.

## API Boundary

- The frontend communicates only with the MovieNight ASP.NET Core API.
- Never call TMDB directly or expose TMDB credentials in browser code.
- Centralize backend API access under `src/lib/api/` when API integration is introduced; do not scatter raw `fetch()` calls across components.
- Read `NEXT_PUBLIC_API_BASE_URL` from environment configuration for backend requests.

## Components and State

- Place reusable shadcn/ui primitives in `src/components/ui/`.
- Keep movie, watchlist, and layout components in their corresponding feature folders when those features are implemented.
- Do not add state-management, animation, or client data-fetching libraries unless a sprint explicitly requires one.

## Verification

- Run the narrowest relevant npm checks for the current sprint before reporting completion.
- Do not begin a later sprint or implement domain features ahead of their stage.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
