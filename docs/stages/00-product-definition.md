# MovieNight — Stage 00: Product Definition

## Stage Status

**Completed before implementation begins.**

This stage captures the product contract that future implementation stages must preserve.

---

## 1. Stage Intent

Define exactly what MovieNight is, who it serves, which user journeys belong to version 1, and which tempting features are intentionally excluded.

This stage contains no application code.

Its output is the stable product context in `PROJECT.md`.

---

## 2. Canonical Context

- `PROJECT.md`
- `DECISIONS.md`
- this stage file

`ARCHITECTURE.md` is not the authority for product scope. If architecture and product scope ever conflict, the conflict must be resolved explicitly rather than silently changing the product.

---

## 3. Entry Criteria

- A small full-stack portfolio project has been selected.
- Backend/Agent Engineering is the primary learning goal.
- The human intends to act primarily as Tech Lead and reviewer.
- The project must remain realistic but intentionally small.

---

## 4. Stage Outcome

After this stage:

- MovieNight has a stable product vision.
- Version 1 scope is explicit.
- Primary user flows are explicit.
- Business rules are explicit.
- Non-goals are explicit.
- Future agents can determine whether proposed work is in or out of scope without relying on old chat history.

---

## 5. In Scope

### Product

MovieNight is a movie discovery application with an anonymous shareable watchlist.

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

Do not add these to version 1:

- TV series
- user registration
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
- recommendation AI/LLM
- deployment
- Docker
- CI/CD
- microservices

The authoritative extended non-goal list remains in `PROJECT.md`.

---

## 7. Product Rules That Must Survive Refactoring

1. The frontend never calls TMDB directly.
2. Anonymous watchlists remain publicly readable.
3. Only the owner token authorizes watchlist mutation.
4. Raw owner tokens are not stored in the database.
5. A movie cannot appear twice in one watchlist.
6. Watchlists have a maximum of 30 movies.
7. A movie is validated against TMDB before being added.
8. Version 1 supports movies only.
9. `Pick for Me` is simple application logic, not an AI recommendation system.
10. New features must not be added merely because the coding agent considers them common or useful.

---

# 8. Sprint Breakdown

This is a planning/specification stage. These sprints represent decisions already completed by the Tech Lead and are not coding-agent implementation tasks.

---

## Sprint 00.1 — Product Scope Lock

### Objective

Freeze the minimum useful product.

### Acceptance Criteria

- [x] Product vision is documented.
- [x] Core features are documented.
- [x] Version 1 is movie-only.
- [x] Authentication is excluded.
- [x] Local-only execution is accepted.

---

## Sprint 00.2 — Business Rules Lock

### Objective

Define the minimum backend behavior that makes MovieNight more than a TMDB UI.

### Acceptance Criteria

- [x] Anonymous ownership model is defined.
- [x] Watchlist mutation authorization is defined.
- [x] Watchlist capacity is defined.
- [x] Duplicate prevention is defined.
- [x] Movie validation before persistence is defined.
- [x] Pick-for-Me behavior is defined.

---

## Sprint 00.3 — User Flow Lock

### Objective

Define the end-to-end flows used later for integration verification.

### Acceptance Criteria

- [x] Discovery flow exists.
- [x] Search flow exists.
- [x] Filtering flow exists.
- [x] Recommendation flow exists.
- [x] Watchlist creation flow exists.
- [x] Returning-owner flow exists.
- [x] Shared read-only watchlist flow exists.

---

# 9. Stage Definition of Done

- [x] `PROJECT.md` is the canonical product specification.
- [x] Product scope is understandable without prior chat history.
- [x] Business rules are explicit.
- [x] Non-goals are explicit.
- [x] Primary user flows are explicit.
- [x] No code was required to complete this stage.

---

# 10. Change Control

If a future request changes a product-level decision:

1. Update `PROJECT.md`.
2. Add or amend the relevant decision in `DECISIONS.md`.
3. Evaluate architecture impact.
4. Update affected future stage files.
5. Update `STATUS.md`.

Do not let an implementation sprint silently redefine product scope.
