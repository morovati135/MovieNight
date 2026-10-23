using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Caching;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class CatalogCacheTests
{
    private static MemoryCache NewMemoryCache(long sizeLimit = 100) => new(new MemoryCacheOptions { SizeLimit = sizeLimit });

    [Fact]
    public async Task Returns_the_cached_value_until_it_expires()
    {
        using var memory = NewMemoryCache();
        var cache = new CatalogCache(memory);
        var calls = 0;
        Task<string> Create(CancellationToken _) => Task.FromResult($"value-{++calls}");

        var first = await cache.GetOrCreateAsync("k", TimeSpan.FromMilliseconds(80), Create, CancellationToken.None);
        var second = await cache.GetOrCreateAsync("k", TimeSpan.FromMilliseconds(80), Create, CancellationToken.None);
        await Task.Delay(200);
        var third = await cache.GetOrCreateAsync("k", TimeSpan.FromMilliseconds(80), Create, CancellationToken.None);

        Assert.Equal("value-1", first);
        Assert.Equal("value-1", second);
        Assert.Equal("value-2", third);
    }

    [Fact]
    public async Task Concurrent_misses_for_the_same_key_share_one_load()
    {
        using var memory = NewMemoryCache();
        var cache = new CatalogCache(memory);
        var release = new TaskCompletionSource();
        var calls = 0;

        async Task<string> Create(CancellationToken _)
        {
            Interlocked.Increment(ref calls);
            await release.Task;
            return "shared";
        }

        var requests = Enumerable.Range(0, 10)
            .Select(_ => cache.GetOrCreateAsync("k", TimeSpan.FromMinutes(1), Create, CancellationToken.None))
            .ToArray();
        release.SetResult();
        var results = await Task.WhenAll(requests);

        Assert.All(results, result => Assert.Equal("shared", result));
        Assert.Equal(1, calls);
    }

    [Fact]
    public async Task A_caller_cancelling_does_not_cancel_the_shared_load()
    {
        using var memory = NewMemoryCache();
        var cache = new CatalogCache(memory);
        var release = new TaskCompletionSource();

        async Task<string> Create(CancellationToken _)
        {
            await release.Task;
            return "done";
        }

        using var cancellation = new CancellationTokenSource();
        var cancelled = cache.GetOrCreateAsync("k", TimeSpan.FromMinutes(1), Create, cancellation.Token);
        var patient = cache.GetOrCreateAsync("k", TimeSpan.FromMinutes(1), Create, CancellationToken.None);

        cancellation.Cancel();
        release.SetResult();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => cancelled);
        Assert.Equal("done", await patient);
    }

    [Fact]
    public async Task Failures_are_not_cached()
    {
        using var memory = NewMemoryCache();
        var cache = new CatalogCache(memory);
        var calls = 0;

        Task<string> Create(CancellationToken _) =>
            ++calls == 1 ? throw new TmdbUpstreamException("boom") : Task.FromResult("recovered");

        await Assert.ThrowsAsync<TmdbUpstreamException>(() =>
            cache.GetOrCreateAsync("k", TimeSpan.FromMinutes(1), Create, CancellationToken.None));
        var result = await cache.GetOrCreateAsync("k", TimeSpan.FromMinutes(1), Create, CancellationToken.None);

        Assert.Equal("recovered", result);
        Assert.Equal(2, calls);
    }

    [Fact]
    public async Task An_unknown_movie_is_remembered_only_when_requested()
    {
        using var memory = NewMemoryCache();
        var cache = new CatalogCache(memory);
        var remembered = 0;
        var forgotten = 0;

        Task<string> Missing(ref int counter) => throw new TmdbNotFoundException();

        for (var attempt = 0; attempt < 2; attempt++)
        {
            await Assert.ThrowsAsync<TmdbNotFoundException>(() =>
                cache.GetOrCreateAsync<string>("remembered", TimeSpan.FromMinutes(1), _ => { remembered++; return Missing(ref remembered); }, CancellationToken.None, rememberNotFound: true));
            await Assert.ThrowsAsync<TmdbNotFoundException>(() =>
                cache.GetOrCreateAsync<string>("forgotten", TimeSpan.FromMinutes(1), _ => { forgotten++; return Missing(ref forgotten); }, CancellationToken.None));
        }

        Assert.Equal(1, remembered);
        Assert.Equal(2, forgotten);
    }

    [Fact]
    public async Task The_size_limit_bounds_the_number_of_entries()
    {
        using var memory = NewMemoryCache(sizeLimit: 3);
        var cache = new CatalogCache(memory);

        for (var index = 0; index < 20; index++)
        {
            await cache.GetOrCreateAsync($"k{index}", TimeSpan.FromMinutes(1), _ => Task.FromResult("v"), CancellationToken.None);
        }

        Assert.True(memory.Count <= 3, $"Cache held {memory.Count} entries.");
    }
}
