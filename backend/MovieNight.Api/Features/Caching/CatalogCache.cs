using System.Collections.Concurrent;
using System.Diagnostics.Metrics;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Caching;

/// <summary>
/// How long each category of TMDB data may be served from memory. Longer lifetimes are faster (a cold TMDB
/// call costs 0.5-5 s, a cached one about 2 ms), so each is as long as the data's rate of change allows.
/// </summary>
public static class CacheTtl
{
    /// <summary>Genre names effectively never change.</summary>
    public static readonly TimeSpan Genres = TimeSpan.FromHours(24);

    /// <summary>Curated collections and their pages change only when TMDB reorders a studio or franchise.</summary>
    public static readonly TimeSpan Collections = TimeSpan.FromHours(12);

    /// <summary>The all-time top rated list barely moves.</summary>
    public static readonly TimeSpan TopRated = TimeSpan.FromHours(6);

    /// <summary>Movie details and summaries: only vote counts and ratings drift.</summary>
    public static readonly TimeSpan Movie = TimeSpan.FromHours(2);

    /// <summary>Trending and popular are recomputed by TMDB over hours, not seconds.</summary>
    public static readonly TimeSpan Trending = TimeSpan.FromMinutes(30);

    /// <summary>Discover results (genre, year, rating) shift slowly; Home genre switching repeats them.</summary>
    public static readonly TimeSpan Discover = TimeSpan.FromMinutes(15);

    /// <summary>A movie id TMDB does not know: short, so a newly added movie appears soon.</summary>
    public static readonly TimeSpan NotFound = TimeSpan.FromMinutes(1);
}

/// <summary>
/// The one place MovieNight caches TMDB-derived data. It stores only MovieNight DTOs, never TMDB transport
/// models, and adds what <see cref="IMemoryCache"/> alone does not:
/// concurrent requests for the same missing key share one TMDB call; each entry counts as size 1 so the
/// cache's <c>SizeLimit</c> bounds memory; an unknown movie id is remembered briefly; TMDB failures are
/// never cached; hits and misses are counted.
/// </summary>
public sealed class CatalogCache(IMemoryCache cache, ILogger<CatalogCache>? logger = null)
{
    public const string MeterName = "MovieNight.Cache";

    private static readonly Meter Meter = new(MeterName);
    private static readonly Counter<long> Hits = Meter.CreateCounter<long>("movienight.cache.hits");
    private static readonly Counter<long> Misses = Meter.CreateCounter<long>("movienight.cache.misses");
    private static readonly Counter<long> Joined = Meter.CreateCounter<long>("movienight.cache.joined");

    private sealed class NotFoundMarker;

    private static readonly NotFoundMarker NotFound = new();

    private readonly ILogger logger = (ILogger?)logger ?? NullLogger.Instance;
    private readonly ConcurrentDictionary<string, Lazy<Task<object>>> inFlight = new();

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        TimeSpan ttl,
        Func<CancellationToken, Task<T>> create,
        CancellationToken cancellationToken,
        bool rememberNotFound = false)
        where T : class
    {
        if (cache.TryGetValue(key, out object? existing))
        {
            Hits.Add(1, new KeyValuePair<string, object?>("group", Group(key)));
            logger.LogDebug("Cache hit {Key}", key);

            return existing is NotFoundMarker ? throw new TmdbNotFoundException() : (T)existing!;
        }

        var created = false;
        var lazy = inFlight.GetOrAdd(key, _ => new Lazy<Task<object>>(() =>
        {
            created = true;
            return LoadAsync(key, ttl, create, rememberNotFound);
        }));
        var task = lazy.Value;

        if (created)
        {
            Misses.Add(1, new KeyValuePair<string, object?>("group", Group(key)));
            logger.LogDebug("Cache miss {Key}", key);
        }
        else
        {
            Joined.Add(1, new KeyValuePair<string, object?>("group", Group(key)));
            logger.LogDebug("Cache miss joined an in-flight load {Key}", key);
        }

        // Callers wait on their own token, but the shared load is not cancelled by any single caller.
        return (T)await task.WaitAsync(cancellationToken);
    }

    private async Task<object> LoadAsync<T>(string key, TimeSpan ttl, Func<CancellationToken, Task<T>> create, bool rememberNotFound)
        where T : class
    {
        try
        {
            var value = await create(CancellationToken.None);

            Store(key, value, ttl);
            return value;
        }
        catch (TmdbNotFoundException) when (rememberNotFound)
        {
            Store(key, NotFound, CacheTtl.NotFound);
            throw;
        }
        finally
        {
            inFlight.TryRemove(key, out _);
        }
    }

    private void Store(string key, object value, TimeSpan ttl) =>
        cache.Set(key, value, new MemoryCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl, Size = 1 });

    // "movies:details:5" -> "movies:details"; keeps metric tags low-cardinality.
    private static string Group(string key)
    {
        var parts = key.Split(':');

        return parts.Length > 2 ? $"{parts[0]}:{parts[1]}" : key;
    }
}
