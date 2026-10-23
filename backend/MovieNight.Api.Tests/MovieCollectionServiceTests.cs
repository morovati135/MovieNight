using MovieNight.Api.Features.Caching;
using System.Net;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Collections;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class MovieCollectionServiceTests
{
    [Fact]
    public async Task GetCollectionsAsync_builds_each_curated_collection_from_its_tmdb_source()
    {
        var handler = new RoutingHandler(request =>
        {
            var path = request.RequestUri!.AbsolutePath;
            var query = request.RequestUri.Query;

            if (path.StartsWith("/3/collection/", StringComparison.Ordinal))
            {
                // Out of release order, with an unreleased entry: posters must follow release order.
                return (HttpStatusCode.OK, """
                    { "id": 1, "parts": [
                      { "id": 3, "title": "Third", "release_date": "2010-01-01", "poster_path": "/c.jpg" },
                      { "id": 9, "title": "Upcoming", "release_date": "", "poster_path": "/z.jpg" },
                      { "id": 1, "title": "First", "release_date": "2001-01-01", "poster_path": "/a.jpg" },
                      { "id": 2, "title": "Second", "release_date": "2005-01-01", "poster_path": "/b.jpg" }
                    ] }
                    """);
            }

            if (path == "/3/discover/movie" && (query.Contains("with_companies=") || query.Contains("with_genres=")))
            {
                return (HttpStatusCode.OK, """
                    { "page": 1, "total_pages": 1, "total_results": 2, "results": [
                      { "id": 5, "title": "Popular", "poster_path": "/p.jpg" },
                      { "id": 6, "title": "No poster" }
                    ] }
                    """);
            }

            return (HttpStatusCode.NotFound, "{}");
        });
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var service = new MovieCollectionService(new TmdbClient(httpClient), new CatalogCache(cache));

        var collections = await service.GetCollectionsAsync(CancellationToken.None);
        var again = await service.GetCollectionsAsync(CancellationToken.None);

        Assert.Equal(MovieCollectionCatalog.All.Select(definition => definition.Slug), collections.Select(collection => collection.Slug));
        var franchise = collections.Single(collection => collection.Slug == "harry-potter");
        Assert.Equal(
            ["https://image.tmdb.org/t/p/w780/a.jpg", "https://image.tmdb.org/t/p/w780/b.jpg", "https://image.tmdb.org/t/p/w780/c.jpg"],
            franchise.PosterUrls);
        Assert.Equal(["https://image.tmdb.org/t/p/w780/p.jpg"], collections.Single(collection => collection.Slug == "marvel").PosterUrls);
        Assert.Contains(handler.RequestUris, uri => uri.Query.Contains("with_companies=9993|128064|429") || uri.Query.Contains("with_companies=9993%7C128064%7C429"));
        Assert.Contains(handler.RequestUris, uri => uri.Query.Contains("with_genres=10402"));
        Assert.Same(collections, again);
        Assert.Equal(MovieCollectionCatalog.All.Count, handler.RequestUris.Count);
    }

    [Fact]
    public async Task GetCollectionsAsync_leaves_out_collections_tmdb_cannot_load()
    {
        var handler = new RoutingHandler(request =>
            request.RequestUri!.AbsolutePath == "/3/collection/1241"
                ? (HttpStatusCode.OK, """{ "id": 1241, "parts": [{ "id": 1, "title": "Stone", "release_date": "2001-11-16", "poster_path": "/hp.jpg" }] }""")
                : (HttpStatusCode.InternalServerError, "{}"));
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var service = new MovieCollectionService(new TmdbClient(httpClient), new CatalogCache(cache));

        var collections = await service.GetCollectionsAsync(CancellationToken.None);

        Assert.Equal("harry-potter", Assert.Single(collections).Slug);
    }

    [Fact]
    public async Task GetCollectionsAsync_reports_tmdb_failure_when_no_collection_loads()
    {
        var handler = new RoutingHandler(_ => (HttpStatusCode.InternalServerError, "{}"));
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var service = new MovieCollectionService(new TmdbClient(httpClient), new CatalogCache(cache));

        await Assert.ThrowsAsync<TmdbUpstreamException>(() => service.GetCollectionsAsync(CancellationToken.None));
    }

    [Fact]
    public async Task GetCollectionMoviesAsync_pages_studio_collections_and_returns_franchises_as_one_page()
    {
        var handler = new RoutingHandler(request =>
        {
            var path = request.RequestUri!.AbsolutePath;
            return path.StartsWith("/3/collection/", StringComparison.Ordinal)
                ? (HttpStatusCode.OK, """{ "id": 1, "parts": [{ "id": 2, "title": "Second", "release_date": "2005-01-01" }, { "id": 1, "title": "First", "release_date": "2001-01-01" }] }""")
                : (HttpStatusCode.OK, """{ "page": 2, "total_pages": 5, "total_results": 100, "results": [{ "id": 5, "title": "Popular" }] }""");
        });
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var service = new MovieCollectionService(new TmdbClient(httpClient), new CatalogCache(cache));

        var studio = await service.GetCollectionMoviesAsync("marvel", 2, CancellationToken.None);
        var franchise = await service.GetCollectionMoviesAsync("harry-potter", 1, CancellationToken.None);
        var franchiseLater = await service.GetCollectionMoviesAsync("harry-potter", 2, CancellationToken.None);

        Assert.Equal(5, studio!.TotalPages);
        Assert.Contains(handler.RequestUris, uri => uri.Query.Contains("with_companies=420") && uri.Query.Contains("page=2"));
        Assert.Equal(["First", "Second"], franchise!.Results.Select(movie => movie.Title));
        Assert.Equal(1, franchise.TotalPages);
        Assert.Empty(franchiseLater!.Results);
    }

    [Fact]
    public async Task GetCollectionMoviesAsync_returns_null_for_an_unknown_slug()
    {
        var handler = new RoutingHandler(_ => (HttpStatusCode.OK, "{}"));
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var service = new MovieCollectionService(new TmdbClient(httpClient), new CatalogCache(cache));

        Assert.Null(await service.GetCollectionMoviesAsync("nope", 1, CancellationToken.None));
        Assert.Empty(handler.RequestUris);
    }

    private sealed class RoutingHandler(Func<HttpRequestMessage, (HttpStatusCode Status, string Json)> respond) : HttpMessageHandler
    {
        private readonly object gate = new();

        public List<Uri> RequestUris { get; } = [];

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            lock (gate)
            {
                RequestUris.Add(request.RequestUri!);
            }

            var (status, json) = respond(request);
            return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent(json, Encoding.UTF8, "application/json") });
        }
    }
}
