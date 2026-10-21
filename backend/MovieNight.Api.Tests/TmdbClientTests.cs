using System.Net;
using System.Text.Json;
using MovieNight.Api.Integrations.Tmdb;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Tests;

public sealed class TmdbClientTests
{
    [Fact]
    public async Task VerifyConnectivityAsync_returns_when_upstream_succeeds()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK);
        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        var client = new TmdbClient(httpClient);

        await client.VerifyConnectivityAsync(CancellationToken.None);

        Assert.Equal("/3/configuration/languages", handler.RequestUri?.AbsolutePath);
    }

    [Fact]
    public async Task VerifyConnectivityAsync_translates_authentication_failure()
    {
        using var httpClient = new HttpClient(new StubHttpMessageHandler(HttpStatusCode.Unauthorized))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        var client = new TmdbClient(httpClient);

        await Assert.ThrowsAsync<TmdbAuthenticationException>(() => client.VerifyConnectivityAsync(CancellationToken.None));
    }

    [Fact]
    public async Task SearchMoviesAsync_sends_query_and_page_to_tmdb()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK, """{ "page": 2, "total_pages": 2, "total_results": 1, "results": [] }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await client.SearchMoviesAsync("the movie", null, 2, CancellationToken.None);

        Assert.Equal("/3/search/movie", handler.RequestUri?.AbsolutePath);
        Assert.Equal("query=the%20movie&page=2", handler.RequestUri?.Query.TrimStart('?'));
    }

    [Fact]
    public async Task SearchMoviesAsync_sends_optional_year_as_primary_release_year()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK, """{ "page": 1, "total_pages": 1, "total_results": 1, "results": [] }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await client.SearchMoviesAsync("tv", 2021, 1, CancellationToken.None);

        Assert.Equal("query=tv&page=1&primary_release_year=2021", handler.RequestUri?.Query.TrimStart('?'));
    }

    [Fact]
    public async Task DiscoverMoviesAsync_maps_only_supported_filters_to_tmdb_query()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK, """{ "page": 3, "total_pages": 3, "total_results": 1, "results": [] }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await client.DiscoverMoviesAsync(new TmdbDiscoverRequest(28, 2020, 7.5, 3), CancellationToken.None);

        Assert.Equal("/3/discover/movie", handler.RequestUri?.AbsolutePath);
        Assert.Equal("sort_by=popularity.desc&page=3&with_genres=28&primary_release_year=2020&vote_average.gte=7.5", handler.RequestUri?.Query.TrimStart('?'));
    }

    [Fact]
    public async Task GetMovieDetailsAsync_uses_tmdb_response_aggregation()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK, """{ "id": 1, "title": "Movie" }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await client.GetMovieDetailsAsync(1, CancellationToken.None);

        Assert.Equal("/3/movie/1", handler.RequestUri?.AbsolutePath);
        Assert.Equal("append_to_response=credits,similar", handler.RequestUri?.Query.TrimStart('?'));
    }

    [Fact]
    public async Task GetMovieSummaryAsync_uses_the_lightweight_movie_resource()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK, """{ "id": 1, "title": "Movie" }""");
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await client.GetMovieSummaryAsync(1, CancellationToken.None);

        Assert.Equal("/3/movie/1", handler.RequestUri?.AbsolutePath);
        Assert.Equal(string.Empty, handler.RequestUri?.Query);
    }

    [Fact]
    public async Task GetMovieDetailsAsync_translates_not_found()
    {
        using var httpClient = new HttpClient(new StubHttpMessageHandler(HttpStatusCode.NotFound)) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await Assert.ThrowsAsync<TmdbNotFoundException>(() => client.GetMovieDetailsAsync(404, CancellationToken.None));
    }

    [Fact]
    public async Task GetMovieDetailsAsync_translates_upstream_failure()
    {
        using var httpClient = new HttpClient(new StubHttpMessageHandler(HttpStatusCode.InternalServerError)) { BaseAddress = new Uri("https://api.themoviedb.org/3/") };
        var client = new TmdbClient(httpClient);

        await Assert.ThrowsAsync<TmdbUpstreamException>(() => client.GetMovieDetailsAsync(1, CancellationToken.None));
    }

    [Fact]
    public void Popular_response_with_an_empty_release_date_maps_to_a_missing_optional_release_date()
    {
        const string response = """
            { "page": 1, "total_pages": 1, "total_results": 1, "results": [
              { "id": 1599191, "title": "Upcoming movie", "release_date": "" }
            ] }
            """;

        var page = JsonSerializer.Deserialize<TmdbMoviePage>(response);

        Assert.Null(Assert.Single(page!.Results).ReleaseDate);
    }

    private sealed class StubHttpMessageHandler(HttpStatusCode statusCode, string? content = null) : HttpMessageHandler
    {
        public Uri? RequestUri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestUri = request.RequestUri;
            return Task.FromResult(new HttpResponseMessage(statusCode)
            {
                Content = content is null ? null : new StringContent(content)
            });
        }
    }
}
