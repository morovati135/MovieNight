Goal:
Finish the pending Tech Lead review fixes for Sprint 02.2 — Backend Bootstrap. Do not start Sprint 02.3.

Context:
- Read `AGENTS.md`.
- Read `backend/AGENTS.md`.
- Read `docs/CODEX-HANDOFF.md`.
- Read Sprint 02.2 in `docs/stages/02-project-bootstrap.md`.
- Inspect current backend files and `git status`/diff before changing anything.

Required fixes:

1. Investigate and resolve the NU1903 high-severity vulnerability involving the generated/transitive `Microsoft.OpenApi 2.0.0` dependency.

Constraints:
- inspect dependency graph first;
- keep ASP.NET Core OpenAPI support;
- do not suppress NU1903;
- do not disable NuGet auditing;
- do not make unrelated package upgrades;
- use the smallest compatible non-vulnerable remediation.

2. Remove `MovieNight.Api.Tests/UnitTest1.cs` if it is still only the generated meaningless placeholder test.

Constraints:
- do not create a fake replacement to keep test count non-zero;
- do not add business-feature tests outside Sprint 02.2.

Verification:
- `dotnet build`
- `dotnet test`
- vulnerable package audit including transitive packages
- run API on configured HTTP port
- verify `GET /api/health`
- verify CORS allows `http://localhost:3000`
- verify another origin such as `http://localhost:9999` does not receive an allow-origin header
- review final diff for unrelated changes

STATUS:
`STATUS.md` may currently say Sprint 02.2 is complete. Do not advance to Sprint 02.3. If the fixes pass, update only what is needed so STATUS is accurate, then stop for Tech Lead review.

Done when:
- vulnerability warning is resolved without hiding auditing;
- placeholder test is gone;
- required verification actually ran;
- no out-of-scope feature work exists;
- standard completion report is provided;
- Sprint 02.3 has not started.

Do not commit automatically.
