# MovieNight — Instructions for AI Coding Agents

This is the single instruction file for AI agents working in this repository (it is named `CLAUDE.md` because that is the file Claude Code loads automatically; other tools can read it as plain Markdown). Humans: see [README.md](README.md) and [docs/AI-WORKFLOW.md](docs/AI-WORKFLOW.md).

MovieNight is a small full-stack movie app: ASP.NET Core 10 API + Next.js 16 frontend over TMDB, with an anonymous cookie-based watchlist (no accounts).

## Read before substantial work

1. [STATUS.md](STATUS.md): current state; the source of truth for "where are we".
2. [PROJECT.md](PROJECT.md), [ARCHITECTURE.md](ARCHITECTURE.md), [DECISIONS.md](DECISIONS.md): product, structure, rules.
3. The relevant file under [docs/stages/](docs/stages/) when working on a stage.

Repository docs outrank chat history. Inspect only the code relevant to the task.

## Working model

- The human is Tech Lead and reviewer; the agent implements and investigates.
- Work only on what was asked. Never continue into the next sprint automatically.
- Preserve recorded architecture and decisions; propose changes in `DECISIONS.md` first. Ask before changing architecture, security, product scope or data semantics.
- No new product features, packages or patterns without a current requirement. No unrelated refactors.
- Never mark Tech Lead acceptance unless the human explicitly accepted it.
- Review tasks are read-only unless fixes are explicitly requested.
- Do not claim verification you did not run. Report what changed, what was run, the result and open issues.

## Verify before reporting completion

| Area | Commands (repository root) |
|---|---|
| Backend | `dotnet test backend/MovieNight.slnx` |
| Frontend | `cd frontend && npm run typecheck && npx eslint && npm test && npm run build` |
| Live checks (needs both servers and a TMDB token) | `cd frontend && npm run e2e`, `npm run e2e:sweep`, `npm run e2e:a11y` (see `frontend/e2e/README.md`) |

Update `STATUS.md` when the real project state changes.

## Backend rules (`backend/`)

- .NET 10, controller-based Web API, one application project; code organized by feature; EF Core + SQLite with the `DbContext` used directly by services.
- **One top-level type per file.** Public API contracts are MovieNight-owned DTOs, never raw TMDB models; TMDB transport types stay under `Integrations/Tmdb`.
- All TMDB calls go through `TmdbClient` (`IHttpClientFactory`); all caching goes through `CatalogCache` with the TTLs in `CacheTtl` (D032). Preserve async I/O and cancellation.
- Public errors are Problem Details. Never leak exceptions, stack traces, secrets or raw TMDB errors.
- Do not add without explicit approval: MediatR, CQRS, AutoMapper, generic repositories, Unit of Work wrappers, Redis, message brokers, background jobs, auth frameworks, extra application projects.
- Tests: behavioral tests of business rules and HTTP behavior (`MovieNight.Api.Tests/Http` runs the real app with a fake TMDB). No placeholder tests. Do not suppress NuGet vulnerability warnings; use the smallest compatible fix.

## Frontend rules (`frontend/`)

- Next.js App Router, TypeScript, Tailwind CSS 4, Base UI primitives. This Next.js version has breaking changes from older releases: read the relevant guide in `frontend/node_modules/next/dist/docs/` before writing Next-specific code.
- The browser talks only to the MovieNight API (`NEXT_PUBLIC_API_BASE_URL`, and the same-origin `/backend` proxy for the Watchlist). Never call TMDB's API or expose credentials in browser code. All API access lives in `src/lib/api/`; no raw `fetch()` in components.
- Keep the TypeScript types in `src/types/` and `contracts/api-shapes.json` in sync with the API (both sides have tests).
- Visual work: the approved reference images and the project design contract in `.claude/skills/movienight-ui/` are the visual source of truth, not existing code. Validate at 390, 768 and 1440 px.

## Secrets

- Never commit secrets or real API keys, and never put them in `appsettings*.json`, `.env.example` or the frontend. The TMDB token comes from .NET user secrets or the `Tmdb__ReadAccessToken` environment variable (see README).
- Markdown and code must contain no personal paths, e-mail addresses or machine names.

## Git

- Do not commit, push or open pull requests unless explicitly asked. Prefer a clean tree before starting work. No destructive Git commands without explicit approval.
- Commit messages describe what the change does, not the project phase: a conventional prefix (`feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `chore`) with an optional scope, an imperative subject under about 72 characters, and a short body explaining why when it is not obvious. Never mention sprint, stage or work-package numbers. Keep unrelated changes in separate commits.
