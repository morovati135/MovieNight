# MovieNight Backend Instructions

These instructions apply under `backend/`.

## Stack
- .NET 10
- ASP.NET Core Web API
- controller-based endpoints
- xUnit
- EF Core + SQLite only when the relevant persistence stage begins

## Structure
- Keep one ASP.NET Core application project unless an explicit decision changes this.
- Organize business code primarily by feature.
- Keep TMDB transport concerns under the TMDB integration boundary.
- Public API contracts must be MovieNight-owned DTOs, not raw TMDB models.
- Feature services may use EF Core `DbContext` directly.

## Do not introduce without explicit approval
- MediatR
- CQRS
- AutoMapper
- generic repositories
- custom Unit of Work wrappers
- Redis
- message brokers
- background jobs
- authentication frameworks
- additional application-layer projects

## API and infrastructure
- Use ASP.NET Core Problem Details for public API errors.
- Do not leak raw exceptions, secrets, stack traces, or raw third-party errors.
- Use `IHttpClientFactory` for TMDB integration.
- Use `IMemoryCache` only for clearly useful repeated TMDB reads.
- Preserve async I/O and cancellation where appropriate.

## Testing
- Prefer behavioral tests for meaningful business rules and API behavior.
- Do not keep meaningless generated placeholder tests solely to make the test count non-zero.

## Dependencies and security
- Do not suppress NuGet vulnerability warnings.
- Do not disable package auditing to hide a vulnerable dependency.
- Inspect the dependency graph and use the smallest compatible remediation.
- Do not update unrelated packages during a targeted fix.
