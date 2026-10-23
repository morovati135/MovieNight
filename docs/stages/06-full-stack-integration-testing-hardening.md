# Stage 06 — Full-Stack Integration, Testing and Runtime Hardening

**Status:** completed.

**Goal:** prove the whole system works and finish cross-cutting runtime concerns.

**Delivered:** a reviewed cache policy and the shared `CatalogCache` (D032); HTTP-level backend tests with a fake TMDB (movies, collections, watchlist, errors, cookies, CORS, startup configuration); a shared API contract checked on both sides; a Vitest suite and committed browser scripts (journeys, responsive sweep); runtime hardening and security headers (D033); dependency and secret audits.

**Results at handoff:** 178 backend and 41 frontend tests passing, all journey and sweep checks clean, no known vulnerable dependencies.

**Open by design:** CSP, rate limiting and HTTPS/HSTS depend on a hosting decision (D033).
