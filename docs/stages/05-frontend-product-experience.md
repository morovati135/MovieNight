# MovieNight — Stage 05: Frontend Product Experience

## Stage Status

**In Progress**

Stage 04 — Anonymous Watchlist Backend & Persistence is accepted and complete.

Sprint 05.1 — Frontend Design Foundation & App Shell is accepted and complete.

Sprint 05.2 — Discover Home Experience is accepted and complete. Current work is Sprint 05.3 — Search & Discover Experience.

---

# 1. Stage Intent

Turn the completed MovieNight backend into a polished, responsive, portfolio-ready frontend product.

Stage 05 owns the user-facing frontend experience for:

- Discover / Home
- Search and Discover filtering
- Movie Details
- Pick for Me
- Anonymous Watchlist
- loading / error / empty states
- responsive behavior
- interaction and accessibility polish
- final frontend verification and handoff

The frontend must consume MovieNight backend APIs only.

The frontend must not call TMDB directly.

Detailed product/visual rules are maintained by the repository-local MovieNight UI skill and approved reference assets rather than duplicated throughout this Stage document.

---

# 2. Canonical Context and Authority

Use only the context required by the active sprint or work package.

Primary project sources:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this Stage 05 file
- `.agents/skills/movienight-ui/SKILL.md`
- only the active page/work-package references under `.agents/skills/movienight-ui/`

Read `PROJECT.md`, `ARCHITECTURE.md`, and `DECISIONS.md` only when the active task needs a product or architecture decision that is not already resolved by the active Stage/sprint context.

Inspect Stage 03 or Stage 04 implementation only when required for:

- current Movie API contracts
- current Watchlist API contracts
- current Problem Details behavior
- current API-client conventions
- anonymous-cookie / browser-credential behavior
- ports / CORS
- other concrete backend integration dependencies

Do not read every completed Stage by default.

## 2.1 Authority Order for Frontend Work

For MovieNight frontend implementation, resolve conflicts in this order:

1. explicit current Tech Lead instruction
2. active Sprint / work-package scope in this Stage file
3. MovieNight product requirements in `$movienight-ui`
4. approved visual reference assets for the active task
5. remaining `$movienight-ui` visual / responsive / implementation rules
6. existing backend/API contracts
7. supporting implementation skills
8. agent preference or creativity

Existing frontend visuals are not a source of truth for the redesign.

Existing frontend code may still be reused for valid integration, data-flow, state, or other non-visual logic.

---

# 3. Stage Transition Notes

## 3.1 Sprint 05.1 Preservation Rule

Sprint 05.1 remains accepted and is **not reopened**.

Its valid engineering foundation remains part of the project, including:

- Manrope typography foundation
- global design-token direction
- non-pure-black base palette
- reusable shell/layout primitives
- reusable button/control foundations
- accessibility / reduced-motion foundation
- application navigation structure
- centralized frontend API-client direction

During Sprint 05.2 and later frontend work, visual styling or composition created during 05.1 may be adapted when required to match newly approved references.

Such adaptation does not reopen Sprint 05.1 and must not discard valid reusable engineering foundations without a concrete reason.

## 3.2 Sprint 05.2 Redesign Transition

An earlier Sprint 05.2 implementation was partially completed but was **not accepted as the final visual Home implementation**.

Its visual composition is superseded by the approved reference-driven workflow defined below.

Existing 05.2 implementation may still be reused or deliberately ported when it provides valid:

- MovieNight backend API adapters
- client-side Movie/Genre contracts
- Watchlist transport behavior
- browser credential handling
- saved-state logic
- other reusable non-visual data-flow/state logic

Do not discard these areas blindly merely because the visual implementation is being redesigned.

The current frontend implementation must not be used as the visual reference for the new Home.

---

# 4. Stage Outcome

After Stage 05:

- `/` provides the complete Discover / Home experience.
- `/movies/[id]` provides the complete Movie Details experience.
- `/pick` provides the complete Pick for Me experience.
- `/watchlist` provides the complete anonymous Watchlist experience.
- Search and Discover feel like one coherent product experience even when backed by separate backend operations.
- Watchlist add/remove and saved-state feedback are consistent across relevant screens.
- Watchlist behavior remains anonymous and browser-private.
- loading, error, validation, empty, and not-found states exist where required.
- desktop, tablet, and mobile layouts are intentionally designed.
- the approved MovieNight visual direction is implemented through approved references.
- frontend code remains simple and feature-oriented.
- frontend calls no TMDB API directly.
- no fake login/profile/account/streaming capabilities exist.
- Stage 06 can focus on integration, testing, runtime hardening, and cache completion.

---

# 5. Locked Product Routes

Version 1 public frontend routes:

```text
/                    → Discover / Home
/movies/[id]         → Movie Details
/pick                → Pick for Me
/watchlist           → Anonymous Watchlist
```

Search remains part of the `/` product experience.

Do not create public routes for:

```text
/login
/register
/profile
/settings
/collections
/admin
```

unless a later explicit product decision changes scope.

---

# 6. Product / Visual Source of Truth

Detailed frontend product, visual, responsive, and implementation rules live in:

```text
.agents/skills/movienight-ui/
```

Use `$movienight-ui` explicitly during MovieNight frontend implementation and review.

Approved reference images define appearance.

MovieNight requirements define functionality.

Do not copy irrelevant product semantics from a visual reference.

High-level Stage 05 non-negotiables remain:

- movie-only V1
- cinematic, image-first frontend
- dark-but-not-pure-black foundation
- no authentication/profile UI
- no subscription/pricing product
- no streaming playback / Continue Watching behavior
- no fake backend capabilities
- no direct frontend-to-TMDB access
- responsive design is required
- accessibility is required
- motion must be restrained and respect reduced-motion preferences

---

# 7. Frontend Data Boundary

Expected flow:

```text
Next.js UI
    ↓
central MovieNight API client
    ↓
ASP.NET Core backend
```

Forbidden:

```text
Frontend → TMDB
```

All Movie and Watchlist data must come through MovieNight backend APIs.

## 7.1 Anonymous Watchlist

The backend owns anonymous browser identity and its protected cookie.

Frontend Watchlist requests must preserve browser credentials where required.

The frontend must not:

- read or display the anonymous identity
- create a second identity model
- manually persist backend identity tokens
- expose Data Protection details

## 7.2 Saved State

Do not add one backend status request per Movie card.

The frontend may derive saved Movie IDs from the current Watchlist payload and keep a small in-memory saved-state representation for the active UI flow.

---

# 8. Frontend Engineering Direction

Keep the frontend intentionally simple.

Prefer:

- existing project dependencies
- platform/browser capabilities
- reusable feature-oriented components
- lightweight client state
- existing centralized API client
- CSS/Tailwind transitions when sufficient

Do not add without a concrete need:

- large state-management frameworks
- TanStack Query / React Query
- heavy animation libraries
- a new frontend architecture layer
- packages that only reproduce simple platform behavior

Use Server Components where they simplify initial rendering.

Use Client Components where interaction requires them.

Do not create artificial server/client boundaries merely to use advanced Next.js features.

---

# 9. Stage 05 Sprint Breakdown

## Sprint 05.1 — Frontend Design Foundation & App Shell

**Status: Accepted / Completed**

### Accepted Outcome

Sprint 05.1 established:

- Manrope
- global background / typography foundation
- lightweight design-token direction
- reusable page/layout primitives
- primary/secondary interaction treatments
- desktop application header structure
- mobile navigation structure
- reduced-motion / accessibility baseline
- preserved API-client direction

Later reference-driven visual adaptation is allowed under the preservation rule in Section 3.1.

Do not re-execute Sprint 05.1.

---

# 10. Sprint 05.2 — Discover Home Experience

**Status: Completed / Accepted**

## Goal

Build the complete reference-driven MovieNight Discover / Home experience using real MovieNight backend data.

Sprint 05.2 remains one project sprint, but execution is intentionally split into four smaller work packages:

```text
05.2-H1 → Shell Adaptation + Featured Hero
05.2-H2 → Trending + Popular + Movie Rails
05.2-H3 → Genre Discovery + Pick CTA + Watchlist Preview
05.2-H4 → Home States + Responsive Polish + Visual QA
```

A work package is not a new roadmap Sprint.

Sprint 05.2 is complete only after H1–H4 are accepted.

## 10.1 Sprint 05.2 Shared Context Rules

For every 05.2-Hx task:

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- only the active 05.2-Hx subsection from this file
- `$movienight-ui`
- only the active Hx reference assets
- only frontend files required for the active scope
- only backend/API contracts required for the active scope

Do not:

- load all Home references for every work package
- re-read the entire Stage 05 file when the active subsection is sufficient
- derive the visual design from the current frontend
- implement a later Hx work package
- start Sprint 05.3
- commit automatically

Use the previous 05.2 implementation only as a source of valid non-visual integration/data-flow logic.

---

## 10.2 Sprint 05.2-H1 — Shell Adaptation + Featured Hero

### Goal

Adapt the accepted 05.1 shell to the approved Home references and build the complete Featured Hero experience.

### Required Context

Use:

- `$movienight-ui`
- this H1 subsection
- current accepted 05.1 shell primitives
- only Home API/Watchlist contracts needed by Header/Hero
- any valid existing non-visual 05.2 logic required by the Hero

### Visual References

```text
.agents/skills/movienight-ui/assets/home/h1-desktop.png
.agents/skills/movienight-ui/assets/home/h1-mobile.png
```

The full-page references may be inspected only when H1 needs surrounding composition context:

```text
.agents/skills/movienight-ui/assets/home/home-desktop-full.png
.agents/skills/movienight-ui/assets/home/home-mobile-full.png
```

### Scope

- adapt AppHeader visual treatment to the approved Home reference
- desktop primary navigation:
  - Discover
  - Pick for Me
  - Watchlist
  - Search access
- compact mobile top bar for MovieNight identity/search
- mobile bottom navigation:
  - Discover
  - Pick
  - Watchlist
- Featured Hero using real MovieNight backend data
- six-movie carousel sourced from the approved real Home dataset
- strong artwork prominence
- title
- compact metadata
- short overview
- View Details
- Add/Remove Watchlist
- previous / next controls
- slide indicators
- approximately seven-second auto-advance
- pause/resume behavior
- pause during relevant hover/focus interaction
- `prefers-reduced-motion` handling
- intentional desktop / tablet / mobile Hero composition

Do not add a Watch Movie / Play Movie CTA.

### Acceptance Criteria

- [ ] 05.1 foundation is preserved unless a visual adaptation is required.
- [ ] Header contains only real MovieNight destinations/actions.
- [ ] mobile navigation uses Discover / Pick / Watchlist.
- [ ] Hero uses real backend-backed movie data.
- [ ] Hero visually follows the approved H1 references.
- [ ] Hero contains no fake trailer/provider/director/review data.
- [ ] Hero carousel supports the required controls and motion behavior.
- [ ] Watchlist Hero action uses valid existing Watchlist integration.
- [ ] desktop, tablet, and mobile compositions are intentional.
- [ ] keyboard/focus behavior is usable.
- [ ] reduced-motion behavior is respected.

### Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Live-check with the real backend.

Visually verify representative widths:

```text
1440
768
390
```

### Stop Boundary

Do not implement:

- Trending rail
- Popular rail
- Genre Discover section
- Pick for Me promotional section
- Watchlist preview
- final Home-wide loading/error/empty polish

Do not start 05.2-H2 automatically.

---

## 10.3 Sprint 05.2-H2 — Trending + Popular + Movie Rails

### Goal

Build the reusable Movie card/rail system and implement the independent Trending and Popular Home sections.

### Required Context

Use:

- `$movienight-ui`
- this H2 subsection
- accepted H1 output
- existing Movie API adapters/contracts required for Trending/Popular
- existing Watchlist saved-state logic where valid

### Visual References

```text
.agents/skills/movienight-ui/assets/home/h2-desktop.png
.agents/skills/movienight-ui/assets/home/h2-mobile.png
```

### Scope

- reusable `MovieCard`
- reusable horizontal `MovieRow` / rail
- Trending Now
- Popular Movies
- compact integrated Watchlist affordance
- Details navigation
- section heading / continuation affordance
- responsive poster density
- intentional horizontal scrolling/swiping on smaller widths

Trending and Popular remain independent of Genre selection.

### Acceptance Criteria

- [ ] MovieCard is reusable and image-first.
- [ ] Trending uses real Trending backend data.
- [ ] Popular uses real Popular backend data.
- [ ] Trending and Popular remain independent.
- [ ] Watchlist saved state is consistent.
- [ ] card/rail visuals follow the H2 references.
- [ ] mobile does not shrink a desktop row to fit all cards.
- [ ] touch and keyboard interactions remain usable.
- [ ] no unrelated Home feature is implemented.

### Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Live-check with the real backend.

Verify at:

```text
1440
768
390
```

### Stop Boundary

Do not implement:

- functional Genre Discover section
- Pick for Me promotional CTA
- Watchlist preview
- H4 Home-wide states/polish

Do not start 05.2-H3 automatically.

---

## 10.4 Sprint 05.2-H3 — Genre Discovery + Pick CTA + Watchlist Preview

### Goal

Complete the MovieNight-specific Home discovery/support sections while reusing the accepted H2 card/rail system.

### Required Context

Use:

- `$movienight-ui`
- this H3 subsection
- accepted H1/H2 output
- current Genre/Discover contracts
- Pick route/product contract
- current Watchlist contract/state logic

### Visual References

```text
.agents/skills/movienight-ui/assets/home/h3-desktop.png
.agents/skills/movienight-ui/assets/home/h3-mobile.png
```

The H3 reference contains template features that are **visual references only**.

Do not copy template semantics for:

- Series
- Pricing
- subscription plans
- Collection accounts

Use them only to understand visual rhythm, card language, controls, and promotional-section composition.

### Scope

- backend-driven Genre controls
- horizontal Genre control behavior
- selected Genre state
- independent Genre Discover results
- Genre selection changes only the dedicated Discover result section
- Pick for Me promotional CTA linking to `/pick`
- lightweight Watchlist preview / CTA
- reuse established MovieCard/MovieRow where appropriate

### Acceptance Criteria

- [ ] Genres are backend-driven.
- [ ] Genre selection changes only the dedicated Discover result area.
- [ ] Trending remains unchanged.
- [ ] Popular remains unchanged.
- [ ] Pick CTA uses MovieNight semantics rather than template award/pricing semantics.
- [ ] Watchlist preview remains lightweight and browser-private.
- [ ] no Series/Pricing/subscription feature is introduced.
- [ ] H3 follows approved desktop/mobile visual language.
- [ ] mobile Genre controls remain touch-friendly and horizontally usable.

### Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Live-check Genre, Pick navigation, and Watchlist preview against real APIs.

Verify at:

```text
1440
768
390
```

### Stop Boundary

Do not start Sprint 05.3.

Do not perform final Home-wide visual acceptance until H4.

Do not start 05.2-H4 automatically.

---

## 10.5 Sprint 05.2-H4 — Home States + Responsive Polish + Visual QA

### Goal

Complete Home-specific states and perform final responsive/visual acceptance for Sprint 05.2.

H4 is Home-specific.

It does **not** replace Sprint 05.7, which performs cross-product responsive, interaction, and accessibility polish after all Stage 05 feature pages are complete.

### Required Context

Use:

- `$movienight-ui`
- this H4 subsection
- completed H1–H3 Home implementation
- only Home-related frontend/backend contracts

Use `$web-design-guidelines` for final QA after implementation-level visual correction.

### Full Home References

```text
.agents/skills/movienight-ui/assets/home/home-desktop-full.png
.agents/skills/movienight-ui/assets/home/home-mobile-full.png
```

### Scope

- Home loading state
- Home error state
- Home empty/no-content states where applicable
- final desktop composition
- final tablet composition
- final mobile composition
- spacing/hierarchy consistency
- typography consistency
- image prominence
- responsive section density
- hover / focus-visible / active / selected states
- touch target review
- reduced-motion review
- final Home accessibility review
- final visual comparison with full approved references
- remove visual drift introduced across H1–H3

### Required Viewports

```text
Desktop: 1440px
Tablet:  768px
Mobile:  390px
```

### Acceptance Criteria

- [ ] H1–H3 functionality remains intact.
- [ ] Home has required loading/error/empty behavior.
- [ ] desktop/tablet/mobile feel intentionally composed.
- [ ] mobile is not a scaled-down desktop.
- [ ] navigation remains usable.
- [ ] Hero remains usable at all required widths.
- [ ] rails and Genre controls behave correctly.
- [ ] Pick CTA and Watchlist preview fit the overall rhythm.
- [ ] focus-visible and keyboard behavior are usable.
- [ ] touch targets are reasonable.
- [ ] reduced-motion behavior is correct.
- [ ] final Home closely follows the approved reference language.
- [ ] no forbidden template/product feature has leaked into MovieNight.

### Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Live-check Home against the real backend.

Capture/inspect representative browser screenshots at:

```text
1440
768
390
```

Use visual comparison against the full Home references.

### Sprint 05.2 Completion Rule

Sprint 05.2 may be marked complete only when H1, H2, H3, and H4 have all been accepted.

### Stop Boundary

Do not start Sprint 05.3 automatically.

---

# 11. Sprint 05.3 — Search & Discover Experience

## Goal

Create a unified Search/Discover interaction over the existing backend Search and Discover operations.

Search remains part of the Home product experience; do not create a separate public Search route unless explicitly approved later.

## Required Context

Read only:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- this Sprint 05.3 section
- `$movienight-ui`
- current Home shared components required by Search/Discover
- current Search/Discover backend contracts
- approved Search/Discover references when supplied

## Scope

- prominent Search input
- Genre / Year / Minimum Rating filters where the approved UX requires them
- clear Search-vs-Discover mode rule
- no empty Search requests
- responsive results grid
- backend paging/navigation
- loading
- validation-safe state
- no-results state
- safe upstream error state
- MovieCard / Watchlist saved-state reuse
- no arbitrary public sort selector

## Acceptance Criteria

- [ ] users do not need to understand backend Search vs Discover distinctions.
- [ ] empty Search does not trigger a Search request.
- [ ] filters use backend-supported values only.
- [ ] no unsupported sort contract is exposed.
- [ ] results/paging work.
- [ ] saved state works on result cards.
- [ ] validation/error/empty/loading states are user-friendly.
- [ ] mobile filter UX is intentional.
- [ ] approved references are followed when available.

## 11.1 Sprint 05.3 Execution Plan

**Status: In Progress**

No approved Search/Discover reference images exist. By Tech Lead decision (2026-10-21), Sprint 05.3 derives its appearance from the accepted Home visual language (glass header/controls, MovieCard, genre chips, section titles, shared tokens) and runs as small work packages with a screenshot review checkpoint after each, like Sprint 05.2.

Search / Discover interaction model:

- Search lives on `/`. The header Search control opens a Search view in place of the Home sections; closing it returns to the Home sections. No new public route.
- Search state lives in the `/` URL query (`q`, and from S2 `genre`, `year`, `rating`; from S3 `page`) so Back/Forward and reloads keep the current results.
- Mode rule: a non-blank title query searches by title; with an empty query, any selected filter discovers by filter; with neither, no request is made and the view invites the user to start.
- Title + filters: backend title Search accepts no filters, so with a title active the filters narrow the loaded title matches in the browser (Tech Lead decision 2026-10-21) and the summary states how many loaded matches were checked.
- Typed queries are debounced and trimmed; a blank query never triggers a Search request.
- Result cards reuse MovieCard and the Home Watchlist saved state.

Work packages:

- [x] 05.3-S1 — Search entry + title Search results: Search view on `/`, header/mobile access, prominent input, debounced title Search, responsive results grid, loading / no-results / validation-safe / error states, saved state on result cards.
- [x] 05.3-S2 — Discover filters + mode rule: Genre / Year / Minimum Rating filters with backend-supported values only, Discover results with an empty query, intentional mobile filter UX, clear mode feedback when a title query is active.
- [ ] 05.3-S3 — Paging + responsive polish + visual QA: backend paging/navigation for Search and Discover, 1440 / 768 / 390 polish, keyboard / reduced-motion checks, screenshots in `docs/screenshots/05.3-*`.

Sprint 05.3 is complete only after S1–S3 are accepted.

## Verification

```text
npm run lint
npm run build
git diff --check
```

Live-check representative Search and Discover flows.

## Stop Boundary

Do not implement Movie Details.

Do not start Sprint 05.4 automatically.

---

# 12. Sprint 05.4 — Movie Details Experience

## Goal

Build a polished Movie Details page using only the current MovieNight Movie Details contract and approved visual references.

## Required Context

Use:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- this Sprint 05.4 section
- `$movienight-ui`
- current shared Movie components
- current Movie Details backend contract
- approved Movie Details references supplied by the Tech Lead

Analyze/lock the reference adaptation before substantial implementation if the page references have not yet been reviewed.

## Scope

- `/movies/[id]`
- cinematic Movie Details Hero
- backdrop
- poster
- title
- release date/year
- runtime
- rating
- genres
- overview
- Watchlist CTA
- Cast
- Similar Movies
- reusable MovieCard
- loading
- error
- not-found

Do not invent unsupported:

- director
- writer
- trailer
- reviews
- provider availability
- IMDb-specific data
- production studio data

## Acceptance Criteria

- [ ] route uses real backend data.
- [ ] page uses current backend contract only.
- [ ] approved visual references define appearance.
- [ ] Watchlist works.
- [ ] Cast works.
- [ ] Similar Movies works.
- [ ] loading/error/not-found states exist.
- [ ] mobile/tablet/desktop compositions are intentional.

## Verification

```text
npm run lint
npm run build
git diff --check
```

Live-check known and unknown Movie IDs.

## Stop Boundary

Do not implement Pick for Me page.

Do not start Sprint 05.5 automatically.

---

# 13. Sprint 05.5 — Pick for Me Experience

## Goal

Build the signature Pick for Me frontend experience using the backend rule-based picker and approved references.

## Required Context

Use:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- this Sprint 05.5 section
- `$movienight-ui`
- current shared controls/cards
- Pick backend contract
- approved Pick references supplied by the Tech Lead

Analyze/lock the reference adaptation before substantial implementation if the page references have not yet been reviewed.

## Scope

- `/pick`
- intro
- Genre / Year / Minimum Rating
- Pick action
- functional loading state
- one spotlight result
- View Details
- Add/Remove Watchlist
- Pick Again
- no-match state
- safe error state

Do not claim LLM/AI personalization that does not exist.

## Acceptance Criteria

- [ ] filters map correctly to backend.
- [ ] Pick returns one Movie.
- [ ] result feels intentionally spotlighted.
- [ ] Details works.
- [ ] Watchlist works.
- [ ] Pick Again works.
- [ ] loading/no-match/error states are polished.
- [ ] copy remains accurate to rule-based behavior.
- [ ] approved references define appearance.

## Verification

```text
npm run lint
npm run build
git diff --check
```

Live-check filtered and unfiltered Pick flows.

## Stop Boundary

Do not implement Watchlist page.

Do not start Sprint 05.6 automatically.

---

# 14. Sprint 05.6 — Anonymous Watchlist Experience

## Goal

Build the complete browser-private Watchlist page using the current anonymous Watchlist backend and approved references.

## Required Context

Use:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- this Sprint 05.6 section
- `$movienight-ui`
- current Watchlist backend contract
- current MovieCard / saved-state behavior
- approved Watchlist references supplied by the Tech Lead

Analyze/lock the reference adaptation before substantial implementation if the page references have not yet been reviewed.

## Scope

- `/watchlist`
- browser-private Watchlist load
- privacy note
- saved Movie grid
- Remove
- View Details
- empty state
- loading
- error
- credential-preserving Watchlist requests

Do not expose anonymous identity/cookie internals.

Do not invent:

- analytics
- profile
- cloud sync
- named collections
- public sharing

## Acceptance Criteria

- [ ] Watchlist loads current browser data.
- [ ] browser credentials are preserved.
- [ ] remove works reliably.
- [ ] Details navigation works.
- [ ] empty state works.
- [ ] privacy note is clear.
- [ ] no identity internals are shown.
- [ ] no dashboard/analytics content is invented.
- [ ] mobile grid is usable.
- [ ] approved references define appearance.

## Verification

```text
npm run lint
npm run build
git diff --check
```

Live-check add → Watchlist → remove.

## Stop Boundary

Do not begin broad Stage 05 polish automatically.

Do not start Sprint 05.7 automatically.

---

# 15. Sprint 05.7 — Responsive, Interaction & UX Polish

## Goal

Polish the completed Stage 05 frontend across all feature pages, viewport sizes, interaction states, and accessibility.

This is a **cross-product** polish sprint.

It is broader than Home-specific 05.2-H4.

## Required Context

Use:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- this Sprint 05.7 section
- `$movienight-ui`
- completed Stage 05 frontend only
- page-specific approved references already used by completed sprints
- `$web-design-guidelines` for final UI/UX review

## Scope

Verify all completed pages at representative:

```text
1440
768
390
```

Review/finalize:

- navigation
- Hero behavior
- Search/filter usability
- grids/rails
- touch targets
- hover
- focus-visible
- keyboard behavior
- active/selected/disabled states
- typography consistency
- spacing/radius consistency
- effect restraint
- reduced-motion handling
- loading/error/empty states
- cross-page visual consistency

Fix only genuine frontend UX/polish issues.

## Acceptance Criteria

- [ ] all pages feel intentionally designed at desktop/tablet/mobile.
- [ ] navigation is usable across devices.
- [ ] filters/actions are usable on mobile.
- [ ] keyboard focus is visible.
- [ ] touch targets are reasonable.
- [ ] motion remains functional and restrained.
- [ ] typography/spacing/radius are consistent.
- [ ] page references remain respected.
- [ ] no dashboard/template drift has accumulated.

## Verification

```text
npm run lint
npm run build
git diff --check
```

Perform manual/browser visual checks at required representative widths.

## Stop Boundary

Do not start final Stage handoff until polish blockers are resolved.

Do not start Sprint 05.8 automatically.

---

# 16. Sprint 05.8 — Stage 05 Verification & Handoff

## Goal

Verify the completed frontend as one coherent product and prepare the repository for Stage 06.

Do not add new product features.

## Product Verification

Verify:

- Discover / Home
- Search
- Discover filters
- Movie Details
- Cast
- Similar Movies
- Pick for Me
- Watchlist
- saved-state behavior
- Watchlist add/remove
- loading
- error
- empty
- not-found where applicable

## Visual / Responsive Verification

Confirm:

- approved visual references are respected
- MovieNight remains cinematic and image-first
- background is not pure black
- no dashboard-style composition has accumulated
- no forbidden account/streaming/template semantics exist
- responsive layouts are intentional at desktop/tablet/mobile
- typography, spacing, radius, and interaction language are coherent

## Integration Verification

Confirm:

- frontend calls only MovieNight backend
- no direct TMDB frontend calls exist
- Watchlist credentials are preserved
- anonymous identity internals are hidden
- saved-state behavior is consistent
- raw backend Problem Details are not dumped into normal UI

## Build / Dependency Verification

Run:

```text
npm run lint
npm run build
git diff --check
```

Run additional existing frontend tests if present.

Review new npm dependencies and confirm each is required.

## Documentation Verification

Check relevant consistency among:

- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this Stage 05 file
- applicable `AGENTS.md`
- `$movienight-ui`

Fix only genuine Stage 05 inconsistencies.

## Stage 05 Definition of Done

- [ ] Sprint 05.1 is accepted.
- [ ] Sprint 05.2 H1–H4 are accepted.
- [ ] Sprint 05.3 is accepted.
- [ ] Sprint 05.4 is accepted.
- [ ] Sprint 05.5 is accepted.
- [ ] Sprint 05.6 is accepted.
- [ ] Sprint 05.7 is accepted.
- [ ] frontend lint passes.
- [ ] frontend build passes.
- [ ] all four public frontend routes are complete.
- [ ] Search/Discover is complete.
- [ ] Watchlist anonymous/browser-private behavior works.
- [ ] required UI states exist.
- [ ] responsive layouts are intentional.
- [ ] approved reference-driven visual workflow has been followed.
- [ ] no fake account/profile/streaming/backend capabilities exist.
- [ ] no direct frontend-to-TMDB calls exist.
- [ ] Stage 06 hardening has not been started.
- [ ] `STATUS.md` marks Stage 05 complete only after all checks pass.
- [ ] Stage 06 is marked next.

## Completion Report

Return:

1. Stage result: PASS or BLOCKED
2. visual/design verification
3. Discover/Home verification
4. Search/Discover verification
5. Movie Details verification
6. Pick for Me verification
7. Watchlist verification
8. responsive/accessibility verification
9. integration verification
10. build/lint/dependency verification
11. documentation consistency
12. files changed during handoff, if any
13. remaining issues
14. STATUS update
15. explicit confirmation Stage 06 was not started

## Stop Boundary

**Hard stop.**

Do not start Stage 06.

---

# 17. Stage 05 In Scope

Stage 05 includes:

- existing 05.1 design/app-shell foundation
- reference-driven frontend redesign/adaptation
- Home / Discover
- Search / filters/results
- Movie Details
- Cast
- Similar Movies
- Pick for Me
- Anonymous Watchlist
- saved-state UX
- loading / error / empty / not-found states
- responsive composition
- interaction states
- restrained motion
- accessibility baseline
- frontend API integration
- credential-aware Watchlist behavior
- final frontend verification/handoff
- project-local Agent/Skill/reference workflow for frontend execution

---

# 18. Stage 05 Out of Scope

Do not implement:

- authentication
- registration
- login
- profile
- account settings
- device/account Watchlist sync
- public shared watchlists
- multiple named watchlists
- collections as a product capability
- streaming playback
- Continue Watching
- trailer integration
- provider availability
- reviews
- profile-based recommendations
- LLM recommendation claims
- direct TMDB frontend access
- production deployment
- Stage 06 cache hardening
- Stage 06 full-stack runtime hardening

---

# 19. Context / Token Strategy

Stage 05 intentionally minimizes Codex context usage.

## 19.1 Fresh Task Rule

Use a fresh Codex task/thread for:

- every new Sprint 05.x
- every Sprint 05.2-Hx work package

Keep same-task corrections in the same thread.

## 19.2 Active-Scope Context Rule

For most tasks, load only:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- active Sprint/work-package subsection
- `$movienight-ui`
- active reference assets
- relevant frontend files
- required backend contracts

Do not automatically load:

- every prior Stage file
- all Stage 05 prose
- all page references
- the entire frontend
- the entire backend
- every installed design skill

## 19.3 Skill Roles

Implementation:

```text
$movienight-ui
$frontend-app-builder
$ui-ux-pro-max
```

Roles:

```text
$movienight-ui
→ MovieNight product + visual + responsive contract

$frontend-app-builder
→ section-based implementation + browser visual iteration

$ui-ux-pro-max
→ supporting UX / responsive / accessibility guidance
```

Final QA:

```text
$movienight-ui
$web-design-guidelines
```

Supporting skills must not override MovieNight requirements or approved references.

## 19.4 Reference Rule

Use only reference assets relevant to the active work package.

Full-page references are mainly for page-wide visual acceptance and surrounding context.

Do not repeatedly attach/read every reference image.

---

# 20. Standard Execution Prompt Shape

Later Codex prompts should remain compact because durable context now lives in repository docs and skills.

Conceptual template:

```text
Use $movienight-ui, $frontend-app-builder, and $ui-ux-pro-max.

Execute only <active Sprint/work package> from:
docs/stages/05-frontend-product-experience.md

Read:
- applicable AGENTS.md
- frontend/AGENTS.md
- STATUS.md
- only the active section
- only backend contracts required by the active scope

Use only the approved reference assets named in the active section.

Preserve valid existing API/data-flow logic.
Do not derive the visual design from the existing frontend.
Do not start the next work package/sprint.
Do not commit automatically.

Run the active verification and stop.
```

Do not duplicate the full MovieNight visual/product contract inside every prompt.

---

# 21. Sprint Completion Report Standard

For Sprint 05.2-H1 through 05.2-H4 and Sprint 05.3–05.7, report:

1. what changed
2. files changed
3. dependencies added/changed and why
4. design/implementation decisions required by the active scope
5. API/integration impact
6. commands/tests executed
7. visual/responsive verification
8. accessibility/state verification where applicable
9. assumptions
10. remaining issues
11. `STATUS.md` update
12. explicit confirmation the next work package/sprint was not started

Sprint 05.8 uses the broader Stage handoff report defined above.

---

# 22. Plan-Mode Rule

Use Plan mode only when the active task exposes a genuine unresolved ambiguity.

Examples:

- server/client boundary creates a real architecture decision
- existing API boundary cannot support the approved frontend behavior cleanly
- anonymous Watchlist cookie behavior conflicts with the current request path
- a visual behavior requires a non-trivial dependency/package choice

Do not use Plan mode merely to restate the active work package.

If Plan mode is used:

- plan only the active scope
- identify the exact ambiguity
- do not implement later work
- stop for Tech Lead review if a locked product/visual decision would change

---

# 23. Stage 05 Final Boundary

Stage 05 ends with:

```text
completed Movie backend
        +
anonymous Watchlist backend
        +
reference-driven polished Next.js frontend
        +
responsive product UX
        +
real MovieNight feature integration
        ↓
complete user-facing product ready for Stage 06 hardening
```

Stage 05 must not become:

```text
authentication frontend
profile system
streaming player
subscription product
generic dashboard/template clone
direct TMDB client
production deployment stage
cache-hardening stage
```

Any proposal that materially changes this boundary requires explicit Tech Lead approval and corresponding canonical-document updates.
