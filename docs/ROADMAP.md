# MovieNight — Project Roadmap

## Purpose

This file is the high-level delivery roadmap for MovieNight.

It defines the major project stages, their boundaries, and the order in which they should be executed.

Detailed implementation belongs in the individual files under `docs/stages/`.

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
- full bootstrap verification

Important accepted local contracts:

- Backend: `http://localhost:5080`
- Frontend: `http://localhost:3000`
- Health: `GET /api/health`

---

# Stage 03 — Movie Backend & TMDB Integration

**Status:** Completed

Primary outcome:

Build the complete read-only movie backend boundary over TMDB.

Major capabilities:

- TMDB application authentication with Bearer token
- typed TMDB configuration
- `HttpClient` integration
- TMDB transport models isolated from public MovieNight contracts
- MovieNight-owned DTOs
- full image URLs produced by the backend
- genres
- trending movies
- popular movies
- search
- discover/filtering
- movie details
- cast
- similar movies
- rule-based `Pick for Me`
- explicit error handling
- limited targeted in-memory caching
- backend tests
- live TMDB smoke verification

Explicitly out of scope:

- EF Core
- SQLite
- watchlist persistence
- frontend movie UI
- authentication
- user accounts

Detailed file:

- `docs/stages/03-movie-backend-tmdb-integration.md`

---

# Stage 04 — Anonymous Watchlist Backend & Persistence

**Status:** Next

Primary outcome:

Add application-owned persistence and the anonymous watchlist domain.

Major capabilities:

- EF Core
- SQLite
- migrations
- watchlist aggregate/model
- public `ShareId`
- private owner token
- hashed owner-token persistence
- create watchlist
- read public watchlist
- add movie
- remove movie
- duplicate prevention
- maximum 30 movies
- TMDB movie validation before persistence
- movie snapshot persistence
- watchlist backend tests

Explicitly out of scope:

- registration/login
- ASP.NET Identity
- JWT
- profiles
- frontend final product experience

---

# Stage 05 — Frontend Product Experience

**Status:** Planned

Primary outcome:

Build the real portfolio-ready MovieNight user experience over the completed backend contracts.

Major capabilities:

- application layout and visual direction
- discovery/home experience
- trending section
- popular section
- search experience
- discover filters
- movie cards
- movie details
- cast
- similar movies
- `Pick for Me`
- anonymous watchlist creation
- watchlist owner experience
- public shared watchlist
- loading states
- empty states
- error states
- responsive behavior
- final component organization

Constraints:

- frontend calls only MovieNight backend
- no direct TMDB calls
- no unnecessary state-management/data-fetching libraries
- no redesign of backend contracts without explicit Tech Lead decision

---

# Stage 06 — Full-Stack Integration, Testing & Runtime Hardening

**Status:** Planned

Primary outcome:

Verify all user journeys end-to-end and complete cross-cutting runtime concerns that were intentionally kept lightweight during feature construction.

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

## Cache Completion & Hardening

Stage 03 intentionally introduces only a small explicit `IMemoryCache` baseline.

Stage 06 MUST revisit caching as a dedicated hardening concern rather than leaving the Stage 03 implementation as the final cache design.

The Stage 06 cache review must include:

- inventory of all cacheable TMDB read operations
- verification of whether each existing cache provides measurable value
- explicit TTL policy by data category
- reconsideration of caching for search/discover based on actual behavior and repetition
- cache-key consistency
- optional negative-cache policy for suitable failures/not-found responses
- stale-data tolerance
- refresh/expiration behavior
- memory-bound considerations
- concurrency/cache-stampede considerations where relevant
- logging/observability for cache behavior where useful
- validation that cached DTOs do not leak TMDB transport models
- tests for important cache behavior
- removal of cache entries that add complexity without real value

This is a **planned project requirement**, not an optional future idea.

The goal is still to keep caching simple and local unless measured project needs justify something more complex.

Redis or distributed caching remains out of scope unless a future explicit architecture decision changes that.

---

# Stage 07 — Final Polish & Portfolio Handoff

**Status:** Planned

Primary outcome:

Turn the completed application into a clean portfolio deliverable.

Major capabilities:

- final UX polish
- accessibility pass
- responsive review
- final error/empty/loading-state review
- code cleanup
- dead-code removal
- documentation consistency
- project README
- local run instructions
- architecture summary
- screenshots/demo guidance
- final security/dependency checks
- final repository hygiene
- portfolio/LinkedIn handoff notes

No major new business feature should be introduced in this stage.

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

A stage boundary should change only when:

1. product scope changes materially;
2. an accepted architecture decision changes;
3. implementation reveals a genuine dependency that makes the current ordering unsafe or impractical.

Do not split or merge stages merely because an Agent proposes a different organization.

Any roadmap change must be explicitly approved by the Tech Lead and reflected in:

- `docs/ROADMAP.md`
- affected stage files
- `DECISIONS.md` when appropriate
- `STATUS.md`
