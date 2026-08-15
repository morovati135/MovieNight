using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Data;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Features.Watchlists;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class WatchlistServiceTests
{
    [Fact]
    public async Task AddAsync_validates_only_a_genuinely_new_movie()
    {
        await using var database = await CreateDatabaseAsync();
        await using var context = database.CreateContext();
        var lookup = new RecordingMovieSummaryLookup();
        var service = new WatchlistService(context, lookup);
        var anonymousId = Guid.NewGuid();

        var first = await service.AddAsync(anonymousId, 7);
        var duplicate = await service.AddAsync(anonymousId, 7);

        Assert.Equal(WatchlistAddResult.Added, first);
        Assert.Equal(WatchlistAddResult.AlreadyExists, duplicate);
        Assert.Equal([7], lookup.RequestedMovieIds);
    }

    [Fact]
    public async Task AddAsync_does_not_persist_a_movie_that_cannot_be_validated()
    {
        await using var database = await CreateDatabaseAsync();
        await using var context = database.CreateContext();
        var lookup = new RecordingMovieSummaryLookup((_, _) => throw new TmdbNotFoundException());
        var service = new WatchlistService(context, lookup);

        await Assert.ThrowsAsync<TmdbNotFoundException>(() => service.AddAsync(Guid.NewGuid(), 404));

        Assert.Empty(await context.WatchlistItems.ToListAsync());
    }

    [Fact]
    public async Task GetMoviesAsync_preserves_order_skips_only_not_found_movies_and_bounds_concurrency()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using (var setupContext = database.CreateContext())
        {
            setupContext.WatchlistItems.AddRange(Enumerable.Range(1, 8).Select(movieId => new WatchlistItem
            {
                Id = Guid.NewGuid(),
                AnonymousId = anonymousId,
                MovieId = movieId,
                CreatedAtUtc = new DateTime(2026, 8, 15, movieId, 0, 0, DateTimeKind.Utc)
            }));
            await setupContext.SaveChangesAsync();
        }

        var activeLookups = 0;
        var maximumConcurrentLookups = 0;
        var firstWaveStarted = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var releaseLookups = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var lookup = new RecordingMovieSummaryLookup(async (movieId, cancellationToken) =>
        {
            var active = Interlocked.Increment(ref activeLookups);
            UpdateMaximum(ref maximumConcurrentLookups, active);
            if (active == WatchlistService.MaximumHydrationConcurrency)
            {
                firstWaveStarted.TrySetResult();
            }

            try
            {
                await releaseLookups.Task.WaitAsync(cancellationToken);
                return movieId == 5
                    ? throw new TmdbNotFoundException()
                    : CreateSummary(movieId);
            }
            finally
            {
                Interlocked.Decrement(ref activeLookups);
            }
        });
        await using var context = database.CreateContext();
        var service = new WatchlistService(context, lookup);

        var getMovies = service.GetMoviesAsync(anonymousId);
        await firstWaveStarted.Task.WaitAsync(TimeSpan.FromSeconds(5));

        Assert.Equal(WatchlistService.MaximumHydrationConcurrency, Volatile.Read(ref activeLookups));
        Assert.Equal(WatchlistService.MaximumHydrationConcurrency, lookup.RequestedMovieIds.Count);
        Assert.False(getMovies.IsCompleted);

        releaseLookups.SetResult();
        var movies = await getMovies;

        Assert.Equal([8, 7, 6, 4, 3, 2, 1], movies.Select(movie => movie.Id));
        Assert.Equal(WatchlistService.MaximumHydrationConcurrency, maximumConcurrentLookups);
        Assert.Equal(8, lookup.RequestedMovieIds.Count);
        Assert.Equal(8, await context.WatchlistItems.CountAsync());
    }

    [Fact]
    public async Task GetMoviesAsync_propagates_general_upstream_failures_instead_of_returning_partial_results()
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

        var lookup = new RecordingMovieSummaryLookup((_, _) => throw new TmdbUpstreamException("Unavailable"));
        await using var context = database.CreateContext();
        var service = new WatchlistService(context, lookup);

        await Assert.ThrowsAsync<TmdbUpstreamException>(() => service.GetMoviesAsync(anonymousId));
    }

    private static void UpdateMaximum(ref int maximum, int candidate)
    {
        var observed = Volatile.Read(ref maximum);
        while (candidate > observed)
        {
            var original = Interlocked.CompareExchange(ref maximum, candidate, observed);
            if (original == observed)
            {
                return;
            }

            observed = original;
        }
    }

    private static MovieSummaryDto CreateSummary(int movieId) =>
        new(movieId, $"Movie {movieId}", null, null, [], null, 0);

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

    private sealed class RecordingMovieSummaryLookup(
        Func<int, CancellationToken, Task<MovieSummaryDto>>? response = null) : IMovieSummaryLookup
    {
        private readonly object sync = new();

        public List<int> RequestedMovieIds { get; } = [];

        public Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken)
        {
            lock (sync)
            {
                RequestedMovieIds.Add(movieId);
            }

            return response?.Invoke(movieId, cancellationToken) ?? Task.FromResult(CreateSummary(movieId));
        }
    }

    private sealed class SqliteWatchlistDatabase(
        SqliteConnection connection,
        DbContextOptions<MovieNightDbContext> options) : IAsyncDisposable
    {
        public MovieNightDbContext CreateContext() => new(options);

        public ValueTask DisposeAsync() => connection.DisposeAsync();
    }
}
