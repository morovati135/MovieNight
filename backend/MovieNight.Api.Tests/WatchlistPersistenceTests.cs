using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Data;
using MovieNight.Api.Features.Watchlists;

namespace MovieNight.Api.Tests;

public sealed class WatchlistPersistenceTests
{
    [Fact]
    public async Task GetItemsAsync_returns_only_the_visitors_items_newest_first()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        var otherAnonymousId = Guid.NewGuid();
        await using (var setupContext = database.CreateContext())
        {
            setupContext.WatchlistItems.AddRange(
                CreateItem(anonymousId, 10, new DateTime(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc)),
                CreateItem(anonymousId, 20, new DateTime(2026, 8, 15, 11, 0, 0, DateTimeKind.Utc)),
                CreateItem(otherAnonymousId, 30, new DateTime(2026, 8, 15, 12, 0, 0, DateTimeKind.Utc)));
            await setupContext.SaveChangesAsync();
        }

        await using var context = database.CreateContext();
        var service = new WatchlistService(context);

        var items = await service.GetItemsAsync(anonymousId);

        Assert.Equal([20, 10], items.Select(item => item.MovieId));
    }

    [Fact]
    public async Task AddAsync_is_idempotent_for_duplicates()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using var context = database.CreateContext();
        var service = new WatchlistService(context);

        var firstResult = await service.AddAsync(anonymousId, 123);
        var duplicateResult = await service.AddAsync(anonymousId, 123);

        Assert.Equal(WatchlistAddResult.Added, firstResult);
        Assert.Equal(WatchlistAddResult.AlreadyExists, duplicateResult);
        Assert.Equal(1, await context.WatchlistItems.CountAsync());
    }

    [Fact]
    public async Task AddAsync_rejects_new_items_when_the_watchlist_has_fifty_items()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using (var setupContext = database.CreateContext())
        {
            setupContext.WatchlistItems.AddRange(
                Enumerable.Range(1, WatchlistService.MaximumItems)
                    .Select(movieId => CreateItem(anonymousId, movieId, DateTime.UtcNow)));
            await setupContext.SaveChangesAsync();
        }

        await using var context = database.CreateContext();
        var service = new WatchlistService(context);

        var result = await service.AddAsync(anonymousId, 51);

        Assert.Equal(WatchlistAddResult.CapacityReached, result);
        Assert.Equal(WatchlistService.MaximumItems, await context.WatchlistItems.CountAsync());
    }

    [Fact]
    public async Task RemoveAsync_is_idempotent_for_missing_items()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using var context = database.CreateContext();
        var service = new WatchlistService(context);

        await service.RemoveAsync(anonymousId, 123);
        await service.RemoveAsync(anonymousId, 123);

        Assert.Empty(await context.WatchlistItems.ToListAsync());
    }

    [Fact]
    public async Task SQLite_unique_constraint_rejects_duplicate_items_outside_the_service_path()
    {
        await using var database = await CreateDatabaseAsync();
        var anonymousId = Guid.NewGuid();
        await using (var firstContext = database.CreateContext())
        {
            firstContext.WatchlistItems.Add(CreateItem(anonymousId, 123, DateTime.UtcNow));
            await firstContext.SaveChangesAsync();
        }

        await using var duplicateContext = database.CreateContext();
        duplicateContext.WatchlistItems.Add(CreateItem(anonymousId, 123, DateTime.UtcNow));

        await Assert.ThrowsAsync<DbUpdateException>(() => duplicateContext.SaveChangesAsync());
    }

    private static WatchlistItem CreateItem(Guid anonymousId, int movieId, DateTime createdAtUtc) => new()
    {
        Id = Guid.NewGuid(),
        AnonymousId = anonymousId,
        MovieId = movieId,
        CreatedAtUtc = createdAtUtc
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

    private sealed class SqliteWatchlistDatabase(SqliteConnection connection, DbContextOptions<MovieNightDbContext> options) : IAsyncDisposable
    {
        public MovieNightDbContext CreateContext() => new(options);

        public ValueTask DisposeAsync() => connection.DisposeAsync();
    }
}
