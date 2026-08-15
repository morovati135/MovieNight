# MovieNight — Stage 04: Anonymous Watchlist Backend & Persistence

## Stage Status

**Planned — Next Stage after Stage 03 acceptance and commit**

Stage 03 — Movie Backend & TMDB Integration must be complete, accepted, and committed before implementation begins.

> Important canonical-alignment note:
>
> Earlier product/roadmap documents described a different anonymous-watchlist model using a public `ShareId`, private owner token, a maximum of 30 items, and persisted movie snapshots.
>
> The Tech Lead has explicitly replaced that direction for Stage 04 with the locked decisions in this document:
>
> - one implicit watchlist per anonymous browser identity
> - protected persistent anonymous cookie
> - no user accounts
> - no public `ShareId`/owner-token model in V1
> - maximum 50 items
> - movie IDs only in persistence
> - backend hydration through the existing movie/TMDB boundary
>
> Before or during the first Stage 04 implementation sprint, canonical project documents that still contradict these decisions must be aligned. The implementation must not silently preserve the superseded model.

---

# 1. Stage Intent

Add the first application-owned persistence boundary to MovieNight and implement the complete anonymous-watchlist backend.

The watchlist must persist across browser sessions without requiring registration, login, ASP.NET Identity, JWT, or user profiles. Anonymous ownership is represented by a server-generated opaque browser identity stored in a protected persistent cookie, while watchlist state is stored in SQLite through EF Core.

The stage must also provide a clean API-documentation experience through ASP.NET Core OpenAPI and Scalar so the completed Movie and Watchlist APIs are easier to inspect and exercise during later frontend and integration work.

After this stage, Stage 05 can build the real frontend product experience over stable MovieNight-owned Movie and Watchlist contracts.

---

# 2. Canonical Context

Use only the context required by the active sprint.

Primary sources of truth:

- `AGENTS.md`
- `backend/AGENTS.md`
- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this stage file

Stage 03 implementation may be inspected when a current Stage 04 task depends on:

- `MovieCatalogService`
- `MovieSummaryDto`
- TMDB error translation
- existing `IMemoryCache` behavior
- existing ASP.NET Core Problem Details conventions

Do not read all completed stage files by default.

If a canonical document still contains the superseded ShareId/owner-token/movie-snapshot design, this stage file represents the newly approved Tech Lead decision, but the conflicting canonical document must be corrected rather than ignored indefinitely.

---

# 3. Entry Criteria

Before Sprint 04.1 implementation begins:

- Stage 03 is accepted and committed.
- `dotnet build` succeeds.
- `dotnet test` succeeds.
- `GET /api/health` works.
- Stage 03 Movie APIs are stable.
- `MovieSummaryDto` and the Movie/TMDB boundary exist.
- the TMDB Read Access Token remains outside source control.
- the Git working tree is clean.
- SQLite + EF Core remain the accepted persistence direction.
- no authentication framework has been introduced.
- Stage 04 canonical-document conflicts are identified and scheduled for correction.

---

# 4. Stage Outcome

After Stage 04:

- an anonymous browser receives a protected persistent MovieNight visitor identity when first interacting with the watchlist;
- that browser can add, list, and remove watchlist movies without login;
- the watchlist persists in SQLite across application restarts;
- one anonymous identity owns one implicit watchlist;
- duplicate movies cannot exist for the same anonymous identity;
- watchlists are limited to 50 items;
- movie existence is validated through the MovieNight movie boundary before persistence;
- persisted watchlist rows contain application-owned relationship state only, not copied TMDB movie snapshots;
- `GET /api/watchlist` returns hydrated MovieNight `MovieSummaryDto` data;
- hydration reuses the existing Movie/TMDB and cache boundary rather than exposing TMDB behavior to the watchlist feature;
- hydration uses bounded concurrency;
- Stage 03 cache behavior remains explicit and Stage 06 cache hardening remains mandatory;
- OpenAPI + Scalar provide a usable development API reference;
- backend tests cover persistence, anonymous isolation, idempotency, limits, hydration, and important failure paths;
- Stage 05 can consume stable Watchlist APIs without knowing how anonymous identity, SQLite, or TMDB hydration are implemented.

---

# 5. Locked Stage 04 Decisions

These decisions were explicitly approved by the Tech Lead and must not be silently redesigned by the coding agent.

## 5.1 Anonymous Ownership Model

Version 1 does not use:

- registration
- login
- ASP.NET Identity
- JWT
- user profiles
- public `ShareId`
- private owner tokens

Each browser has one opaque anonymous MovieNight identity.

The browser identity is represented internally as a `Guid`.

One anonymous identity owns one implicit watchlist.

There is no separate `Watchlist` aggregate/table merely to represent a single named list.

---

## 5.2 Anonymous Cookie

Anonymous identity is stored in a persistent browser cookie.

Recommended semantic contract:

```text
Cookie name:
movienight.anonymous-id

Identity:
Guid

Lifetime:
approximately 1 year

HttpOnly:
true

SameSite:
Lax

Secure:
true in production
false when required for local HTTP development
```

The cookie must contain a **protected opaque value**, not a raw authorization credential.

Use ASP.NET Core Data Protection to protect/unprotect the anonymous identifier.

The cookie should be created only on the first Watchlist interaction, not on unrelated Movie API requests.

Examples that may create the cookie:

```http
GET /api/watchlist
POST /api/watchlist/{movieId}
DELETE /api/watchlist/{movieId}
```

Examples that must not create it:

```http
GET /api/movies/trending
GET /api/movies/popular
GET /api/movies/{id}
```

The implementation must remain compatible with the current localhost HTTP development contract.

---

## 5.3 Persistence Technology

Use:

- EF Core 10
- SQLite
- Code First Migrations

Do not introduce:

- generic repository
- custom Unit of Work
- CQRS
- MediatR
- Clean Architecture multi-project layering

The watchlist feature may use `MovieNightDbContext` directly through a focused application/service boundary.

---

## 5.4 Database Lifecycle

Use explicit EF Core migrations.

Commit migration source files.

Do not commit the SQLite database instance.

Do not use:

```text
EnsureCreated()
```

Do not automatically execute:

```text
Database.Migrate()
```

during normal application startup.

Development lifecycle:

```text
dotnet ef migrations add <MigrationName>
dotnet ef database update
dotnet run
```

A future server deployment would use a persistent SQLite path and an explicit migration step before application startup.

Production deployment automation itself remains out of scope.

---

## 5.5 SQLite Location and Configuration

Use a local application-owned data directory such as:

```text
backend/MovieNight.Api/App_Data/
```

with a configuration-based connection string, for example:

```text
Data Source=App_Data/movienight.db
```

The exact safe path may be refined during implementation if required by the current project layout.

The following local database artifacts must not be committed:

```text
*.db
*.db-shm
*.db-wal
```

---

## 5.6 Watchlist Persistence Model

The conceptual persistence model is:

```text
WatchlistItem
- Id
- AnonymousId
- MovieId
- CreatedAtUtc
```

Recommended types:

```text
Id            → long
AnonymousId   → Guid
MovieId       → int
CreatedAtUtc  → DateTime / UTC
```

Use:

- a normal internal primary key `Id`
- a unique database constraint/index over `(AnonymousId, MovieId)`

Do not persist:

- movie title
- poster URL
- overview
- rating
- release date
- TMDB movie snapshot
- cast
- similar movies

TMDB remains the movie source of truth.

MovieNight persistence stores only application-owned watchlist relationship state.

---

## 5.7 Watchlist Capacity

Maximum watchlist size:

```text
50 movies per anonymous identity
```

When adding a new movie:

1. check whether it already exists;
2. if it already exists, return idempotent success;
3. only for a genuinely new item, enforce capacity;
4. if 50 items already exist, return `409 Conflict`.

A duplicate add must not fail merely because the list is already at capacity.

---

## 5.8 Add/Remove Idempotency

Add is idempotent.

```http
POST /api/watchlist/{movieId}
```

If the movie is already present:

```text
204 No Content
```

Delete is idempotent.

```http
DELETE /api/watchlist/{movieId}
```

If the movie is already absent:

```text
204 No Content
```

Database uniqueness remains mandatory even though the application path checks for duplicates.

---

## 5.9 Movie Validation Before Persistence

A new movie must be validated through the existing MovieNight Movie boundary before insertion.

Do not let `WatchlistService` call TMDB directly.

Conceptual dependency:

```text
WatchlistService
        ↓
MovieCatalogService
        ↓
TMDB integration/cache boundary
```

If a requested Movie ID is not a valid TMDB movie:

```text
404 Not Found
```

Validation should use the lightweight movie-summary path defined below rather than the heavier Details aggregate unless implementation evidence proves otherwise.

---

## 5.10 Lightweight Movie Summary Lookup

Add an internal lightweight Movie Catalog capability conceptually equivalent to:

```text
GetSummaryAsync(movieId)
```

The exact method name may follow current code conventions.

It should:

- return the existing MovieNight `MovieSummaryDto`;
- call the normal TMDB movie lookup required for summary data;
- not append credits/similar data;
- reuse the existing mapping and full-image-URL boundary;
- remain internal to the backend application/service layer;
- not require a new public Movie endpoint merely for Stage 04.

---

## 5.11 Stage 04 Summary Cache

The lightweight summary lookup may use explicit `IMemoryCache`.

Starting policy:

```text
Key:
movies:summary:{movieId}

TTL:
approximately 10 minutes
```

This remains a small explicit cache, not a generic caching framework.

Do not merge Details and Summary cache entries merely to create abstraction.

Stage 04 must preserve the principle:

```text
simple explicit cache now
→ mandatory cache review/hardening in Stage 06
```

Stage 06 remains responsible for the final cache inventory, TTL policy, key consistency, stampede/concurrency review, observability, search/discover reconsideration, memory considerations, and cache tests.

Do not remove or weaken that deferred requirement.

---

## 5.12 Watchlist Hydration

Persistence stores Movie IDs only.

`GET /api/watchlist` is responsible for returning frontend-ready MovieNight summaries.

Conceptual flow:

```text
GET /api/watchlist
       ↓
resolve anonymous identity
       ↓
SQLite
       ↓
WatchlistItem rows
ORDER BY CreatedAtUtc DESC
       ↓
Movie IDs
       ↓
MovieCatalogService summary lookup
       ↓
existing cache/TMDB boundary
       ↓
MovieSummaryDto[]
```

The frontend must not receive only IDs and perform N individual Movie calls.

Hydration is a backend responsibility.

---

## 5.13 Bounded Hydration Concurrency

Watchlist hydration may run independent movie-summary lookups concurrently, but concurrency must be bounded.

Starting limit:

```text
maximum 4 active summary/TMDB lookups
```

Do not:

- hydrate all items sequentially when avoidable;
- fire all 50 external lookups concurrently with unbounded `Task.WhenAll`.

Cache hits should naturally reduce actual outbound TMDB calls.

Response ordering must remain:

```text
CreatedAtUtc DESC
```

regardless of individual hydration completion order.

---

## 5.14 Hydration Failure Semantics

If one persisted Movie ID returns an upstream movie-level `404`:

```text
skip that item in the GET response
```

Do not delete the database row as a hidden side effect of GET.

If the TMDB/integration boundary has a general operational failure such as:

- timeout
- network failure
- TMDB authentication/configuration failure
- upstream 5xx
- other request-level infrastructure failure

then:

```text
GET /api/watchlist
→ fail safely using the existing upstream Problem Details direction
```

Do not silently return an empty/partial list that could make the user believe their watchlist was deleted.

---

## 5.15 Public Watchlist API

Expected V1 public capabilities:

```http
GET    /api/watchlist
POST   /api/watchlist/{movieId}
DELETE /api/watchlist/{movieId}
```

Public semantics:

```text
GET
→ IReadOnlyList<MovieSummaryDto>
→ newest-added first

POST
→ 204 No Content
→ idempotent if already present

DELETE
→ 204 No Content
→ idempotent if already absent
```

Expected important error categories include:

```text
400 → invalid public input
404 → requested movie does not exist when adding
409 → watchlist capacity reached
502/safe upstream failure → external movie service unavailable where relevant
```

Do not add a V1 status endpoint such as:

```http
GET /api/watchlist/{movieId}/status
```

unless a later explicitly approved frontend requirement proves it necessary.

Do not add watchlist pagination in V1.

---

## 5.16 OpenAPI and Scalar

Use ASP.NET Core 10 built-in OpenAPI generation as the API-document source of truth.

Use:

```text
Scalar.AspNetCore
```

for the interactive development API reference.

Do not add Swagger UI in parallel.

Target development endpoints are conceptually:

```text
/openapi/v1.json
/scalar
```

Exact route conventions may follow current official package defaults if they differ slightly.

OpenAPI/Scalar must be Development-only unless a future explicit decision changes that.

Document meaningful:

- API title
- version
- description
- endpoint summaries/descriptions
- tags/groups
- important success response codes
- important Problem Details responses
- anonymous-cookie behavior

Suggested group direction:

```text
Health
Movies
Watchlist
Diagnostics
```

Do not create fake JWT/Bearer authentication merely to make Scalar show an authorization control.

Do not force XML-comment boilerplate across every DTO/property.

Use concise endpoint metadata where it materially improves the API contract.

---

# 6. In Scope

Stage 04 includes:

- canonical-document alignment required by the newly approved anonymous-watchlist model
- EF Core 10 setup
- SQLite provider/configuration
- migrations
- local database lifecycle/documentation
- `MovieNightDbContext`
- `WatchlistItem`
- unique watchlist-item constraint
- anonymous visitor identity service/boundary
- protected persistent cookie
- ASP.NET Core Data Protection use for anonymous identity
- add/list/remove Watchlist APIs
- idempotent add/remove behavior
- maximum 50-item rule
- TMDB movie validation before persistence
- lightweight Movie summary lookup
- explicit summary cache baseline
- backend-owned Watchlist hydration
- bounded hydration concurrency
- hydration ordering
- partial movie-404 handling
- safe infrastructure/upstream failure behavior
- OpenAPI metadata
- Scalar interactive API reference
- watchlist unit/integration tests where valuable
- live/manual Watchlist verification
- persistence-across-restart verification
- Stage 04 handoff/documentation consistency

---

# 7. Out of Scope

Do not implement:

- registration
- login
- ASP.NET Identity
- JWT
- OAuth
- profiles
- roles/permissions
- admin panel
- public ShareId watchlists
- private owner-token mutation model
- multiple named watchlists per anonymous user
- cross-device identity synchronization
- browser-to-browser watchlist synchronization
- account recovery
- recovery of a watchlist after the anonymous cookie is deleted
- LocalStorage-only watchlist persistence
- public watchlist sharing in V1 under the newly approved Stage 04 model
- movie snapshot persistence
- watchlist pagination
- watchlist status endpoint without an explicit later requirement
- background cleanup jobs for orphaned/invalid Watchlist rows
- auto-deleting invalid rows during `GET`
- Redis/distributed cache
- generic caching framework
- generic repository/Unit of Work
- CQRS/MediatR
- multi-project Clean Architecture
- production deployment automation
- Docker
- frontend final product experience
- Stage 05 UI implementation

---

# 8. Source Organization Direction

Preserve one ASP.NET Core application project.

A possible shape:

```text
backend/MovieNight.Api/
├── Data/
│   ├── MovieNightDbContext.cs
│   ├── Configurations/
│   │   └── WatchlistItemConfiguration.cs
│   └── Migrations/
│
├── Features/
│   ├── Movies/
│   │   └── existing Stage 03 movie boundary
│   │
│   └── Watchlist/
│       ├── WatchlistController.cs
│       ├── WatchlistItem.cs
│       ├── WatchlistService.cs
│       └── AnonymousVisitorService.cs
│
├── Integrations/
│   └── Tmdb/
│       └── existing Stage 03 integration
│
└── Program.cs
```

This is directional, not a hard requirement.

Prefer a small number of coherent files.

Do not create one file per tiny type merely to match the diagram.

Do not introduce new application/domain/infrastructure projects.

---

# 9. Error & Security Boundary

Stage 04 must preserve existing ASP.NET Core Problem Details behavior.

Expected categories:

- invalid Movie ID → `400`
- unknown Movie on add → `404`
- watchlist capacity reached → `409`
- external TMDB/integration operational failure → safe existing upstream error direction
- malformed/tampered/invalid anonymous cookie → recover safely according to the anonymous identity boundary, without exposing internal protection details

Anonymous identity must not leak:

- raw Data Protection implementation details
- internal exception details
- stack traces
- TMDB token
- raw TMDB response bodies

The anonymous cookie is not an authentication system and must not cause the project to introduce one.

Cookie protections are intended to prevent casual tampering and opaque identity disclosure, not to transform V1 into a full identity/security platform.

---

# 10. Canonical Alignment Requirement

The currently stored roadmap/product documents may still contain the superseded Stage 04 design:

```text
public ShareId
private owner token
hashed owner-token persistence
maximum 30 movies
movie snapshot persistence
public shared watchlist
```

Those assumptions conflict with the explicit Tech Lead decisions in this stage.

Before Stage 04 is considered complete:

- `PROJECT.md` must reflect the approved anonymous-cookie model;
- `DECISIONS.md` must record the revised ownership/persistence decisions where appropriate;
- `docs/ROADMAP.md` Stage 04 must reflect the new capabilities and 50-item limit;
- Stage 05 roadmap wording must not promise a public shared-watchlist flow unless explicitly re-approved later;
- any completed planning document that is intended to remain canonical must not continue to contradict the current V1 product model;
- `STATUS.md` must identify Stage 04 as active/complete accurately.

Do not rewrite historical documents unnecessarily.

Correct only statements that act as current project requirements.

---

# 11. Stage 04 Sprint Breakdown

## Sprint 04.1 — Persistence Foundation

### Goal

Introduce the smallest correct EF Core + SQLite persistence foundation and align canonical project documentation with the approved Stage 04 watchlist model.

### Required Context

Read:

- applicable `AGENTS.md`
- `backend/AGENTS.md`
- `STATUS.md`
- Sprint 04.1 from this file
- current backend bootstrap/configuration
- only canonical files that currently conflict with Stage 04 decisions

Inspect Stage 03 code only if required to avoid configuration regressions.

### Tasks

1. Identify canonical Stage 04 statements that still describe:
   - ShareId/owner token
   - 30-item maximum
   - movie snapshot persistence
   - public shared watchlist
2. Align only the affected current project documents with the approved Stage 04 model.
3. Add the required EF Core SQLite packages compatible with the current .NET 10 project.
4. Register `MovieNightDbContext`.
5. Add safe SQLite connection-string configuration.
6. Establish the local application data path.
7. Add the minimal initial persistence model/configuration required to generate the first migration.
8. Configure database artifacts to remain untracked.
9. Create the initial EF Core migration.
10. Apply it explicitly with EF CLI.
11. Document the local migration/database-update command if not already clear.

### Expected Change Surface

Likely areas:

```text
PROJECT.md
DECISIONS.md
docs/ROADMAP.md
STATUS.md

backend/MovieNight.Api/
├── Data/
├── appsettings*.json
├── Program.cs
└── MovieNight.Api.csproj

.gitignore
backend/README.md
backend/MovieNight.Api.Tests/
```

Only touch a file when it is directly required.

### Acceptance Criteria

- [ ] canonical Stage 04 product/roadmap conflicts are removed.
- [ ] EF Core SQLite dependencies are explicit and compatible.
- [ ] `MovieNightDbContext` is registered.
- [ ] SQLite connection configuration is centralized.
- [ ] local database artifacts are ignored.
- [ ] initial migration exists and is committed-source eligible.
- [ ] `dotnet ef database update` succeeds.
- [ ] no `EnsureCreated()` is used.
- [ ] no startup auto-migration is introduced.
- [ ] no Watchlist public API is implemented yet.
- [ ] Stage 03 Movie APIs remain unaffected.

### Verification

```text
dotnet build MovieNight.slnx
dotnet test MovieNight.slnx
dotnet ef database update
dotnet list MovieNight.slnx package --vulnerable --include-transitive
git diff --check
git status
```

Also confirm the generated SQLite database file is not tracked.

### Stop Boundary

Do not implement anonymous-cookie identity behavior.

Do not start Sprint 04.2 automatically.

---

## Sprint 04.2 — Anonymous Visitor Identity

### Goal

Create the protected persistent anonymous-browser identity boundary used by all Watchlist operations.

### Required Context

Read:

- applicable `AGENTS.md`
- `backend/AGENTS.md`
- `STATUS.md`
- Sprint 04.2 from this file
- the persistence/configuration pieces created in Sprint 04.1
- current application startup conventions

### Tasks

1. Implement a focused anonymous-visitor identity service/boundary.
2. Use `Guid` as the internal identity.
3. Protect/unprotect the cookie value using ASP.NET Core Data Protection.
4. Configure:
   - persistent lifetime around 1 year
   - `HttpOnly`
   - `SameSite=Lax`
   - environment-appropriate `Secure`
5. Create the identity only on Watchlist interaction.
6. Handle missing/invalid/tampered cookie values safely.
7. Keep the identity implementation independent of login/authentication frameworks.
8. Add focused tests for:
   - first identity creation
   - returning visitor resolution
   - invalid/tampered cookie handling
   - no identity creation during unrelated Movie API usage where practical

### Expected Change Surface

Likely:

```text
backend/MovieNight.Api/Features/Watchlist/
backend/MovieNight.Api/Program.cs
backend/MovieNight.Api.Tests/
```

### Acceptance Criteria

- [ ] anonymous identity is a server-generated `Guid`.
- [ ] cookie value is protected/opaque.
- [ ] cookie is persistent.
- [ ] `HttpOnly` is enabled.
- [ ] `SameSite=Lax` is used.
- [ ] Secure behavior supports localhost HTTP while remaining production-safe.
- [ ] identity is created only for Watchlist interaction.
- [ ] no authentication framework is introduced.
- [ ] invalid/tampered cookie behavior is safe and tested.

### Verification

```text
dotnet build MovieNight.slnx
dotnet test MovieNight.slnx
git diff --check
```

Perform a focused local cookie smoke check if practical.

### Stop Boundary

Do not implement full Watchlist add/list/remove behavior.

Do not start Sprint 04.3 automatically.

---

## Sprint 04.3 — Watchlist Domain & Persistence

### Goal

Implement the Watchlist persistence rules and service-level data operations without completing the public hydrated API.

### Required Context

Read:

- applicable `AGENTS.md`
- `backend/AGENTS.md`
- `STATUS.md`
- Sprint 04.3 from this file
- current `MovieNightDbContext`
- current anonymous-identity boundary

### Tasks

1. Finalize `WatchlistItem` persistence shape:
   - Id
   - AnonymousId
   - MovieId
   - CreatedAtUtc
2. Add the unique `(AnonymousId, MovieId)` constraint.
3. Add/update migration if required.
4. Implement focused service behavior for:
   - ordered item retrieval
   - duplicate detection
   - capacity check
   - insert
   - remove
5. Enforce maximum 50 items.
6. Keep duplicate add and missing remove semantically idempotent.
7. Preserve `CreatedAtUtc DESC` ordering.
8. Add focused persistence tests, preferably against real SQLite semantics where valuable.
9. Verify uniqueness also protects against duplicate persistence outside normal application flow.

### Expected Change Surface

Likely:

```text
backend/MovieNight.Api/Data/
backend/MovieNight.Api/Features/Watchlist/
backend/MovieNight.Api.Tests/
```

### Acceptance Criteria

- [ ] model persists only application-owned relationship state.
- [ ] no movie snapshot fields are stored.
- [ ] unique `(AnonymousId, MovieId)` constraint exists.
- [ ] maximum size is 50.
- [ ] duplicate behavior is idempotent at service level.
- [ ] missing remove behavior is idempotent.
- [ ] newest-added ordering is stable.
- [ ] SQLite-backed persistence tests cover important rules.
- [ ] no public Watchlist API hydration is completed prematurely.

### Verification

```text
dotnet build MovieNight.slnx
dotnet test MovieNight.slnx
dotnet ef database update
git diff --check
```

### Stop Boundary

Do not implement the complete public Watchlist API/Hydration yet.

Do not start Sprint 04.4 automatically.

---

## Sprint 04.4 — Watchlist API & Hydration

### Goal

Expose the complete V1 Watchlist API and hydrate persisted Movie IDs through the existing MovieNight Movie/TMDB boundary.

### Required Context

Read:

- applicable `AGENTS.md`
- `backend/AGENTS.md`
- `STATUS.md`
- Sprint 04.4 from this file
- existing Watchlist service/persistence
- Stage 03 Movie contracts and `MovieCatalogService`
- only the TMDB integration pieces needed for lightweight summary lookup/cache behavior

### Tasks

1. Add the lightweight internal Movie summary lookup.
2. Reuse existing MovieNight mapping/full-image-URL behavior.
3. Add explicit summary cache around the approved baseline.
4. Implement Movie validation before a new Watchlist insert.
5. Implement public:
   - `GET /api/watchlist`
   - `POST /api/watchlist/{movieId}`
   - `DELETE /api/watchlist/{movieId}`
6. Implement backend-owned hydration for GET.
7. Limit concurrent summary lookups to a maximum of 4.
8. Preserve `CreatedAtUtc DESC` output ordering.
9. Skip one item when that specific Movie now returns 404.
10. Fail safely on general TMDB/integration infrastructure failures.
11. Return:
   - 204 for successful/idempotent POST
   - 204 for successful/idempotent DELETE
   - 404 for invalid/nonexistent movie on a genuinely new add
   - 409 when a new add exceeds capacity
12. Add focused tests for public and service behavior.
13. Do not add a status endpoint or pagination.

### Expected Change Surface

Likely:

```text
backend/MovieNight.Api/Features/Watchlist/
backend/MovieNight.Api/Features/Movies/
backend/MovieNight.Api/Integrations/Tmdb/
backend/MovieNight.Api.Tests/
```

### Acceptance Criteria

- [ ] GET returns `MovieSummaryDto` items, not raw IDs.
- [ ] GET preserves newest-added ordering.
- [ ] POST validates a genuinely new Movie before persistence.
- [ ] duplicate POST is idempotent.
- [ ] DELETE is idempotent.
- [ ] 50-item capacity is enforced.
- [ ] summary lookup is lightweight relative to Movie Details.
- [ ] summary cache is explicit and simple.
- [ ] cache/TMDB access remains behind Movie Catalog boundary.
- [ ] hydration concurrency is bounded to 4.
- [ ] one per-movie 404 is skipped without deleting the DB row.
- [ ] general upstream failure does not silently produce an empty/partial success.
- [ ] no snapshot persistence is introduced.
- [ ] no status endpoint/pagination is added.

### Verification

```text
dotnet build MovieNight.slnx
dotnet test MovieNight.slnx
dotnet list MovieNight.slnx package --vulnerable --include-transitive
git diff --check
```

Live/manual checks:

```text
GET    /api/watchlist
POST   /api/watchlist/{knownMovieId}
POST   /api/watchlist/{sameKnownMovieId}
DELETE /api/watchlist/{knownMovieId}
DELETE /api/watchlist/{knownMovieId}
POST   /api/watchlist/{unknownMovieId}
```

Verify cookie persistence and Movie hydration without exposing the TMDB token.

### Stop Boundary

Do not add Scalar/OpenAPI work yet unless required merely to keep the build working.

Do not start Sprint 04.5 automatically.

---

## Sprint 04.5 — OpenAPI & Scalar API Documentation

### Goal

Provide a clean, modern, development-only API reference over the completed Movie and Watchlist backend contracts.

### Required Context

Read:

- applicable `AGENTS.md`
- `backend/AGENTS.md`
- `STATUS.md`
- Sprint 04.5 from this file
- current ASP.NET Core 10 OpenAPI setup/packages
- current public controllers/endpoints

Before choosing exact package/configuration syntax, verify the current official ASP.NET Core 10 and Scalar.AspNetCore guidance.

Do not replace stable backend contracts merely to improve documentation cosmetics.

### Tasks

1. Use ASP.NET Core 10 built-in OpenAPI generation as the document source.
2. Add `Scalar.AspNetCore` only if not already present.
3. Expose the interactive Scalar API reference in Development.
4. Keep OpenAPI/Scalar Development-only.
5. Configure meaningful API metadata:
   - MovieNight API title
   - v1
   - concise description
6. Organize APIs with meaningful tags/groups such as:
   - Health
   - Movies
   - Watchlist
   - Diagnostics where applicable
7. Add useful summaries/descriptions to important endpoints.
8. Document important success/error response codes.
9. Ensure Problem Details contracts are represented usefully.
10. Document anonymous Watchlist cookie semantics.
11. Do not add a fake Bearer/JWT authentication scheme.
12. Do not install/keep Swagger UI in parallel unless a real compatibility blocker is found and approved.
13. Keep documentation metadata concise rather than introducing blanket XML-comment boilerplate.

### Expected Change Surface

Likely:

```text
backend/MovieNight.Api/Program.cs
backend/MovieNight.Api/*.csproj
backend/MovieNight.Api/Features/*/*Controller.cs
backend/MovieNight.Api.Tests/
backend/README.md
```

### Acceptance Criteria

- [ ] valid OpenAPI v1 document is available in Development.
- [ ] Scalar UI opens successfully in Development.
- [ ] Movie/Watchlist/Health APIs are organized clearly.
- [ ] important endpoints contain meaningful summaries/descriptions.
- [ ] important response codes are documented.
- [ ] Problem Details is represented.
- [ ] anonymous cookie behavior is documented.
- [ ] endpoints can be exercised interactively where appropriate.
- [ ] no fake auth/JWT configuration is added.
- [ ] no Swagger UI dependency is retained without explicit approval.
- [ ] OpenAPI/Scalar are not unintentionally exposed outside Development.
- [ ] existing runtime API behavior remains unchanged.

### Verification

```text
dotnet build MovieNight.slnx
dotnet test MovieNight.slnx
dotnet list MovieNight.slnx package --vulnerable --include-transitive
git diff --check
```

Manual browser verification:

```text
/openapi/v1.json
/scalar
```

Exercise representative Movie and Watchlist endpoints from Scalar.

### Stop Boundary

Do not begin the broad integration/edge-case sprint.

Do not start Sprint 04.6 automatically.

---

## Sprint 04.6 — Watchlist Integration & Edge Cases

### Goal

Verify the complete anonymous-watchlist subsystem against real persistence, cookie lifecycle, TMDB hydration, and important business edge cases.

### Required Context

Read:

- applicable `AGENTS.md`
- `backend/AGENTS.md`
- `STATUS.md`
- Sprint 04.6 from this file
- completed Stage 04 implementation
- only Stage 03 behavior that Watchlist integration relies on

### Tasks

1. Add or strengthen integration tests where current coverage is insufficient.
2. Verify:
   - first anonymous browser identity
   - returning identity
   - different anonymous identities are isolated
   - add known movie
   - duplicate add
   - remove existing movie
   - remove missing movie
   - capacity 50
   - capacity behavior for already-existing duplicate
   - invalid public Movie ID
   - unknown TMDB Movie ID
   - newest-first ordering
   - persistence across API/database restart cycle where practical
   - SQLite uniqueness
   - hydrated Movie summaries
   - bounded concurrency behavior where testable without brittle timing tests
   - summary cache behavior
   - one-movie TMDB 404 skip semantics
   - general TMDB failure semantics
   - tampered/invalid cookie recovery
3. Verify no Movie snapshot is persisted.
4. Verify DB artifacts remain untracked.
5. Verify no raw protected identity/TMDB token leaks in responses/log output used by tests.
6. Fix only Stage 04 defects revealed by verification.
7. Keep Stage 06 cache-hardening work deferred.

### Acceptance Criteria

- [ ] two anonymous identities cannot see each other's Watchlist data.
- [ ] returning browser identity sees persisted data.
- [ ] duplicate add is idempotent.
- [ ] missing delete is idempotent.
- [ ] capacity behavior is correct.
- [ ] unique DB constraint is verified.
- [ ] output ordering is correct.
- [ ] hydrated summaries use MovieNight contracts.
- [ ] persistence survives restart/recreation of application scope where practical.
- [ ] important cookie failure behavior is covered.
- [ ] important upstream failure behavior is covered.
- [ ] summary cache behavior is covered.
- [ ] no DB snapshot fields exist.
- [ ] no unrelated refactor or later-stage work appears.

### Verification

```text
dotnet build MovieNight.slnx
dotnet test MovieNight.slnx
dotnet ef database update
dotnet list MovieNight.slnx package --vulnerable --include-transitive
git diff --check
git status
```

Perform representative live/manual Watchlist requests against a real local SQLite database and real TMDB configuration where required.

### Stop Boundary

Do not start final Stage 04 handoff work until integration failures are resolved.

Do not start Sprint 04.7 automatically.

---

## Sprint 04.7 — Stage 04 Verification & Handoff

### Goal

Verify Stage 04 as one coherent persistence + anonymous-watchlist subsystem and prepare the repository for Stage 05.

Do not add new product features.

### Repository & Persistence Verification

Confirm:

- migration files are tracked;
- SQLite runtime DB files are not tracked;
- no secret/local credential is tracked;
- no temporary test/debug artifact is tracked;
- database creation/update works from committed migration sources;
- no `EnsureCreated()` exists;
- no automatic startup `Database.Migrate()` was introduced.

### Anonymous Identity Verification

Confirm:

- Guid-based anonymous identity;
- protected opaque cookie;
- persistent lifetime;
- HttpOnly;
- SameSite Lax;
- environment-appropriate Secure behavior;
- identity created only on Watchlist interaction;
- no authentication framework.

### Watchlist Verification

Verify:

- GET
- POST
- DELETE
- duplicate add
- missing delete
- 50-item limit
- same-item duplicate at capacity
- two-user isolation
- persistence across restart
- newest-first ordering
- TMDB validation before new persistence
- hydrated `MovieSummaryDto` output
- no movie snapshot persistence
- per-movie 404 skip
- safe general upstream failure

### Cache Verification

Confirm:

- Stage 03 existing cache behavior still works;
- Stage 04 summary cache is explicit and bounded;
- no generic cache abstraction was introduced;
- Search/Discover were not accidentally cached merely because Stage 04 was added;
- Stage 06 mandatory Cache Completion & Hardening requirement remains documented.

### OpenAPI / Scalar Verification

Confirm:

- OpenAPI document works in Development;
- Scalar opens in Development;
- public APIs are organized/documented;
- Problem Details and important status codes are represented;
- anonymous-cookie behavior is documented;
- no fake auth scheme;
- no unnecessary Swagger UI dependency;
- production/non-Development exposure is not accidentally enabled.

### Documentation Verification

Check consistency among:

- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this Stage 04 file
- `AGENTS.md`
- `backend/AGENTS.md`

Fix only genuine Stage 04 inconsistencies.

### Stage 04 Definition of Done

- [x] all Sprint 04.1–04.7 acceptance criteria are satisfied.
- [x] backend build passes.
- [x] backend tests pass.
- [x] vulnerability audit is clean or contains only explicitly understood non-actionable issues.
- [x] migrations recreate/update the SQLite schema successfully.
- [x] runtime DB artifacts are untracked.
- [x] anonymous browser isolation works.
- [x] returning browser persistence works.
- [x] add/remove/list behavior is correct.
- [x] 50-item limit is correct.
- [x] duplicate prevention exists at application + DB level.
- [x] hydration uses MovieNight Movie boundary.
- [x] summary cache is limited and explicit.
- [x] Stage 06 cache hardening remains mandatory.
- [x] OpenAPI + Scalar work in Development.
- [x] no authentication/user-account system exists.
- [x] no movie snapshot persistence exists.
- [x] no Stage 05 frontend feature work exists.
- [x] canonical documents reflect the approved Stage 04 model.
- [x] `STATUS.md` marks Stage 04 complete only after all checks pass.
- [x] Stage 05 is marked next.
- [x] Stage 05 has not been started.

### Completion Report

Return:

1. Stage result: PASS or BLOCKED
2. Canonical-document alignment
3. Persistence/migration verification
4. Anonymous identity/cookie verification
5. Watchlist API/business-rule verification
6. Hydration/TMDB verification
7. Cache verification
8. OpenAPI/Scalar verification
9. Build/tests/dependency/security verification
10. Repository/Git hygiene
11. Files changed during handoff, if any
12. Remaining issues
13. STATUS update
14. Explicit confirmation Stage 05 was not started

### Stop Boundary

**Hard stop.**

Do not start Stage 05.

---

# 12. Stage 04 Technical Constraints

- Preserve one ASP.NET Core backend application project.
- Frontend must still call only MovieNight backend.
- Watchlist code must not call TMDB directly.
- Use MovieNight-owned DTOs at the public boundary.
- Persist application-owned Watchlist relationship data only.
- Keep SQLite schema intentionally small.
- Use explicit EF Core migrations.
- Avoid broad abstractions for one concrete feature.
- Reuse Stage 03 Movie mapping/error/cache boundaries where they genuinely apply.
- Add only dependencies required by the current sprint.
- Review added packages for known vulnerabilities.
- Use cancellation on meaningful async DB/outbound operations.
- Preserve current localhost ports and CORS unless an explicit requirement changes them.
- Do not expose secrets or protected cookie internals.
- Do not broaden Stage 04 into production deployment architecture.

---

# 13. Stage 04 Context / Token Strategy

The project intentionally optimizes Codex context usage.

## Per-Sprint Thread Rule

Use a fresh Codex thread for each new Sprint 04.x.

Same-sprint corrective review stays in the same thread.

Do not carry the entire Stage 04 conversation into later sprints.

## Required Context

For normal implementation, Codex should usually read:

- applicable `AGENTS.md`
- `STATUS.md`
- only the active Sprint 04.x section
- only relevant implementation files

Read `PROJECT.md`, `ARCHITECTURE.md`, `DECISIONS.md`, or `docs/ROADMAP.md` only when the active sprint directly depends on product/architecture/document consistency.

Do not paste entire canonical files into prompts.

Do not read every completed stage file merely for context.

## Model Guidance

Default:

- normal Stage 04 implementation: Terra / Medium
- small correction/mechanical cleanup: Terra / Light
- difficult persistence/integration/debugging: Sol / Medium
- Sol High only when genuinely necessary

Avoid unnecessary parallel agents/worktrees.

---

# 14. Standard Codex Prompt — Sprint 04.1

```text
Goal:
Execute only Sprint 04.1 — Persistence Foundation from
`docs/stages/04-anonymous-watchlist-backend-persistence.md`.

Context:
Read applicable `AGENTS.md`, `backend/AGENTS.md`, `STATUS.md`, only Sprint 04.1, and only the current backend/config/canonical files required by that sprint.

Requirements:
Follow the locked Stage 04 decisions and Sprint 04.1 acceptance criteria.
Resolve only the canonical-document conflicts explicitly required by this sprint.
Do not implement anonymous-cookie behavior or public Watchlist APIs yet.
Do not start Sprint 04.2.
Do not commit automatically.

Done when:
Run the Sprint 04.1 verification, review the diff, update `STATUS.md` only if genuinely complete, provide the sprint completion report, and stop.
```

---

# 15. Standard Codex Prompt Template — Later Stage 04 Sprints

```text
Goal:
Execute only Sprint <04.X — name> from
`docs/stages/04-anonymous-watchlist-backend-persistence.md`.

Context:
Read applicable `AGENTS.md`, `backend/AGENTS.md`, `STATUS.md`, only the active Sprint 04.X section, and only relevant existing code.

Requirements:
Follow the sprint scope, locked Stage 04 decisions, acceptance criteria, and stop boundary.
Do not implement later Stage 04 work.
Do not start Stage 05.
Do not commit automatically.

Done when:
Run the sprint verification, fix failures caused by current changes, review the diff, update `STATUS.md` only if genuinely complete, provide the sprint completion report, and stop.
```

---

# 16. Sprint Completion Report Standard

For Sprint 04.1–04.6, report:

1. What changed
2. Files changed
3. Dependencies added/changed and why
4. Database/migration impact, if any
5. Tests/commands executed
6. Verification result
7. Security/secret/cookie impact, if any
8. Deliberate assumptions
9. Unresolved issues
10. `STATUS.md` update
11. Explicit confirmation the next sprint was not started

Sprint 04.7 uses the broader Stage handoff report defined in that sprint.

---

# 17. Plan-Mode Rule

Use Plan mode before implementation only when the active sprint exposes a genuine unresolved architectural ambiguity or external-tooling uncertainty not already resolved by this document.

Examples where Plan mode may be justified:

- EF Core migration behavior conflicts with the existing repository layout;
- Scalar/OpenAPI behavior differs materially from the official current .NET 10 guidance;
- the current Stage 03 Movie boundary cannot support the approved lightweight hydration model without a non-trivial design change.

Do not spend a separate planning run merely to restate an explicit sprint.

If Plan mode is used:

- plan only the active sprint;
- identify the exact ambiguity;
- do not implement later sprint work;
- stop for Tech Lead review when the ambiguity would change a locked decision.

---

# 18. Deferred Stage 06 Cache Requirement

Stage 04 introduces one additional explicit cache use for lightweight Movie summaries and intentionally reuses existing Stage 03 cache behavior.

This is still **not the final MovieNight cache design**.

Stage 06 must retain its mandatory Cache Completion & Hardening review, including:

- full cacheable-operation inventory
- TTL policy
- cache-key consistency
- whether Search/Discover should remain uncached
- stale-data tolerance
- expiration/refresh behavior
- memory-bound considerations
- concurrency/cache-stampede behavior
- cache observability
- cache tests
- whether Stage 03 Details cache and Stage 04 Summary cache should remain separate
- whether any cache should be removed because its complexity outweighs its value

Redis/distributed caching remains out of scope unless a later explicit architecture decision changes that.

---

# 19. Final Stage 04 Boundary

Stage 04 ends with:

```text
Movie backend (Stage 03)
        +
EF Core / SQLite
        +
protected anonymous browser identity
        +
anonymous Watchlist persistence
        +
backend-owned Watchlist hydration
        +
limited explicit summary cache
        +
OpenAPI / Scalar developer documentation
        ↓
stable backend ready for Stage 05 frontend product work
```

Stage 04 must **not** become:

```text
authentication system
public sharing system
multi-watchlist system
movie snapshot database
frontend implementation
production deployment architecture
generic persistence/cache framework
```

Any proposal that materially changes this boundary requires explicit Tech Lead approval and corresponding updates to canonical project documents.
