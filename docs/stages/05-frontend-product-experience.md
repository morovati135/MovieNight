# MovieNight — Stage 05: Frontend Product Experience

## Stage Status

**Planned — Next Stage after Stage 04 acceptance and commit**

Stage 04 — Anonymous Watchlist Backend & Persistence must be complete, accepted, and committed before implementation begins.

---

# 1. Stage Intent

Turn the completed MovieNight backend into a polished, responsive, portfolio-ready frontend product.

This stage focuses on the visible user experience:

- movie discovery
- search/discover filtering
- movie details
- Pick for Me
- anonymous watchlist
- loading / error / empty states
- responsive behavior
- subtle interaction polish

The frontend must consume only MovieNight backend APIs.

The frontend must not call TMDB directly.

The visual direction is locked as a modern cinematic movie-discovery website inspired by the approved references, with dark-but-not-black surfaces, rounded geometry, image-driven color, selective glass/glow effects, and restrained motion.

The final result should feel like a real product rather than a tutorial dashboard, admin UI, generic shadcn demo, or Netflix clone.

---

# 2. Canonical Context

Use only the context required by the active sprint.

Primary sources of truth:

- `AGENTS.md`
- `frontend/AGENTS.md`
- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this Stage 05 file

Stage 03 and Stage 04 implementation may be inspected only when the current frontend sprint depends on:

- current public Movie API contracts
- current Watchlist API contracts
- current Problem Details behavior
- current frontend API-client conventions
- current anonymous-cookie behavior
- current ports and CORS rules

Do not read all previous stage files by default.

---

# 3. Entry Criteria

Before Sprint 05.1 implementation begins:

- Stage 04 is accepted and committed.
- Git working tree is clean.
- frontend app builds in its current baseline state.
- backend health endpoint works.
- Movie APIs are stable.
- Watchlist APIs are stable.
- anonymous Watchlist cookie behavior is stable.
- Scalar/OpenAPI are available for development reference.
- no direct frontend-to-TMDB integration exists.
- current frontend API client remains the intended integration boundary.

---

# 4. Stage Outcome

After Stage 05:

- `/` provides the complete Discover/Home experience.
- `/movies/[id]` provides the complete Movie Details experience.
- `/pick` provides the complete Pick for Me experience.
- `/watchlist` provides the complete anonymous Watchlist experience.
- users can search and discover movies without seeing backend/API distinctions.
- users can add/remove movies from the Watchlist from relevant UI locations.
- saved-state feedback is consistent across the frontend.
- Watchlist behavior remains anonymous and browser-private.
- the UI has loading, error, validation, and empty states.
- desktop, tablet, and mobile layouts are intentionally designed.
- MovieNight uses the approved cinematic design direction.
- frontend code remains simple and feature-oriented rather than architecture-heavy.
- no direct TMDB calls exist in the frontend.
- no fake login/profile/account features exist.
- Stage 06 can focus on full-stack integration, runtime hardening, cache completion, and final cross-layer verification.

---

# 5. Locked Stage 05 Product Routes

Version 1 public frontend routes:

```text
/                    → Discover / Home
/movies/[id]         → Movie Details
/pick                → Pick for Me
/watchlist           → Anonymous Watchlist
```

Search and Discover are part of the `/` product experience.

Do not create a separate public Search route unless a later explicit product decision requires one.

Do not create frontend routes for:

```text
/login
/register
/profile
/settings
/collections
/admin
```

No matching backend capabilities exist.

---

# 6. Locked Visual Direction

MovieNight is a:

```text
modern
cinematic
dark
soft
rounded
image-first
polished
movie-discovery web app
```

It must not look like:

```text
an admin dashboard
a generic SaaS dashboard
a neon-heavy cyberpunk dashboard
a Netflix clone
a shadcn component showcase
```

---

## 6.1 Background

The primary background must **not** be pure black.

Avoid:

```text
#000000
```

Use a family of:

```text
graphite
deep navy-gray
muted blue-black
dark charcoal
```

The exact implementation color should be tuned visually during Sprint 05.1.

The base UI should remain visually neutral enough that movie artwork provides much of the page color.

---

## 6.2 Accent Color

Do not make teal/cyan the permanent dominant color of every surface.

Accent color is intended for:

- primary CTA
- active navigation
- selected filter / genre
- focused control
- subtle interactive glow
- small success/active states

Movie imagery should carry a large share of the visual color.

---

## 6.3 Image-Driven Gradients

Use movie artwork as a primary visual source.

Approved pattern:

```text
movie backdrop/poster
+
dark overlay
+
soft transparent gradient
+
page background blend
```

Use this especially for:

- Featured Hero
- Movie Details hero
- Pick result spotlight
- card bottom overlays where useful

Do not introduce dominant-color extraction or runtime palette-generation algorithms in Stage 05.

---

## 6.4 Typography

Typography must follow the approved reference direction:

```text
modern
rounded/geometric
clean
premium
highly readable
streaming-product feel
```

Approved candidates include:

```text
Manrope
Plus Jakarta Sans
DM Sans
Outfit
```

Sprint 05.1 must select one exact font after a lightweight visual comparison.

Current preference:

```text
Manrope
or
Plus Jakarta Sans
```

Use strong typography hierarchy:

```text
Hero/movie title     → heavy/bold
Section heading      → semibold/bold
Body/meta            → regular/medium
```

Do not use decorative “cinema” fonts that reduce readability.

---

## 6.5 Rounded Geometry

Rounded surfaces are a core design rule.

Use consistent radius scales for:

- hero surfaces
- movie posters/cards
- buttons
- search
- filters
- dropdowns
- small floating controls

Prefer:

```text
Hero          → large radius
Cards         → medium/large soft radius
Inputs        → medium/large radius
Genre chips   → pill
Primary CTA   → rounded / pill-like
```

Avoid random per-component radii.

---

## 6.6 Borders

Do **not** wrap every section in a bordered container.

Section separation should primarily come from:

- spacing
- typography
- imagery
- background contrast
- gradients
- subtle shadows

Borders may be used only where visually meaningful:

- input boundary
- selected state
- floating glass control
- subtle card treatment
- focus/accessibility state

Persistent neon outlines around cards are not allowed.

---

## 6.7 Glass Effects

Glassmorphism is selective, not global.

Good locations:

- top header/navigation
- search
- floating hero controls
- filter popovers
- small overlay controls

Bad locations:

- every movie card
- every content section
- entire page surfaces

Glass is a detail, not the primary design system.

---

## 6.8 Glow

Glow is interaction/highlight feedback.

Approved uses:

- primary CTA hover/focus
- selected genre/filter
- focused search/control
- Pick for Me primary action
- brief successful interaction feedback

Do not keep large permanent glows around normal cards or sections.

---

## 6.9 Motion

Motion must be subtle and functional.

Default interaction timing:

```text
approximately 150–250ms
ease-out
```

Approved motion:

```text
Movie card hover
→ small scale
→ slight lift
→ overlay fade

Button hover
→ brightness / subtle glow
→ tiny icon movement where appropriate

Filter/chip
→ smooth active-state transition

Watchlist mutation
→ quick icon/status feedback

Pick result
→ subtle fade/reveal

Skeleton
→ soft shimmer
```

Do not add:

- large parallax systems
- heavy 3D effects
- large animation frameworks without proven need
- excessive page-transition choreography

Prefer CSS/Tailwind transitions when sufficient.

---

# 7. Locked Layout Direction

Desktop layout should follow the approved reference style:

- primarily open/full-width content
- some sections may use an asymmetric layout
- movie rows may be paired with a smaller side feature card
- side feature cards must support the content, not make the page feel like a dashboard

Approved examples:

```text
Trending movie row
+ small Pick for Me feature card
```

or:

```text
Popular movie content
+ compact Watchlist preview
```

Do not convert every section into a two-column dashboard.

---

# 8. App Navigation

## Desktop

Primary navigation:

```text
MovieNight
Discover
Pick for Me
Watchlist
Search
```

Do not show fake:

```text
Profile
Settings
Notifications
Collections
Login
```

unless a real capability is later approved.

Header may use a light glass treatment.

---

## Mobile

Recommended primary navigation:

```text
Discover
Pick
Watchlist
```

Prefer a compact bottom navigation or equivalent touch-friendly mobile pattern.

Final implementation should be validated during Sprint 05.7.

---

# 9. Frontend Data Boundary

Frontend architecture remains intentionally simple.

Expected flow:

```text
React / Next.js UI
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

---

## 9.1 Watchlist Cookie

The backend owns the anonymous cookie.

Frontend requests that interact with the Watchlist must preserve browser credentials.

Conceptual fetch behavior:

```text
credentials: "include"
```

The browser must manage the protected anonymous cookie naturally.

The frontend must not:

- read or display the anonymous Guid
- create its own anonymous identity
- store backend identity tokens manually
- expose Data Protection details

---

## 9.2 Watchlist Saved State

Do not add a backend `movie status` endpoint for every Movie card.

Frontend may load:

```http
GET /api/watchlist
```

once for the current browser session/page flow and derive an in-memory set:

```text
savedMovieIds
```

This state may drive:

- watchlist icon state
- Add/Remove CTA state
- duplicate-safe UI feedback

Do not generate one status request per movie card.

---

# 10. Next.js Component Strategy

Use Server Components where they clearly reduce complexity or improve initial rendering.

Use Client Components for interaction-heavy features such as:

- search input
- discover filters
- Watchlist mutations
- Pick form
- interactive controls

Do not create complicated server/client boundaries merely to use advanced Next.js features.

Prefer the simplest boundary that preserves:

- maintainability
- cookie behavior
- API-client reuse
- predictable UX

---

# 11. Dependency Strategy

Prefer existing project dependencies and platform capabilities.

Use shadcn only for useful primitives such as:

```text
Button
Select
Sheet
Skeleton
Tooltip
Dialog if genuinely required
```

Do not let shadcn dictate the visual identity.

Do not add TanStack Query / React Query unless current implementation proves native fetch + small client state insufficient.

Do not add a heavy animation library unless CSS/Tailwind cannot meet an approved interaction requirement.

Any new package must have a concrete Stage 05 need.

---

# 12. Shared UI Components Direction

Likely reusable components:

```text
AppHeader
MobileNavigation
PageContainer
SectionHeader

FeaturedMovieHero

MovieCard
MovieRow
MovieGrid

GenreChips

SearchBar
DiscoverFilters

WatchlistButton

MovieDetailsHero
CastRow
SimilarMovies

PickForm
PickResult

MovieCardSkeleton
HeroSkeleton
DetailsSkeleton

ErrorState
EmptyState
```

This is directional.

Do not create component explosion.

Do not create one component per trivial wrapper.

---

# 13. Movie Card Contract

`MovieCard` is a core reusable component.

Primary data:

```text
Poster
Title
Year
Rating
```

Possible interaction state:

```text
Saved / not saved
```

Approved hover behavior:

```text
small poster zoom
small lift
soft overlay reveal
watchlist affordance
details affordance
```

Card design must remain image-first.

Do not overload cards with:

- full overview
- large metadata tables
- persistent action toolbars
- heavy borders

---

# 14. Discover / Home Experience

Route:

```text
/
```

Recommended section order:

```text
Header

Featured Hero

Genre Chips

Trending Now

Popular Movies

Pick for Me Feature CTA

Watchlist Preview / CTA
```

Exact ordering may be refined during Sprint 05.2 if the approved visual balance improves.

---

## 14.1 Featured Hero

Recommended hero source:

```text
top item from current Trending results
```

Do not use Pick for Me for the hero.

Hero should remain visually stable enough that a normal refresh does not radically change product identity.

Hero content should use only real backend data.

Expected hero data:

- backdrop
- title
- release year/date
- rating
- genres where available
- overview
- Details CTA
- Watchlist CTA

Do not add fake:

- trailer
- director
- streaming provider
- review score

unless a backend contract exists.

---

## 14.2 Genre Chips

Genre chips are functional.

Use backend genre data.

Active/inactive states should follow the approved visual rules.

Genre interaction may feed Discover behavior.

Do not show hard-coded genres when backend genres are available.

---

## 14.3 Trending

Use:

```http
GET /api/movies/trending
```

Recommended layout:

```text
horizontal movie row
```

Use reusable Movie cards.

---

## 14.4 Popular

Use:

```http
GET /api/movies/popular
```

Recommended desktop layout may be:

```text
movie row or compact grid
+
optional small side feature card
```

Avoid visual over-density.

---

## 14.5 Pick for Me CTA

Home may include a small supporting feature card encouraging the user to visit `/pick`.

This is one of the approved asymmetric sidebar/feature-card uses.

Keep it compact.

Do not implement the entire Pick interaction inside Home.

---

## 14.6 Watchlist Preview / CTA

Home may include a compact Watchlist preview or CTA.

If the Watchlist is empty:

```text
simple callout
```

If non-empty:

```text
small preview of a few saved movies
```

Do not turn it into analytics/dashboard content.

---

# 15. Search & Discover Experience

Search and Discover are visually unified.

The user should not need to understand backend endpoint distinctions.

Expected controls:

```text
Search query
Genre
Year
Minimum Rating
```

Behavior:

- text query → Search endpoint
- filter-driven browse → Discover endpoint

The exact UI behavior must avoid conflicting simultaneous modes.

Sprint 05.3 must define a simple rule for switching between Search and Discover based on current user input.

---

## 15.1 Search UI

Use a prominent rounded Search control.

Do not display raw backend validation language.

Empty queries must not trigger movie-search requests.

---

## 15.2 Discover Filters

Use:

- Genre
- Year
- Minimum Rating

Do not expose arbitrary sort controls.

Backend owns the fixed Discover sort.

---

## 15.3 Results

Use a responsive Movie grid.

Provide:

- loading skeletons
- no-results state
- safe error state
- paging/navigation consistent with backend result shape

Do not load unlimited pages automatically unless an explicit decision is made.

---

# 16. Movie Details Experience

Route:

```text
/movies/[id]
```

Use:

```http
GET /api/movies/{id}
```

Expected sections:

```text
Movie Details Hero
Overview / metadata
Watchlist CTA
Cast
Similar Movies
```

Use only current backend contract fields.

Do not fake:

- director
- writers
- reviews
- trailer
- availability
- IMDb-specific score
- production studio

unless these become actual backend fields later.

---

## 16.1 Movie Details Hero

Use:

- backdrop
- poster
- title
- release date/year
- runtime
- rating
- genres
- overview
- Watchlist CTA

Blend the backdrop into the page background with gradients.

Avoid wrapping the entire hero in heavy bordered panels.

---

## 16.2 Cast

Use current Cast DTO data.

Recommended layout:

```text
horizontal row
```

Portraits may be circular or soft-rounded.

Display:

- actor name
- character name where available

---

## 16.3 Similar Movies

Use reusable MovieCard.

Recommended layout:

```text
horizontal row
```

---

# 17. Pick for Me Experience

Route:

```text
/pick
```

This is a signature MovieNight feature.

The page may use slightly stronger interaction glow/motion than other pages while staying within the global design rules.

Expected flow:

```text
Intro
↓
Genre / Year / Minimum Rating
↓
Pick action
↓
Loading
↓
Single result spotlight
```

Result actions:

```text
View Details
Add/Remove Watchlist
Pick Again
```

Do not add fake AI personalization language implying an LLM or personal-profile model.

The backend currently performs rule-based random selection.

UI language should communicate:

```text
surprise / recommendation / discover
```

without falsely claiming machine-learning personalization.

---

# 18. Anonymous Watchlist Experience

Route:

```text
/watchlist
```

Expected layout:

```text
Your Watchlist

Saved privately in this browser.

Movie grid
```

No Watchlist analytics dashboard.

Do not add:

```text
Total runtime
Most watched genre
Watchlist score
Profile
Sync account
```

unless data and requirements exist.

---

## 18.1 Watchlist Card Behavior

Use the shared MovieCard where possible.

Watchlist-specific action:

```text
Remove
```

Users should also be able to open Movie Details.

Removal should give immediate visual feedback.

---

## 18.2 Empty State

Required:

```text
Your watchlist is empty.

Start discovering movies and save the ones
you want to watch later.

[ Discover Movies ]
```

Wording may be refined but meaning must remain.

---

## 18.3 Privacy Note

Required concept:

```text
Saved privately in this browser.
No account required.
```

Optional small clarification:

```text
Clearing browser data may remove access to this watchlist.
```

Do not show internal identity/cookie details.

---

# 19. Loading States

Prefer skeletons over global spinners.

Expected reusable states:

```text
HeroSkeleton
MovieCardSkeleton
DetailsSkeleton
```

Pick for Me may use a small dedicated loading animation because it represents one explicit user action.

---

# 20. Error States

Do not show raw:

```text
HTTP 502
ProblemDetails JSON
backend exception text
```

User-facing error examples:

```text
We couldn't load movies right now.
Try again.
```

Search:

```text
No movies found for "<query>".
```

Discover:

```text
No movies match these filters.
```

Pick:

```text
We couldn't find a movie matching those filters.
Try different filters.
```

Backend Problem Details may be logged/used internally for development where appropriate.

---

# 21. Responsive Design

Responsive behavior is a product requirement, not optional polish.

## Desktop

- large visual hero
- multi-card rows/grids
- approved occasional side feature card
- comfortable whitespace

## Tablet

- reduced columns
- compact hero
- preserved image hierarchy

## Mobile

- intentional stacked hero
- approximately 2-column movie grid where practical
- touch-friendly controls
- filters may become horizontal scroll or a Sheet
- mobile navigation must remain easy to reach

Do not merely shrink the desktop layout.

---

# 22. Accessibility Baseline

Stage 05 must include a reasonable accessibility baseline:

- semantic navigation
- useful alt text
- visible keyboard focus
- keyboard-operable controls
- acceptable color contrast
- buttons/links with meaningful labels
- touch targets appropriate for mobile

Motion should respect reduced-motion preferences where practical.

Do not sacrifice accessibility for glow/glass styling.

---

# 23. In Scope

Stage 05 includes:

- design tokens and visual foundation
- final font selection
- global background and typography
- desktop header
- mobile navigation
- shared Movie UI components
- Discover/Home
- search/discover filters/results
- Movie Details
- Cast
- Similar Movies
- Pick for Me
- Anonymous Watchlist
- Watchlist saved-state UX
- loading states
- empty states
- error states
- responsive layout
- subtle interaction motion
- selective glow/glass
- frontend API integration
- credential-aware Watchlist requests
- frontend accessibility baseline
- final frontend verification/handoff

---

# 24. Out of Scope

Do not implement:

- authentication
- registration
- login
- profile
- account settings
- watchlist sync between devices
- public shared watchlists
- multiple named watchlists
- collections
- streaming playback
- trailer integration
- provider availability
- reviews
- recommendations based on user profiles
- LLM recommendation
- direct TMDB frontend access
- frontend dominant-color extraction
- large animation frameworks without approval
- production deployment
- Stage 06 cache hardening
- Stage 06 full-stack runtime hardening

---

# 25. Stage 05 Sprint Breakdown

## Sprint 05.1 — Frontend Design Foundation & App Shell

### Goal

Establish the approved MovieNight visual system and reusable application shell before feature pages are built.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- only Sprint 05.1 and Locked Visual Direction from this document
- existing frontend structure/configuration

Inspect backend only if needed to preserve current API-client/config behavior.

### Tasks

1. Review the current frontend baseline and remove only obsolete temporary UI where required.
2. Select the exact approved font from:
   - Manrope
   - Plus Jakarta Sans
   - DM Sans
   - Outfit
3. Configure typography centrally.
4. Define lightweight design tokens for:
   - background
   - surfaces
   - text
   - accent
   - radius
   - shadow
   - glow
   - transitions
5. Implement the non-pure-black global background.
6. Implement reusable:
   - page container
   - section heading
   - primary/secondary button treatment
   - common rounded controls
7. Implement desktop AppHeader.
8. Establish mobile navigation structure without overbuilding later feature pages.
9. Confirm responsive shell behavior.
10. Preserve existing API-client behavior.
11. Do not implement Discover feature content yet.

### Acceptance Criteria

- [ ] exact font is selected and documented.
- [ ] background is not pure black.
- [ ] teal/cyan is not overused as a permanent global fill.
- [ ] radius treatment is consistent.
- [ ] no global bordered-dashboard composition exists.
- [ ] primary/secondary interaction styles are reusable.
- [ ] AppHeader contains only real product navigation.
- [ ] mobile navigation direction exists and is responsive.
- [ ] glass/glow usage remains selective.
- [ ] no feature page is implemented prematurely.
- [ ] current frontend build/lint pass.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Perform visual checks at representative desktop and mobile widths.

### Stop Boundary

Do not build Discover page content.

Do not start Sprint 05.2 automatically.

---

## Sprint 05.2 — Discover Home Experience

### Goal

Build the complete visual Discover/Home experience using real MovieNight backend data.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- Sprint 05.2 from this file
- current design foundation/components
- only current backend Movie API contracts required for Home

### Tasks

1. Build Featured Movie Hero from Trending data.
2. Implement image gradient blending.
3. Implement real genre chips.
4. Implement Trending row.
5. Implement Popular section.
6. Implement reusable MovieCard/Row behavior.
7. Add compact Pick for Me feature CTA.
8. Add compact Watchlist preview/CTA.
9. Integrate Watchlist saved-state feedback.
10. Add Home loading/error/empty states.
11. Use the approved asymmetric layout only where visually useful.
12. Keep sections visually open and avoid bordered container stacking.

### Acceptance Criteria

- [ ] Hero uses real Trending backend data.
- [ ] no fake movie capability/data is shown.
- [ ] artwork provides substantial visual color.
- [ ] Hero blends naturally into the page.
- [ ] genres are backend-driven.
- [ ] Trending works.
- [ ] Popular works.
- [ ] MovieCard is reusable.
- [ ] Pick CTA is compact and non-dashboard-like.
- [ ] Watchlist preview/CTA works.
- [ ] saved states are consistent.
- [ ] loading/error/empty states exist.
- [ ] desktop/mobile visual hierarchy is intentional.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Live-check Home against the real backend.

### Stop Boundary

Do not implement the full Search/Discover result workflow.

Do not start Sprint 05.3 automatically.

---

## Sprint 05.3 — Search & Discover Experience

### Goal

Create a unified Search/Discover interaction over the existing backend endpoints.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- Sprint 05.3 from this file
- current Home components
- Search/Discover backend contracts

### Tasks

1. Implement prominent search input.
2. Implement genre/year/min-rating filters.
3. Define and implement a simple Search-vs-Discover mode rule.
4. Do not send empty Search requests.
5. Implement responsive results grid.
6. Implement backend paging/navigation.
7. Add loading states.
8. Add validation-safe states.
9. Add no-results state.
10. Add safe upstream error state.
11. Preserve reusable MovieCard and Watchlist behavior.
12. Keep arbitrary sort controls out of UI.

### Acceptance Criteria

- [ ] user does not need to understand backend Search vs Discover distinction.
- [ ] empty query does not trigger Search.
- [ ] filters use backend-supported values only.
- [ ] no arbitrary sort selector exists.
- [ ] results grid works.
- [ ] pagination/navigation works.
- [ ] saved Watchlist state works on result cards.
- [ ] validation errors are user-friendly.
- [ ] empty/error/loading states are present.
- [ ] mobile filter UX is intentional.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Live-check representative Search and Discover flows.

### Stop Boundary

Do not implement Movie Details.

Do not start Sprint 05.4 automatically.

---

## Sprint 05.4 — Movie Details Experience

### Goal

Build a polished Movie Details page using only the current backend Movie Details contract.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- Sprint 05.4 from this file
- current shared Movie components
- current Movie Details backend contract

### Tasks

1. Implement `/movies/[id]`.
2. Build Movie Details Hero.
3. Blend backdrop into page background.
4. Show:
   - poster
   - title
   - release date/year
   - runtime
   - rating
   - genres
   - overview
5. Add Watchlist CTA.
6. Build Cast row.
7. Build Similar Movies row.
8. Reuse MovieCard.
9. Add loading/error/not-found states.
10. Do not invent unsupported metadata.

### Acceptance Criteria

- [ ] Details route loads real backend data.
- [ ] page uses current backend contract only.
- [ ] backdrop/artwork drives page color.
- [ ] no fake director/trailer/reviews/provider data exists.
- [ ] Watchlist CTA works.
- [ ] Cast renders correctly.
- [ ] Similar Movies renders correctly.
- [ ] loading/error/404 states exist.
- [ ] mobile layout remains intentional.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Live-check a known and unknown Movie ID.

### Stop Boundary

Do not implement Pick for Me page.

Do not start Sprint 05.5 automatically.

---

## Sprint 05.5 — Pick for Me Experience

### Goal

Build the signature Pick for Me frontend experience.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- Sprint 05.5 from this file
- current shared controls/cards
- Pick backend contract

### Tasks

1. Implement `/pick`.
2. Add page intro.
3. Add:
   - Genre
   - Year
   - Minimum Rating
4. Implement Pick action.
5. Implement a small functional loading animation/state.
6. Render one result spotlight.
7. Add:
   - View Details
   - Add/Remove Watchlist
   - Pick Again
8. Use slightly stronger but still restrained glow/motion for the primary Pick interaction.
9. Add no-match/error states.
10. Avoid false AI/personalization claims.

### Acceptance Criteria

- [ ] Pick filters map correctly to backend.
- [ ] Pick action returns one Movie.
- [ ] result is visually spotlighted.
- [ ] View Details works.
- [ ] Watchlist interaction works.
- [ ] Pick Again works.
- [ ] loading state is polished.
- [ ] no-result state is clear.
- [ ] upstream error state is safe.
- [ ] copy does not claim LLM/AI personalization that does not exist.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Live-check unfiltered and filtered Pick flows.

### Stop Boundary

Do not implement Watchlist page.

Do not start Sprint 05.6 automatically.

---

## Sprint 05.6 — Anonymous Watchlist Experience

### Goal

Build the complete browser-private Watchlist page.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- Sprint 05.6 from this file
- current Watchlist backend contract
- current MovieCard and saved-state behavior

### Tasks

1. Implement `/watchlist`.
2. Load real browser-private Watchlist.
3. Show required privacy note.
4. Render Watchlist Movie grid.
5. Add Remove interaction.
6. Add View Details interaction.
7. Keep UI free from anonymous identity internals.
8. Build empty Watchlist state.
9. Add loading/error states.
10. Ensure Watchlist requests preserve browser credentials.
11. Keep page visually focused and non-dashboard-like.

### Acceptance Criteria

- [ ] Watchlist loads current browser data.
- [ ] requests preserve credentials.
- [ ] remove is immediate and reliable.
- [ ] Details navigation works.
- [ ] empty state works.
- [ ] privacy note is clear.
- [ ] no anonymous Guid/cookie internals are displayed.
- [ ] no analytics/dashboard content is invented.
- [ ] mobile Watchlist grid is usable.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Live-check add-from-Discover → Watchlist → remove.

### Stop Boundary

Do not begin broad responsive/polish sprint automatically.

Do not start Sprint 05.7 automatically.

---

## Sprint 05.7 — Responsive, Interaction & UX Polish

### Goal

Polish the completed frontend across viewport sizes, interaction states, and accessibility.

### Required Context

Read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- Sprint 05.7 from this file
- completed Stage 05 UI only

### Tasks

1. Verify all pages at representative:
   - desktop
   - tablet
   - mobile
2. Finalize mobile navigation.
3. Finalize responsive Hero behavior.
4. Finalize mobile filter UX.
5. Improve touch targets.
6. Review:
   - hover
   - focus
   - keyboard
   - active
   - disabled
7. Review glow usage and remove excess.
8. Review glass usage and remove excess.
9. Review section borders/boxes and remove dashboard-like composition.
10. Review typography consistency.
11. Review spacing/radius consistency.
12. Add/refine reduced-motion handling where useful.
13. Verify loading/error/empty states across pages.
14. Fix only genuine frontend UX/polish issues.

### Acceptance Criteria

- [ ] desktop/tablet/mobile layouts feel intentionally designed.
- [ ] no desktop-only layout simply shrinks on mobile.
- [ ] navigation is usable on mobile.
- [ ] filters are usable on mobile.
- [ ] touch targets are reasonable.
- [ ] keyboard focus is visible.
- [ ] animation is subtle and functional.
- [ ] glow is not excessive.
- [ ] glass is not excessive.
- [ ] pure black is not used as main background.
- [ ] sections are not boxed unnecessarily.
- [ ] typography is consistent.
- [ ] loading/error/empty states are consistent.

### Verification

```text
npm run build
npm run lint
git diff --check
```

Perform manual visual checks at representative viewport widths.

### Stop Boundary

Do not start final Stage 05 handoff until polish blockers are resolved.

Do not start Sprint 05.8 automatically.

---

## Sprint 05.8 — Stage 05 Verification & Handoff

### Goal

Verify the completed frontend as one coherent product experience and prepare the repository for Stage 06.

Do not add new product features.

### Product Verification

Verify:

- Discover/Home
- Search
- Discover filters
- Movie Details
- Cast
- Similar Movies
- Pick for Me
- Watchlist
- Watchlist saved state
- Watchlist add/remove
- loading states
- error states
- empty states

### Design Verification

Confirm:

- background is not pure black
- typography matches approved modern rounded/geometric direction
- artwork drives much of the visual color
- gradients blend movie artwork naturally
- radius usage is consistent
- sections are not boxed unnecessarily
- glass is selective
- glow is selective
- motion is subtle/functional
- no dashboard-style page composition
- no fake profile/login/account UI
- no fake backend capabilities

### Responsive Verification

Check representative:

- desktop
- tablet
- mobile

Confirm:

- navigation
- Hero
- Movie grids
- Search
- filters
- Details
- Pick
- Watchlist

all remain usable.

### Data / Integration Verification

Confirm:

- frontend calls only MovieNight backend
- no frontend TMDB URLs/API usage exist
- Watchlist requests preserve credentials
- anonymous cookie internals are not exposed
- saved-state behavior is consistent
- backend Problem Details are not dumped directly into normal UI

### Build / Dependency Verification

Run:

```text
npm run build
npm run lint
```

Run additional project-defined frontend tests if they exist.

Review added npm packages and confirm each is required.

### Documentation Verification

Check relevant consistency among:

- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this Stage 05 file
- `AGENTS.md`
- `frontend/AGENTS.md`

Fix only genuine Stage 05 inconsistencies.

### Stage 05 Definition of Done

- [ ] all Sprint 05.1–05.8 acceptance criteria are satisfied.
- [ ] frontend build passes.
- [ ] frontend lint passes.
- [ ] Discover/Home is complete.
- [ ] Search/Discover is complete.
- [ ] Movie Details is complete.
- [ ] Pick for Me is complete.
- [ ] Watchlist frontend is complete.
- [ ] anonymous Watchlist behavior works.
- [ ] loading/error/empty states exist.
- [ ] responsive layouts are intentional.
- [ ] approved visual direction is implemented.
- [ ] no pure-black main background.
- [ ] no dashboard-style section boxing.
- [ ] no excessive teal/cyan.
- [ ] no excessive glass/glow.
- [ ] typography follows approved direction.
- [ ] no fake account/profile features.
- [ ] no fake backend capabilities.
- [ ] no direct frontend-to-TMDB calls.
- [ ] no Stage 06 hardening work is started.
- [ ] `STATUS.md` marks Stage 05 complete only after all checks pass.
- [ ] Stage 06 is marked next.
- [ ] Stage 06 has not started.

### Completion Report

Return:

1. Stage result: PASS or BLOCKED
2. Visual/design verification
3. Discover/Home verification
4. Search/Discover verification
5. Movie Details verification
6. Pick for Me verification
7. Watchlist verification
8. Responsive/accessibility verification
9. Frontend/backend integration verification
10. Build/lint/dependency verification
11. Documentation consistency
12. Files changed during handoff, if any
13. Remaining issues
14. STATUS update
15. Explicit confirmation Stage 06 was not started

### Stop Boundary

**Hard stop.**

Do not start Stage 06.

---

# 26. Stage 05 Technical Constraints

- Keep one Next.js frontend application.
- Frontend calls only MovieNight backend.
- Do not call TMDB directly.
- Preserve the centralized API-client direction.
- Keep architecture feature-oriented and simple.
- Do not introduce state-management frameworks without proven need.
- Do not add query/data libraries without proven need.
- Do not add heavy animation libraries without approval.
- Use shadcn only as primitive support.
- Do not let component libraries define the product identity.
- Use real backend capabilities only.
- Preserve current localhost frontend/backend ports unless explicitly changed.
- Preserve current CORS behavior.
- Keep Watchlist cookie browser-managed.
- Avoid secrets in frontend environment/config.
- Do not broaden Stage 05 into production deployment.

---

# 27. Stage 05 Context / Token Strategy

The project intentionally optimizes Codex context usage.

## Per-Sprint Thread Rule

Use a fresh Codex thread for each new Sprint 05.x.

Same-sprint corrections stay in the same thread.

Do not carry the entire Stage 05 conversation into every implementation sprint.

## Required Context

For most frontend sprints, Codex should usually read:

- applicable `AGENTS.md`
- `frontend/AGENTS.md`
- `STATUS.md`
- only the active Sprint 05.x section
- current relevant frontend files
- only required backend contracts

Do not read the entire backend implementation unless required.

Do not read every prior stage file by default.

## Model Guidance

Recommended:

```text
05.1 Design Foundation
→ Terra / Medium

05.2 Discover Home
→ Sol / Medium

05.3 Search & Discover
→ Terra / Medium
  switch to Sol / Medium if state/data-flow complexity becomes non-trivial

05.4 Movie Details
→ Terra / Medium

05.5 Pick for Me
→ Terra / Medium

05.6 Watchlist
→ Terra / Medium

05.7 Responsive / UX Polish
→ Sol / Medium

05.8 Verification / Handoff
→ Sol / Medium
```

Use Light only for small same-sprint corrections.

Avoid High unless a genuinely difficult issue appears.

---

# 28. Standard Codex Prompt — Sprint 05.1

```text
Execute only Sprint 05.1 — Frontend Design Foundation & App Shell from
`docs/stages/05-frontend-product-experience.md`.

Context:
- Read applicable `AGENTS.md`.
- Read `frontend/AGENTS.md`.
- Read `STATUS.md`.
- Read only the Locked Visual Direction and Sprint 05.1 from the Stage 05 document.
- Inspect only the current frontend structure/configuration required for this sprint.

Requirements:
- Follow all locked Stage 05 visual/product decisions.
- Select one approved font and document the choice.
- Establish the non-pure-black cinematic design foundation.
- Implement the reusable app shell/header/mobile-navigation direction and lightweight design tokens.
- Keep teal/cyan restrained.
- Do not create bordered dashboard composition.
- Do not add excessive glass/glow.
- Do not implement Discover feature content yet.
- Do not start Sprint 05.2.
- Do not commit automatically.

When done:
- run Sprint 05.1 verification;
- visually check desktop and mobile shell behavior;
- review the diff;
- update `STATUS.md` only if genuinely complete;
- return the standard sprint completion report;
- stop.
```

---

# 29. Standard Codex Prompt Template — Later Stage 05 Sprints

```text
Execute only Sprint <05.X — name> from
`docs/stages/05-frontend-product-experience.md`.

Context:
- Read applicable `AGENTS.md`.
- Read `frontend/AGENTS.md`.
- Read `STATUS.md`.
- Read only the active Sprint 05.X section.
- Inspect only the relevant frontend code and backend contracts required for this sprint.

Requirements:
- Follow the sprint scope, locked Stage 05 product/design rules, acceptance criteria, and stop boundary.
- Use only real MovieNight backend capabilities.
- Do not call TMDB directly.
- Do not implement later Sprint 05 work.
- Do not start Stage 06.
- Do not commit automatically.

When done:
- run the sprint verification;
- perform the required live/visual checks;
- review the diff;
- update `STATUS.md` only if genuinely complete;
- return the standard sprint completion report;
- stop.
```

---

# 30. Sprint Completion Report Standard

For Sprint 05.1–05.7, report:

1. What changed
2. Files changed
3. Dependencies added/changed and why
4. Design decisions made during the sprint
5. API/integration impact
6. Commands/tests executed
7. Visual/responsive verification
8. Accessibility/state verification where applicable
9. Assumptions
10. Remaining issues
11. `STATUS.md` update
12. Explicit confirmation the next sprint was not started

Sprint 05.8 uses the broader Stage handoff report defined in that sprint.

---

# 31. Plan-Mode Rule

Use Plan mode only when the current sprint exposes a genuine unresolved ambiguity.

Examples:

- App Router/server-client boundary creates a real architecture decision.
- the existing frontend bootstrap conflicts materially with the approved design system.
- current Watchlist cookie behavior cannot work cleanly through the existing frontend request boundary.
- a requested visual behavior requires a package/framework decision with non-trivial consequences.

Do not use Plan mode merely to restate the active sprint.

If Plan mode is used:

- plan only the active sprint;
- identify the exact ambiguity;
- do not implement later work;
- stop for Tech Lead review if a locked design/product decision would change.

---

# 32. Stage 05 Final Boundary

Stage 05 ends with:

```text
completed Movie backend
        +
anonymous Watchlist backend
        +
polished cinematic Next.js frontend
        +
responsive product UX
        +
real MovieNight feature integration
        ↓
complete user-facing product ready for Stage 06 hardening
```

Stage 05 must **not** become:

```text
authentication frontend
profile system
streaming player
Netflix clone
dashboard template
direct TMDB client
heavy frontend framework stack
production deployment stage
cache-hardening stage
```

Any proposal that materially changes this boundary requires explicit Tech Lead approval and corresponding canonical-document updates.
