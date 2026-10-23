# MovieNight — Project Status

## Current Phase

Implementation / Stage 05 complete (Sprint 05.8 accepted by the Tech Lead on 2026-10-23); Stage 06 plan approved by the Tech Lead on 2026-10-23 (`docs/stages/06-full-stack-integration-testing-hardening.md`); Sprint 06.1 accepted by the Tech Lead on 2026-10-23; Sprint 06.2 accepted by the Tech Lead on 2026-10-23; Sprint 06.3 accepted by the Tech Lead on 2026-10-23; Sprint 06.4 accepted by the Tech Lead on 2026-10-23; Sprint 06.5 in progress

## Current Stage

Stage 06 — Full-Stack Integration, Testing & Runtime Hardening (in progress). Stage 05 is completed / accepted.

## Current Sprint

Sprint 06.5 — Stage 06 Verification & Handoff (in progress).

Sprint 06.4 — Runtime Configuration, Security & Dependency Audit (accepted by the Tech Lead on 2026-10-23).

06.4 implemented state (decisions in D033):

- Findings and fixes: the TMDB preflight diagnostic was public and reached TMDB uncached on every call → Development only; an unexpected exception returned an empty 500 → generic Problem Details 500; CORS origin was hard-coded → `Cors:AllowedOrigins` (default localhost:3000); no security headers → added on API and frontend.
- Verified by 15 new HTTP tests (178 backend tests): security headers; generic 500 without internal detail; malformed TMDB answers → 502; preflight, OpenAPI and Scalar absent in Production; startup fails clearly for a missing token or non-HTTPS TMDB address without leaking the token; CORS from configuration and no credentials for other origins; cookie Secure over HTTPS only; the TMDB token is sent only to TMDB and never returned.
- Dependencies: `dotnet list package --vulnerable --include-transitive` clean; patch updates to 10.0.13 (OpenApi, EF Core, Mvc.Testing) and Microsoft.OpenApi 2.12.2; frontend `next` 16.4.3, `eslint-config-next`, `tailwind-merge` 3.7; `npm audit --omit=dev` 0. Left alone as major jumps: eslint 10, TypeScript 7, React 19.3, `@types/node` 26, Scalar minor, Microsoft.OpenApi 3.
- Checked and clean: no secret in the repository (token only from user secrets); logs do not include the Authorization header; production build, 41 frontend tests, 17 / 17 journey checks and the route sweep pass against the production build.
- Open Tech Lead decisions (not done): Content-Security-Policy, rate limiting, HTTPS redirect / HSTS: see D033.


Sprint 06.3 — Contract Verification & Frontend Tests (accepted by the Tech Lead on 2026-10-23).

06.3 implemented state:

- Contract: `contracts/api-shapes.json` lists the JSON property names of every shape the frontend consumes (movie summary, details, cast, person, genre, page, collection). The backend test `ApiContractTests` checks the real API responses (including nested items and Problem Details) against it; the frontend test `src/lib/api/contract.test.ts` checks the TypeScript types in `src/types/movie.ts` against it, with compile-time exhaustive key lists. No drift was found; changing one side now fails a test (confirmed by changing the file).
- Frontend tests: Vitest + Testing Library + jsdom (dev dependencies; `@types/node` raised to 24 as Vitest requires). 41 tests in 5 files: API client (URLs, paging, encoding, 404 / error mapping), Watchlist client (proxy path, cookie, messages), `useWatchlist` (load, retry, add, remove, failure, double-click guard, rehydrate), Browse paging (Load more, duplicate removal, retry on page failure, empty, not-found, collection slug, category change), contract. `npm test`.
- End-to-end: the Stage 05 browser journeys and the 13-route × 3-width sweep are now committed scripts in `frontend/e2e/` (`npm run e2e`, `npm run e2e:sweep`, README); they use live TMDB data and are run by hand. Run now: 17 / 17 journey checks and all 39 route-width pages pass. The sweep ignores hidden images (the Hero's inactive slides are loaded eagerly and some finish unrendered); noted for Stage 07 polish: image-optimizer requests in dev took up to 7.5 s cold.
- Checks: tsc, eslint, `next build`, 41 frontend tests, 163 backend tests, `npm audit --omit=dev` 0.



Sprint 06.2 — Backend Integration & Failure-Path Tests (accepted by the Tech Lead on 2026-10-23).

06.2 implemented state:

- Gap found: the 85 earlier tests called controllers directly, so routing, model validation, Problem Details output, cookies, CORS, data protection and the real SQLite database were never exercised together.
- New HTTP-level tests start the real application in memory (`Microsoft.AspNetCore.Mvc.Testing` 10.0.10, test project only; `public partial class Program` added so the tests can start it) with a fake TMDB, a temporary database and keys per test. 63 new tests in `backend/MovieNight.Api.Tests/Http/`:
  - Movies: all public endpoints return 200 JSON; MovieNight shape (no TMDB fields); 13 invalid inputs return 400 validation problems without calling TMDB; unknown id 404 (remembered 1 minute); 401 / 500 / network failure return a safe 502 that leaks no upstream text or token and is not cached; list endpoints and Collections turn an outage into 502; cache and no-cache behavior; no anonymous cookie on movie endpoints; CORS allows only the frontend origin.
  - Collections: list, pages (studio pages through Discover, franchise is one page), unknown slug 404 without calling TMDB, invalid page 400, outage 502.
  - Watchlist: protected HttpOnly SameSite=Lax cookie issued once; tampered cookie replaced with an empty list; idempotent add and remove; newest first; two browsers isolated; same cookie restores the list; unknown movie 404 and not saved; invalid id 400; TMDB failure 502 and nothing saved; the 51st movie returns 409 while existing movies can be re-added and a removal frees a slot; hydration served from cache; after a cold start a movie TMDB forgot is left out and an outage returns 502.
- 154 backend tests pass (91 before). Developer database and keys under `App_Data` were not touched.

Sprint 06.1 — Cache Review & Hardening (accepted by the Tech Lead on 2026-10-23; branch `feature/stage-06-plan`). Tech Lead note: TTL choices drive performance, so they must be based on measurement.

06.1 implemented state:

- Inventory and measurement (live, 2026-10-23): cached endpoints answer in about 2 ms against 0.6–5 s cold (details 5.2 s, trending 3.0 s, collections 2.5 s); Discover, Search and Pick were uncached at about 0.5–1.3 s each.
- New `CatalogCache` helper replaces the two services' own `GetOrCreateAsync` calls: shared loads for concurrent misses, size-bounded cache (`SizeLimit` 5000), 1-minute negative cache for unknown movie ids, failures never cached, hit / miss counters and debug logs.
- TTL policy by data category in `CacheTtl` and D032: details 10 min → 2 h, trending / popular 5 min → 30 min, top rated 1 h → 6 h, genres 6 h → 24 h, collections 6 h → 12 h, Discover newly cached 15 min; Search stays uncached; Pick reuses cached Discover pages.
- Verified live: Discover 0.52 s → 0.003 s on repeat, unknown id 404 0.73 s → 0.001 s, 8 concurrent cold requests for one movie completed together in about 0.8 s.
- Tests: 91 backend tests pass (6 new cache tests: expiry, shared load, cancellation, failures not cached, negative cache, size bound; one test updated because Discover is now cached).

Previous sprint:

Sprint 05.8 — Stage 05 Verification & Handoff (accepted by the Tech Lead on 2026-10-23; verification run 2026-10-23: PASS; branch `feature/stage-05-handoff`)

05.8 verification (2026-10-23, result PASS):

- Product: 18 live checks through the real backend in a fresh browser all passed — Home sections; save from a Home card → Watchlist page → saved state on Details; Details cast and similar movies; Search by title, title + genre and an empty result; Pick for Me reveals a movie; Remove → Undo → empty shelf; Home and Details with the backend blocked show friendly errors without raw Problem Details; invalid movie id and unknown route show not-found.
- Responsive / accessibility: X7 sweep of 13 routes at 390 / 768 / 1440 (no overflow, no target under 40px, one h1 each); no forbidden login / account / streaming copy in the frontend.
- Integration: no request to api.themoviedb.org, no `fetch()` outside `src/lib/api/`, Watchlist requests use `credentials: "include"` through `/backend/watchlist`. Artwork may be re-requested straight from `image.tmdb.org` by the image fallback (images only, no API access).
- Build: lint, build, `git diff --check` clean; 85 backend tests passing; every npm dependency is used (`react-dom`, `shadcn` and `tw-animate-css` implicitly or through `globals.css`).
- Docs: fixed two stale route lists (Stage 05 §5 and the UI skill's product-scope) that still named only four routes; STATUS, ROADMAP, DECISIONS and ARCHITECTURE agree.
- Remaining issues found by the verification were fixed the same day (Tech Lead approved the plan): `next` 16.3.6 → 16.4.2 (it carried a critical advisory), `eslint-config-next` 16.4.2, `lucide-react` 1.61, `@base-ui/react` 1.9, React type packages 19.3; `shadcn` moved from `dependencies` to `devDependencies` and its one used file, `shadcn/tailwind.css`, copied unchanged to `src/app/shadcn-tailwind.css` (no component imports the package; generated CSS compared before / after: no rule from it changed; D031); `npm audit fix` (non-breaking). `npm audit --omit=dev`: 0 vulnerabilities (was 19, 2 critical). The 9 findings still listed by a full `npm audit` are dev-only (`shadcn` CLI and `eslint-config-next` via `braces` / `micromatch` / `fast-glob`; no patched `braces` exists yet) and do not ship. Scene thumbnails on Details now use TMDB w780 (the full-size viewer keeps the original): the failing thumbnail requests are gone (0 errors on Details at 390 / 768 / 1440).
- Not changed: the image fallback may re-request artwork from `image.tmdb.org` (images only); the dev-only hydration warnings come from a browser extension (`bis_skin_checked`), not the code.
- After the fixes: lint, tsc, build, 85 backend tests, the 18 live checks and the 13-route sweep were run again and pass.
- Stage 06 has not been started. Screenshots `docs/screenshots/05.8-*`.

Sprint 05.7 — Product Additions and Polish is accepted and complete (X1–X7 accepted by the Tech Lead on 2026-10-22 and 2026-10-23); it is merged into `master` (PR #1).

### Sprint 05.7 Work Packages

- [x] 05.7-X1 — Fixes + consistency + footer (TMDB attribution) (accepted by the Tech Lead on 2026-10-22)
- [x] 05.7-X2 — Navigation + About (accepted by the Tech Lead on 2026-10-22)
- [x] 05.7-X3 — Home speed (accepted by the Tech Lead on 2026-10-22)
- [x] 05.7-X4 — Card + CTA details (accepted by the Tech Lead on 2026-10-22)
- [x] 05.7-X5 — New Home sections (Collections, Iconic top rated) (accepted by the Tech Lead on 2026-10-22)
- [x] 05.7-X6 — See more + category pages (accepted by the Tech Lead on 2026-10-23)
- [x] 05.7-X7 — Interaction pass + final QA (accepted by the Tech Lead on 2026-10-23)

Scope extension, audit findings, decisions (footer, About and Socials, header, collections, browse pages) and work packages are recorded in `docs/stages/05-frontend-product-experience.md` (§15.1) and D030. Work happened on branch `feature/polish-05.7`.

What remains: Stage 06 (full-stack integration, testing and runtime hardening, including the mandatory cache review) and Stage 07 (final polish and portfolio handoff). The scene-thumbnail question is settled: thumbnails use TMDB w780, the viewer keeps the original.

05.7-X7 accepted state:

- Swept 13 routes (Home, the four Browse categories, an unknown collection, Search, Pick, Watchlist, About, movie details, unknown movie, 404) at 390 / 768 / 1440 in headless Edge: no horizontal overflow, no console or network errors except the expected 404s of the not-found pages, no touch target under 40px, every page has one h1.
- Fix found by the sweep: movie details backdrops were TMDB "original" files (about 2.6 MB, 5–7 s), which the Next image optimiser could time out on (500) and leave the details hero blank; `BuildBackdropUrl` now uses w1280 like the list backdrops (test updated, 85 passing).
- Checked: "Load more" on Trending (20 → 39 cards, one repeat dropped) and Marvel (20 → 40); Star Wars (franchise) shows one page without the button; genre chips are keyboard reachable and Enter selects.
- Open point for the Tech Lead: the details page's scene thumbnails still use "original" files (chosen so the full-size viewer is sharp); an occasional one fails its first request and relies on the direct fallback. Using w1280 would remove that at some sharpness in the viewer.
- Verified: lint, build, `git diff --check`, `dotnet test`; screenshots `docs/screenshots/05.7-X7-*`.

05.7-X6 accepted state:

- Backend: `page` (1–500) on `GET /api/movies/trending` and `/popular` (cached per page); new `GET /api/collections/{slug}/movies?page=` — franchises return one page in release order (later pages empty), studio and genre collections page through Discover, an unknown slug returns 404. 85 backend tests passing (2 new).
- Frontend: `/browse/[category]` (`trending`, `popular`, `iconic`, or a collection slug) with the Search grid and "Load more" paging, skeleton, retry, not-found notice. "See more" links on Trending, Popular and Iconic; every collection card links to its page. The genre section still uses Search and Your Watchlist still opens `/watchlist`.
- Review follow-ups (Tech Lead, same day): Discover by Genre keeps each genre's movies in memory, warms the other genres one at a time while idle (first 12 posters of each downloaded early) and fetches a genre on chip hover/focus/touch, so choosing one swaps in without a loading state once warmed; the genre chips are one frosted track like the Pick page's segmented controls (sliding raised thumb, site font semibold, chips share the width evenly when they fit, otherwise swipe/trackpad/mouse-drag with edge fades, no arrows, selected chip kept centred); on phones the Home hero has a 44rem minimum height instead of the full screen height, so the gap to Trending Now matches other sizes.
- Known limit: a genre clicked in the first seconds, before the warm-up reaches it, still shows a short load; the browser extension attribute `bis_skin_checked` triggers dev-only hydration warnings and is not a code issue.
- Verified: lint, tsc, build, `dotnet test`; live API (paging, 404, 400 on page 0) and `/browse/trending`, `/browse/star-wars`, `/browse/marvel`, `/browse/nope` rendered; screenshots `docs/screenshots/05.7-X6-*`. Load more in a browser and tablet width are covered in X7.

05.7-X5 accepted state:

- Backend: `GET /api/collections` (curated catalogue of eight — TMDB franchise collections plus studio and genre sets, D030 — each with up to three cover posters, 6 h cache, a failing collection left out) and `GET /api/movies/top-rated?page=` (highest rated films with at least 10,000 votes, 1 h cache); TMDB client gains collections, a company filter for Discover and the top-rated query. 83 backend tests passing (6 new).
- Home, after the Pick CTA and before Your Watchlist: Collections — stacked poster cards with the name over the front poster (`movie-covers/Collections`, a rail from tablets up; `Collection_Mobile`, two columns on phones; the back posters fan out on hover) — and "Iconic: Top rated of all time" as landscape cards (`movie-covers/Cards`). Both load only when scrolled near (shared `use-near-viewport`), with skeletons and a retry notice.
- Review follow-up: collection names in the site font (Manrope extra bold, normal case; an Anton display face was tried and rejected as off-theme) with a soft small text shadow; the two back posters fan out further (about 15% and 29% to the right) so the stack reads clearly; landscape cards' Watchlist plus is as big as on poster cards.
- Verified: lint, build, `git diff --check`, `dotnet test`; live at 1440 / 768 / 390: section order, 8 collections, 20 iconic cards (The Shawshank Redemption, The Godfather, 12 Angry Men…), no overflow, no errors, new data requested only on scroll; screenshots `docs/screenshots/05.7-X5-*`.

05.7-X4 accepted state:

- Movie cards (poster and landscape): the Watchlist island's plus and saved check are bold (stroke 3 instead of 2, round caps), as in the Tech Lead reference.
- Pick CTA: the travelling glow line is longer — about 40% for every glow layer, then (Tech Lead follow-up) a further ~30% for the line itself only (the bright rim and the hotspot on the edge), leaving the soft halo and inner bleed at their size; nothing else on the CTA changed.
- Verified: lint, build, `git diff --check`; cards at 1440 / 390 and the landscape card on Pick; screenshots `docs/screenshots/05.7-X4-*`.

05.7-X3 accepted state:

- Cause: Home loaded trending + popular, then six full Movie Details requests (credits, recommendations, images) for the hero before anything rendered, and the hero used TMDB `original` backdrops.
- Changes: the hero is built from the trending list itself (summary backdrop, D029) plus genre names, with trending, popular and genres loaded in one parallel round (10 API calls before the hero image → 3); movie-summary backdrops use TMDB `w1280` (was `w780`) so the full-width hero stays sharp; the visible hero image gets `fetchPriority="high"`; the genre section loads its data only when it comes near the viewport.
- Measured (Chrome, 20 Mbps / 40 ms; cold = backend restarted and image cache emptied; warm = median of 3):
  - cold: hero text 2,964 → 1,435 ms; hero image / LCP 6,841 → 4,362 ms;
  - warm: hero text 935 → 445 ms; hero image 942 → 566 ms; LCP 732 → 568 ms;
  - data transferred on first view 813 → 711 KB.
- Tried and reverted: loading the hero image straight from TMDB (skipping the Next image optimiser) — slightly faster cold (3.95 s) but much slower on repeat visits (median 3.65 s), because browsers then download the full file instead of the optimised, cached copy.
- Revision after Tech Lead review (slides went blank while their image loaded; desktop hero quality): the hero is now one stack of per-slide layers, and only the shown slide is opaque. The shown slide changes only once the new slide's image has loaded, so the previous backdrop stays and cross-fades instead of a blank hero. Desktop shows the quick 1280px backdrop first and fades TMDB's original over it (`lib/tmdb-image.ts` swaps the size segment of the backend-provided URL; still through the Next image optimiser, so 1440px screens get a 1920px image and retina screens more). Images load for the current slide first; after it is on screen, the next and previous slides load at low priority (full quality for current + next), and loaded slides stay mounted.
- Measured after the revision: 0 blank frames in 9 runs of clicking through every slide faster than images download (1440 @1x, 1440 @2x, 390 @2x; cold and warm image cache); desktop settles on the original. Warm hero image ~0.5–0.9 s; LCP ~1.2–1.4 s because the full-quality fade-in is the largest paint; desktop first view transfers ~1.3–1.6 MB (was 0.7 MB with 1280px-only, 2.3 MB when every slide preloaded at full quality — narrowed to neighbours). Cold first-load times vary widely on this machine (3.5–11 s) because they depend on its connection to TMDB; they are cached afterwards.
- Verified: lint, build, `git diff --check`, `dotnet test` (77 passing); hero still shows genres and rotates; rails and genre section unchanged at 1440 / 390; no overflow or errors; screenshots `docs/screenshots/05.7-X3-*`.

05.7-X2 accepted state:

- Header: no border stroke (an inner highlight and soft shadow instead), rounder corners (32px), an icon before each item (Compass, Sparkles, Bookmark, Info) and the cult-ui halo-tabs "pill" indicator (frosted fill, hairline rim, soft glow underneath) in one blue colour family matching the theme (single-hue like the halo-toast rims; Tech Lead choice), with the active icon in light blue, gliding between items; About added. Tablets use short labels ("Pick") so all four fit. halo-tabs is built on Base UI Tabs (`role="tab"`), so the items stay real links with `aria-current` and only its pill and its measured-position mechanism are used (`components/layout/nav-pill.tsx`); this replaced an earlier motion `layoutId` pill that could drift on the fixed mobile bar.
- Mobile bar (revised after review): a fully rounded halo-tabs pill track with the same indicator; icons only and larger (24px), names kept for screen readers; even 6px inset on both sides at every width; About added (four columns). Shared item list in `components/layout/navigation-items.ts`.
- `/about` ("Made for movie nights."): portfolio and practice project by Amir Mahdi Morovati; What's inside (Discover, Pick for Me, Watchlist); How it's built — spec-driven development with an AI coding agent (specs in the repository, one work package at a time, each reviewed in the browser), the architecture and the stack; Find me online — GitHub, X, Instagram with Simple Icons brand logos (`components/ui/brand-icons.tsx`, CC0); these cards float up 6px with a deeper shadow on hover (still with reduced motion). An editorial rewrite was tried and rolled back at the Tech Lead's request; the card version was kept, slightly simplified (no background glow, no hover lift).
- Verified: lint, build, `git diff --check`; 1440 / 1024 / 768 / 390: no overflow, header fits, current page marked in header and mobile bar, no target under 44px, social links correct; the indicator stays exactly on the active item after navigating while scrolled at 360 / 390 / 430 / 560 / 700 and in the header at 1440 / 768; no errors; screenshots `docs/screenshots/05.7-X2-*`.

05.7-X1 accepted state:

- Site-wide footer (`components/layout/site-footer.tsx`): logo, tagline, Home / Watchlist / About links (Pick for Me left to the header so the footer is not a copy of the menu), TMDB's official logo (`public/tmdb-logo.svg`, from TMDB's logo page) linking to themoviedb.org with "This product uses the TMDB API but is not endorsed or certified by TMDB.", © year, and "Made with ♥ by Amir Mahdi" linking to X. The layout's main area no longer carries mobile-nav padding; the footer does.
- Movie Details no longer overflows on phones: 20px side padding like the rails expect, and horizontal overflow clipped at page level (as on Home and Pick).
- Tab titles: "Search · MovieNight" while Search is open; "Movie not found · MovieNight" / "Movie unavailable · MovieNight" on Details.
- Watchlist button wording is "Add to Watchlist" / "In Watchlist" everywhere (the Home hero said "Add to watchlist" / "Remove").
- Skip link is 44px tall.
- Home and Details full-page states (`PageNotice`) use the cinematic frame of the Pick / Watchlist notices.
- Verified: lint, build, `git diff --check`; all pages at 1440 / 768 / 390: no horizontal overflow, no target under 44px except the accepted 40px tablet rail arrows, no unnamed controls, footer on every page; the only console errors are the expected not-found 404 and `/about` prefetches until X2 adds that page; screenshots `docs/screenshots/05.7-X1-*`.

Sprint 05.6 — Anonymous Watchlist Experience is accepted and complete (W1, W2, W3 accepted by the Tech Lead on 2026-10-22).

### Sprint 05.6 Work Packages

- [x] 05.6-W1 — Page + states (accepted by the Tech Lead on 2026-10-22)
- [x] 05.6-W2 — Visual polish (accepted by the Tech Lead on 2026-10-22, with the morph-text / floating-aurora hero)
- [x] 05.6-W3 — QA (accepted by the Tech Lead on 2026-10-22)

Direction (cozy personal shelf in the site's own visual language, poster cards, Remove with Undo, no sorting/filtering), privacy note and work-package scope are recorded in `docs/stages/05-frontend-product-experience.md` (§14.1). Work happens on branch `feature/watchlist-05.6`.

05.6-W3 accepted state:

- QA audit of `/watchlist` at 1440 / 768 / 390 in every state (loading, empty, shelf, Undo message, error): no horizontal overflow, no touch target under 44px, headings H1 → H2, every image has alt text, no page errors; reduced motion leaves nothing animating.
- Fixed: keyboard focus was lost after Remove (it fell back to the top of the page). Now focus moves to Undo; Undo returns it to the restored movie; if the message times out while focused, focus moves to the movie now in that slot, or to the empty-shelf heading when the shelf is empty.
- Fixed: a card fading out after removal could still be clicked or focused. Each saved movie is now a `ShelfItem` that becomes inert (and hidden from assistive technology) while it exits.
- Live cross-page run: saved from Home (card island), Movie Details (Add to Watchlist) and Pick for Me (spotlight) → all three on the shelf, newest first → Home's "Your Watchlist" row shows them → removed all by keyboard → Home row hidden.
- Screenshots: `docs/screenshots/05.6-W3-*`.

05.6-W2 accepted state:

- Hero (revised after Tech Lead review the same day — the first version with rays, a fanned poster pile and a warm ambient glow was rejected): centred title using Vengeance UI `morph-text` ("Your movie shelf" → "Saved for later" → "Ready for tonight"; screen readers get one `h1`), over the Framer Marketplace "Floating Animation" aurora (ported from its published module onto the new `ogl` dependency, brand pink / blue / violet, fading into the page, paused off screen).
- Cards drift in gently when the shelf opens; a removed card fades and shrinks while the others slide into place, and Undo eases it back in (motion `layout` + `AnimatePresence`).
- Empty state: a small "empty shelf" of three dashed poster outlines on a warm glow.
- Reduced motion: no entrance or removal animation, the first title phrase only, and a still aurora frame.
- Verified: lint, build, `git diff --check`; the W1 live flow rerun unchanged (empty → 9 saved → remove → Undo → details; error → Try again) with no overflow and no target under 44px at 1440 / 768 / 390; aurora canvas renders at 1440 and 390; title morphs; removed card mid-fade at 160 ms; with reduced motion it leaves at once; screenshots `docs/screenshots/05.6-W2-*`.

05.6-W1 accepted state:

- `/watchlist` ("Your movie shelf"): saved count ("9 movies waiting for movie night"), plain-language privacy note, poster grid (shared `MovieCard` + title, year · rating and a Remove button per movie; the card's own island also removes), View Details through the card.
- Remove shows "Removed *title* · Undo" for 5 s; Undo saves the movie again. `useWatchlist().toggle` now resolves to whether the change succeeded (existing callers unaffected).
- Loading skeleton, error with Try again, cozy empty state with Discover movies / Pick for Me.
- Verified: lint, build, `git diff --check`; live with a fresh browser: empty shelf → 9 saved through `/backend/watchlist` → 9 shown → remove 9 → 8 → Undo → 9 (backend 9) → Undo message gone after 5 s → View Details opens the movie; error → Try again → shelf; no horizontal overflow and no target under 44px at 1440 / 768 / 390; screenshots `docs/screenshots/05.6-W1-*`.

Sprint 05.5 — Pick for Me Experience is accepted and complete (P1, P2, P3 accepted by the Tech Lead on 2026-10-22).

### Sprint 05.5 Work Packages

- [x] 05.5-P1 — Route + filters + pick flow (accepted by the Tech Lead on 2026-10-22: "Perfect!" and go-ahead to the next part; also covers P2's spotlight, artwork-first reveal and repeat avoidance)
- [x] 05.5-P2 — Spotlight + states (accepted by the Tech Lead on 2026-10-22, including the polish round)
- [x] 05.5-P3 — Responsive polish + visual QA (accepted by the Tech Lead on 2026-10-22)

Visual direction, cult-ui components (halo-search adapted as the prompt line, halo-select, halo-toggle-group, halo-button), Vengeance UI effects, loading-ui morphing-infinity, data decisions and work-package scope are recorded in `docs/stages/05-frontend-product-experience.md` (§13.1). Work happens on branch `feature/pick-for-me-05.5`.

05.5-P3 accepted state:

- QA audit of `/pick` at 1440 / 768 / 390 in every state (idle, searching, result, no match, error): no page-level horizontal overflow, no touch target under 44px except the accepted 40px tablet rail arrows, heading order H1 → H2 → H3 → H2, every image has alt text, focus moves to and announces the result / notice, keyboard Genre select + rating toggle + Pick by Enter all work, reduced motion leaves nothing animating (strip loop, rays, glows), no page errors.
- Fixed (Tech Lead report): posters sometimes did not load. Cause: the Next image optimiser times out fetching TMDB artwork on slow connections (`upstream image response timed out`), and summary backdrops were TMDB `original` files (several MB). Movie-summary backdrops now use TMDB `w780` (D029 updated); a shared `ResilientImage` retries a failed optimised image straight from TMDB and otherwise shows a designed placeholder, never a broken image; the picker quietly picks another movie (max 2, within the 10 s budget) when the picked poster cannot load at all or the movie has no poster. Verified with the optimiser down (loads directly), the first two picks' posters blocked (third movie shown with its poster) and all images down (placeholder ticket in ~5 s, no broken images).
- Fixed (Tech Lead report): the top strip started fast, slowed and stopped. Cause: a new image array on every render restarted the loop, and the GSAP tween was created in a timeout outside the GSAP context, so old tweens were never killed and stacked. Follow-up (Tech Lead report: occasional stutter, and a faster strip after resizing): GSAP ran on the main thread, tiles popped in while moving, extra copies were added after the first render, and the loop distance was computed once from the window width (tiles are 140px below md, 180px above). Now the strip keeps its first set of posters for the page load, renders all copies up front, preloads the posters before the loop starts (max 4 s), and loops with the Web Animations API on the compositor; the distance is measured from the tiles and re-synced on resize, and speed is per tile. `gsap` was removed. Measured: ~242 px/s at 1440 even with the main thread frozen 350ms every second, 192 px/s at 390 (same 1.23 tiles/s), unchanged after resizing back, 0 tiles added while moving, no animation with reduced motion; UI unchanged.
- Genre / Release year: the label reveal after choosing an option is slower and smoother (~0.55 s for "Animation", was ~0.3 s; Tech Lead request).
- Screenshots: `docs/screenshots/05.5-P3-*` (idle, searching, result, full page, no match, error at 1440 / 768 / 390; reduced motion; poster placeholder).

05.5-P2 polish (accepted):

- Top poster strip: soft fade and edge blur on both sides.
- Searching frame: loading-ui `morphing-infinity` (verbatim) replaces the shader orb.
- Minimum rating: cult-ui `halo-toggle-group` used verbatim (dark styles applied directly, 44px items) instead of the adapted `halo-segmented`, which was removed.
- Spotlight poster as a rounded ticket (perforated tear line, side notches); the TMDB score moved off the artwork into the ticket stub.
- Landscape suggestion rail: extra bottom room so the card shadow fades softly instead of being clipped.
- Verified: lint, build, `git diff --check`; live at 1440 / 390: no horizontal overflow, rating toggles 44px with full screen-reader names and URL sync, score not over the artwork; screenshots `docs/screenshots/05.5-P2-polish-*`.

05.5-P2 implemented state (awaiting review):

- No match: names the current choices in words and offers one button per active choice ("Rated 7+ instead" / "Any rating", "Any year, not just 1925", "Any genre, not just Documentary") plus "Start over with any movie"; each loosens just that choice, updates the URL and searches again straight away.
- Error: same cinematic frame, accurate copy ("We couldn't reach the movie service"), choices kept, Try again.
- Both notices use the spotlight frame with a dim fan of popular posters and the halo orb; focus moves to the notice heading.
- Verified: lint, build, `git diff --check`; live at 1440 / 390: no-match → loosen year → result; forced 502 → Try again → result with the URL unchanged; no horizontal overflow; screenshots `docs/screenshots/05.5-P2-*`.

05.5-P1 redesign (accepted):

- Title hero: earlier Manrope title / flip-fade design restored (Tech Lead request) with the original Vengeance UI magnetic-spotlight-marquee strip below the text (no pointer-follow; 240 px/s instead of 600; loop later moved from GSAP to the Web Animations API and `gsap` removed — see P3), original animated-rays (drift now actually running) and flip-fade-text; controls on a symmetric 2 × 2 grid; halo rims desynchronised (own phase/speed, only prompt and Pick button glow continuously).
- "Picked for you" spotlight from the Tech Lead's references; the search stays up until details, poster and backdrop have loaded (max 10 s from the click), shuffling posters of movies that match the current choices (popular as fallback) with honest step text; quiet retry (max 2) when Pick Again repeats a recently shown movie; focus moves to the result.
- Landscape suggestion cards (`movie-covers/Cards`): "Popular right now" / "More like {title}"; `MovieCard` / `MovieRow` gained a landscape variant; backend D029 adds an optional `backdropUrl` to movie summaries (77 tests passing).
- Verified: lint, build, `git diff --check`, `dotnet test`; browser at 1440 / 768 / 390: no horizontal overflow, touch targets ≥ 44px (except the accepted 40px tablet rail arrows), artwork always loaded at reveal (reveals in ~2–6 s live; 10.2 s with artwork held back 14 s), marquee follow + wake, no-match / error states, marquee strip fixed under mouse movement, reduced motion with no running animations or marquee loop; screenshots in `docs/screenshots/05.5-P1-*` (replacing the first-round set; hero screenshots to be retaken once TMDB is reachable again — on 2026-10-22 TMDB timed out from this machine, so the final hero was verified with stand-in data).

05.5-P1 first-round state (superseded by the redesign above):

- Backend D028: `vote_count.gte=100` is sent with every minimum-rating Discover/Pick request; tests updated (77 passing).
- New dependencies: `motion` (all halo controls) and `@paper-design/shaders-react` (the Warp orb in the prompt line), required by the cult-ui components.
- cult-ui components adapted in `frontend/src/components/ui/halo/` (shared glow, button, select, segmented; halo-search adapted to a read-only prompt line because Pick takes no free text). Brand pink/violet/cyan rim, dark-only surfaces, rim and orb still under reduced motion, staggered text readable as a whole by screen readers.
- `/pick`: intro, prompt sentence restating the choice, Genre / Release year selects, Minimum rating segmented (Any / 6+ / 7+ / 8+), Pick a movie / Pick again, basic result (poster, title, year, rating, overview, View Details, Watchlist), no-match with Clear choices, error with Try again; filters in the URL (`/pick?genre=&year=&rating=`).
- Verified: lint, build, `git diff --check`, `dotnet test`; live API checks (unfiltered, genre, genre+year+rating, rating only, no match 404, invalid 400); browser checks at 1440 / 768 / 390: no horizontal overflow, no touch target under 44px, URL sync, Pick again, Watchlist add/remove, View Details, no-match and error states; screenshots in `docs/screenshots/05.5-P1-*`.
- Known: the header prefetches `/watchlist`, which 404s until Sprint 05.6 (pre-existing).

Sprint 05.4 — Movie Details Experience is accepted and complete (D1, D2, D2b, D3 accepted by the Tech Lead on 2026-10-22).

### Sprint 05.4 Work Packages

- [x] 05.4-D1 — Route + Hero + About (accepted by the Tech Lead on 2026-10-22)
- [x] 05.4-D2 — Cast + More like this (accepted by the Tech Lead on 2026-10-22)
- [x] 05.4-D2b — Details enrichment (accepted by the Tech Lead on 2026-10-22)
- [x] 05.4-D3 — Responsive polish + visual QA (accepted by the Tech Lead on 2026-10-22)

Reference adaptation, dropped reference elements (country, like/dislike, Watch Now / Preview, scene stills, Director, Comments, footer links) and work-package scope are recorded in `docs/stages/05-frontend-product-experience.md` (§12.1). Work happens on branch `feature/movie-details-05.4`. Plan decisions: rating as five stars filled to the TMDB score plus the number; genre pills link to the Home Search view (`/?genre={id}`).

05.4-D3 accepted state:

- Audit of the finished page for John Wick: Chapter 4, Inception and Clayface at 1440 / 768 / 390 (full-page captures): no horizontal overflow, no image without alt text, heading order H1 → H2 (About, Genres, Cast, Director, More like), all touch targets ≥ 44px except the tablet rail arrows at 40px (the accepted Home rail size, left consistent).
- Fixed hero metadata: at 768px a separator dot started the rating line, and with a missing release year the row would have started with a dot. The facts (year, runtime, countries) are now one row whose separators sit in the gap before each fact and are clipped when a fact starts a line, so no line ever starts with a dot; the rating always has its own line below, as in `movie-details/Section_1`. Verified for full data, no year, and no year + no runtime at 1440 / 1024 / 768 / 390 / 320 (20 cases, none dangling; at 320 the countries wrap cleanly).
- Keyboard: logical tab order (skip link, header, Watchlist, scene rail and tiles, genres, cast rail, More like cards with their Watchlist controls) with visible focus on every stop. Reduced motion: hero image and copy animations off; scene hover zoom is motion-safe only.
- Regression on the production build: D1 (Watchlist toggle, genre link, not-found, retry), D2 (similar-card toggle, initials, Home rail), full-size scene viewer (arrow keys, close). `npm run lint`, `npm run build`, `git diff --check`. Screenshots in `docs/screenshots/05.4-D3-*`.

05.4-D2b accepted state (Tech Lead request 2026-10-22 after reviewing D2 as "a little empty"):

- Research: TMDB's existing details response already carries directors, production countries, text-free scene images and recommendations. Offered also: trailer, tagline, age rating, collection; not selected. Out of scope: reviews/comments, likes, watch providers, IMDb, studios (PROJECT.md non-goals / Stage 05 scope).
- Backend (D027): `MovieDetailsDto` adds `directors`, `productionCountryCodes`, `sceneImageUrls` (max 10, hero backdrop excluded); `similarMovies` now comes from TMDB recommendations. Still one TMDB request (`append_to_response=credits,recommendations,images&include_image_language=null`). Tests updated and added (76 passing).
- Frontend: scene gallery directly under the hero after `movie-details/Section_1` (16:9 rounded scenes, exactly five across at 1440, glass arrows, peeking on smaller screens); Director section with portraits after Cast (`movie-details/Section_2`); production countries by name in the hero metadata; the Cast portrait is a shared `PersonPortrait`.
- Mobile hero metadata: the rating moves to its own line on phones so no separator dot dangles at a line start.
- Full-size scene viewer (Tech Lead request 2026-10-22): each scene tile is a button that opens a full-screen dialog (Base UI Dialog, already a dependency) showing the original-quality TMDB file, not the resized thumbnail; previous / next buttons and arrow keys (wrapping), "Scene N of 10" title, Escape / close button / backdrop click to close, focus kept inside while open and returned to the tile afterwards. The backend now returns scene URLs at TMDB original size; thumbnails still go through the Next.js image resizer. Verified at 1440 / 390: original 3600×2025 file loaded, keyboard open / navigate / close, reduced motion.
- Fixed the desktop colour line between Cast and Director reported by the Tech Lead (with screenshots): the global body glow (radial gradient at the top of the page) repeated once per viewport height because `html` is one viewport tall and backgrounds repeat by default, painting a faint glow with a hard top edge at every multiple of the window height (between Cast and Director at a 950px-tall window). `body` now uses `background-repeat: no-repeat`; measured on the production build at 1920×1080 and 1920×950, the background is flat across the former boundaries (RGB sum 40 → 40, previously 40 → 48.6). Home's top glow is unchanged.
- Verified on the production build against the real backend at 1440 / 768 / 390: "2023 · 2h 50m · Germany, United States · 7.7", 10 scenes with 5 fully visible at 1440 and arrows paging, Director Chad Stahelski, "More like" led by John Wick: Chapter 2 and 3, missing scenes / directors / countries hide cleanly, no horizontal overflow; D1 and D2 QA re-run. `dotnet test` (76), `npm run lint`, `npm run build`, `git diff --check`. Screenshots in `docs/screenshots/05.4-D2b-*`.
- Data note: TMDB sometimes stores near-identical uploads of the same artwork; exact duplicates and the hero backdrop are removed, visually identical files under different paths cannot be detected.
- Local setup: the 05.4 worktree database was migrated with `dotnet ef database update`; the backend now runs from the 05.4 worktree.

05.4-D2 accepted state:

- Cast after `movie-details/Section_2`: circular portraits with the actor name and character underneath, in a horizontal rail with glass previous/next controls from tablet width up (centred on the portraits) and a peeking next portrait on smaller screens; initials when a photo is missing.
- More like {title} after `movie-details/Section_3` / `movie-covers/Covers_Type_1`: the shared MovieCard rail with Watchlist saved state; a card opens that movie's details page at the top.
- Section order follows the reference: About, Genres, Cast, More like this. Cast and More like this are hidden when the backend returns none.
- Shared code: MovieRow's rail scrolling moved unchanged into `useRailScroll`, used by MovieRow and the Cast rail.
- Verified on the production build against the real backend at 1440 / 768 / 390: 12 cast members with photos ("Keanu Reeves · John Wick"), cast arrows page and enable/disable correctly, 12 similar cards, Watchlist toggle on a similar card and back, similar card navigation, initials fallback, empty cast / similar hide their sections, Home Trending rail still pages, no horizontal overflow. `npm run lint`, `npm run build`, `git diff --check`. Screenshots in `docs/screenshots/05.4-D2-*`.

05.4-D1 accepted state:

- `/movies/[id]` renders real backend data. Positive whole-number IDs only; anything else shows the not-found page without a request. The browser tab title becomes `{title} · MovieNight`.
- Cinematic hero after `movie-details/Section_1`: full-bleed backdrop with the Home readability gradients (a softened, blurred poster when there is no backdrop), poster beside the title as in `movie-covers/Movie_single_Cover_slider`, year · runtime (e.g. 2h 50m) · rating (stars + number), each hidden when missing.
- Watchlist CTA after `icons/book_Mark`: blue-outlined pill, outline bookmark "Add to Watchlist" → filled bookmark "In Watchlist" (new `details` appearance of the shared WatchlistButton; existing appearances unchanged).
- About section with the overview (fallback text when missing) and pink Genre pills linking to `/?genre={id}`.
- States: loading skeleton mirroring the hero and About; "We couldn’t find that movie." with Back to Discover for 404 / invalid IDs; "We couldn’t load this movie right now." with Try again for other failures.
- Shared code: Home's Watchlist logic moved unchanged into `useWatchlist` (used by Home and Movie Details); the API layer throws `MovieNotFoundError` on 404; Home's full-page notice is exported as `PageNotice`.
- Verified on the production build against the real backend at 1440 / 768 / 390: John Wick: Chapter 4 renders title, 2023 · 2h 50m · 7.7, overview and Action / Thriller / Crime links; Watchlist toggles to the filled "In Watchlist" state and back; a genre pill opens Search with "20,001 movies match Action"; a Home card opens its details page; unknown ID → not-found, `abc` → not-found with no request; error via request interception and retry; loading skeleton; missing backdrop / runtime / genres / overview handled; 48px Watchlist target; no horizontal overflow; Home Search and saved-state regression re-run. `npm run lint`, `npm run build`, `git diff --check`. Screenshots in `docs/screenshots/05.4-D1-*`.

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
- Sprint 05.4 — Movie Details Experience
- 05.5-P1 — Route + filters + pick flow
- 05.5-P2 — Spotlight + states
- 05.5-P3 — Responsive polish + visual QA
- Sprint 05.5 — Pick for Me Experience
- 05.6-W1 — Page + states
- 05.6-W2 — Visual polish
- 05.6-W3 — QA
- Sprint 05.6 — Anonymous Watchlist Experience
- Product scope and non-goals locked
- Backend/frontend stack selected
- Local development conventions locked
- MovieNight project-local UI skill / reference workflow established

---

## In Progress

- Sprint 05.7-X6 — See more + category pages.

---

## Not Started

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

Sprint 05.4 note: Movie Details references are committed under `.agents/skills/movienight-ui/assets/movie-details/`, `movie-covers/` and `icons/`.

Home footer note: the minimal footer with TMDB attribution is now planned as Sprint 05.7-X1 (site-wide).

Repository transition caution:

- accepted 05.1 foundation and partial/superseded 05.2 work currently coexist in the working tree;
- redesign tasks must preserve accepted 05.1 engineering foundations;
- valid 05.2 API/data-flow/Watchlist integration logic must not be discarded blindly.

---

## Next Planned Work

1. Execute Sprint 05.7-X1, then X2–X7 one at a time after each is accepted (plan in stage doc §15.1).
2. Do not start Sprint 05.8 before Sprint 05.7 is accepted.
3. Complete mandatory Cache Completion & Hardening during Stage 06, not Stage 05.
