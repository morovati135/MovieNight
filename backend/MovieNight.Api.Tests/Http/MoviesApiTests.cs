using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MovieNight.Api.Tests.Http;

public sealed class MoviesApiTests
{
    [Theory]
    [InlineData("/api/health")]
    [InlineData("/api/movies/genres")]
    [InlineData("/api/movies/trending")]
    [InlineData("/api/movies/popular?page=2")]
    [InlineData("/api/movies/top-rated")]
    [InlineData("/api/movies/search?query=matrix&year=1999")]
    [InlineData("/api/movies/discover?genreId=28&year=2020&minRating=7.5&page=2")]
    [InlineData("/api/movies/pick?genreId=28")]
    [InlineData("/api/movies/7")]
    public async Task Public_endpoints_answer_200_json(string url)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync(url);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Details_returns_the_movienight_shape_not_the_tmdb_shape()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        using var document = JsonDocument.Parse(await client.GetStringAsync("/api/movies/7"));
        var root = document.RootElement;

        Assert.Equal(7, root.GetProperty("id").GetInt32());
        Assert.Equal("Movie 7", root.GetProperty("title").GetString());
        Assert.StartsWith("https://image.tmdb.org/t/p/", root.GetProperty("posterUrl").GetString());
        Assert.False(root.TryGetProperty("poster_path", out _));
        Assert.False(root.TryGetProperty("vote_average", out _));
    }

    [Fact]
    public async Task Search_with_no_matches_is_an_empty_page_and_pick_is_not_found()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var page = await client.GetFromJsonAsync<JsonElement>("/api/movies/search?query=nothing-matches");
        var pick = await client.GetAsync("/api/movies/pick?genreId=99999");

        Assert.Equal(0, page.GetProperty("results").GetArrayLength());
        Assert.Equal(HttpStatusCode.NotFound, pick.StatusCode);
        Assert.Equal("No movie available.", (await pick.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("title").GetString());
    }

    [Theory]
    [InlineData("/api/movies/trending?page=0")]
    [InlineData("/api/movies/trending?page=501")]
    [InlineData("/api/movies/popular?page=abc")]
    [InlineData("/api/movies/top-rated?page=-1")]
    [InlineData("/api/movies/search")]
    [InlineData("/api/movies/search?query=%20%20")]
    [InlineData("/api/movies/search?query=a&year=1800")]
    [InlineData("/api/movies/search?query=a&page=0")]
    [InlineData("/api/movies/discover?genreId=0")]
    [InlineData("/api/movies/discover?minRating=11")]
    [InlineData("/api/movies/discover?year=2200")]
    [InlineData("/api/movies/pick?minRating=-1")]
    [InlineData("/api/movies/0")]
    public async Task Invalid_input_is_a_400_validation_problem_and_never_reaches_tmdb(string url)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync(url);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(400, problem.GetProperty("status").GetInt32());
        Assert.True(problem.TryGetProperty("errors", out _));
        Assert.Equal(0, host.Tmdb.RequestCount);
    }

    [Fact]
    public async Task A_non_numeric_movie_id_and_an_unknown_route_are_not_found()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/movies/abc")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/nothing-here")).StatusCode);
    }

    [Fact]
    public async Task An_unknown_movie_is_a_404_problem_and_is_remembered_briefly()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var first = await client.GetAsync($"/api/movies/{FakeTmdb.NotFoundId}");
        var second = await client.GetAsync($"/api/movies/{FakeTmdb.NotFoundId}");

        Assert.Equal(HttpStatusCode.NotFound, first.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
        Assert.Equal("Movie not found.", (await second.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("title").GetString());
        Assert.Equal(1, host.Tmdb.RequestCount);
    }

    [Theory]
    [InlineData(FakeTmdb.UnauthorizedId, "TMDB authentication failed.")]
    [InlineData(FakeTmdb.ServerErrorId, "TMDB is unavailable.")]
    [InlineData(FakeTmdb.NetworkFailureId, "TMDB is unavailable.")]
    public async Task Upstream_failures_are_a_safe_502_and_are_not_cached(int movieId, string expectedTitle)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync($"/api/movies/{movieId}");
        var body = await response.Content.ReadAsStringAsync();
        await client.GetAsync($"/api/movies/{movieId}");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.Equal(expectedTitle, JsonDocument.Parse(body).RootElement.GetProperty("title").GetString());
        Assert.DoesNotContain("secret", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(FakeTmdb.Token, body, StringComparison.Ordinal);
        Assert.Equal(2, host.Tmdb.RequestCount);
    }

    [Theory]
    [InlineData("/api/movies/genres")]
    [InlineData("/api/movies/trending")]
    [InlineData("/api/movies/search?query=matrix")]
    [InlineData("/api/movies/discover")]
    [InlineData("/api/movies/pick")]
    [InlineData("/api/collections")]
    public async Task List_endpoints_turn_a_tmdb_outage_into_a_safe_502(string url)
    {
        using var host = await ApiHost.StartAsync();
        host.Tmdb.Override = _ => FakeTmdb.Status(HttpStatusCode.ServiceUnavailable);
        using var client = host.CreateBrowser();

        var response = await client.GetAsync(url);
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.DoesNotContain("secret", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("themoviedb", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Repeated_requests_are_served_from_the_cache_and_search_is_not_cached()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        await client.GetAsync("/api/movies/trending");
        await client.GetAsync("/api/movies/trending");
        await client.GetAsync("/api/movies/trending?page=2");
        Assert.Equal(2, host.Tmdb.RequestCount);

        await client.GetAsync("/api/movies/search?query=matrix");
        await client.GetAsync("/api/movies/search?query=matrix");
        Assert.Equal(4, host.Tmdb.RequestCount);
    }

    [Fact]
    public async Task Movie_endpoints_do_not_issue_the_anonymous_cookie()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync("/api/movies/trending");

        Assert.False(response.Headers.Contains("Set-Cookie"));
    }

    [Fact]
    public async Task Only_the_frontend_origin_is_allowed_by_cors()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        async Task<string?> AllowedOrigin(string origin)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/movies/genres");
            request.Headers.Add("Origin", origin);
            var response = await client.SendAsync(request);
            return response.Headers.TryGetValues("Access-Control-Allow-Origin", out var values) ? values.Single() : null;
        }

        Assert.Equal("http://localhost:3000", await AllowedOrigin("http://localhost:3000"));
        Assert.Null(await AllowedOrigin("https://evil.example"));
    }
}
