using System.Net.Http.Headers;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MovieNight.Api.Data;
using MovieNight.Api.Features.Collections;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Watchlists;
using MovieNight.Api.Integrations.Tmdb;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info = new()
        {
            Title = "MovieNight API",
            Version = "v1",
            Description = "Movie discovery and anonymous watchlist API."
        };

        return Task.CompletedTask;
    });
});

builder.Services.AddMemoryCache();

Directory.CreateDirectory(Path.Combine(builder.Environment.ContentRootPath, "App_Data"));

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "App_Data", "DataProtection-Keys")))
    .SetApplicationName("MovieNight");

var databaseConnectionString = builder.Configuration.GetConnectionString("MovieNightDatabase")
    ?? throw new InvalidOperationException("Connection string 'MovieNightDatabase' is required.");

builder.Services.AddDbContext<MovieNightDbContext>(options =>
    options.UseSqlite(databaseConnectionString));

builder.Services.AddOptions<TmdbOptions>().BindConfiguration(TmdbOptions.SectionName)
    .Validate(
        options => Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out var baseUrl) && baseUrl.Scheme == Uri.UriSchemeHttps,
        "Tmdb:BaseUrl must be an absolute HTTPS URL.")
    .Validate(
        options => !string.IsNullOrWhiteSpace(options.ReadAccessToken),
        "TMDB configuration is missing. Set Tmdb__ReadAccessToken through a local environment variable or user secret.")
    .ValidateOnStart();

builder.Services.AddHttpClient<TmdbClient>((serviceProvider, client) =>
{
    var options = serviceProvider.GetRequiredService<IOptions<TmdbOptions>>().Value;

    client.BaseAddress = new Uri(options.BaseUrl, UriKind.Absolute);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.ReadAccessToken);
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddScoped<MovieCatalogService>();
builder.Services.AddScoped<MovieCollectionService>();
builder.Services.AddScoped<IMovieSummaryLookup>(serviceProvider => serviceProvider.GetRequiredService<MovieCatalogService>());

builder.Services.AddScoped<IAnonymousVisitorIdentityService, AnonymousVisitorIdentityService>();

builder.Services.AddScoped<WatchlistService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000");
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options
        .WithTitle("MovieNight API Reference")
        .WithTheme(ScalarTheme.BluePlanet));
}

app.UseCors();

app.MapControllers();

app.Run();
