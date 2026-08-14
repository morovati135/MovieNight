# MovieNight — Stage 02: Project Bootstrap

## Stage Status

**Ready for execution in Cursor.**

This is the first stage that creates application code.

---

## 1. Stage Intent

Create a clean local-development baseline for MovieNight.

At the end of this stage:

- the .NET backend builds and runs,
- the Next.js frontend builds and runs,
- backend tests run,
- shadcn/ui is initialized,
- the browser can call the backend health endpoint from the frontend,
- no Movie/TMDB/Watchlist business feature has been implemented yet.

This stage exists to prove the toolchain and frontend/backend boundary before domain work begins.

---

## 2. Canonical Context

Use:

- `PROJECT.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `STATUS.md`
- this stage file
- applicable `.cursor/rules/*.mdc`

Do not read Stage 03+ files during this stage.

---

## 3. Entry Criteria

Before implementation:

- .NET 10 SDK must be available.
- Node.js must be on a supported LTS line.
- npm must be available.
- Git must be available.
- repository root already contains MovieNight foundation documentation and Cursor rules.

If a required runtime/tool is missing, report the missing prerequisite rather than changing the project stack.

---

## 4. Stage Outcome

The following local flow must work:

```text
Browser
  |
  v
http://localhost:3000
  |
  | GET /api/health
  v
http://localhost:5080
  |
  v
{ "status": "ok" }
```

No external API and no database are required yet.

---

## 5. In Scope

- repository bootstrap support files
- .NET solution
- ASP.NET Core controller-based API project
- backend test project
- deterministic local backend HTTP port
- simple health endpoint
- local-development CORS
- Next.js frontend
- TypeScript
- App Router
- `src/` directory
- Tailwind CSS
- shadcn/ui initialization
- minimal MovieNight application shell
- centralized frontend API-base configuration
- health smoke integration
- build/test verification

---

## 6. Out of Scope

Do not implement:

- TMDB client
- TMDB API key/configuration
- movie endpoints
- movie DTOs
- search/discovery
- recommendation
- EF Core
- SQLite
- migrations
- watchlist models/endpoints
- authentication
- final design system
- final home page
- elaborate animations
- Docker
- deployment
- CI/CD

Do not pre-create empty feature classes for future stages.

---

## 7. Technical Constraints

- Backend target framework: `net10.0`.
- Backend is controller-based.
- Backend application project: `MovieNight.Api`.
- Backend test project: `MovieNight.Api.Tests`.
- .NET 10 solution format may use `.slnx`.
- Frontend uses npm.
- Frontend uses Next.js App Router + TypeScript + Tailwind + `src/`.
- Initialize shadcn/ui using its official CLI.
- Do not add unrelated packages.
- Keep frontend shell intentionally minimal; visual design work belongs to later stages.
- Do not expose secrets.
- Use CORS restricted to `http://localhost:3000`.
- Backend local HTTP convention: `http://localhost:5080`.
- The health endpoint must be under `/api/health`.

---

# 8. Sprint Breakdown

---

## Sprint 02.1 — Repository Preflight

### Objective

Verify the local toolchain and create only root-level bootstrap files that are still missing.

### Required Context

- `@PROJECT.md`
- `@ARCHITECTURE.md`
- `@DECISIONS.md`
- `@STATUS.md`
- `@docs/stages/02-project-bootstrap.md`

Inspect the repository root before creating anything.

### Tasks

1. Inspect existing root files and preserve the existing foundation documents/rules.
2. Verify:
   - `dotnet --version`
   - `node --version`
   - `npm --version`
   - `git --version`
3. Confirm .NET major version is 10.
4. Confirm Node is on a supported LTS line.
5. Create a root `.gitignore` if one does not already exist.
6. Create a root `.editorconfig` if one does not already exist.
7. Ensure empty `backend/` and future `frontend/` locations can be created without overwriting existing work.
8. Do not initialize business code in this sprint.

### `.gitignore` minimum coverage

It should ignore at least:

```text
bin/
obj/
TestResults/
node_modules/
.next/
coverage/
.env
.env.*
!.env.example
*.db
*.db-shm
*.db-wal
.vs/
.idea/
```

Do not ignore project source, lock files, migration files, or committed example configuration.

### Expected Change Surface

```text
.gitignore
.editorconfig
backend/           # directory may be created
```

### Acceptance Criteria

- [ ] Required CLI versions are reported.
- [ ] .NET major version is 10.
- [ ] Node is an LTS version.
- [ ] Existing foundation files were not rewritten unnecessarily.
- [ ] `.gitignore` is suitable for both .NET and Next.js.
- [ ] `.editorconfig` provides a small cross-platform baseline.
- [ ] No application feature code exists yet.

### Verification

```text
dotnet --version
node --version
npm --version
git --version
```

### Stop Boundary

Stop after repository preflight. Do not scaffold backend or frontend yet.

---

## Sprint 02.2 — Backend Bootstrap

### Objective

Create the .NET solution, API application, test project, and a working health endpoint.

### Required Context

- canonical project files
- current stage file
- files created by Sprint 02.1

### Tasks

1. Under `backend/`, create a .NET solution named `MovieNight`.
2. Create:
   - `MovieNight.Api`
   - `MovieNight.Api.Tests`
3. Target .NET 10.
4. Use the ASP.NET Core Web API controller template.
5. Add both projects to the solution.
6. Add a project reference from tests to API.
7. Remove sample WeatherForecast/template business code.
8. Configure controllers and OpenAPI support using the normal ASP.NET Core setup generated for the current template.
9. Add:
   - `GET /api/health`
10. The endpoint returns a small application-owned response such as:

```json
{
  "status": "ok"
}
```

11. Configure the development HTTP launch URL to use:

```text
http://localhost:5080
```

12. Add local CORS policy for:

```text
http://localhost:3000
```

13. Do not add EF Core or TMDB packages.
14. Do not create future Movie/Watchlist features.

### Suggested CLI Shape

Use the installed .NET 10 CLI rather than manually generating project files.

A valid shape is:

```text
cd backend
dotnet new sln --name MovieNight
dotnet new webapi --use-controllers --framework net10.0 --output MovieNight.Api
dotnet new xunit --framework net10.0 --output MovieNight.Api.Tests
dotnet sln MovieNight.slnx add MovieNight.Api/MovieNight.Api.csproj
dotnet sln MovieNight.slnx add MovieNight.Api.Tests/MovieNight.Api.Tests.csproj
dotnet add MovieNight.Api.Tests/MovieNight.Api.Tests.csproj reference MovieNight.Api/MovieNight.Api.csproj
```

If the installed .NET 10 SDK emits an equivalent current command/output, use it rather than fighting the CLI.

### Expected Change Surface

```text
backend/
├── MovieNight.slnx
├── MovieNight.Api/
└── MovieNight.Api.Tests/
```

### Acceptance Criteria

- [ ] Solution exists.
- [ ] API targets .NET 10.
- [ ] API is controller-based.
- [ ] Test project targets .NET 10.
- [ ] Test project references API.
- [ ] Template sample endpoint/code is removed.
- [ ] `GET /api/health` returns HTTP 200.
- [ ] Health response contains `status = "ok"`.
- [ ] Backend uses local HTTP port 5080 for the development convention.
- [ ] CORS allows only the local frontend origin needed by the project.
- [ ] No EF Core package is added.
- [ ] No TMDB code/package/configuration exists.
- [ ] No Movie/Watchlist feature implementation exists.

### Verification

From `backend/`:

```text
dotnet build
dotnet test
dotnet run --project MovieNight.Api
```

While the API is running, verify:

```text
GET http://localhost:5080/api/health
```

### Stop Boundary

Stop after backend bootstrap. Do not create the frontend in this sprint.

---

## Sprint 02.3 — Frontend Bootstrap

### Objective

Create the Next.js application and establish the minimal UI/tooling baseline.

### Required Context

- canonical project files
- current stage file
- implemented backend contract for `/api/health`

### Tasks

1. From the repository root, create `frontend/` using the official `create-next-app` CLI.
2. Use:
   - npm
   - TypeScript
   - Tailwind CSS
   - ESLint
   - App Router
   - `src/` directory
   - `@/*` import alias
3. Keep the generated package lock file.
4. Initialize shadcn/ui using the official CLI and recommended/default setup compatible with the generated Next.js app.
5. Remove unnecessary starter/demo content.
6. Create a minimal MovieNight shell:
   - application name
   - one short placeholder description
   - no final movie UI
7. Keep styling simple and clean; do not perform Stage 05 design-system work.
8. Create `frontend/.env.example` containing:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5080
```

9. Do not add a state-management library.
10. Do not add animation libraries.
11. Do not call TMDB.

### Suggested CLI Shape

Use the current official CLI.

A suitable non-interactive shape is:

```text
npx create-next-app@latest frontend --use-npm --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

If the current CLI asks additional framework-default questions, preserve stable recommended defaults unless they conflict with this stage.

Then initialize shadcn/ui using the current official CLI.

### Expected Change Surface

```text
frontend/
├── package.json
├── package-lock.json
├── components.json
├── .env.example
└── src/
```

### Acceptance Criteria

- [ ] Next.js app uses TypeScript.
- [ ] App Router is enabled.
- [ ] source files live under `src/`.
- [ ] Tailwind is working.
- [ ] shadcn/ui is initialized.
- [ ] `@/*` import alias resolves correctly.
- [ ] `npm run build` succeeds.
- [ ] `npm run dev` serves the application on localhost.
- [ ] Starter/demo content is removed.
- [ ] No domain feature is implemented.
- [ ] No TMDB request exists.
- [ ] No unnecessary package was added.

### Verification

From `frontend/`:

```text
npm run build
npm run dev
```

Verify:

```text
http://localhost:3000
```

### Stop Boundary

Stop after frontend bootstrap. Do not wire frontend/backend health integration yet.

---

## Sprint 02.4 — Local Full-Stack Smoke Integration

### Objective

Prove the frontend can communicate with the backend through the intended application boundary.

### Required Context

- current stage file
- `/api/health` backend implementation
- current frontend shell
- `.env.example`

### Tasks

1. Add a small centralized frontend API configuration/helper under the intended API area, for example:

```text
frontend/src/lib/api/
```

2. Read the backend base URL from:

```text
NEXT_PUBLIC_API_BASE_URL
```

3. For local development, use the configured value rather than duplicating the backend URL throughout components.
4. Add a minimal health request to the MovieNight backend.
5. Surface the result in the current shell using a restrained development-oriented indicator such as:
   - `API connected`
   - controlled error state if unreachable
6. Do not turn this into a generic data-fetching framework.
7. Do not add React Query/TanStack Query/SWR only for this smoke check.
8. Do not introduce movie business UI.
9. Ensure backend CORS works from `http://localhost:3000`.
10. Keep the implementation small enough to remove or repurpose later without architectural impact.

### Expected Change Surface

```text
frontend/src/lib/api/
frontend/src/app/ and/or a small local component
```

Backend changes should be unnecessary unless a real bootstrap defect is found.

### Acceptance Criteria

- [ ] Frontend base URL is centralized.
- [ ] Frontend does not call TMDB.
- [ ] Browser can call `http://localhost:5080/api/health`.
- [ ] Successful backend connection is visibly indicated.
- [ ] Backend-unavailable state is handled without crashing the page.
- [ ] CORS is not globally unrestricted.
- [ ] No new data-fetching library was introduced.
- [ ] No business feature was implemented.

### Verification

Run backend:

```text
cd backend
dotnet run --project MovieNight.Api
```

Run frontend in a second terminal:

```text
cd frontend
npm run dev
```

Verify in browser:

```text
http://localhost:3000
```

Expected:

- frontend renders,
- health connection succeeds,
- browser console has no CORS error caused by the application configuration.

### Stop Boundary

Stop after smoke integration. Do not start TMDB work.

---

## Sprint 02.5 — Bootstrap Verification & Handoff

### Objective

Validate the entire bootstrap stage, clean template noise, and prepare the repository for Stage 03.

### Required Context

- all Stage 02 changes
- `STATUS.md`

### Tasks

1. Run backend build/tests.
2. Run frontend production build.
3. Run both apps locally and verify health integration.
4. Review the complete Stage 02 diff.
5. Remove only bootstrap-related dead/template code.
6. Confirm no secret or local-only environment file is tracked.
7. Confirm no out-of-scope feature/package was introduced.
8. Update `STATUS.md` only after all acceptance criteria pass.
9. Report exact commands executed and results.
10. Do not implement Stage 03.

### Acceptance Criteria

- [ ] `dotnet build` succeeds.
- [ ] `dotnet test` succeeds.
- [ ] `npm run build` succeeds.
- [ ] Backend starts locally.
- [ ] Frontend starts locally.
- [ ] Frontend-to-health API call works.
- [ ] No CORS error exists in the verified flow.
- [ ] No secret is committed.
- [ ] No TMDB/EF Core/Watchlist feature exists yet.
- [ ] Changed files contain no unnecessary template sample code.
- [ ] `STATUS.md` accurately marks Stage 02 complete.
- [ ] Agent provides Sprint Completion Report.

### Verification

```text
cd backend
dotnet build
dotnet test
```

```text
cd frontend
npm run build
```

Then run both applications and perform the browser smoke test.

### Stop Boundary

**Hard stop.**

Do not start Stage 03.

---

# 9. Stage Definition of Done

Stage 02 is complete only when:

- [ ] Sprint 02.1 is accepted.
- [ ] Sprint 02.2 is accepted.
- [ ] Sprint 02.3 is accepted.
- [ ] Sprint 02.4 is accepted.
- [ ] Sprint 02.5 is accepted.
- [ ] Backend and frontend both build.
- [ ] Backend tests pass.
- [ ] Full-stack health smoke flow works.
- [ ] `STATUS.md` is current.
- [ ] No out-of-scope business code exists.

---

# 10. Codex Execution Strategy for Stage 02

Codex loads applicable `AGENTS.md` guidance automatically.

Use one focused Codex chat per sprint/corrective review when practical.
Use Plan mode only for genuinely ambiguous or structurally significant work.

Before a sprint:
- inspect `git status`;
- read `STATUS.md`;
- read only the active sprint and relevant code.

After a sprint:
- run verification;
- review the diff;
- stop for Tech Lead acceptance;
- do not commit automatically.

## Current handoff
Development moved from Cursor to Codex during Sprint 02.2.

Before Sprint 02.3, read `docs/CODEX-HANDOFF.md` and finish the pending Sprint 02.2 Tech Lead findings.
