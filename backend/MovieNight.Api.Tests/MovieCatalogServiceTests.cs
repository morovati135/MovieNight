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
