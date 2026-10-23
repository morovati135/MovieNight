# MovieNight — Decisions

Decisions that must be preserved unless explicitly changed. To change one, add a new decision here first.

## Foundations (D001–D024)

| ID | Decision | Why |
|---|---|---|
| D001 | Backend: .NET 10, ASP.NET Core Web API, controller-based (D021) | Modern supported stack; explicit feature controllers |
| D002 | Frontend: Next.js (App Router) + TypeScript, npm (D022) | Mature React base for a polished UI; one package manager |
| D003 | Styling: Tailwind CSS 4 with shadcn-style components on Base UI | Consistent UI without a large custom design system |
| D004 | Persistence: SQLite with EF Core | Local-only app; no database server |
| D005 | TMDB is the source of truth for movies; no local catalog | Nothing to synchronize |
| D006 | The browser never calls TMDB's API; everything goes through the backend | Credentials, mapping, caching and errors stay behind the API |
| D007 | One private anonymous watchlist per browser, tied to a protected anonymous-browser identity | Account-free watchlist, no public sharing |
| D008 | No owner tokens; the identity is protected at the browser boundary (protected HttpOnly cookie) | It is an implementation boundary, not a public write credential |
| D009 | The watchlist stores TMDB movie ids and app-owned metadata, not movie snapshots | TMDB stays the source of truth |
| D010–D013 | One ASP.NET Core project organized by feature; no Clean Architecture, MediatR, CQRS or generic repository; services use `DbContext` directly | Too small to justify layers |
| D014 | `IMemoryCache` for selected TMDB reads (policy: D032) | Useful caching without infrastructure |
| D015 | ASP.NET Core Problem Details for every API error | One consistent error shape |
| D016 | No registration, login, Identity or JWT | Anonymous ownership is enough |
| D017 | Movies only (no TV) | Avoid duplicated mapping, routing and UI |
| D018 | Runs fully on localhost; deployment and Docker are out of scope | The goal is full-stack engineering, not infrastructure |
| D019 | Built by an AI coding agent, with the human as Tech Lead and reviewer | The project is an agent-engineering exercise |
| D020 | Each task gets only the stable docs, the current status and the relevant code | Save agent context |
| D023 | Ports: frontend `http://localhost:3000`, backend `http://localhost:5080` | Predictable CORS, config and smoke tests |
| D024 | Bootstrap was complete only when the frontend reached the backend health endpoint | Prove the full-stack boundary first |

## D025 — Same-origin forwarding for Watchlist requests

Watchlist requests use `/backend/watchlist` and `/backend/watchlist/{movieId}`, which `frontend/next.config.ts` rewrites to the backend `/api/watchlist`. Movie requests call the backend directly through `NEXT_PUBLIC_API_BASE_URL`.

The anonymous identity is a protected HttpOnly cookie (D007, D008). Same-origin requests with `credentials: "include"` let the browser send it; the backend CORS policy never allows credentialed cross-origin calls. The split is intentional.

- The rewrites exist only when `NEXT_PUBLIC_API_BASE_URL` is set at dev-server start or build; otherwise Watchlist calls 404.
- Do not replace this with `localStorage` storage or direct cross-origin Watchlist calls without a new decision.

## D026 — Optional release year on title search

`GET /api/movies/search` accepts an optional `year` (1888–2100), forwarded to TMDB as `primary_release_year`. Genre and minimum rating stay Discover-only; with a title they narrow the loaded matches in the browser. Without a backend year, a year filter could only narrow one page, so common titles showed no results. Do not emulate genre or rating filtering for search by scanning many TMDB pages without a new decision.

## D027 — Movie details enrichment

`GET /api/movies/{id}` also returns `directors`, `productionCountryCodes` and `sceneImageUrls` (up to 10 text-free TMDB backdrops, excluding the hero backdrop). `similarMovies` comes from TMDB *recommendations* (far more relevant than keyword-based "similar"). All of it comes from one TMDB request (`append_to_response=credits,recommendations,images&include_image_language=null`).

- Keep one TMDB request per movie; cap list sizes in the mapper.
- Out of scope: reviews, comments, likes, user ratings, watch providers, IMDb data, studios, trailers, tagline, age rating.

## D028 — Vote-count floor for minimum-rating filters

With a minimum rating, Discover and Pick also send `vote_count.gte=100` (`MinimumRatingVoteCount` in `TmdbClient`); without one, no floor. Otherwise "minimum rating 9" returns obscure titles with a handful of votes. It applies to Search & Discover and Pick. Changing the value or exposing it needs a new decision.

## D029 — Optional backdrop on movie summaries

`MovieSummaryDto` has an optional `backdropUrl` (from the list result TMDB already returns; null when absent and on older Watchlist rows) for landscape cards and the Pick spotlight. Cards fall back to the poster.

Artwork sizes: summary backdrops and the Details hero use TMDB `w1280`; scene images stay `original` for the full-size viewer, and scene thumbnails use `w780`. Multi-MB `original` files timed out in the image optimizer and left heroes blank.

## D030 — Public routes, collections and category pages

Public routes: `/` (Home and Search), `/movies/[id]`, `/pick`, `/watchlist`, `/about`, `/browse/[category]`. A site-wide footer carries the TMDB attribution. Home has curated Collections and "Iconic: Top rated of all time".

- Collections are a fixed, project-curated catalogue (`Features/Collections/MovieCollectionCatalog.cs`): Marvel, DC, Harry Potter, John Wick, Godzilla, Musicals, The Lord of the Rings, Star Wars. Not user-created.
- `GET /api/collections` returns each with up to three cover posters (a collection TMDB cannot load is left out); `GET /api/collections/{slug}/movies?page=` serves one (franchises are one page in release order; studio and genre sets page through Discover; unknown slug is 404).
- "Iconic" (`GET /api/movies/top-rated?page=`) is Discover sorted by rating with at least 10,000 votes, not TMDB's `movie/top_rated`.
- `/browse/[category]` serves `trending`, `popular`, `iconic` and every collection slug; trending, popular and top rated take `?page=` (1–500).
- `/login`, `/register`, `/profile`, `/settings`, `/collections` and `/admin` stay out of scope.

## D031 — `shadcn` is a development tool

`shadcn` is a `devDependency` (for its CLI). The one file the app uses, `shadcn/tailwind.css`, is kept unchanged as `frontend/src/app/shadcn-tailwind.css` and imported by `globals.css`; no component imports the package. After updating `shadcn`, compare its `dist/tailwind.css` with the copy and refresh it if it changed.

## D032 — Cache policy

All TMDB-derived data is cached in memory through one helper, `CatalogCache` (`Features/Caching`), with lifetimes by how fast the data changes (a cold TMDB call costs 0.5–5 s, a cached one about 2 ms):

| Data | Lifetime (`CacheTtl`) |
|---|---|
| Genres | 24 h |
| Collections list and pages | 12 h |
| Top rated (Iconic) | 6 h |
| Movie details and summaries | 2 h |
| Trending and popular pages | 30 min |
| Discover (genre / year / rating / page) | 15 min |
| Unknown movie id (TMDB 404) | 1 min |
| Search | not cached |
| TMDB failures and timeouts | never cached |

- Only MovieNight DTOs are cached, never TMDB models. Pick samples the cached Discover pages.
- Concurrent misses for a key share one TMDB call; one caller cancelling does not cancel it for the others.
- `SizeLimit` is 5000 entries (one per key). Keys are `group:name:...`, with invariant formatting.
- Hits, misses and joined loads are counted (`MovieNight.Cache` meter) and logged at debug level.
- Staleness is accepted up to the lifetime; no background refresh and no invalidation logic.

## D033 — Runtime hardening and configuration

- `Tmdb:ReadAccessToken` is required and `Tmdb:BaseUrl` must be an absolute HTTPS URL; the app refuses to start otherwise, without echoing the token. CORS origins come from `Cors:AllowedOrigins` (default `http://localhost:3000`); credentials are never allowed cross-origin.
- Outside Development an unexpected failure returns a generic `application/problem+json` 500; malformed TMDB answers are 502; exceptions are only logged. OpenAPI, Scalar and `GET /api/tmdb/preflight` exist only in Development.
- The API sends `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`; the frontend sends nosniff, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and a restrictive `Permissions-Policy`.
- The anonymous cookie is HttpOnly, SameSite=Lax, one year, and Secure on HTTPS.
- Not done on purpose, to decide with a hosting choice: Content-Security-Policy, rate limiting (behind the Next proxy every Watchlist call shares one address), HTTPS redirect and HSTS.

## D034 — Documentation and AI instructions

`CLAUDE.md` is the single instruction file for AI agents; there is no `AGENTS.md`. The project UI contract and approved design references live in `.claude/skills/movienight-ui/`. Documentation is kept short; history lives in Git. Working screenshots are not tracked (`docs/screenshots/` is ignored); the README uses a curated set in `docs/images/`.
