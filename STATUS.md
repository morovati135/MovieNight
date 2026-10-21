# MovieNight — Project Status

## Current Phase

Implementation / Stage 05 (in progress)

## Current Stage

Stage 05 — Frontend Product Experience (in progress)

## Current Sprint

Sprint 05.4 — Movie Details Experience (next; not started)

Sprint 05.3 — Search & Discover Experience is accepted and complete (S1–S3 accepted by the Tech Lead on 2026-10-22).

### Sprint 05.3 Work Packages

- [x] 05.3-S1 — Search entry + title Search results (accepted by the Tech Lead on 2026-10-21)
- [x] 05.3-S2 — Discover filters + mode rule (accepted by the Tech Lead on 2026-10-22)
- [x] 05.3-S3 — Paging + responsive polish + visual QA (accepted by the Tech Lead on 2026-10-22)

05.3-S3 accepted state:

- Backend paging for title Search and Discover through an appending `Load more` button under the grid, with a caption such as "Showing 40 of 177"; pages are capped at the backend's 500 and movies repeated across pages are shown once. Paging is not stored in the URL (a reload starts from page 1).
- Genre / rating narrowing of a title search automatically checks further title pages until at least 12 movies show, at most 5 pages (100 matches); then `Check more matches` continues one page at a time and the caption says how many title matches were checked (e.g. "Checked 99 of 1,677 title matches"). While pages are still being checked, an empty narrowing shows "Checking more matches…" instead of an empty message.
- A failed later page keeps the loaded results and shows "More movies couldn’t be loaded." with `Try again`; a failed first page keeps the S1/S2 error state. A new title or filter change starts again from page 1.
- `Load more` keeps keyboard focus while loading (busy, extra activations ignored); 48px target, centred, clear of the mobile bottom navigation; spinner and skeleton respect reduced motion.
- Verified on the production build (`next build` + `next start`) against the real backend at 1440 / 768 / 390: Load more appends page 2 for Discover and Search without duplicates, keyboard Enter on Load more keeps focus, auto-check requests title pages 1–5 exactly once each and `Check more matches` requests page 6, a failed page 2 (request interception) keeps 20 results and recovers on retry, a new query requests only page 1, reduced motion disables animation, no horizontal overflow, logical tab order (search, clear, Genre, Year, Rating, card, Watchlist control) with visible focus on every control including the notched card outline; S1 / S2 QA re-run on the production build. `npm run lint`, `npm run build`, `git diff --check`. Screenshots in `docs/screenshots/05.3-S3-*`.
- Local setup note: a fresh worktree's SQLite database needs `dotnet ef database update` (backend README) before Watchlist calls work; this was applied to the 05.3 worktree's untracked local database.

No approved Search/Discover references exist; by Tech Lead decision (2026-10-21) Sprint 05.3 derives its appearance from the accepted Home visual language. The interaction model and work-package scope are recorded in `docs/stages/05-frontend-product-experience.md` (§11.1). Work happens on branch `feature/search-discover-05.3`.

05.3-S1 accepted state:

- The header Search control (`/?search=open`) opens a Search view on `/` in place of the Home sections; Close returns to the Home sections. No new public route.
- Prominent glass Search input (auto-focused, clear button, `role="search"` form). Typing is debounced (350ms) and trimmed into the `q` URL parameter, so reload and Back/Forward keep the query; Enter searches immediately.
- A blank or whitespace-only query never sends a Search request; the view shows a short prompt instead.
- Title results use a responsive MovieCard grid (6 / 4 / 2 columns at 1440 / 768 / 390) with a result count; first page only (paging is S3).
- Loading skeleton grid, no-results message, and a contained error message with retry; results for an older query or attempt are never shown.
- Result cards share the Home Watchlist saved state and add/remove behaviour.
- Verified: `npm run lint`, `npm run build`, `git diff --check`; live checks against the real backend at 1440 / 768 / 390 (header opens Search with focus, blank input sends 0 requests, typing "batman" sends exactly 1 request and updates the URL, saved state toggles and restores on a result card, reload / Close / Back, no-results, error via request interception and retry, no horizontal overflow); screenshots in `docs/screenshots/05.3-S1-*`.

05.3-S2 accepted state:

- Genre / Release year / Minimum rating filters as glass selects under the Search input; a chosen filter uses the pink selected treatment of the Home genre chips. Options are backend-supported values only: genres from `/api/movies/genres`, years from next year down to 1888, ratings 9+ down to 1+.
- Mode rule: a title in the search box searches by title; with the box empty, any filter discovers by those filters; with neither, no request is made and the view invites the user to start.
- Title + filters (Tech Lead decisions 2026-10-21/22): with a title active the filters stay usable. Year is applied by the backend (`GET /api/movies/search` now accepts an optional `year`, forwarded to TMDB as `primary_release_year`; recorded as D026), so title + year is exact with correct totals, e.g. "38 movies found for “Tv” from 2021". Genre and minimum rating, which TMDB title search cannot filter, narrow the loaded title matches in the browser with no new request, and the summary states what was checked, e.g. "4 of the first 20 matches for “Tv” from 2019 fit Rated 6+". Until S3 paging (which will load further title pages for genre/rating narrowing), only the first page is narrowed.
- Empty results always offer a way forward: title + filters → `Show all “…” matches` (clears filters) and `Browse … movies` (drops the title, keeps the filters); Discover → `Clear filters`.
- Backend: `SearchMoviesQuery.Year` (1888–2100, same validation as Discover) through `MovieCatalogService.SearchAsync` and `TmdbClient.SearchMoviesAsync`; new tests for year forwarding and year validation; endpoint description, Stage 03 contract notes and `DECISIONS.md` (D026) updated.
- Filters live in the URL (`genre`, `year`, `rating`) alongside `q`. Out-of-range or malformed URL values are dropped before any request, and a genre the backend does not list is ignored (a URL genre is only sent once the genre list confirms it).
- Discover results reuse the S1 grid and states, with a summary such as "235 movies match Action · 2019 · Rated 7+", a filter-specific no-results message, and a contained error with retry.
- Mobile: the filters fold behind one `Filters` control (with an active-count badge and a `Clear filters` action) and open as full-width stacked selects; tablet and desktop show the three selects in one row.
- Verified: `dotnet test` (74 passed), `npm run lint`, `npm run build`, `git diff --check`; live checks against the real backend at 1440 / 768 / 390 (backend title + year returns only that year and rejects 1887 with 400, a year change sends exactly one new title search while genre/rating changes send none, empty-state actions, each filter's request parameters, two filter changes 40ms apart both kept, filters with a title narrow the loaded matches to exactly the expected subset (checked against the API response) with 0 extra requests, changing the title keeps the filters applied, Clear filters, invalid URL values send no request, unknown genre dropped, no-results, error via request interception and retry, mobile filter toggle and 48px selects, no horizontal overflow); screenshots in `docs/screenshots/05.3-S2-*`.

Sprint 05.2 — Discover Home Experience is accepted and complete (H1–H4 accepted by the Tech Lead on 2026-10-21).

### Sprint 05.2 Work Packages

- [x] 05.2-H1 — Shell Adaptation + Featured Hero
- [x] 05.2-H2 — Trending + Popular + Movie Rails
- [x] 05.2-H3 — Genre Discovery + Pick CTA + Watchlist Preview
- [x] 05.2-H4 — Home States + Responsive Polish + Visual QA

05.2-H3 accepted by the Tech Lead. Final accepted state:

- Backend-driven Genre discovery with a horizontal chip row, mouse-accessible previous/next controls from tablet width up, and an independent result rail; a failed genre request clears the result rail instead of showing the previous genre's movies.
- Watchlist, genre list, and genre results load independently of the critical Home path (Hero / Trending / Popular); each failure is contained to its own section with a local retry.
- Anonymous Watchlist preview integrated with the shared saved-state logic.
- Pick for Me CTA redesigned as a responsive cinema ticket (perforation notches, divider, stub) linking to `/pick`; copy reflects genre / release year / minimum rating.
- CSS-only travelling edge glow on the CTA: one light source on the ticket outline (edge-shaped hotspot, short rim highlight, local outer halo, shallow inner bleed) that follows corners without rotation, scaled for mobile / tablet / desktop, 35s lap; hidden under reduced motion.
- Verified: lint, build, `git diff --check`, live backend checks, and 1440 / 768 / 390 screenshots in `docs/screenshots/05.2-H3-*`.

05.2-H4 accepted by the Tech Lead (2026-10-21) after one review fix: on mobile/tablet the empty notch gap around the MovieCard Watchlist control showed smeared poster artwork with a circular blur, because the H4 control rewrite dropped the `backdrop-blur-none` override and the transparent 44 / 48 px hit area inherited the icon button's `backdrop-blur-md`. The override was restored; geometry, hit areas and desktop rendering are unchanged, and 390 / 768 / 1440 were re-verified against the real backend. Final accepted state:

- Home loading state mirrors the real Hero (mobile artwork-over-copy and desktop copy/carousel layouts) and the first two rails; the in-page and route-level loading states are now the same component, with a valid `role="status"` live region.
- Home error and empty states are vertically centred in the visible area, use the shared design tokens, and offer an action (`Try again` / `Check again`).
- An empty Popular response omits the Popular section instead of leaving a heading with no rail.
- Section-level notices (Genre list, Genre results, Genre empty, Watchlist error) share one component and style.
- Home section rhythm is driven by one flex gap instead of per-section padding: card-bottom → next heading is 116 / 104 / 58 px at 1440 / 768 / 390 for every section pair (previously 42–140 px with the 390 gaps inconsistent).
- Hero copy shares the rails' left gutter at every breakpoint (it previously started at x=120 against x=48 at 1440, and 20px against 16px at 390).
- MovieCard Watchlist glass island is sized from the card (26.9% of its width, container query units) so it matches the clip-path notch exactly at every breakpoint; the icon is centred with flex and the focus ring wraps the island. The hit area is unchanged (44 / 48 / 64 px).
- Rail arrows that cannot scroll fade out completely instead of leaving a ghost circle over posters; mobile `See More` is hidden when there is nothing to scroll. Rail, genre and hero arrows share one glass-control style.
- Keyboard focus is now visible on movie cards (outline follows the notched card silhouette) and on the rail scroller; previously the card's focus ring was painted under the poster image.
- Design-token cleanup: shared `glass`, `link`, `brand-pink` and `brand-blue` colour tokens, shared section-title / glass-control / primary-action class constants.
- Verified: `npm run lint`, `npm run build`, `git diff --check`; live checks against the real backend on the production build at 1440 / 768 / 390 (no horizontal overflow, no touch target below 44px except the tablet rail arrows at 40px and the focus-only skip link); loading, error, empty and partial-failure states via request interception; keyboard focus, rail scrolling, Genre selection, Watchlist toggle and reduced motion (Hero rotation off, skeleton and Pick glow static); screenshots in `docs/screenshots/05.2-H4-*`.
- Known and deliberately not changed: no Home footer exists (the UI skill's Home section order lists a minimal footer with TMDB attribution; it is not assigned to any 05.2 work package); the Hero carousel strip keeps its accepted right offset; tablet rail arrows are 40px.

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
- 05.2-H4 — Home States + Responsive Polish + Visual QA
- Sprint 05.2 — Discover Home Experience
- 05.3-S1 — Search entry + title Search results
- 05.3-S2 — Discover filters + mode rule
- 05.3-S3 — Paging + responsive polish + visual QA
- Sprint 05.3 — Search & Discover Experience
- Product scope and non-goals locked
- Backend/frontend stack selected
- Local development conventions locked
- MovieNight project-local UI skill / reference workflow established

---

## In Progress

- None. Sprint 05.4 is next and has not started.

---

## Not Started

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

None currently blocking.

Sprint 05.4 note: the Tech Lead supplied Movie Details reference images in the main checkout under `.agents/skills/movienight-ui/assets/Movies Deatils/` (with `Movie Covers/` and `Icons/`); they are not yet committed to the repository.

Home footer note: the UI skill's Home section order lists a minimal footer with TMDB attribution; it is not assigned to any sprint yet.

Repository transition caution:

- accepted 05.1 foundation and partial/superseded 05.2 work currently coexist in the working tree;
- redesign tasks must preserve accepted 05.1 engineering foundations;
- valid 05.2 API/data-flow/Watchlist integration logic must not be discarded blindly.

---

## Next Planned Work

1. Plan Sprint 05.4 — Movie Details Experience against the supplied Movie Details references (work packages with review checkpoints, as in 05.2 / 05.3).
2. Execute 05.4 only after the plan is agreed; do not start Sprint 05.5 before Sprint 05.4 is accepted.
4. Complete mandatory Cache Completion & Hardening during Stage 06, not Stage 05.
