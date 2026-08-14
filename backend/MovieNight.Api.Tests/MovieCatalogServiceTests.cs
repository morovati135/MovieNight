using System.Net;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class MovieCatalogServiceTests
{
    [Fact]
    public async Task GetGenresAsync_maps_genres()
    {
        var handler = new GenreHttpMessageHandler("""
            { "genres": [{ "id": 28, "name": "Action" }, { "id": 35, "name": "Comedy" }] }
            """);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache);

        var firstResult = await service.GetGenresAsync(CancellationToken.None);
        var secondResult = await service.GetGenresAsync(CancellationToken.None);

        Assert.Collection(
            firstResult,
            genre => Assert.Equal((28, "Action"), (genre.Id, genre.Name)),
            genre => Assert.Equal((35, "Comedy"), (genre.Id, genre.Name)));
        Assert.Equal(firstResult, secondResult);
        Assert.Equal(2, handler.RequestCount);
        Assert.Equal("/3/genre/movie/list", handler.RequestUri?.AbsolutePath);
    }

    [Theory]
    [InlineData("/3/trending/movie/week")]
    [InlineData("/3/movie/popular")]
    public async Task Trending_and_popular_map_results_and_use_the_memory_cache(string expectedPath)
    {
        var handler = new GenreHttpMessageHandler("""
            { "page": 1, "total_pages": 3, "total_results": 42, "results": [{ "id": 7, "title": "Movie", "vote_average": 8.1 }] }
            """);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache);

        var first = expectedPath.EndsWith("popular")
            ? await service.GetPopularAsync(CancellationToken.None)
            : await service.GetTrendingAsync(CancellationToken.None);
        var second = expectedPath.EndsWith("popular")
            ? await service.GetPopularAsync(CancellationToken.None)
            : await service.GetTrendingAsync(CancellationToken.None);

        Assert.Equal(7, Assert.Single(first.Results).Id);
        Assert.Equal(first, second);
        Assert.Equal(1, handler.RequestCount);
        Assert.Equal(expectedPath, handler.RequestUri?.AbsolutePath);
    }

    [Fact]
    public async Task Search_and_discover_do_not_use_the_memory_cache()
    {
        var handler = new GenreHttpMessageHandler("""
            { "page": 2, "total_pages": 3, "total_results": 42, "results": [] }
            """);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache);

        await service.SearchAsync("arrival", 2, CancellationToken.None);
        await service.SearchAsync("arrival", 2, CancellationToken.None);
        await service.DiscoverAsync(878, 2016, 7.5, 2, CancellationToken.None);
        await service.DiscoverAsync(878, 2016, 7.5, 2, CancellationToken.None);

        Assert.Equal(4, handler.RequestCount);
    }

    private sealed class GenreHttpMessageHandler(string json) : HttpMessageHandler
    {
        public int RequestCount { get; private set; }

        public Uri? RequestUri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestCount++;
            RequestUri = request.RequestUri;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            });
        }
    }
}
