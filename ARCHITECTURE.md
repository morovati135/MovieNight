# MovieNight — Architecture

## 1. Architecture Goal

Use a simple full-stack architecture with clear boundaries and minimal abstraction.

This project is intentionally not implemented using Clean Architecture, CQRS, MediatR, microservices, or a generic repository layer.

---

## 2. System Overview

```text
Browser
   |
   v
Next.js Frontend
   |
   v
ASP.NET Core Web API
   |                |
   v                v
TMDB API         SQLite
```

The frontend communicates only with the MovieNight backend.

The backend owns external integration, persistence, validation, caching, and business rules.

---

## 3. Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- `IHttpClientFactory`
- `IMemoryCache`
- ASP.NET Core Problem Details

### Testing

- xUnit
- ASP.NET Core integration testing infrastructure

### External Service

- TMDB API

---

## 4. Repository Structure

```text
/
├── PROJECT.md
├── ARCHITECTURE.md
├── DECISIONS.md
├── STATUS.md
├── docs/
│   └── stages/
├── backend/
└── frontend/
```

---

## 5. Backend Structure

Use one ASP.NET Core application project.

Recommended structure:

```text
backend/
└── MovieNight.Api/
    ├── Features/
    │   ├── Movies/
    │   └── Watchlists/
    ├── Integrations/
    │   └── Tmdb/
    ├── Data/
    ├── Common/
    ├── Program.cs
    └── appsettings.json
```

### Features

Feature folders contain code owned by a specific business capability.

Example:

```text
Features/
└── Movies/
    ├── MoviesController.cs
    ├── MovieService.cs
    ├── MovieDtos.cs
    └── MovieMappings.cs
```

Do not split a small feature into unnecessary layers.

### Integrations

TMDB-specific transport models and client code belong under:

```text
Integrations/Tmdb/
```

TMDB models must not be exposed directly from public API endpoints.

### Persistence

EF Core infrastructure belongs under:

```text
Data/
```

The initial persistence model contains only watchlist items keyed by the protected anonymous-browser identity. It does not persist TMDB movie snapshots or require a separate watchlist table.

### Common

Use `Common/` only for code that is genuinely shared.

Do not move code to `Common/` preemptively.

---

## 6. Frontend Structure

Recommended structure:

```text
frontend/
└── src/
    ├── app/
    ├── components/
    │   ├── movie/
    │   ├── watchlist/
    │   ├── layout/
    │   └── ui/
    ├── lib/
    │   ├── api/
    │   └── utils/
    └── types/
```

### Rules

- UI components must not call TMDB.
- Backend API access should be centralized under `lib/api`.
- Avoid scattered raw `fetch()` calls across unrelated components.
- Keep components feature-oriented when practical.
- Do not create frontend abstraction layers unless repeated complexity justifies them.

---

## 7. API Boundary

All movie data requested by the frontend must pass through the backend.

Example endpoints may include:

```text
GET  /api/movies/trending?page=
GET  /api/movies/popular?page=
GET  /api/movies/top-rated?page=
GET  /api/collections
GET  /api/collections/{slug}/movies?page=
GET  /api/movies/search
GET  /api/movies/discover
GET  /api/movies/{id}
GET  /api/movies/{id}/similar
POST /api/movies/pick

```

Exact route design may be refined during the relevant stage, but endpoint behavior must remain resource-oriented and simple.

---

## 8. Error Handling

Use ASP.NET Core Problem Details for public API errors.

Expected application errors include:

- invalid input,
- resource not found,
- invalid anonymous-browser identity,
- duplicate watchlist movie,
- unavailable TMDB dependency.

Raw TMDB responses, stack traces, internal exception messages, or secrets must never be returned to the frontend.

---

## 9. Validation

Use straightforward validation close to the affected feature.

Do not add a validation framework unless the project gains enough validation complexity to justify it.

Important validations include:

- search query,
- year,
- rating range,
- anonymous-browser identity,
- duplicate movie,
- TMDB movie existence.

---

## 10. TMDB Integration

Use a typed or named HttpClient configured through `IHttpClientFactory`.

TMDB API configuration must come from configuration/environment variables.

Do not hard-code secrets.

Responsibilities of the TMDB integration:

- build external requests,
- deserialize TMDB transport models,
- surface controlled integration failures,
- stay isolated from public API DTOs.

---

## 11. Caching

Use `IMemoryCache` only where it provides clear value for repeatedly requested TMDB data.

Suitable candidates:

- trending movies,
- genres,
- popular/top-rated lists,
- individual movie details.

Caching is an optimization, not a second source of truth.

Avoid complex cache invalidation logic.

---

## 12. Persistence

Use SQLite through EF Core.

Persist only application-owned state:

- watchlists,
- watchlist items,
- anonymous-browser association.

TMDB movie catalog data is not replicated locally.

---

## 13. Anonymous Ownership

Each browser is associated with one private watchlist through a protected anonymous-browser identity. The identity is not a public share identifier or a separate owner token, and no shared-watchlist read behavior exists.

---

## 14. Dependency Rules

Allowed:

```text
Controller -> Feature Service
Feature Service -> TMDB Integration
Feature Service -> DbContext
TMDB Integration -> HttpClient
Persistence -> EF Core
```

Avoid introducing interfaces only to mirror every concrete class.

Use an interface when it creates a real boundary, improves testability, or represents external infrastructure.

---

## 15. Testing Strategy

Prioritize tests for logic with meaningful failure modes.

Backend tests should cover:

- watchlist business rules,
- anonymous-browser identity handling,
- duplicate prevention,
- movie validation,
- recommendation rules,
- API success/error behavior.

Do not chase artificial test coverage percentages.

---

## 16. Architectural Constraints

The coding agent must not introduce these without explicit approval:

- additional application layers,
- additional backend projects,
- MediatR,
- CQRS,
- repository pattern,
- Unit of Work wrapper,
- AutoMapper,
- Redis,
- background jobs,
- message brokers,
- authentication systems,
- Docker infrastructure.

---

## 17. Decision Principle

Optimize for clarity, explicit behavior, low operational complexity, and low agent context cost.

A smaller codebase with fewer indirections is preferred over a theoretically more extensible architecture.


---

## 18. Local Development Baseline

For the initial localhost workflow:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5080
```

The backend uses controller-based ASP.NET Core Web API endpoints.

Local CORS should allow the frontend origin above rather than using an unrestricted origin policy.

The first integration gate is:

```text
GET /api/health
```

The frontend should prove it can reach this endpoint before TMDB or persistence features are introduced.
