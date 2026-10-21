using System.Net;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class MovieCatalogServiceTests
{
    [Fact]
    public async Task GetGenresAsync_maps_genres_and_uses_the_memory_cache()
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
        Assert.Equal(1, handler.RequestCount);
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

        await service.SearchAsync("arrival", null, 2, CancellationToken.None);
        await service.SearchAsync("arrival", null, 2, CancellationToken.None);
        await service.DiscoverAsync(878, 2016, 7.5, 2, CancellationToken.None);
        await service.DiscoverAsync(878, 2016, 7.5, 2, CancellationToken.None);

        Assert.Equal(4, handler.RequestCount);
    }

    [Theory]
    [InlineData(null, null, null, "sort_by=popularity.desc&page=1")]
    [InlineData(28, null, null, "sort_by=popularity.desc&page=1&with_genres=28")]
    [InlineData(null, 2020, 7.5, "sort_by=popularity.desc&page=1&primary_release_year=2020&vote_average.gte=7.5")]
    public async Task PickAsync_reuses_the_first_page_when_only_one_page_is_available_and_preserves_filters(int? genreId, int? year, double? minRating, string expectedQuery)
    {
        var handler = new GenreHttpMessageHandler("""
            { "page": 1, "total_pages": 1, "total_results": 1, "results": [{ "id": 7, "title": "Movie", "vote_average": 8.1 }] }
            """);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache, (min, _) => min);

        var result = await service.PickAsync(genreId, year, minRating, CancellationToken.None);

        Assert.Equal(7, result?.Id);
        Assert.Equal(1, handler.RequestCount);
        Assert.Equal("/3/discover/movie", handler.RequestUri?.AbsolutePath);
        Assert.Equal(expectedQuery, handler.RequestUri?.Query.TrimStart('?'));
    }

    [Fact]
    public async Task PickAsync_selects_a_non_first_movie_from_a_bounded_random_page()
    {
        var handler = new PickHttpMessageHandler(request => request.RequestUri!.Query.Split('&').Contains("page=1")
            ? """{ "page": 1, "total_pages": 50, "total_results": 1000, "results": [{ "id": 1, "title": "First page" }] }"""
            : """{ "page": 15, "total_pages": 50, "total_results": 1000, "results": [{ "id": 7, "title": "First candidate" }, { "id": 8, "title": "Selected" }] }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var randomCalls = new List<(int Min, int Max)>();
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache, (min, max) =>
        {
            randomCalls.Add((min, max));
            return max - 1;
        });

        var result = await service.PickAsync(28, 2020, 7.5, CancellationToken.None);

        Assert.Equal((8, "Selected"), (result?.Id, result?.Title));
        Assert.Equal([(1, 16), (0, 2)], randomCalls);
        Assert.Collection(
            handler.RequestUris,
            request => Assert.Equal("sort_by=popularity.desc&page=1&with_genres=28&primary_release_year=2020&vote_average.gte=7.5", request.Query.TrimStart('?')),
            request => Assert.Equal("sort_by=popularity.desc&page=15&with_genres=28&primary_release_year=2020&vote_average.gte=7.5", request.Query.TrimStart('?')));
    }

    [Fact]
    public async Task PickAsync_limits_page_selection_to_available_pages_when_fewer_than_the_bound_exist()
    {
        var handler = new PickHttpMessageHandler(request => request.RequestUri!.Query.Split('&').Contains("page=1")
            ? """{ "page": 1, "total_pages": 12, "total_results": 240, "results": [{ "id": 1, "title": "First page" }] }"""
            : """{ "page": 12, "total_pages": 12, "total_results": 240, "results": [{ "id": 12, "title": "Selected" }] }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var randomCalls = new List<(int Min, int Max)>();
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache, (min, max) =>
        {
            randomCalls.Add((min, max));
            return max - 1;
        });

        var result = await service.PickAsync(null, null, null, CancellationToken.None);

        Assert.Equal(12, result?.Id);
        Assert.Equal([(1, 13), (0, 1)], randomCalls);
        Assert.Equal("sort_by=popularity.desc&page=12", handler.RequestUris[1].Query.TrimStart('?'));
    }

    [Fact]
    public async Task PickAsync_returns_null_when_discover_has_no_candidates()
    {
        var handler = new GenreHttpMessageHandler("""{ "page": 1, "total_pages": 0, "total_results": 0, "results": [] }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache, (min, _) => min);

        var result = await service.PickAsync(null, null, null, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetDetailsAsync_uses_a_cache_key_per_movie_id()
    {
        var handler = new GenreHttpMessageHandler("""
            { "id": 7, "title": "Movie", "credits": { "cast": [] }, "recommendations": { "results": [] } }
            """);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache);

        var first = await service.GetDetailsAsync(7, CancellationToken.None);
        var second = await service.GetDetailsAsync(7, CancellationToken.None);
        await service.GetDetailsAsync(8, CancellationToken.None);

        Assert.Equal(7, first.Id);
        Assert.Equal(first, second);
        Assert.Equal(2, handler.RequestCount);
    }

    [Fact]
    public async Task GetSummaryAsync_uses_lightweight_movie_lookup_mapping_and_per_movie_cache()
    {
        var handler = new GenreHttpMessageHandler("""
            {
              "id": 7,
              "title": "Movie",
              "overview": "Summary",
              "release_date": "2026-08-15",
              "genres": [{ "id": 18, "name": "Drama" }],
              "poster_path": "/poster.jpg",
              "vote_average": 8.2
            }
            """);
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var service = new MovieCatalogService(new TmdbClient(httpClient), cache);

        var first = await service.GetSummaryAsync(7, CancellationToken.None);
        var second = await service.GetSummaryAsync(7, CancellationToken.None);

        Assert.Equal(first, second);
        Assert.Equal([18], first.GenreIds);
        Assert.Equal("https://image.tmdb.org/t/p/w780/poster.jpg", first.PosterUrl);
        Assert.Equal(1, handler.RequestCount);
        Assert.Equal("/3/movie/7", handler.RequestUri?.AbsolutePath);
        Assert.Equal(string.Empty, handler.RequestUri?.Query);
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

    private sealed class PickHttpMessageHandler(Func<HttpRequestMessage, string> responseFactory) : HttpMessageHandler
    {
        public List<Uri> RequestUris { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestUris.Add(request.RequestUri!);
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(responseFactory(request), Encoding.UTF8, "application/json")
            });
        }
    }
}
