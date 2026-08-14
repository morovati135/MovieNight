# MovieNight — Stage 00: Product Definition

## Stage Status

**Completed and accepted before implementation began.**

This stage defines the product contract that all later Codex work must preserve.

---

## 1. Stage Intent

Define exactly what MovieNight is, who it serves, which user journeys belong to version 1, and which tempting features are intentionally excluded.

This stage contains no application implementation.

Its primary durable output is `PROJECT.md`.

---

## 2. Canonical Context

For product-level decisions, use:

- `AGENTS.md` — project-wide Codex execution rules
- `PROJECT.md` — authoritative product scope and business rules
- `DECISIONS.md` — locked decisions
- this stage file — record of how the product scope was established

`ARCHITECTURE.md` does not override product scope.

If architecture and product requirements conflict, the conflict must be surfaced to the Tech Lead rather than silently resolving it through implementation.

---

## 3. Entry Criteria

- A small full-stack portfolio project has been selected.
- Backend and Agent Engineering are the primary learning goals.
- The human acts as Tech Lead and reviewer.
- The project must remain realistic but intentionally small.
- Version 1 is local-only.

---

## 4. Stage Outcome

After this stage:

- MovieNight has a stable product vision.
- Version 1 scope is explicit.
- Primary user flows are explicit.
- Business rules are explicit.
- Non-goals are explicit.
- Codex can determine whether proposed work is in or out of scope without relying on old chat history.

---

## 5. In Scope

### Product

MovieNight is a movie discovery application with an anonymous, shareable watchlist.

### Version 1 capabilities

- Home page
- Trending/popular movie discovery
- Search
- Genre filtering
- Release-year filtering
- Minimum-rating filtering
- Pagination
- Movie details
- Cast
- Similar movies
- Rule-based `Pick for Me`
- Anonymous watchlist creation
- Add/remove watchlist items
- Returning owner through browser-local ownership data
- Public read-only watchlist sharing

### Data ownership

- TMDB is the movie source of truth.
- MovieNight persists only application-owned state.
- Watchlist items store a small movie snapshot for efficient rendering.

---

## 6. Out of Scope

Version 1 does not include:

- TV series
- registration
- login
- ASP.NET Identity
- JWT
- profiles
- roles/permissions
- admin panel
- reviews/comments
- likes
- user ratings
- notifications
- email
- payments
- localization
- multi-language UI
- AI/LLM recommendation
- Docker
- CI/CD
- production deployment
- microservices

The complete authoritative non-goal list remains in `PROJECT.md`.

---

## 7. Product Rules That Must Survive Refactoring

1. The frontend never calls TMDB directly.
2. Anonymous watchlists remain publicly readable.
3. Only the owner token authorizes watchlist mutation.
4. Raw owner tokens are not stored in the database.
5. A movie cannot appear twice in one watchlist.
6. Watchlists contain at most 30 movies.
7. A movie is validated against TMDB before persistence.
8. Version 1 supports movies only.
9. `Pick for Me` is simple application logic, not an AI recommendation system.
10. Codex must not add features merely because they are common or potentially useful.

---

# 8. Decision Breakdown

This is a specification stage, not an implementation stage.

## Decision 00.1 — Product Scope Lock

Accepted:

- [x] Product vision documented.
- [x] Core features documented.
- [x] Movie-only scope selected.
- [x] Authentication excluded.
- [x] Local-only execution accepted.

## Decision 00.2 — Business Rules Lock

Accepted:

- [x] Anonymous ownership model defined.
- [x] Watchlist mutation authorization defined.
- [x] Watchlist capacity defined.
- [x] Duplicate prevention defined.
- [x] TMDB validation before persistence defined.
- [x] Pick-for-Me behavior defined.

## Decision 00.3 — User Flow Lock

Accepted:

- [x] Discovery flow
- [x] Search flow
- [x] Filtering flow
- [x] Recommendation flow
- [x] Watchlist creation flow
- [x] Returning-owner flow
- [x] Shared read-only flow

---

# 9. Stage Definition of Done

- [x] `PROJECT.md` is the canonical product specification.
- [x] Product scope is understandable without prior chat history.
- [x] Business rules are explicit.
- [x] Non-goals are explicit.
- [x] Primary user flows are explicit.
- [x] No implementation code was required.

---

# 10. Change Control

If a later request changes a product-level decision:

1. Update `PROJECT.md`.
2. Update or append the relevant entry in `DECISIONS.md`.
3. Evaluate architecture impact.
4. Update affected future stage files.
5. Update `STATUS.md`.

A later implementation sprint must never silently redefine product scope.
