# Backend local configuration

MovieNight uses a TMDB **Read Access Token** with HTTP Bearer authentication. Never add this token to `appsettings*.json`, source files, or commits.

For the current PowerShell session, provide it with:

```powershell
$env:Tmdb__ReadAccessToken = "your-tmdb-read-access-token"
```

For persistent local development, initialize .NET user secrets once from `backend/MovieNight.Api`, then set the secret:

```powershell
dotnet user-secrets init
dotnet user-secrets set "Tmdb:ReadAccessToken" "your-tmdb-read-access-token"
```

Run `GET /api/tmdb/preflight` to make one harmless TMDB read request. A successful check returns `204 No Content`; failures return a safe Problem Details response without exposing the token or raw TMDB response.

## Local database migrations

The local SQLite database is stored at `backend/MovieNight.Api/App_Data/movienight.db` and is not tracked by Git. Apply migrations explicitly from `backend/MovieNight.Api`:

```powershell
dotnet ef database update
```
