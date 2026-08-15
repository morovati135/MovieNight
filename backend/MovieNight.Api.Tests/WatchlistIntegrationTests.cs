using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Data;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Features.Watchlists;

namespace MovieNight.Api.Tests;

public sealed class WatchlistIntegrationTests
{
    [Fact]
    public async Task Returning_browser_is_isolated_and_retains_hydrated_watchlist_after_database_and_identity_restart()
    {
        var testDirectory = Directory.CreateTempSubdirectory("movienight-watchlist-");
        var databasePath = Path.Combine(testDirectory.FullName, "watchlist.db");
        var keysPath = Directory.CreateDirectory(Path.Combine(testDirectory.FullName, "keys"));

        try
        {
            var firstIdentityService = CreateIdentityService(keysPath);
            var firstBrowser = new DefaultHttpContext();
            var firstAnonymousId = firstIdentityService.GetOrCreate(firstBrowser);
            var firstBrowserCookie = GetCookiePair(firstBrowser);

            var secondBrowser = new DefaultHttpContext();
            var secondAnonymousId = firstIdentityService.GetOrCreate(secondBrowser);

            Assert.NotEqual(firstAnonymousId, secondAnonymousId);

            var options = CreateOptions(databasePath);
            await using (var firstApplicationContext = new MovieNightDbContext(options))
            {
                await firstApplicationContext.Database.MigrateAsync();
                var service = new WatchlistService(firstApplicationContext, new SuccessfulMovieSummaryLookup());
                Assert.Equal(WatchlistAddResult.Added, await service.AddAsync(firstAnonymousId, 7));
                Assert.Equal(WatchlistAddResult.Added, await service.AddAsync(secondAnonymousId, 8));
            }

            var restartedIdentityService = CreateIdentityService(keysPath);
            var returningBrowser = new DefaultHttpContext();
            returningBrowser.Request.Headers.Cookie = firstBrowserCookie;
            var returningAnonymousId = restartedIdentityService.GetOrCreate(returningBrowser);

            Assert.Equal(firstAnonymousId, returningAnonymousId);
            Assert.Equal(0, returningBrowser.Response.Headers.SetCookie.Count);

            await using (var restartedApplicationContext = new MovieNightDbContext(CreateOptions(databasePath)))
            {
                var restartedService = new WatchlistService(restartedApplicationContext, new SuccessfulMovieSummaryLookup());
                var movies = await restartedService.GetMoviesAsync(returningAnonymousId);

                var movie = Assert.Single(movies);
                Assert.Equal((7, "Movie 7"), (movie.Id, movie.Title));
                Assert.DoesNotContain(movies, candidate => candidate.Id == 8);
            }
        }
        finally
        {
            testDirectory.Delete(recursive: true);
        }
    }

    private static AnonymousVisitorIdentityService CreateIdentityService(DirectoryInfo keysPath) =>
        new(DataProtectionProvider.Create(keysPath, builder => builder.SetApplicationName("MovieNight")));

    private static DbContextOptions<MovieNightDbContext> CreateOptions(string databasePath) =>
        new DbContextOptionsBuilder<MovieNightDbContext>()
            .UseSqlite($"Data Source={databasePath};Pooling=False")
            .Options;

    private static string GetCookiePair(DefaultHttpContext context)
    {
        var setCookie = Assert.Single(context.Response.Headers.SetCookie)
            ?? throw new InvalidOperationException("The anonymous identity cookie was not issued.");
        return setCookie.Split(';', 2)[0];
    }

    private sealed class SuccessfulMovieSummaryLookup : IMovieSummaryLookup
    {
        public Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken) =>
            Task.FromResult(new MovieSummaryDto(movieId, $"Movie {movieId}", null, null, [], null, 0));
    }
}
