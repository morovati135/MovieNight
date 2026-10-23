# MovieNight API

ASP.NET Core 10 Web API: movies and collections from TMDB, and the anonymous watchlist in SQLite. Setup (including the TMDB token) is in the [root README](../README.md); structure and rules are in [ARCHITECTURE.md](../ARCHITECTURE.md).

## Commands (from the repository root)

```bash
dotnet run --project backend/MovieNight.Api --launch-profile http   # http://localhost:5080
dotnet test backend/MovieNight.slnx                                  # all backend tests
dotnet tool restore                                                  # EF Core CLI, once
dotnet restore backend/MovieNight.slnx                               # packages, once (before dotnet-ef)
```

## Configuration

| Key | Source | Notes |
|---|---|---|
| `Tmdb:ReadAccessToken` | user secrets or env `Tmdb__ReadAccessToken` | required; never in a committed file |
| `Tmdb:BaseUrl` | `appsettings.json` | HTTPS only |
| `ConnectionStrings:MovieNightDatabase` | `appsettings.json` | default `Data Source=App_Data/movienight.db` (git-ignored) |
| `Cors:AllowedOrigins` | config / env | default `http://localhost:3000` |

## Development helpers

- API reference: `/scalar`; OpenAPI document: `/openapi/v1.json`; TMDB connectivity check: `GET /api/tmdb/preflight` (204 on success). All three exist only in the Development environment.
- Database: `cd backend/MovieNight.Api && dotnet tool run dotnet-ef database update`. After changing the model: `dotnet tool run dotnet-ef migrations add <Name>`.
- Tests: `MovieNight.Api.Tests/Http` starts the real app in memory with a fake TMDB and a temporary database; the other test files are unit tests.
