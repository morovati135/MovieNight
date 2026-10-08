# MovieNight — Project Status

## Current Phase

Implementation / Stage 05 (in progress)

## Current Stage

Stage 05 — Frontend Product Experience (in progress)

## Current Sprint

Sprint 05.2 — Discover Home Experience (in progress)

### Sprint 05.2 Work Packages

- [x] 05.2-H1 — Shell Adaptation + Featured Hero
- [x] 05.2-H2 — Trending + Popular + Movie Rails
- [x] 05.2-H3 — Genre Discovery + Pick CTA + Watchlist Preview
- [ ] 05.2-H4 — Home States + Responsive Polish + Visual QA

05.2-H3 accepted by the Tech Lead. Final accepted state:

- Backend-driven Genre discovery with a horizontal chip row, mouse-accessible previous/next controls from tablet width up, and an independent result rail; a failed genre request clears the result rail instead of showing the previous genre's movies.
- Watchlist, genre list, and genre results load independently of the critical Home path (Hero / Trending / Popular); each failure is contained to its own section with a local retry.
- Anonymous Watchlist preview integrated with the shared saved-state logic.
- Pick for Me CTA redesigned as a responsive cinema ticket (perforation notches, divider, stub) linking to `/pick`; copy reflects genre / release year / minimum rating.
- CSS-only travelling edge glow on the CTA: one light source on the ticket outline (edge-shaped hotspot, short rim highlight, local outer halo, shallow inner bleed) that follows corners without rotation, scaled for mobile / tablet / desktop, 35s lap; hidden under reduced motion.
- Verified: lint, build, `git diff --check`, live backend checks, and 1440 / 768 / 390 screenshots in `docs/screenshots/05.2-H3-*`.

Sprint 05.2 is complete only after H1–H4 are accepted.

---

## Current Transition State

Sprint 05.1 remains accepted and is not reopened.

Its valid frontend engineering foundation remains active, including:

- Manrope typography foundation
- non-pure-black design foundation
- shared design-token direction
- reusable shell/layout primitives
- application navigation structure
- reduced-motion/accessibility foundation
- centralized API-client direction

A previous Sprint 05.2 Home implementation was partially completed but was not accepted as the final visual implementation.

That previous visual composition is superseded by the approved reference-driven 05.2 workflow.

Valid non-visual 05.2 work may be retained or deliberately ported, especially:

- Movie API adapters/contracts
- Genre/Discover integration
- Watchlist API transport
- browser credential handling
- saved-state logic
- other reusable data-flow/state behavior

The existing frontend visual implementation is not a visual source of truth for the redesign.

---

## Accepted / Completed

- Stage 00 — Product Definition
- Stage 01 — Technical Foundation
- Sprint 02.1 — Repository Preflight
- Sprint 02.2 — Backend Bootstrap
- Sprint 02.3 — Frontend Bootstrap
- Sprint 02.4 — Local Full-Stack Smoke Integration
- Sprint 02.5 — Bootstrap Verification & Handoff
- Stage 02 — Project Bootstrap
- Sprint 03.1 — TMDB Access Preflight & Configuration
- Sprint 03.2 — TMDB Client & Movie Contract Boundary
- Sprint 03.3 — Discovery & Search API
- Sprint 03.4 — Movie Details, Cast & Similar API
- Sprint 03.5 — Pick for Me
- Sprint 03.6 — Stage 03 Verification & Handoff
- Stage 03 — Movie Backend / TMDB Integration
- Sprint 04.1 — Persistence Foundation
- Sprint 04.2 — Anonymous Visitor Identity
- Sprint 04.3 — Watchlist Domain & Persistence
- Sprint 04.4 — Watchlist API & Hydration
- Sprint 04.5 — OpenAPI & Scalar API Documentation
- Sprint 04.6 — Watchlist Integration & Edge Cases
- Sprint 04.7 — Stage 04 Verification & Handoff
- Stage 04 — Anonymous Watchlist Backend & Persistence
- Sprint 05.1 — Frontend Design Foundation & App Shell (Manrope selected)
- 05.2-H1 — Shell Adaptation + Featured Hero
- 05.2-H2 — Trending + Popular + Movie Rails
- 05.2-H3 — Genre Discovery + Pick CTA + Watchlist Preview
- Product scope and non-goals locked
- Backend/frontend stack selected
- Local development conventions locked
- MovieNight project-local UI skill / reference workflow established

---

## In Progress

- Sprint 05.2 — Discover Home Experience
- Reference-driven Home redesign through 05.2-H1 → H4

---

## Not Started

- Sprint 05.3 — Search & Discover Experience
- Sprint 05.4 — Movie Details Experience
- Sprint 05.5 — Pick for Me Experience
- Sprint 05.6 — Anonymous Watchlist Experience
- Sprint 05.7 — Responsive, Interaction & UX Polish
- Sprint 05.8 — Stage 05 Verification & Handoff
- Stage 06 — Full-Stack Integration, Testing & Runtime Hardening
- Stage 07 — Final Polish & Portfolio Handoff

---

## Current Frontend Execution Model

MovieNight frontend implementation now uses repository-local Agent skills and approved reference assets.

Primary implementation skills:

```text
$movienight-ui
$frontend-app-builder
$ui-ux-pro-max
```

Final UI/UX review:

```text
$movienight-ui
$web-design-guidelines
```

Detailed visual/product rules live in:

```text
.agents/skills/movienight-ui/
```

Current Home references live in:

```text
.agents/skills/movienight-ui/assets/home/
```

Sprint 05.2 is intentionally executed as small work packages to reduce context usage and improve visual review quality.

---

## Current Architectural Constraints

- One ASP.NET Core application project
- .NET 10
- Next.js frontend
- SQLite + EF Core for application-owned Watchlist persistence
- TMDB accessed only through backend
- anonymous browser-private Watchlist
- protected backend-owned anonymous cookie
- no authentication system
- no MediatR
- no CQRS
- no generic repository
- no multi-project Clean Architecture
- no Docker
- no production deployment
- frontend visual design is reference-driven
- existing frontend code is not a visual source of truth
- valid existing API/data-flow logic should be preserved where useful

---

## Known Issues / Blockers

None currently blocking Sprint 05.2.

Repository transition caution:

- accepted 05.1 foundation and partial/superseded 05.2 work currently coexist in the working tree;
- redesign tasks must preserve accepted 05.1 engineering foundations;
- valid 05.2 API/data-flow/Watchlist integration logic must not be discarded blindly.

---

## Next Planned Work

1. Execute and review 05.2-H4 — Home States + Responsive Polish + Visual QA.
2. Mark Sprint 05.2 complete only after H4 acceptance.
3. Do not start Sprint 05.3 before Sprint 05.2 is accepted.
4. Complete mandatory Cache Completion & Hardening during Stage 06, not Stage 05.
