using System.Collections.Concurrent;
using System.Diagnostics.Metrics;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Caching;

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
