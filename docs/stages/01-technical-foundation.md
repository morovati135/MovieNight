# MovieNight — Stage 01: Technical Foundation

## Stage Status

**Completed and accepted before implementation began.**

This stage converts the accepted product scope into a small, explicit technical baseline that later Codex implementation work must preserve.

---

## 1. Stage Intent

Choose the application stack, repository shape, primary boundaries, local-development conventions, testing direction, and intentionally excluded architectural patterns.

This stage does not implement business features.

Its durable outputs are `ARCHITECTURE.md` and `DECISIONS.md`.

---

## 2. Canonical Context

Use:

- `AGENTS.md` — project-wide Codex execution rules
- `PROJECT.md` — product contract
- `ARCHITECTURE.md` — architecture contract
- `DECISIONS.md` — locked technical/product decisions
- this stage file

Backend-specific implementation work must additionally obey `backend/AGENTS.md`.

Frontend-specific implementation work will use a nested `frontend/AGENTS.md` after the frontend is scaffolded.

---

## 3. Entry Criteria

- Stage 00 product scope is accepted.
- Movie discovery and anonymous watchlist are confirmed.
- Backend/Agent Engineering is the primary learning goal.
- Version 1 runs only on localhost.

---

## 4. Stage Outcome

After this stage, Codex can determine:

- which stack to use,
- where frontend/backend responsibilities live,
- how backend source should be organized,
- what is persisted locally,
- how external TMDB integration is isolated,
- how errors are represented,
- which architectural patterns are prohibited,
- which local ports and boundaries the bootstrap must establish.

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
- xUnit

### Frontend

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- npm
- Node.js LTS
- `src/` directory
- `@/*` import alias

### Local runtime convention

- Frontend: `http://localhost:3000`
- Backend HTTP: `http://localhost:5080`

---

## 6. Repository Shape

Target shape:

```text
MovieNight/
├── AGENTS.md
├── PROJECT.md
├── ARCHITECTURE.md
├── DECISIONS.md
├── STATUS.md
├── .editorconfig
├── .gitignore
├── docs/
│   ├── STAGE-TEMPLATE.md
│   ├── CODEX-WORKFLOW.md
│   ├── CODEX-HANDOFF.md       # temporary during migration
│   ├── FIRST-CODEX-PROMPT.md  # temporary during migration
│   └── stages/
├── backend/
│   ├── AGENTS.md
│   ├── MovieNight.slnx
│   ├── MovieNight.Api/
│   └── MovieNight.Api.Tests/
└── frontend/                  # created in Sprint 02.3
```

A nested `frontend/AGENTS.md` will be added after `create-next-app` creates the frontend directory.

---

## 7. Boundary Decisions

### Frontend -> Backend

The frontend communicates with the MovieNight API.

It does not know TMDB credentials and does not depend on raw TMDB response contracts.

### Backend -> TMDB

TMDB-specific transport types remain inside the TMDB integration boundary.

Public API contracts are MovieNight-owned DTOs.

### Backend -> SQLite

EF Core `DbContext` is the persistence abstraction.

Do not add a generic repository or custom Unit of Work wrapper.

---

## 8. API Conventions

- Public application routes use `/api/...`.
- Bootstrap health route is `GET /api/health`.
- Expected public API failures use ASP.NET Core Problem Details.
- Do not expose secrets, stack traces, or raw TMDB failures.
- Cancellation should flow through meaningful async HTTP/database operations.

Exact Movie and Watchlist contracts are defined in their implementation stages.

---

## 9. Local Development Conventions

### Frontend API configuration

Use:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
```

Commit only safe example configuration.

Local `.env.local` is not committed.

### CORS

Backend local development permits:

```text
http://localhost:3000
```

Do not use unrestricted `AllowAnyOrigin`.

### Secrets

TMDB credentials stay outside committed source configuration.

---

## 10. Dependency Policy

A package may be added only when:

1. it directly supports the active sprint,
2. the platform does not already provide a reasonable solution,
3. it does not violate `DECISIONS.md`,
4. Codex reports why it is needed.

Do not install libraries for hypothetical later use.

Security warnings must be investigated rather than hidden.

---

## 11. Explicitly Rejected Architecture

Do not introduce:

- multi-project Clean Architecture layering
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

unless a future explicit Tech Lead decision changes the project.

---

# 12. Decision Breakdown

## Decision 01.1 — Stack Selection

Accepted:

- [x] .NET 10
- [x] controller-based ASP.NET Core API
- [x] Next.js + TypeScript
- [x] Tailwind + shadcn/ui
- [x] SQLite + EF Core
- [x] npm + Node LTS
- [x] xUnit

## Decision 01.2 — Architecture Boundary Lock

Accepted:

- [x] Frontend-to-backend boundary
- [x] Backend-to-TMDB boundary
- [x] Persistence boundary
- [x] Feature-oriented backend structure
- [x] Prohibited patterns

## Decision 01.3 — Local Development Contract

Accepted:

- [x] Frontend port 3000
- [x] Backend HTTP port 5080
- [x] Local CORS origin
- [x] API base URL convention
- [x] Secret-handling direction

---

# 13. Stage Definition of Done

- [x] `ARCHITECTURE.md` describes the intended system structure.
- [x] `DECISIONS.md` records decisions later Codex threads must not silently reverse.
- [x] Stage 02 can bootstrap the repository without reopening product or architecture selection.
- [x] No business feature implementation belongs to this stage.

---

# 14. Stability Principle

Generated project/package files and lock files pin actual dependency versions after bootstrap.

Do not repeatedly upgrade dependencies during feature work unless:

- compatibility requires it,
- security requires it,
- or the Tech Lead explicitly requests it.

The objective is a stable implementation baseline, not continuous dependency churn.
