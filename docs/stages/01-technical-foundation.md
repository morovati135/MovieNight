# MovieNight — Stage 01: Technical Foundation

## Stage Status

**Completed before implementation begins.**

This stage converts the product scope into a small set of technical constraints that implementation agents must preserve.

---

## 1. Stage Intent

Choose the application stack, repository shape, primary boundaries, local development conventions, and intentionally excluded architectural patterns.

This stage contains no business-feature implementation.

Its main outputs are `ARCHITECTURE.md` and `DECISIONS.md`.

---

## 2. Canonical Context

- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- this stage file

---

## 3. Entry Criteria

- Stage 00 product scope is stable.
- Movie discovery and anonymous watchlist are confirmed.
- Backend/Agent Engineering is the primary learning goal.
- Version 1 runs only on localhost.

---

## 4. Stage Outcome

After this stage, an implementation agent can answer:

- what stack to use,
- where frontend/backend responsibilities live,
- how the backend is structured,
- what is persisted locally,
- how errors are represented,
- which architectural patterns are prohibited,
- how the repository will be bootstrapped.

---

## 5. Technical Baseline

### Backend

- .NET 10
- ASP.NET Core Web API
- controller-based API
- one application project: `MovieNight.Api`
- feature-oriented source organization
- Entity Framework Core
- SQLite
- `IHttpClientFactory`
- `IMemoryCache`
- ASP.NET Core Problem Details
- xUnit for backend tests

### Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- npm
- Node.js LTS line
- `src/` directory
- `@/*` import alias

### Current local runtime convention

- Frontend: `http://localhost:3000`
- Backend HTTP: `http://localhost:5080`

The fixed backend HTTP port is a local-development convention so frontend configuration and smoke tests remain predictable.

---

## 6. Repository Shape

```text
MovieNight/
├── PROJECT.md
├── ARCHITECTURE.md
├── DECISIONS.md
├── STATUS.md
├── .cursorignore
├── .cursor/
│   └── rules/
├── docs/
│   ├── STAGE-TEMPLATE.md
│   ├── CURSOR-WORKFLOW.md
│   └── stages/
├── backend/
│   ├── MovieNight.slnx
│   ├── MovieNight.Api/
│   └── MovieNight.Api.Tests/
└── frontend/
```

The backend test project is not an additional application architecture layer. It exists only for verification.

---

## 7. Boundary Decisions

### Frontend -> Backend

The frontend communicates with the MovieNight API.

It does not know TMDB credentials and does not depend on TMDB response contracts.

### Backend -> TMDB

TMDB-specific transport types remain under the integration boundary.

Public API contracts are MovieNight-owned DTOs.

### Backend -> SQLite

EF Core `DbContext` is the persistence abstraction.

Do not add a generic repository or a custom Unit of Work wrapper.

---

## 8. API Conventions

- Public application routes use `/api/...`.
- Bootstrap health route: `GET /api/health`.
- JSON uses the normal ASP.NET Core/System.Text.Json conventions unless a real requirement appears.
- Expected API failures use Problem Details.
- Never expose stack traces, secrets, or raw TMDB failure bodies.
- Cancellation should flow through meaningful HTTP/database async operations.

Exact movie/watchlist contracts are defined in their implementation stages rather than invented during bootstrap.

---

## 9. Local Development Conventions

### Frontend API configuration

Use:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
```

The committed repository contains only a safe example configuration such as `.env.example`.

A local `.env.local` may be created from that example but must not be committed.

### CORS

During local development the backend permits the frontend origin:

```text
http://localhost:3000
```

Do not use an unrestricted `AllowAnyOrigin` configuration.

### Secrets

TMDB credentials are not needed during Stage 02.

When TMDB is introduced later, secrets must stay outside committed source configuration.

---

## 10. Dependency Policy

A package/library can be added only when:

1. it directly supports current sprint requirements,
2. the platform does not already provide a reasonable solution,
3. it does not violate `DECISIONS.md`,
4. the agent reports the dependency and reason.

Do not install libraries "for later".

---

## 11. Explicitly Rejected Architecture

Do not introduce:

- Clean Architecture multi-project layering
- MediatR
- CQRS
- AutoMapper
- generic repository
- custom Unit of Work
- Redis
- message broker
- background jobs
- authentication frameworks
- microservices
- Docker

---

# 12. Sprint Breakdown

This is a planning/specification stage. The decisions below are already accepted and should not trigger coding work.

---

## Sprint 01.1 — Stack Selection

### Acceptance Criteria

- [x] .NET 10 is selected.
- [x] Controller-based ASP.NET Core Web API is selected.
- [x] Next.js + TypeScript is selected.
- [x] Tailwind + shadcn/ui are selected.
- [x] SQLite + EF Core are selected.
- [x] npm and Node LTS are selected.
- [x] xUnit is selected.

---

## Sprint 01.2 — Architecture Boundary Lock

### Acceptance Criteria

- [x] Frontend-to-backend boundary is documented.
- [x] Backend-to-TMDB boundary is documented.
- [x] Persistence boundary is documented.
- [x] Feature-oriented backend structure is documented.
- [x] Prohibited architecture patterns are documented.

---

## Sprint 01.3 — Local Development Contract

### Acceptance Criteria

- [x] Frontend localhost port is defined.
- [x] Backend localhost HTTP port is defined.
- [x] Local CORS origin is defined.
- [x] Frontend API base URL convention is defined.
- [x] Secret-handling direction is defined.

---

# 13. Stage Definition of Done

- [x] `ARCHITECTURE.md` describes the intended system structure.
- [x] `DECISIONS.md` records decisions future agents must not silently reverse.
- [x] Stage 02 can bootstrap the repository without making product or architecture decisions.
- [x] No business feature implementation is part of this stage.

---

# 14. Versioning Principle

The project pins its actual dependencies through generated project/package files and lock files after bootstrap.

Do not repeatedly upgrade framework/package versions during feature work unless:

- a compatibility issue requires it,
- a security issue requires it,
- or the Tech Lead explicitly requests it.

The goal is a stable codebase, not continuous dependency churn.
