# MovieNight — Architecture & Product Decisions

This file records decisions that future agent sessions must preserve unless explicitly changed.

---

## D001 — Backend Framework

**Decision:** Use .NET 10 with ASP.NET Core Web API.

**Reason:** The project is backend-focused and should use a modern supported .NET stack.

---

## D002 — Frontend Framework

**Decision:** Use Next.js with TypeScript.

**Reason:** It provides a mature React-based foundation suitable for a polished portfolio frontend.

---

## D003 — Styling

**Decision:** Use Tailwind CSS and shadcn/ui.

**Reason:** They allow rapid implementation of a consistent, modern UI without introducing a large custom design-system codebase.

---

## D004 — Persistence

**Decision:** Use SQLite with Entity Framework Core.

**Reason:** The application is local-only and does not need infrastructure complexity associated with a separate database server.

---

## D005 — Movie Source of Truth

**Decision:** TMDB remains the source of truth for movie catalog data.

**Reason:** MovieNight should not maintain or synchronize a duplicate movie catalog.

---

## D006 — Backend Boundary

**Decision:** The frontend must not call TMDB directly.

**Reason:** API credentials, mapping, caching, error handling, and movie-related backend logic must remain behind the application API.

---

## D007 — Watchlist Model

**Decision:** Each browser has one private anonymous watchlist, associated through a protected anonymous-browser identity.

**Reason:** The application supports an account-free personal watchlist without public sharing or a separate owner credential.

---

## D008 — Anonymous-Browser Identity Protection

**Decision:** Do not use owner tokens; protect the anonymous-browser identity at the browser boundary.

**Reason:** The identity is an implementation boundary for a browser-private watchlist, not a reusable public write credential.

---

## D009 — Watchlist Movie Storage

**Decision:** Store TMDB movie identifiers and application-owned watchlist metadata, not movie-detail snapshots.

**Reason:** TMDB remains the source of truth for movie details and the local database stays limited to application-owned state.

---

## D010 — Backend Structure

**Decision:** Use one ASP.NET Core project organized primarily by feature.

**Reason:** The project is too small to justify multiple architectural projects or layers.

---

## D011 — No Clean Architecture

**Decision:** Do not implement a traditional multi-project Clean Architecture.

**Reason:** It would add abstractions and context cost without solving a current project problem.

---

## D012 — No MediatR or CQRS

**Decision:** Do not use MediatR or CQRS.

**Reason:** Current request/response and business complexity do not justify an additional dispatch abstraction.

---

## D013 — No Generic Repository

**Decision:** Feature services may use EF Core DbContext directly.

**Reason:** EF Core already provides the required persistence abstraction for this project.

---

## D014 — Caching

**Decision:** Use `IMemoryCache` for selected read-heavy TMDB data.

**Reason:** It provides useful local caching without introducing external infrastructure.

---

## D015 — API Error Contract

**Decision:** Use ASP.NET Core Problem Details for API errors.

**Reason:** The application needs one consistent error representation without a custom error framework.

---

## D016 — Authentication

**Decision:** Do not implement registration, login, Identity, or JWT.

**Reason:** Anonymous ownership is sufficient for the current watchlist feature.

---

## D017 — Movie Only

**Decision:** Version 1 supports movies only.

**Reason:** Supporting both movies and TV series would duplicate mapping, routing, filtering, and UI concerns without adding enough value to the primary learning goal.

---

## D018 — Local Execution Only

**Decision:** Version 1 must run fully on localhost. Deployment and Docker are out of scope.

**Reason:** The primary goal is Agent Engineering and full-stack implementation, not infrastructure work.

---

## D019 — Agent Development Model

**Decision:** Implementation is performed by the coding agent. The human acts primarily as Tech Lead and reviewer.

**Reason:** The project is explicitly intended as an Agent Engineering exercise.

---

## D020 — Context Efficiency

**Decision:** Each implementation sprint should receive only the stable documents, current stage document, status file, and relevant code.

**Reason:** Avoid wasting coding-agent context on unrelated files and historical conversations.


---

## D021 — Controller-Based Backend API

**Decision:** Use controller-based ASP.NET Core Web API endpoints.

**Reason:** The project benefits from explicit feature controllers and predictable API organization while staying simple.

---

## D022 — Frontend Package Manager

**Decision:** Use npm for the frontend.

**Reason:** Keep the project setup conventional and avoid introducing multiple JavaScript package-manager workflows.

---

## D023 — Local Development Ports

**Decision:** Use `http://localhost:3000` for the frontend and `http://localhost:5080` for the backend development HTTP endpoint.

**Reason:** Stable local addresses make CORS, frontend configuration, documentation, and smoke tests predictable.

---

## D024 — Bootstrap Integration Gate

**Decision:** Project bootstrap is not complete until the frontend successfully calls the backend health endpoint.

**Reason:** Validate the full-stack boundary before introducing domain features such as TMDB and Watchlists.


---

## D025 — Same-Origin Forwarding for Watchlist Requests

**Decision:** Frontend Watchlist requests use the same-origin paths `/backend/watchlist` and `/backend/watchlist/{movieId}`, which `frontend/next.config.ts` rewrites to the backend `/api/watchlist` endpoints. Movie requests keep using the normal API client (`apiFetch`), which calls the backend directly through `NEXT_PUBLIC_API_BASE_URL`.

**Reason:** The anonymous Watchlist identity is a backend-issued, protected HttpOnly cookie (D007, D008). Keeping Watchlist requests same-origin lets the browser send and receive that cookie on first-party requests made with `credentials: "include"`. The backend CORS policy allows the frontend origin but does not allow credentialed cross-origin requests, so direct browser-to-backend Watchlist calls do not fit the current credential/CORS model. Movie endpoints are public and cookie-free, so they do not need forwarding.

**Rules:**

- This split between the Watchlist and Movie request paths is intentional, not accidental duplication of the API client.
- The forwarding rules exist only when `NEXT_PUBLIC_API_BASE_URL` is set when the Next.js configuration loads (dev server start or build). If it is missing, no rewrites are registered and Watchlist requests fail with 404.
- Do not replace this with `localStorage`/`sessionStorage` Watchlist storage or with direct cross-origin Watchlist calls without an explicit architecture change recorded in this file.
## D026 — Optional Release Year on Movie Search

**Decision:** `GET /api/movies/search` accepts an optional `year` (1888–2100, the same range as Discover), which the backend forwards to TMDB title search as `primary_release_year`. Genre and minimum rating remain Discover-only filters.

**Reason:** In the Home Search view (Sprint 05.3) a title can be combined with Genre / Year / Minimum Rating filters. TMDB title search supports a release-year filter but not genre or rating filters. Without a backend year, a year filter could only narrow the first loaded page of title matches, so common titles routinely showed no results for a year that does have matches. Forwarding the year makes title + year exact, with correct totals and paging.

**Rules:**

- The frontend sends `year` with a title query; genre and minimum rating with a title still narrow the loaded title matches in the browser.
- Do not emulate genre or rating filtering for title Search on the backend by scanning multiple TMDB pages without a separate decision (request cost and caching belong to Stage 06).

## D027 — Movie Details Enrichment from the Existing TMDB Request

**Decision:** `GET /api/movies/{id}` additionally returns `directors` (from TMDB credits crew, job "Director"), `productionCountryCodes` (ISO 3166-1) and `sceneImageUrls` (up to 10 text-free TMDB backdrops, excluding the hero backdrop). `similarMovies` keeps its name but is now sourced from TMDB recommendations instead of TMDB "similar". All of it comes from the single existing TMDB details request (`append_to_response=credits,recommendations,images&include_image_language=null`).

**Reason:** The Tech Lead asked for a richer Movie Details page (Sprint 05.4). The supplied reference shows a director, a country and a row of scene images, all of which TMDB already provides for the request MovieNight makes. TMDB has no separate "screenshot" type for movies; text-free backdrops are its scene images. TMDB "similar" results are keyword-based and often unrelated (for John Wick: Chapter 4 they included Barton Fink); recommendations are markedly more relevant (John Wick: Chapter 2 and 3 first).

**Rules:**

- Keep this to one TMDB request per movie; cap list sizes in the mapper.
- Still out of scope (PROJECT.md non-goals / Stage 05 scope): reviews and comments, likes and user ratings, watch providers, IMDb data, production studios. Trailers, tagline, age rating and collections were offered and not selected; adding them needs a new decision.

## D028 — Vote-Count Floor for Minimum Rating Filters

**Decision:** When a minimum rating is set, the backend Discover request to TMDB (used by `GET /api/movies/discover` and `GET /api/movies/pick`) also sends a minimum vote count (`vote_count.gte`). Without a minimum rating, no floor is sent. The floor is 100 votes (`MinimumRatingVoteCount` in `TmdbClient`).

**Reason:** TMDB `vote_average.gte` alone lets movies with only a handful of votes satisfy high ratings, so "Min. rating 9" returned obscure titles instead of well-rated films. The Tech Lead approved the floor on 2026-10-22 during Sprint 05.5 planning.

**Rules:**

- The floor applies only together with a minimum rating; unfiltered and genre/year-only results are unchanged.
- It affects Search & Discover (Sprint 05.3) as well as Pick for Me; this is intended.
- Changing the floor value or exposing it as a parameter needs a new decision.

## D029 — Optional Backdrop on Movie Summaries

**Decision:** `MovieSummaryDto` (every movie list: trending, popular, search, discover, pick, recommendations, Watchlist) gains an optional `backdropUrl`, built from the TMDB list result's `backdrop_path` that MovieNight already receives. It is null when TMDB has none and on Watchlist snapshots created before this change.

**Reason:** The Tech Lead asked (2026-10-22, Sprint 05.5) for landscape suggestion cards (`movie-covers/Cards`, `Covers_Type_2`) and a backdrop behind the Pick spotlight. Landscape cards need wide artwork, which summaries did not carry (05.4 had dropped these cards for that reason). TMDB list results already include it, so no extra request is made.

**Rules:**

- Additive and optional: existing clients and stored data stay valid.
- Landscape cards fall back to the poster when `backdropUrl` is null.
- Summary backdrops use the TMDB `w780` rendition (cards and blurred backgrounds); the Movie Details hero keeps its `original` backdrop. `original` files are several MB and timed out in the Next image optimiser on slow connections.
