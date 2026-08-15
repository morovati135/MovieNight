using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Controllers;
using MovieNight.Api.Data;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Features.Watchlists;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class WatchlistControllerTests
{
    [Fact]
    public async Task Get_returns_hydrated_movie_summaries_and_establishes_anonymous_identity()
    {
        await using var database = await CreateDatabaseAsync();
        await using var context = database.CreateContext();
        var controller = CreateController(
            new WatchlistService(context, new StubMovieSummaryLookup()),
            new AnonymousVisitorIdentityService(new EphemeralDataProtectionProvider()));

        var result = await controller.Get(CancellationToken.None);

        var movies = Assert.IsAssignableFrom<IReadOnlyList<MovieSummaryDto>>(
            Assert.IsType<OkObjectResult>(result.Result).Value);
        Assert.Empty(movies);
        Assert.Single(controller.HttpContext.Response.Headers.SetCookie);
    }

    [Fact]
    public async Task Post_and_delete_are_idempotent_and_return_no_content()
    {
        await using var database = await CreateDatabaseAsync();
        await using var context = database.CreateContext();
        var anonymousId = Guid.NewGuid();
        var lookup = new StubMovieSummaryLookup();
        var controller = CreateController(
            new WatchlistService(context, lookup),
            new FixedAnonymousVisitorIdentityService(anonymousId));

        var firstAdd = await controller.Add(7, CancellationToken.None);
        var duplicateAdd = await controller.Add(7, CancellationToken.None);
        var firstDelete = await controller.Remove(7, CancellationToken.None);
        var missingDelete = await controller.Remove(7, CancellationToken.None);

        Assert.IsType<NoContentResult>(firstAdd);
        Assert.IsType<NoContentResult>(duplicateAdd);
        Assert.IsType<NoContentResult>(firstDelete);
        Assert.IsType<NoContentResult>(missingDelete);
        Assert.Equal(1, lookup.RequestCount);
        Assert.Empty(await context.WatchlistItems.ToListAsync());
    }

    [Fact]
    public async Task Post_returns_not_found_for_an_unknown_new_movie_without_persisting_it()
    {
        await using var database = await CreateDatabaseAsync();
        await using var context = database.CreateContext();
        var controller = CreateController(
            new WatchlistService(context, new StubMovieSummaryLookup(new TmdbNotFoundException())),
            new FixedAnonymousVisitorIdentityService(Guid.NewGuid()));

        var result = await controller.Add(404, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status404NotFound, problem.StatusCode);
        Assert.Equal("Movie not found.", Assert.IsType<ProblemDetails>(problem.Value).Title);
        Assert.Empty(await context.WatchlistItems.ToListAsync());
    }

    [Fact]
    public async Task Post_returns_conflict_when_a_new_add_exceeds_capacity_without_calling_movie_lookup()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using (var setupContext = database.CreateContext())
        {
            setupContext.WatchlistItems.AddRange(Enumerable.Range(1, WatchlistService.MaximumItems).Select(movieId => new WatchlistItem
            {
                Id = Guid.NewGuid(),
                AnonymousId = anonymousId,
                MovieId = movieId,
                CreatedAtUtc = DateTime.UtcNow
            }));
            await setupContext.SaveChangesAsync();
        }

        await using var context = database.CreateContext();
        var lookup = new StubMovieSummaryLookup();
        var controller = CreateController(
            new WatchlistService(context, lookup),
            new FixedAnonymousVisitorIdentityService(anonymousId));

        var result = await controller.Add(51, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status409Conflict, problem.StatusCode);
        Assert.Equal(0, lookup.RequestCount);
        Assert.Equal(WatchlistService.MaximumItems, await context.WatchlistItems.CountAsync());
    }

    [Fact]
    public async Task Get_returns_safe_bad_gateway_problem_for_general_tmdb_failure()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using (var setupContext = database.CreateContext())
        {
            setupContext.WatchlistItems.Add(new WatchlistItem
            {
                Id = Guid.NewGuid(),
                AnonymousId = anonymousId,
                MovieId = 7,
                CreatedAtUtc = DateTime.UtcNow
            });
            await setupContext.SaveChangesAsync();
        }

        await using var context = database.CreateContext();
        var controller = CreateController(
            new WatchlistService(context, new StubMovieSummaryLookup(new TmdbUpstreamException("internal"))),
            new FixedAnonymousVisitorIdentityService(anonymousId));

        var result = await controller.Get(CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result.Result);
        Assert.Equal(StatusCodes.Status502BadGateway, problem.StatusCode);
        var details = Assert.IsType<ProblemDetails>(problem.Value);
        Assert.Equal("TMDB is unavailable.", details.Title);
        Assert.DoesNotContain("internal", details.Detail, StringComparison.OrdinalIgnoreCase);
    }

    private static WatchlistController CreateController(
        WatchlistService service,
        IAnonymousVisitorIdentityService identityService) => new(service, identityService)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

    private static async Task<SqliteWatchlistDatabase> CreateDatabaseAsync()
    {
        var connection = new SqliteConnection("Data Source=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<MovieNightDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var context = new MovieNightDbContext(options);
        await context.Database.EnsureCreatedAsync();
        return new SqliteWatchlistDatabase(connection, options);
    }

    private sealed class StubMovieSummaryLookup(Exception? exception = null) : IMovieSummaryLookup
    {
        public int RequestCount { get; private set; }

        public Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken)
        {
            RequestCount++;
            return exception is null
                ? Task.FromResult(new MovieSummaryDto(movieId, $"Movie {movieId}", null, null, [], null, 0))
                : Task.FromException<MovieSummaryDto>(exception);
        }
    }

    private sealed class FixedAnonymousVisitorIdentityService(Guid anonymousId) : IAnonymousVisitorIdentityService
    {
        public Guid GetOrCreate(HttpContext context) => anonymousId;
    }

    private sealed class SqliteWatchlistDatabase(
        SqliteConnection connection,
        DbContextOptions<MovieNightDbContext> options) : IAsyncDisposable
    {
        public MovieNightDbContext CreateContext() => new(options);

        public ValueTask DisposeAsync() => connection.DisposeAsync();
    }
}
