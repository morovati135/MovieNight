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
public sealed class ApiHost(string environment = "Production", IReadOnlyDictionary<string, string?>? settings = null) : WebApplicationFactory<Program>
{
    private readonly DirectoryInfo directory = Directory.CreateTempSubdirectory("movienight-api-");

    public FakeTmdb Tmdb { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(environment);
        builder.UseContentRoot(directory.FullName);
        builder.UseSetting("Tmdb:ReadAccessToken", FakeTmdb.Token);
        builder.UseSetting("ConnectionStrings:MovieNightDatabase", $"Data Source={Path.Combine(directory.FullName, "test.db")};Pooling=False");
        foreach (var (key, value) in settings ?? new Dictionary<string, string?>())
        {
            builder.UseSetting(key, value);
        }

        builder.ConfigureTestServices(services =>
            services.AddHttpClient<TmdbClient>().ConfigurePrimaryHttpMessageHandler(() => Tmdb));
    }

    /// <summary>A client with its own cookie jar: one anonymous browser.</summary>
    public HttpClient CreateBrowser() => CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });

    public static async Task<ApiHost> StartAsync(string environment = "Production", IReadOnlyDictionary<string, string?>? settings = null)
    {
        var host = new ApiHost(environment, settings);

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
