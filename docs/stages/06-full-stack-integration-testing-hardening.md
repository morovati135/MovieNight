# MovieNight — Stage 06: Full-Stack Integration, Testing & Runtime Hardening

## Stage Status

**In Progress — sprint breakdown and recommendations approved by the Tech Lead on 2026-10-23.** Tech Lead note: TTLs are a performance lever, so the TTL policy must be chosen carefully from measured evidence, not guessed.

Stage 05 — Frontend Product Experience is accepted and complete (Sprint 05.8 accepted 2026-10-23).

---

# 1. Stage Intent

Verify the complete user journeys end to end and finish the cross-cutting runtime concerns that were kept lightweight while features were built. No new product features. Any defect found is fixed in the sprint that finds it, or recorded for the Tech Lead if it needs a product decision.

---

# 2. Starting Point (facts from the repository on 2026-10-23)

- Backend: 85 xUnit tests passing (unit tests for catalog, collections, mapper, TMDB client, watchlist service and persistence; controller tests; `WatchlistIntegrationTests`).
- Frontend: lint, type check and build pass; there is no automated frontend test suite. Stage 05 verification used throwaway scripts (CDP against headless Edge), which are not in the repository.
- Production npm audit: 0 findings. 9 dev-only advisories remain with no upstream patch (D031).
- Caches today (`IMemoryCache`, absolute expiry only, `GetOrCreateAsync`, no size limit):

| Key | Data | TTL |
|---|---|---|
| `movies:summary:{id}` | movie summary (watchlist hydration) | 10 min |
| `movies:details:{id}` | movie details | 10 min |
| `movies:genres` | genre list | 6 h |
| `movies:trending:{page}`, `movies:popular:{page}` | list pages | 5 min |
| `movies:top-rated:{page}` | list pages | 1 h |
| `collections:all`, `collections:{slug}:{page}` | collections | 6 h |
| Search, Discover, Pick | not cached | — |

---

# 3. Proposed Sprint Breakdown

## Sprint 06.1 — Cache Review & Hardening (mandatory)

Covers every item in the ROADMAP's mandatory cache list: operation inventory and value of each cache; TTL policy by data category; whether Search/Discover/Pick should be cached (Home genre discovery calls Discover repeatedly); key consistency; negative caching (unknown movie id, TMDB failure); stale-data tolerance; stampede protection (`GetOrCreateAsync` does not de-duplicate concurrent misses); a memory bound (`SizeLimit`) because page-keyed entries grow with `page` 1–500; useful observability (hit / miss logging or counters); cached values stay MovieNight DTOs, never TMDB transport models; cache tests; remove any cache that gives no value. Output: a short cache policy recorded in `DECISIONS.md` plus the code and tests.

## Sprint 06.2 — Backend Integration & Failure-Path Tests

API-level tests through the real pipeline for Movies, Collections and Watchlist: validation errors, 404s, 502 on TMDB failure (Problem Details shape, no raw upstream text), watchlist capacity (50), idempotent add / remove, cookie behavior, bounded hydration with partial TMDB failures. Fills only gaps in the current 85 tests.

## Sprint 06.3 — Frontend/Backend Contract Verification & Frontend Tests

Check that the TypeScript types and API client match the OpenAPI document actually served by the backend. Add a small automated frontend test layer (decision needed: see §4) covering the API client and the critical hooks (`useWatchlist`, paging in Browse), and turn the Stage 05 CDP journeys into repeatable end-to-end checks if the Tech Lead approves a tool.

## Sprint 06.4 — Runtime Configuration, Security & Dependency Audit

Final CORS and configuration validation (development vs. production values, missing TMDB key behavior, cookie flags), security headers, request limits, error-path review (nothing leaks stack traces or upstream bodies), `dotnet list package --vulnerable`, `npm audit`, review of logging for sensitive data.

## Sprint 06.5 — Stage 06 Verification & Handoff

Full local regression (backend tests, frontend checks, live end-to-end run), docs alignment (STATUS, ROADMAP, ARCHITECTURE, DECISIONS), handoff report. Stage 07 is not started.

---

# 4. Decisions Needed From the Tech Lead

1. Approve, reorder or change the five sprints above.
2. Frontend test tooling: Vitest + Testing Library for unit tests, and either Playwright (adds a dev dependency and browser download) or keeping the CDP scripts as committed dev scripts.
3. Whether Search and Discover responses should be cached briefly (they are the most repeated calls), or stay uncached for simplicity.

---

# 4.1 Recommendations (for Tech Lead decision)

1. **Sprint order:** keep 06.1 → 06.5. Cache first, because later tests should lock in the final cache behavior; audit and config after tests so fixes are covered.
2. **Frontend tests:** Vitest + Testing Library for unit/hook tests; keep the Stage 05 CDP journeys as committed dev scripts under `frontend/e2e/` (no Playwright now: it adds a browser download and a large dependency for a project this size; revisit in Stage 07 only if wanted).
3. **Search / Discover caching:** cache Discover (genre/year/rating/page) for 5 minutes, because Home genre switching repeats it; do not cache Search (free-text keys are high-cardinality and low hit rate) or Pick (randomness is the feature). Both behind the memory bound below.
4. **Cache design:** one small `ICatalogCache`-style helper (or extension) instead of repeating `GetOrCreateAsync` in two services, with per-key de-duplication of concurrent misses, a global `SizeLimit` (each entry size 1), no negative caching of TMDB 5xx/timeouts, and a short (1 min) negative cache for unknown ids (404) only.

# 4.2 Detailed Work Packages

## 06.1 — Cache Review & Hardening
- P1 Inventory and evidence: measure hit rate and latency for each cache on a live run; record keep / change / remove for each.
- P2 Policy: TTL by category (static: genres, collections; slow: top rated, details; fast: trending, popular, Discover), written to `DECISIONS.md`.
- P3 Implementation: shared cache helper, de-duplication, `SizeLimit`, negative-cache rule, Discover caching, consistent key naming.
- P4 Observability: debug-level hit/miss logging and a counter; no sensitive data.
- P5 Tests: expiry, de-duplication of concurrent misses, no caching of failures, size bound, key consistency, DTO-only values.
- Exit: policy recorded, tests green, no cache without recorded value.

## 06.2 — Backend Integration & Failure Paths
- P1 Gap analysis against the 85 tests (list what is untested).
- P2 HTTP-level tests with a fake TMDB handler: Movies, Collections, Watchlist happy and failure paths (400 / 404 / 502 Problem Details, no upstream text).
- P3 Watchlist rules: cap of 50, idempotent add / remove, cookie issue and reuse, partial hydration failure.
- Exit: every public endpoint has at least one success and one failure test.

## 06.3 — Contract Verification & Frontend Tests
- P1 Compare `/openapi` output with `src/types` and `src/lib/api` and fix or generate-check drift.
- P2 Add Vitest + Testing Library; test API client error mapping, `useWatchlist`, Browse paging.
- P3 Commit the CDP journeys as `frontend/e2e/` scripts with a README (18 live checks + route sweep).
- Exit: `npm test` and the e2e script documented and passing.

## 06.4 — Runtime Config, Security & Audit
- P1 CORS and config: dev vs production values, missing TMDB key fails clearly, cookie flags (HttpOnly, SameSite, Secure in production).
- P2 Error-path and logging review; security headers; request size / rate considerations.
- P3 `dotnet list package --vulnerable --include-transitive`, `npm audit`, outdated review.
- Exit: findings fixed or recorded with a reason.

## 06.5 — Verification & Handoff
- Full regression (backend tests, lint / tsc / build, frontend tests, live e2e, sweep), docs aligned, handoff report. Stage 07 not started.

---

# 5. Constraints

- No new product features; no Redis or distributed cache (out of scope unless a new architecture decision says otherwise).
- Preserve recorded architecture and decisions; propose changes through `DECISIONS.md`.
- One sprint at a time; do not continue to the next sprint automatically.
- Commit only when the Tech Lead asks.
