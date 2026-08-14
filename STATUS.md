# MovieNight — Project Status

## Current Phase

Implementation / Stage 02 Bootstrap

## Current Stage

Stage 02 — Project Bootstrap

## Current Sprint

Sprint 02.2 — Backend Bootstrap (**implemented, under Tech Lead review; not accepted yet**)

## Accepted / Completed

- Stage 00 — Product Definition
- Stage 01 — Technical Foundation
- Sprint 02.1 — Repository Preflight
- Product scope and non-goals locked
- Backend/frontend stack selected
- Local development conventions locked
- Cursor-to-Codex migration instructions added

## Implemented but Pending Acceptance

### Sprint 02.2 — Backend Bootstrap

Cursor previously implemented:

- `MovieNight.slnx`
- `MovieNight.Api` targeting .NET 10
- `MovieNight.Api.Tests`
- controller-based API
- `GET /api/health`
- backend HTTP port 5080
- CORS for `http://localhost:3000`
- WeatherForecast template removal

Reported checks:

- backend build passed
- health endpoint passed
- positive/negative CORS checks passed

The two review findings documented in `docs/CODEX-HANDOFF.md` have been remediated and verified:

1. `Microsoft.OpenApi` is explicitly pinned to the minimal patched 2.x version; NuGet auditing remains enabled.
2. The meaningless generated `MovieNight.Api.Tests/UnitTest1.cs` placeholder test was removed.

Sprint 02.2 remains pending Tech Lead acceptance.

## Not Started

- Sprint 02.3 — Frontend Bootstrap
- Sprint 02.4 — Local Full-Stack Smoke Integration
- Sprint 02.5 — Bootstrap Verification & Handoff
- Stage 03 — Movie Backend / TMDB integration
- Watchlist backend
- Frontend feature implementation
- Final integration/polish

## Current Architectural Constraints

- One ASP.NET Core application project
- .NET 10
- Next.js frontend
- SQLite + EF Core when persistence begins
- TMDB accessed only through backend
- No authentication system
- No MediatR
- No CQRS
- No generic repository
- No multi-project Clean Architecture
- No Docker
- No production deployment

## Known Issues

- Sprint 02.2 is awaiting Tech Lead confirmation of the completed review fixes.

## Next Planned Work

1. Open MovieNight as a Codex local project.
2. Run the task in `docs/FIRST-CODEX-PROMPT.md`.
3. Resolve only the pending Sprint 02.2 review findings.
4. Run required verification.
5. Review Codex diff/report with the Tech Lead.
6. Accept and commit Sprint 02.2 only after findings are resolved.
7. Start Sprint 02.3 in a fresh Codex thread afterward.
