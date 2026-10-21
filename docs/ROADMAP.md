# MovieNight — Project Roadmap

## Purpose

This file is the high-level delivery roadmap for MovieNight.

It defines:

- major project stages
- stage boundaries
- execution order
- current stage status

Detailed implementation belongs in the individual files under:

```text
docs/stages/
```

The project uses Stage numbers starting at `00`.

---

# Stage 00 — Product Definition

**Status:** Completed

Primary outcomes:

- product vision
- target experience
- version 1 scope
- business rules
- user flows
- explicit non-goals

Primary canonical output:

- `PROJECT.md`

---

# Stage 01 — Technical Foundation

**Status:** Completed

Primary outcomes:

- backend/frontend technology selection
- architectural boundaries
- local-development conventions
- dependency policy
- rejected architectural patterns

Primary canonical outputs:

- `ARCHITECTURE.md`
- `DECISIONS.md`

---

# Stage 02 — Project Bootstrap

**Status:** Completed

Primary outcomes:

- Git/repository baseline
- .NET 10 backend bootstrap
- Next.js frontend bootstrap
- backend health endpoint
- local CORS configuration
- frontend-to-backend smoke integration
- Codex-native project instructions
- bootstrap verification/handoff

Accepted local contracts:

```text
Backend:  http://localhost:5080
Frontend: http://localhost:3000
Health:   GET /api/health
```

Detailed Stage file:

- `docs/stages/02-project-bootstrap.md`

---

# Stage 03 — Movie Backend & TMDB Integration

**Status:** Completed

Primary outcome:

Build a stable MovieNight-owned read-only Movie backend boundary over TMDB.

Completed capabilities include:

- TMDB Bearer Read Access Token integration
- typed TMDB configuration
- `HttpClient` integration
- TMDB transport models isolated from public MovieNight contracts
- MovieNight-owned DTOs
- backend-produced full image URLs
- genres
- trending
- popular
- search
- discover/filtering
- Movie Details
- cast
- similar movies
- rule-based Pick for Me
- explicit error translation
- limited targeted in-memory caching
- tests and live verification
- Stage handoff

Important boundary:

```text
Frontend → MovieNight backend → TMDB
```

The frontend must never call TMDB directly.

Detailed file:

- `docs/stages/03-movie-backend-tmdb-integration.md`

---

# Stage 04 — Anonymous Watchlist Backend & Persistence

**Status:** Completed

Primary outcome:

Add application-owned persistence and a browser-private anonymous Watchlist without user accounts.

Accepted capabilities:

- EF Core
- SQLite
- migrations
- backend-generated anonymous browser identity
- protected persistent anonymous cookie
- one implicit Watchlist per anonymous browser identity
- no public ShareId / owner-token model in V1
- Movie IDs only in persistence
- no persisted Movie snapshots
- duplicate prevention
- maximum 50 Watchlist items
- backend Movie validation
- backend hydration through the Movie/TMDB boundary
- newest-first ordering
- bounded summary lookup behavior
- Watchlist tests/integration verification
- ASP.NET Core OpenAPI
- Scalar API documentation
- Stage handoff

Explicitly out of scope:

- registration/login
- ASP.NET Identity
- JWT
- user profiles
- device/account Watchlist sync
- public shared Watchlists
- named collections

Detailed file:

- `docs/stages/04-anonymous-watchlist-backend-persistence.md`

---

# Stage 05 — Frontend Product Experience

**Status:** In Progress

Primary outcome:

Build the polished, responsive, portfolio-ready MovieNight frontend over the completed Movie and Anonymous Watchlist backend contracts.

Public frontend routes:

```text
/                    → Discover / Home
/movies/[id]         → Movie Details
/pick                → Pick for Me
/watchlist           → Anonymous Watchlist
```

Major capabilities:

- application shell / design foundation
- Discover / Home
- Search and Discover interaction
- Trending and Popular discovery
- Genre discovery
- Movie cards / rails / grids
- Movie Details
- Cast
- Similar Movies
- Pick for Me
- anonymous browser-private Watchlist
- saved-state feedback
- loading / error / empty / not-found states
- responsive layouts
- accessibility / interaction quality
- reference-driven visual implementation
- final frontend verification/handoff

## Current Stage 05 Progress

```text
05.1 — Frontend Design Foundation & App Shell
       Status: Completed / Accepted

05.2 — Discover Home Experience
       Status: Completed / Accepted
       Execution:
       05.2-H1 → 05.2-H2 → 05.2-H3 → 05.2-H4

05.3 — Search & Discover Experience
       Status: Completed / Accepted
       Execution:
       05.3-S1 → 05.3-S2 → 05.3-S3

05.4 — Movie Details Experience
       Status: Not Started

05.5 — Pick for Me Experience
       Status: Not Started

05.6 — Anonymous Watchlist Experience
       Status: Not Started

05.7 — Responsive, Interaction & UX Polish
       Status: Not Started

05.8 — Stage 05 Verification & Handoff
       Status: Not Started
```

Sprint 05.2 remains **one Sprint**.

Its H1–H4 items are internal work packages used to reduce Agent context and create explicit visual review checkpoints.

Detailed H1–H4 scope, reference assets, acceptance criteria, and stop boundaries live only in:

- `docs/stages/05-frontend-product-experience.md`

Detailed product/visual/reference rules live in:

- `.agents/skills/movienight-ui/`

Stage 05 constraints:

- frontend calls only MovieNight backend
- no direct TMDB frontend calls
- no fake account/profile/streaming capabilities
- no authentication frontend
- no subscription product
- no unnecessary frontend frameworks/libraries
- reference assets define approved appearance
- existing frontend visuals are not the redesign source of truth
- valid existing API/data-flow logic may be reused
- no Stage 06 hardening work is started early

Detailed Stage file:

- `docs/stages/05-frontend-product-experience.md`

---

# Stage 06 — Full-Stack Integration, Testing & Runtime Hardening

**Status:** Planned

Primary outcome:

Verify the complete user journeys end-to-end and complete cross-cutting runtime concerns that were intentionally kept lightweight during feature construction.

Major capabilities:

- end-to-end feature integration
- API integration tests where valuable
- critical business-rule tests
- failure-path verification
- frontend/backend contract verification
- local full-stack regression testing
- dependency/security audits
- runtime/error-path review
- final CORS/configuration validation

## Mandatory Cache Completion & Hardening

Stage 03 intentionally introduced only a small explicit `IMemoryCache` baseline.

Stage 06 must revisit caching as a dedicated hardening concern.

The review must include:

- cacheable-operation inventory
- evidence/value of existing caches
- TTL policy by data category
- Search/Discover caching reconsideration
- cache-key consistency
- suitable negative-cache policy
- stale-data tolerance
- expiration/refresh behavior
- memory-bound considerations
- concurrency/cache-stampede concerns where relevant
- useful cache observability
- DTO/transport-boundary verification
- important cache tests
- removal of cache complexity that provides no value

This is a planned requirement, not an optional future idea.

Redis/distributed caching remains out of scope unless a future explicit architecture decision changes that.

---

# Stage 07 — Final Polish & Portfolio Handoff

**Status:** Planned

Primary outcome:

Turn the verified application into a clean portfolio deliverable.

Major capabilities:

- final UX polish
- final accessibility review
- responsive review
- final error/empty/loading review
- code cleanup
- dead-code removal
- documentation consistency
- project README
- local run instructions
- architecture summary
- screenshots/demo guidance
- final security/dependency checks
- repository hygiene
- portfolio/LinkedIn handoff notes

No major new business feature should be introduced in this Stage.

---

# Stage Order

```text
00 Product Definition
        ↓
01 Technical Foundation
        ↓
02 Project Bootstrap
        ↓
03 Movie Backend & TMDB Integration
        ↓
04 Anonymous Watchlist Backend & Persistence
        ↓
05 Frontend Product Experience
        ↓
06 Full-Stack Integration, Testing & Runtime Hardening
        ↓
07 Final Polish & Portfolio Handoff
```

Total project stages: **8 stages (00 through 07)**.

---

# Roadmap Change Rule

A Stage boundary should change only when:

1. product scope changes materially;
2. an accepted architecture decision changes;
3. implementation reveals a genuine dependency that makes the current ordering unsafe or impractical.

Do not split or merge Stages merely because an Agent proposes a different organization.

Internal work packages such as Sprint 05.2-H1 through H4 do not change the Stage or Sprint numbering model.

Any material roadmap change must be explicitly approved by the Tech Lead and reflected in:

- `docs/ROADMAP.md`
- affected Stage files
- `DECISIONS.md` when appropriate
- `STATUS.md`
