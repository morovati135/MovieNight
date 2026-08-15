using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Data;

namespace MovieNight.Api.Features.Watchlists;

public enum WatchlistAddResult
{
    Added,
    AlreadyExists,
    CapacityReached
}

public sealed class WatchlistService(MovieNightDbContext dbContext)
{
    public const int MaximumItems = 50;

    public async Task<IReadOnlyList<WatchlistItem>> GetItemsAsync(
        Guid anonymousId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.WatchlistItems
            .AsNoTracking()
            .Where(item => item.AnonymousId == anonymousId)
            .OrderByDescending(item => item.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<WatchlistAddResult> AddAsync(
        Guid anonymousId,
        int movieId,
        CancellationToken cancellationToken = default)
    {
        var existingItem = await dbContext.WatchlistItems
            .SingleOrDefaultAsync(
                item => item.AnonymousId == anonymousId && item.MovieId == movieId,
                cancellationToken);

        if (existingItem is not null)
        {
            return WatchlistAddResult.AlreadyExists;
        }

        var itemCount = await dbContext.WatchlistItems
            .CountAsync(item => item.AnonymousId == anonymousId, cancellationToken);

        if (itemCount >= MaximumItems)
        {
            return WatchlistAddResult.CapacityReached;
        }

        var item = new WatchlistItem
        {
            Id = Guid.NewGuid(),
            AnonymousId = anonymousId,
            MovieId = movieId,
            CreatedAtUtc = DateTime.UtcNow
        };

        dbContext.WatchlistItems.Add(item);

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return WatchlistAddResult.Added;
        }
        catch (DbUpdateException)
        {
            dbContext.Entry(item).State = EntityState.Detached;

            var wasAddedByAnotherRequest = await dbContext.WatchlistItems
                .AnyAsync(
                    existing => existing.AnonymousId == anonymousId && existing.MovieId == movieId,
                    cancellationToken);

            if (wasAddedByAnotherRequest)
            {
                return WatchlistAddResult.AlreadyExists;
            }

            throw;
        }
    }

    public async Task RemoveAsync(
        Guid anonymousId,
        int movieId,
        CancellationToken cancellationToken = default)
    {
        var item = await dbContext.WatchlistItems.SingleOrDefaultAsync(
            item => item.AnonymousId == anonymousId && item.MovieId == movieId,
            cancellationToken);

        if (item is null)
        {
            return;
        }

        dbContext.WatchlistItems.Remove(item);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
