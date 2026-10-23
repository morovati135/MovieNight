using System.Net;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MovieNight.Api.Data;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests.Http;

/// <summary>
/// The real MovieNight application running in memory: real routing, validation, middleware, cookies,
/// data protection, SQLite database and caches. Only TMDB is replaced, by <see cref="FakeTmdb"/>.
/// Each instance has its own database, keys and cache.
/// </summary>
public sealed class ApiHost : WebApplicationFactory<Program>
{
    private readonly DirectoryInfo directory = Directory.CreateTempSubdirectory("movienight-api-");

    public FakeTmdb Tmdb { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Production");
        builder.UseContentRoot(directory.FullName);
        builder.UseSetting("Tmdb:ReadAccessToken", FakeTmdb.Token);
        builder.UseSetting("ConnectionStrings:MovieNightDatabase", $"Data Source={Path.Combine(directory.FullName, "test.db")};Pooling=False");
        builder.ConfigureTestServices(services =>
            services.AddHttpClient<TmdbClient>().ConfigurePrimaryHttpMessageHandler(() => Tmdb));
    }

    /// <summary>A client with its own cookie jar: one anonymous browser.</summary>
    public HttpClient CreateBrowser() => CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

    public static async Task<ApiHost> StartAsync()
    {
        var host = new ApiHost();

        using var scope = host.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<MovieNightDbContext>().Database.MigrateAsync();

        return host;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (disposing)
        {
            try
            {
                directory.Delete(recursive: true);
            }
            catch (IOException)
            {
                // SQLite may still hold the file briefly; the temp folder is cleaned by the OS later.
            }
        }
    }
}

/// <summary>A stand-in for the TMDB API. The movie id decides the behavior of a movie request.</summary>
public sealed class FakeTmdb : HttpMessageHandler
{
    public const string Token = "test-token-never-real";

    public const int NotFoundId = 404;
    public const int UnauthorizedId = 401;
    public const int ServerErrorId = 500;
    public const int NetworkFailureId = 503;

    private int requestCount;

    public int RequestCount => Volatile.Read(ref requestCount);

    /// <summary>Replaces the default behavior; return null to fall back to it.</summary>
    public Func<HttpRequestMessage, HttpResponseMessage?>? Override { get; set; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        Interlocked.Increment(ref requestCount);

        return Task.FromResult(Override?.Invoke(request) ?? Respond(request));
    }

    private static HttpResponseMessage Respond(HttpRequestMessage request)
    {
        var path = request.RequestUri!.AbsolutePath;

        if (path.EndsWith("/genre/movie/list", StringComparison.Ordinal))
        {
            return Json("""{ "genres": [{ "id": 28, "name": "Action" }, { "id": 35, "name": "Comedy" }] }""");
        }

        if (path.Contains("/collection/", StringComparison.Ordinal))
        {
            return Json("""{ "id": 1, "name": "Series", "parts": [{ "id": 1, "title": "Part", "poster_path": "/p.jpg", "release_date": "2001-01-01" }] }""");
        }

        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length >= 2 && segments[^2] == "movie" && int.TryParse(segments[^1], out var movieId))
        {
            return movieId switch
            {
                NotFoundId => Status(HttpStatusCode.NotFound),
                UnauthorizedId => Status(HttpStatusCode.Unauthorized),
                ServerErrorId => Status(HttpStatusCode.InternalServerError),
                NetworkFailureId => throw new HttpRequestException("connection refused (secret-host.internal)"),
                _ => Json($$"""{ "id": {{movieId}}, "title": "Movie {{movieId}}", "overview": "Overview", "release_date": "2020-01-01", "genres": [{ "id": 28, "name": "Action" }], "poster_path": "/p.jpg", "vote_average": 7.5, "credits": { "cast": [] }, "recommendations": { "results": [] } }"""),
            };
        }

        // Lists (trending, popular, top rated, search, discover): two movies per page.
        var query = System.Web.HttpUtility.ParseQueryString(request.RequestUri.Query);
        var page = int.TryParse(query["page"], out var parsedPage) ? Math.Max(parsedPage, 1) : 1;

        if (query["with_genres"] == "99999" || query["query"] == "nothing-matches")
        {
            return Json("""{ "page": 1, "total_pages": 0, "total_results": 0, "results": [] }""");
        }

        return Json($$"""
            { "page": {{page}}, "total_pages": 2, "total_results": 4, "results": [
              { "id": {{page * 10 + 1}}, "title": "Movie {{page * 10 + 1}}", "poster_path": "/a.jpg", "vote_average": 8.0 },
              { "id": {{page * 10 + 2}}, "title": "Movie {{page * 10 + 2}}", "poster_path": "/b.jpg", "vote_average": 7.0 } ] }
            """);
    }

    public static HttpResponseMessage Json(string json) =>
        new(HttpStatusCode.OK) { Content = new StringContent(json, Encoding.UTF8, "application/json") };

    public static HttpResponseMessage Status(HttpStatusCode code) =>
        new(code) { Content = new StringContent("""{ "status_message": "upstream secret detail", "success": false }""", Encoding.UTF8, "application/json") };
}
