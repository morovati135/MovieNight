---
name: movienight-ui
description: Project-specific product and visual contract for designing and implementing the MovieNight frontend. Use when building, restyling, reviewing, or validating MovieNight user-interface screens. It defines the routes and scope, the visual language, responsive rules and the implementation and validation workflow. Do not use it for backend-only tasks.
---

# MovieNight UI

The source of truth for MovieNight frontend work. The implemented app (see the screenshots in `docs/images/`) is the visual baseline: new UI must look like it belongs to the same product.

## Authority order

1. The task the Tech Lead explicitly gave.
2. Product scope and routes: [references/product-scope.md](references/product-scope.md).
3. This visual language and the responsive rules below.
4. Existing backend/API contracts (`contracts/api-shapes.json`).
5. Agent design preference: last, and never against 1–4.

## Visual language

- **Mood:** cinematic, dark, calm; artwork is the hero, chrome stays quiet. Sophisticated visuals on simple code.
- **Color:** deep navy background (`--background` #030a1b) with a soft blue glow at the top of the page. Brand blue (`--brand-blue` #0f7bb9, hover #0e71ab) for primary actions, brand pink (`--brand-pink` #d41d7c) for secondary accents, cyan accent/ring (`--accent`, `--ring`) for focus and highlights, links `--link` #21aaf5. White text on brand fills must keep WCAG AA contrast (4.5:1). All tokens live in `frontend/src/app/globals.css`; use tokens, not new literals.
- **Type:** Manrope. Large, tight, bold display titles (`sectionTitleClassName`); small, quiet metadata in muted white (at least 60% opacity on dark for text).
- **Surfaces:** frosted "glass" panels and pills (`--glass`, blur, thin light borders, soft shadow) for the header, controls and floating UI; rounded generously (`--radius`, full pills for buttons and chips).
- **Posters:** notched cards with a clipped silhouette and the watchlist control in the notch; the keyboard focus ring is drawn as an SVG outline following the silhouette. Landscape cards show the title and rating on the artwork.
- **Motion:** functional and restrained (spring slide on selected chips and toggles, cross-fades, hover lift). Everything must respect `prefers-reduced-motion`; the Hero carousel must not auto-advance for those users.
- **States:** every screen has designed loading (skeleton with the same layout, so nothing jumps), empty and error states (`PageNotice`, `SectionNotice`); errors are friendly and never show raw backend text.

## Responsive rules

Validate at **390**, **768** and **1440** px (and 320 px for overflow).

- 390: single column, tight vertical rhythm, two posters per row, fixed bottom navigation, no horizontal page scroll. The hero is a poster composition with a minimum height of 44rem.
- 768: tablet density (four posters per row), header navigation visible.
- 1440: wide layout; content max width about 77rem; hero uses a full backdrop with a carousel strip.
- Touch targets at least 40 px (44 px preferred). Rails scroll horizontally with snapping; their scroll containers are keyboard focusable and named.

## Implementation rules

- Implement only the requested scope; no unrelated refactors; no premature abstraction. Reusable pieces already exist: `MovieCard`, `MovieRow` (rail), `MovieGrid`, `FeaturedMovieHero`, `GenreChips`, `WatchlistButton`, `PageNotice`.
- Use real TMDB-backed data from the API; never hard-code fake movies to match a screenshot.
- Do not change backend contracts unless the task requires it; adapt the frontend to the existing ones.
- Every interactive control has default, hover, focus-visible, pressed, disabled and selected states where they apply, and works by keyboard.
- Preserve semantics, focus visibility, alt text, contrast and touch targets; accessibility fixes must not redesign the visual direction.
- Do not copy product features from other sites or templates; MovieNight's scope is in `references/product-scope.md`.

## Validate before reporting done

1. Run the app (backend and frontend) and look at the result in a real browser at 390 / 768 / 1440 px.
2. Run `npm run e2e:sweep` (layout, overflow, touch targets) and `npm run e2e:a11y` in `frontend/`.
3. Compare with the baseline screenshots in `docs/images/`; fix visible drift in spacing, hierarchy, typography and responsiveness.
4. Report: scope, files changed, behavior, viewports checked, checks run, limitations and anything deferred. Do not claim visual acceptance from code inspection alone.
