# MovieNight — Stage 03: Movie Backend & TMDB Integration

## Stage Status

**Planned — Next Stage**

Stage 02 — Project Bootstrap must be complete and committed before this stage begins.

---

# 1. Stage Intent

Build the complete read-only MovieNight movie backend boundary over TMDB.

The objective is not merely to prove that TMDB can be called.

By the end of this stage, the MovieNight backend should expose stable application-owned movie APIs that later frontend work can consume without knowing:

- TMDB authentication details
- TMDB transport response shapes
- TMDB image-path conventions
- TMDB endpoint composition
- TMDB error bodies

This stage is the first real business-feature backend stage.

---

# 2. Canonical Context

Before substantial Stage 03 work, use:

- `AGENTS.md`
- `backend/AGENTS.md`
- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- this stage file

Do not read every completed stage unless a specific dependency requires it.

Stage 02 implementation can be inspected as needed for existing API conventions and bootstrap configuration.

---

# 3. Entry Criteria

- Stage 00 accepted.
- Stage 01 accepted.
- Stage 02 accepted and committed.
- .NET 10 backend builds successfully.
- `GET /api/health` works.
- Frontend/backend local ports are stable.
- Git working tree is clean.
- A TMDB developer application/account can provide an application Read Access Token before live connectivity work is accepted.

---

# 4. Locked Stage 03 Decisions

These decisions were explicitly approved by the Tech Lead.

## 4.1 TMDB Authentication

Use TMDB application authentication through a **Bearer Read Access Token**.

Do not send the credential as an API-key query parameter in MovieNight implementation.

The secret must remain outside committed source control.

---

## 4.2 Home Discovery

Support both:

- Trending movies
- Popular movies

These remain separate MovieNight API capabilities.

---

## 4.3 Search vs Discover

Keep Search and Discover as separate public MovieNight API operations.

Search is title/query-oriented.

Discover is filter-oriented.

Do not create one ambiguous endpoint that silently switches between unrelated TMDB behaviors.

---

## 4.4 Discover Filters

Version 1 public discover filters are intentionally limited to:

- `genreId`
- `year`
- `minRating`
- `page`

Do not expose arbitrary TMDB filters or a public sort contract in Stage 03.

The backend may use a sensible fixed default sort for discovery.

---

## 4.5 Movie Details Aggregation

MovieNight exposes one application-level movie details operation.

Internally, prefer TMDB response aggregation through supported append/composition capabilities when this keeps the implementation simpler and avoids redundant calls.

The public MovieNight details contract should include the data required for:

- movie details
- cast
- similar movies

The frontend must not care how many TMDB requests were required.

---

## 4.6 Image Contract

MovieNight public DTOs return complete image URLs where appropriate.

Do not expose raw TMDB `poster_path`, `backdrop_path`, or profile-path conventions as the primary frontend contract.

The image URL construction responsibility belongs to the backend integration/mapping boundary.

---

## 4.7 Pick for Me

`Pick for Me` is backend-owned and rule-based.

Use discover-compatible optional filters:

- `genreId`
- `year`
- `minRating`

The backend selects a candidate from valid discover results.

Do not implement this as:

- an LLM feature
- an AI recommendation engine
- frontend-only random selection

---

## 4.8 Stage 03 Cache Policy

Introduce **limited, explicit `IMemoryCache` use only where the benefit is obvious**.

Initial targets:

- Genres — long-lived relative to other TMDB reads
- Trending — short-lived
- Popular — short-lived
- Movie details — short-lived/moderate

Suggested starting TTLs:

- Genres: approximately 6 hours
- Trending: approximately 5 minutes
- Popular: approximately 5 minutes
- Movie details: approximately 10 minutes

These are starting implementation values, not permanent architectural guarantees.

Do not create a generic caching framework.

Do not cache Search or Discover by default in Stage 03.

### Deferred Cache Requirement

Stage 03 caching is deliberately a **small baseline**, not the final caching design.

`docs/ROADMAP.md` reserves a mandatory **Cache Completion & Hardening** review in Stage 06.

Stage 06 must revisit:

- complete cacheable-operation inventory
- TTL policy
- cache keys
- search/discover caching evidence
- stale-data tolerance
- expiration/refresh behavior
- memory usage
- concurrency/stampede concerns
- cache observability
- cache tests

This deferred requirement must not be silently removed.

---

# 5. Target Public Backend Capabilities

Exact naming may be refined during implementation if required by existing API conventions, but semantic boundaries must remain stable.

Expected capabilities:

```http
GET /api/movies/genres
GET /api/movies/trending
GET /api/movies/popular
GET /api/movies/search
GET /api/movies/discover
GET /api/movies/{id}
GET /api/movies/pick
```

Possible query contracts:

```text
/api/movies/search
- query      required
- page       optional/default 1

/api/movies/discover
- genreId    optional
- year       optional
- minRating  optional
- page       optional/default 1

/api/movies/pick
- genreId    optional
- year       optional
- minRating  optional
```

Do not implement frontend movie features in this stage.

---

# 6. API Contract Principles

## Pagination

Movie list responses should use an application-owned paged result contract.

It should expose only what MovieNight needs, for example:

- current page
- total pages
- total results
- items

Do not expose raw TMDB paging types.

Apply reasonable validation/normalization for invalid page values and external limits.

---

## Movie Summary

Movie list/search/discover/trending/popular results should use a compact MovieNight-owned summary DTO.

Likely information:

- TMDB movie identifier
- title
- release date/year where available
- overview/summary where needed
- rating
- poster URL
- backdrop URL where useful
- genre identifiers or application-useful genre representation

The exact fields should be chosen from actual frontend/product needs, not by copying entire TMDB responses.

---

## Movie Details

Movie details should expose a stable application-owned aggregate suitable for the later details page.

Likely information:

- identifier
- title
- overview
- release date
- runtime
- rating
- genres
- poster URL
- backdrop URL
- cast subset
- similar-movie summaries

Do not pass raw TMDB transport objects through controllers.

---

## Cast

Return only the cast information MovieNight needs.

Avoid transporting the complete TMDB credits payload.

A small cast item may contain:

- person identifier
- name
- character
- profile image URL

A reasonable top-cast limit may be applied if aligned with the later UI need.

---

# 7. Error and Resilience Boundary

Expected MovieNight public failures should use the existing ASP.NET Core Problem Details direction.

The integration must distinguish important failure categories such as:

- invalid MovieNight input
- missing/invalid TMDB configuration
- requested movie not found
- TMDB authentication/configuration failure
- TMDB rate limit/upstream temporary failure
- malformed/unexpected upstream response where relevant
- network/timeout failure

Do not:

- leak Read Access Token
- leak raw TMDB response bodies
- return stack traces
- expose transport exception details directly to clients

Use cancellation for meaningful outbound calls.

Keep resilience simple in Stage 03.

Do not add a complex resilience framework unless an actual requirement proves it necessary.

---

# 8. Source-Organization Direction

Preserve one ASP.NET Core application project.

Use feature-oriented organization with a clear integration boundary.

A possible shape:

```text
backend/MovieNight.Api/
├── Features/
│   └── Movies/
│       ├── MoviesController.cs
│       ├── MovieDtos.cs
│       ├── MovieService.cs
│       └── MovieMappings.cs
├── Integrations/
│   └── Tmdb/
│       ├── TmdbOptions.cs
│       ├── TmdbClient.cs
│       ├── TmdbModels.cs
│       └── TmdbImageUrlBuilder.cs
└── Program.cs
```

This is a direction, not a requirement to create unnecessary files.

Prefer a small number of coherent files over both extremes:

- one giant file
- one file per tiny type

Do not create additional application/domain/infrastructure projects.

---

# 9. Secrets & Configuration

The committed repository must not contain a real TMDB token.

Use configuration/environment-based secret injection.

A safe committed example may document the expected variable without a real secret.

The Stage 03 implementation/report must explain how the human supplies the token locally.

Before handoff, verify the token does not appear in Git-tracked files or diffs.

---

# 10. Stage 03 Sprint Breakdown

## Sprint 03.1 — TMDB Access Preflight & Configuration

### Goal

Establish a safe and verified TMDB application-access boundary without implementing the movie feature set yet.

### Tasks

1. Inspect current backend bootstrap/configuration conventions.
2. Define typed TMDB options.
3. Define the local secret/environment-variable contract for the Read Access Token.
4. Register a named/typed `HttpClient` through `IHttpClientFactory`.
5. Configure:
   - TMDB API base URL
   - Bearer authorization
   - reasonable timeout
6. Add the smallest TMDB client capability required for connectivity verification.
7. Verify the real token works against one harmless read operation.
8. Establish basic upstream error translation direction.
9. Document local secret setup without committing the real token.

### In Scope

- TMDB configuration
- secret contract
- HTTP client registration
- connectivity
- minimal integration baseline

### Out of Scope

- public movie discovery endpoints
- search
- discover
- details
- Pick for Me
- cache framework
- EF Core
- frontend movie UI

### Acceptance Criteria

- [ ] No real token is committed.
- [ ] Bearer authentication is used.
- [ ] TMDB base URL is centralized.
- [ ] `IHttpClientFactory` is used.
- [ ] live TMDB connectivity is verified.
- [ ] missing configuration fails clearly and safely.
- [ ] backend still builds.
- [ ] existing `/api/health` remains unaffected.

### Verification

```text
dotnet build
dotnet test
configuration/secret scan
live TMDB smoke request
GET /api/health
git diff --check
```

### Stop Boundary

Do not start Movie DTO/client-boundary design beyond what connectivity requires.

Do not start Sprint 03.2 automatically.

---

## Sprint 03.2 — TMDB Client & Movie Contract Boundary

### Goal

Create the internal TMDB transport boundary and the stable MovieNight-owned read models needed by later movie endpoints.

### Tasks

1. Define only required TMDB transport models.
2. Define MovieNight-owned:
   - movie summary DTO
   - paged movie result DTO
   - genre DTO
   - movie details DTO
   - cast DTO
3. Implement mapping from TMDB transport models to MovieNight DTOs.
4. Implement backend image URL construction.
5. Add genre retrieval.
6. Add limited genre caching.
7. Validate mapping with focused tests.
8. Keep controllers/public feature endpoints minimal until Sprint 03.3.

### Acceptance Criteria

- [ ] Public DTOs do not expose raw TMDB transport types.
- [ ] Image URLs are backend-owned.
- [ ] Mapping is explicit and understandable.
- [ ] Genres can be read through the service/integration boundary.
- [ ] Genre cache is explicit and simple.
- [ ] no Search/Discover/Details public feature work is started prematurely.
- [ ] tests cover meaningful mapping behavior.

### Verification

```text
dotnet build
dotnet test
NuGet vulnerability audit
targeted genre integration smoke test
git diff --check
```

### Stop Boundary

Do not start Sprint 03.3 automatically.

---

## Sprint 03.3 — Discovery & Search API

### Goal

Expose the primary movie-list capabilities required by the product.

### Public Capabilities

```text
Genres
Trending
Popular
Search
Discover
```

### Tasks

1. Add MovieNight movie controller/service orchestration for list operations.
2. Implement:
   - trending
   - popular
   - search
   - discover
3. Apply public query validation.
4. Support discover filters:
   - genreId
   - year
   - minRating
   - page
5. Keep Search and Discover semantics separate.
6. Add short explicit cache for:
   - trending
   - popular
7. Do not cache Search/Discover by default.
8. Map upstream errors to safe MovieNight Problem Details.
9. Add meaningful backend tests.
10. Perform live TMDB smoke verification.

### Acceptance Criteria

- [ ] Trending works.
- [ ] Popular works.
- [ ] Search works.
- [ ] Discover works.
- [ ] pagination contract is MovieNight-owned.
- [ ] invalid inputs fail predictably.
- [ ] Trending/Popular cache behavior is explicit.
- [ ] Search/Discover are not cached without evidence.
- [ ] no raw TMDB error body leaks.
- [ ] no frontend movie feature is added.

### Verification

```text
dotnet build
dotnet test
NuGet vulnerability audit
manual/live checks for all five list capabilities
cache smoke verification for trending/popular
GET /api/health
git diff --check
```

### Stop Boundary

Do not start Movie Details or Pick for Me.

Do not start Sprint 03.4 automatically.

---

## Sprint 03.4 — Movie Details, Cast & Similar API

### Goal

Expose one MovieNight movie-details operation that aggregates the information required for the later frontend details page.

### Tasks

1. Implement movie details retrieval.
2. Retrieve/aggregate:
   - core movie details
   - cast
   - similar movies
3. Prefer supported upstream response aggregation when it simplifies the implementation.
4. Map the result to MovieNight-owned DTOs.
5. Apply a reasonable cast subset/limit if useful.
6. Return full poster/backdrop/profile image URLs.
7. Add explicit short/moderate movie-details caching.
8. Handle:
   - unknown movie
   - upstream failure
   - malformed/unexpected response
9. Add meaningful tests.

### Acceptance Criteria

- [ ] `GET /api/movies/{id}` provides the complete MovieNight details aggregate.
- [ ] raw TMDB transport models remain internal.
- [ ] cast and similar data are included.
- [ ] full image URLs are returned.
- [ ] not-found behavior is correct.
- [ ] details caching is explicit.
- [ ] tests cover important mapping/error behavior.

### Verification

```text
dotnet build
dotnet test
NuGet vulnerability audit
live known-movie details request
live invalid/unknown movie request
cache smoke verification
git diff --check
```

### Stop Boundary

Do not start Pick for Me.

Do not start Sprint 03.5 automatically.

---

## Sprint 03.5 — Pick for Me

### Goal

Implement the version 1 rule-based backend movie picker.

### Input

Optional:

- `genreId`
- `year`
- `minRating`

### Behavior

1. Build an appropriate discover request.
2. Retrieve a candidate page/set.
3. Select one valid movie.
4. Return a normal MovieNight movie-summary contract.
5. Provide predictable behavior when no candidate exists.

The implementation should remain intentionally simple.

### Out of Scope

- machine learning
- LLM recommendation
- personalization profile
- user history
- collaborative filtering
- persistence
- frontend recommendation UI

### Acceptance Criteria

- [ ] no-filter pick works.
- [ ] filtered pick works.
- [ ] result uses standard MovieNight movie contract.
- [ ] empty candidate behavior is defined.
- [ ] invalid filter behavior is defined.
- [ ] selection logic is backend-owned.
- [ ] meaningful deterministic unit tests cover logic where possible.

### Verification

```text
dotnet build
dotnet test
live Pick-for-Me smoke tests
invalid/empty-result checks
git diff --check
```

### Stop Boundary

Do not start Stage 04.

Do not start Sprint 03.6 automatically.

---

## Sprint 03.6 — Stage 03 Verification & Handoff

### Goal

Verify the entire Movie Backend/TMDB stage as one coherent read-only subsystem.

Do not add new product features.

### Repository & Secret Verification

- confirm no real TMDB token is tracked
- confirm no local secret file is tracked
- confirm no temporary debugging artifacts are tracked
- confirm Git diff/status is clean except intended handoff changes

### Backend Verification

Verify:

- build
- tests
- vulnerability audit
- `/api/health`
- genres
- trending
- popular
- search
- discover
- movie details
- cast
- similar
- Pick for Me
- invalid inputs
- not found
- upstream failure behavior where practical

### Cache Baseline Verification

Verify that Stage 03 cache behavior exists only where intended:

- genres
- trending
- popular
- details

Confirm:

- Search is not cached by default.
- Discover is not cached by default.
- no generic cache abstraction was introduced unnecessarily.
- the Stage 06 cache-completion requirement remains documented in `docs/ROADMAP.md`.

### Documentation Verification

Check consistency among:

- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- `docs/ROADMAP.md`
- `AGENTS.md`
- `backend/AGENTS.md`

Fix only genuine Stage 03 inconsistencies.

### Stage 03 Definition of Done

- [ ] all Stage 03 capabilities work.
- [ ] build passes.
- [ ] tests pass.
- [ ] vulnerability audit is clean or only contains understood non-actionable connectivity warnings.
- [ ] secrets are not committed.
- [ ] public contracts are MovieNight-owned.
- [ ] TMDB details remain behind integration boundary.
- [ ] cache baseline is limited and explicit.
- [ ] Stage 06 cache-hardening requirement remains planned.
- [ ] no EF Core/watchlist work exists.
- [ ] no frontend movie feature work exists.
- [ ] `STATUS.md` marks Stage 03 complete only after all checks pass.
- [ ] Stage 04 is set as next.
- [ ] Stage 04 has not been started.

### Completion Report

Return:

1. Repository/secret verification
2. TMDB configuration verification
3. Public API capability verification
4. Tests/build result
5. Security/dependency audit
6. Cache baseline verification
7. Documentation consistency
8. Files changed, if any
9. Remaining issues
10. STATUS update
11. Explicit confirmation Stage 04 was not started

---

# 11. Stage 03 Token/Context Strategy

The project intentionally optimizes Codex context usage.

## Per-Sprint Thread Rule

Use a fresh Codex thread for each new Sprint 03.x.

Same-sprint corrective review stays in the same thread.

Do not carry the entire Stage 03 conversation into later sprints.

## Required Context

For implementation, Codex should normally read:

- applicable `AGENTS.md`
- `STATUS.md`
- only the active Sprint 03.x section
- only relevant implementation files

Read `PROJECT.md`, `ARCHITECTURE.md`, or `DECISIONS.md` only when the active task requires a product/architecture decision.

Do not paste entire canonical files into prompts.

## Model Guidance

Default:

- normal Stage 03 implementation: Terra / Medium
- small correction/mechanical cleanup: Terra / Light
- difficult integration/debugging: Sol / Medium
- Sol High only when genuinely necessary

Avoid unnecessary parallel agents/worktrees for Stage 03.

---

# 12. Standard Codex Prompt — Sprint 03.1

```text
Goal:
Execute only Sprint 03.1 — TMDB Access Preflight & Configuration from `docs/stages/03-movie-backend-tmdb-integration.md`.

Context:
Read applicable AGENTS.md, STATUS.md, only Sprint 03.1, and the current backend bootstrap/configuration files needed for this task.

Constraints:
- Bearer Read Access Token
- token must not be committed
- use IHttpClientFactory
- centralize TMDB base URL/configuration
- no movie discovery/details/Pick-for-Me feature work yet
- no EF Core/watchlist/frontend movie work
- no unrelated package or architecture changes
- do not start Sprint 03.2
- do not commit automatically

Done when:
Run the Sprint 03.1 verification, review the diff, update STATUS only if genuinely complete, provide the standard completion report, and stop.
```

---

# 13. Standard Codex Prompt Template — Later Stage 03 Sprints

```text
Goal:
Execute only Sprint <03.X — name> from `docs/stages/03-movie-backend-tmdb-integration.md`.

Context:
Read applicable AGENTS.md, STATUS.md, only the active Sprint 03.X section, and only relevant existing code.

Constraints:
Follow the sprint scope, locked Stage 03 decisions, and stop boundary.
Do not implement later Stage 03 work.
Do not start Stage 04.
Do not commit automatically.

Done when:
Run the sprint verification, fix failures caused by current changes, review the diff, update STATUS only if genuinely complete, provide the standard completion report, and stop.
```

---

# 14. Plan-Mode Rule

Use Plan mode before implementation only when the active sprint exposes a genuine architectural ambiguity or external-integration uncertainty not already resolved by this document.

Do not spend a separate planning run merely to restate an already explicit sprint.

If Plan mode is used, it must plan only the active sprint and must not implement or design later sprints.
