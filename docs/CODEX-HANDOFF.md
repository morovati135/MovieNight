# MovieNight — Cursor to Codex Handoff

## Accepted work

### Sprint 02.1 — Repository Preflight
Accepted.

Verified environment:
- .NET SDK 10.0.302
- Node.js v24.19.0 LTS
- npm 11.17.0
- Git 2.47.1.windows.1

Sprint 02.1 commit:
`chore: complete repository preflight`

## Sprint 02.2 — Backend Bootstrap

Cursor implemented it and updated `STATUS.md` as if complete, but Tech Lead review did **not** accept it yet.

Reported implementation:
- `backend/MovieNight.slnx`
- `MovieNight.Api` targeting `net10.0`
- `MovieNight.Api.Tests`
- controller-based API
- `GET /api/health`
- HTTP port 5080
- CORS only for `http://localhost:3000`
- WeatherForecast removed
- no EF Core/TMDB/Movie/Watchlist work

Reported verification:
- `dotnet build` passed
- `dotnet test` passed only because of generated placeholder test
- `/api/health` returned 200 and `{ "status": "ok" }`
- positive/negative CORS checks passed

## Pending Sprint 02.2 review findings

### 1. NU1903 / Microsoft.OpenApi
A high-severity NuGet vulnerability warning was reported involving transitive `Microsoft.OpenApi 2.0.0`.

Required:
- inspect actual dependency graph;
- keep OpenAPI support;
- do not suppress NU1903;
- do not disable auditing;
- use smallest compatible remediation;
- do not update unrelated packages;
- rerun vulnerable-package audit including transitives.

### 2. Generated placeholder test
`MovieNight.Api.Tests/UnitTest1.cs` is a meaningless generated empty test.

Required:
- remove it if still a placeholder;
- do not replace it with a fake test just to keep test count non-zero.

## First Codex task
Do not start Sprint 02.3.
Finish and verify the two Sprint 02.2 findings above first.

`STATUS.md` may currently claim Sprint 02.2 is complete. Treat that as stale until Tech Lead accepts these fixes.
