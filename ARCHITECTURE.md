# MovieNight — Architecture

A simple full-stack app with clear boundaries and minimal abstraction: no Clean Architecture, CQRS, MediatR, microservices or generic repository (D010–D013).

```text
Browser ──> Next.js frontend ──> ASP.NET Core API ──> TMDB API
                                        └──────────> SQLite (watchlist only)
```

The browser talks only to the MovieNight API. The API owns TMDB access, persistence, validation, caching and business rules.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Base UI, motion |
| Backend | .NET 10, ASP.NET Core controllers, EF Core + SQLite, `IHttpClientFactory`, `IMemoryCache`, Problem Details, OpenAPI + Scalar (Development) |
| Tests | xUnit (+ in-memory ASP.NET Core host), Vitest + Testing Library, axe-core and browser scripts |
| External | TMDB API (read access token, bearer auth) |

## Repository layout

```text
backend/MovieNight.Api/          the API (one project, organized by feature)
  Controllers/                   Movies, Collections, Watchlist, Health, TmdbPreflight + query models
  Features/Movies|Collections|Watchlists|Caching/   services, DTO contracts, CatalogCache
  Integrations/Tmdb/             TmdbClient, options, exceptions, Transport/ (TMDB models, never public)
  Data/, Migrations/             EF Core DbContext and migrations
backend/MovieNight.Api.Tests/    unit tests + Http/ (real app in memory with a fake TMDB)
frontend/src/app/                routes: / /movies/[id] /pick /watchlist /about /browse/[category]
frontend/src/components/         feature folders (home, movie, movie-details, search, pick, watchlist, layout, ui)
frontend/src/lib/api/            the only place that calls the backend; src/types/ mirrors the API
frontend/e2e/                    browser journey, sweep, accessibility and performance scripts
contracts/api-shapes.json        JSON property names shared by backend and frontend tests
.claude/skills/movienight-ui/    UI contract and approved design references
```

Rules: one top-level type per file; public API contracts are MovieNight-owned DTOs, never TMDB models; `Common/` only for code that is genuinely shared.

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Availability (no TMDB call) |
| `GET /api/movies/genres`, `trending`, `popular`, `top-rated` | Lists; paged lists take `?page=` (1–500) |
| `GET /api/movies/search?query=&year=&page=` | Title search (query required, non-blank) |
| `GET /api/movies/discover?genreId=&year=&minRating=&page=` | Filtered discovery |
| `GET /api/movies/pick?genreId=&year=&minRating=` | One random match (404 if none) |
| `GET /api/movies/{id}` | Details with cast, directors, countries, scenes, recommendations |
| `GET /api/collections`, `/api/collections/{slug}/movies?page=` | Curated collections |
| `GET /api/watchlist`, `POST/DELETE /api/watchlist/{movieId}` | The current anonymous browser's watchlist |
| `GET /api/tmdb/preflight` | Development-only TMDB connectivity check |

In Development, `/openapi/v1.json` and `/scalar` document them. Errors are Problem Details (400 validation, 404, 409 watchlist full, 502 TMDB trouble); raw TMDB responses, stack traces and secrets are never returned.

## Watchlist

The first Watchlist request issues a protected, HttpOnly, SameSite=Lax cookie (`movienight.anonymous-id`, one year, Secure on HTTPS) holding an opaque id. Watchlist items are rows of `(anonymous id, TMDB movie id, created time)` in SQLite: at most 50 per browser, no duplicates, add and remove are idempotent, and a movie is validated against TMDB before it is saved. Listing hydrates the ids into movie summaries through the cached summary lookup with bounded concurrency; a movie TMDB no longer knows is skipped and a TMDB outage is a 502. The frontend calls it through the same-origin `/backend` proxy (D025).

## Caching

All caching goes through `CatalogCache` over `IMemoryCache` (D032): lifetimes by data category in `CacheTtl`, shared loads for concurrent misses, a bounded size, a short negative cache for unknown ids, failures never cached, hit/miss counters. Only DTOs are cached. There is no invalidation: entries expire.

## Frontend

- All backend access lives in `src/lib/api/`; components never call `fetch()` directly and never call TMDB.
- Artwork uses `next/image` (30-day optimizer cache) with a fallback that retries TMDB directly (images only).
- Pages load their data in the browser, with explicit loading, empty and error states.
- Visual source of truth: the approved references and contract in `.claude/skills/movienight-ui/`.

## Configuration

| Setting | Where | Notes |
|---|---|---|
| `Tmdb:ReadAccessToken` | user secrets or env `Tmdb__ReadAccessToken` | required; never in committed files |
| `Tmdb:BaseUrl` | `appsettings.json` | HTTPS only |
| `ConnectionStrings:MovieNightDatabase` | `appsettings.json` | SQLite file in `App_Data/` (git-ignored) |
| `Cors:AllowedOrigins` | config / env | default `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL` | `frontend/.env.local` | backend address; also enables the `/backend` proxy |
| `NEXT_PUBLIC_SITE_URL` | env | absolute site address for social previews |

## Testing

Test logic with meaningful failure modes, not coverage numbers.

- Backend unit tests: services, TMDB client and mapping, watchlist rules, cache behavior.
- Backend HTTP tests (`Http/`): the real application with a fake TMDB and a temporary database: routing, validation, Problem Details, cookies, CORS, caching, startup configuration, security headers.
- Contract: `contracts/api-shapes.json` is checked against the real API (backend) and the TypeScript types (frontend).
- Frontend (Vitest): API clients, `useWatchlist`, Browse paging.
- Browser scripts (`frontend/e2e`, live TMDB data): user journeys, 13-route responsive sweep, axe accessibility and keyboard audit, page-load measurements.
