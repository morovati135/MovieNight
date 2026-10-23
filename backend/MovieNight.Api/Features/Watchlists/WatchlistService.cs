using Microsoft.EntityFrameworkCore;
using MovieNight.Api.Data;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Watchlists;

public sealed class WatchlistService(MovieNightDbContext dbContext, IMovieSummaryLookup movieSummaryLookup)
{
    public const int MaximumItems = 50;
    internal const int MaximumHydrationConcurrency = 4;

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

    public async Task<IReadOnlyList<MovieSummaryDto>> GetMoviesAsync(
        Guid anonymousId,
        CancellationToken cancellationToken = default)
    {
        var items = await GetItemsAsync(anonymousId, cancellationToken);
        using var concurrencyGate = new SemaphoreSlim(MaximumHydrationConcurrency);

        var lookups = items.Select(async item =>
        {
            await concurrencyGate.WaitAsync(cancellationToken);
            try
            {
                return await movieSummaryLookup.GetSummaryAsync(item.MovieId, cancellationToken);
            }
            catch (TmdbNotFoundException)
            {
                return null;
            }
            finally
            {
                concurrencyGate.Release();
            }
        });

        var movies = await Task.WhenAll(lookups);
        return movies.OfType<MovieSummaryDto>().ToArray();
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

        await movieSummaryLookup.GetSummaryAsync(movieId, cancellationToken);

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
