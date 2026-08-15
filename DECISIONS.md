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

**Reason:** Avoid wasting Cursor context on unrelated files and historical conversations.


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
