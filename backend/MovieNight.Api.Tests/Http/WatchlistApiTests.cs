using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;

namespace MovieNight.Api.Tests.Http;

public sealed class WatchlistApiTests
{
    private const string CookieName = "movienight.anonymous-id";

    private static async Task<int[]> ListIdsAsync(HttpClient client)
    {
        var movies = await client.GetFromJsonAsync<JsonElement>("/api/watchlist");

        return movies.EnumerateArray().Select(movie => movie.GetProperty("id").GetInt32()).ToArray();
    }

    [Fact]
    public async Task The_first_request_issues_a_protected_http_only_cookie_and_later_requests_reuse_it()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();

        var first = await browser.GetAsync("/api/watchlist");
        var second = await browser.GetAsync("/api/watchlist");

        var setCookie = Assert.Single(first.Headers.GetValues("Set-Cookie"));
        Assert.StartsWith($"{CookieName}=", setCookie);
        Assert.Contains("httponly", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("expires=", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.False(second.Headers.Contains("Set-Cookie"));
        // The value is protected, not the raw visitor id.
        Assert.False(Guid.TryParse(setCookie.Split(';')[0][(CookieName.Length + 1)..], out _));
    }

    [Fact]
    public async Task A_tampered_cookie_is_replaced_with_a_new_empty_watchlist()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();
        await browser.PostAsync("/api/watchlist/7", null);

        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/watchlist");
        request.Headers.Add("Cookie", $"{CookieName}=not-a-valid-protected-value");
        using var stranger = host.CreateClient(new() { HandleCookies = false });
        var response = await stranger.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Single(response.Headers.GetValues("Set-Cookie"));
        Assert.Equal(0, (await response.Content.ReadFromJsonAsync<JsonElement>()).GetArrayLength());
    }

    [Fact]
    public async Task Add_is_idempotent_and_the_movie_appears_hydrated_newest_first()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();

        Assert.Equal(HttpStatusCode.NoContent, (await browser.PostAsync("/api/watchlist/7", null)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await browser.PostAsync("/api/watchlist/7", null)).StatusCode);
        await Task.Delay(20);
        Assert.Equal(HttpStatusCode.NoContent, (await browser.PostAsync("/api/watchlist/8", null)).StatusCode);

        var movies = await browser.GetFromJsonAsync<JsonElement>("/api/watchlist");

        Assert.Equal([8, 7], movies.EnumerateArray().Select(movie => movie.GetProperty("id").GetInt32()));
        Assert.Equal("Movie 8", movies[0].GetProperty("title").GetString());
    }

    [Fact]
    public async Task Remove_is_idempotent_and_removing_a_missing_movie_succeeds()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();
        await browser.PostAsync("/api/watchlist/7", null);

        Assert.Equal(HttpStatusCode.NoContent, (await browser.DeleteAsync("/api/watchlist/7")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await browser.DeleteAsync("/api/watchlist/7")).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, (await browser.DeleteAsync("/api/watchlist/12345")).StatusCode);
        Assert.Empty(await ListIdsAsync(browser));
    }

    [Fact]
    public async Task Two_browsers_have_separate_watchlists()
    {
        using var host = await ApiHost.StartAsync();
        using var first = host.CreateBrowser();
        using var second = host.CreateBrowser();

        await first.PostAsync("/api/watchlist/7", null);
        await second.PostAsync("/api/watchlist/8", null);

        Assert.Equal(new[] { 7 }, await ListIdsAsync(first));
        Assert.Equal(new[] { 8 }, await ListIdsAsync(second));
    }

    [Fact]
    public async Task The_watchlist_is_kept_across_a_new_client_that_returns_the_same_cookie()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateClient(new() { HandleCookies = false });
        var first = await browser.GetAsync("/api/watchlist");
        var cookie = first.Headers.GetValues("Set-Cookie").Single().Split(';')[0];

        async Task<HttpResponseMessage> Send(HttpMethod method, string url)
        {
            using var request = new HttpRequestMessage(method, url);
            request.Headers.Add("Cookie", cookie);
            return await browser.SendAsync(request);
        }

        await Send(HttpMethod.Post, "/api/watchlist/7");
        var again = await Send(HttpMethod.Get, "/api/watchlist");

        Assert.False(again.Headers.Contains("Set-Cookie"));
        Assert.Equal(7, (await again.Content.ReadFromJsonAsync<JsonElement>())[0].GetProperty("id").GetInt32());
    }

    [Fact]
    public async Task An_unknown_movie_is_a_404_and_is_not_saved()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();

        var response = await browser.PostAsync($"/api/watchlist/{FakeTmdb.NotFoundId}", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Empty(await ListIdsAsync(browser));
    }

    [Theory]
    [InlineData("/api/watchlist/0")]
    [InlineData("/api/watchlist/-5")]
    public async Task An_invalid_movie_id_is_a_400_for_add_and_remove(string url)
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();

        Assert.Equal(HttpStatusCode.BadRequest, (await browser.PostAsync(url, null)).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await browser.DeleteAsync(url)).StatusCode);
        Assert.Equal(0, host.Tmdb.RequestCount);
    }

    [Theory]
    [InlineData(FakeTmdb.UnauthorizedId, "TMDB authentication failed.")]
    [InlineData(FakeTmdb.ServerErrorId, "TMDB is unavailable.")]
    public async Task A_tmdb_failure_while_adding_is_a_safe_502_and_nothing_is_saved(int movieId, string expectedTitle)
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();

        var response = await browser.PostAsync($"/api/watchlist/{movieId}", null);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.Equal(expectedTitle, problem.GetProperty("title").GetString());
        Assert.Empty(await ListIdsAsync(browser));
    }

    [Fact]
    public async Task The_fifty_first_movie_is_a_409_but_existing_movies_can_still_be_re_added_and_removed()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();

        for (var id = 1; id <= 50; id++)
        {
            Assert.Equal(HttpStatusCode.NoContent, (await browser.PostAsync($"/api/watchlist/{id}", null)).StatusCode);
        }

        var overflow = await browser.PostAsync("/api/watchlist/51", null);
        var again = await browser.PostAsync("/api/watchlist/1", null);

        Assert.Equal(HttpStatusCode.Conflict, overflow.StatusCode);
        Assert.Equal("Watchlist capacity reached.", (await overflow.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("title").GetString());
        Assert.Equal(HttpStatusCode.NoContent, again.StatusCode);
        Assert.Equal(50, (await ListIdsAsync(browser)).Length);

        await browser.DeleteAsync("/api/watchlist/50");
        Assert.Equal(HttpStatusCode.NoContent, (await browser.PostAsync("/api/watchlist/51", null)).StatusCode);
    }

    [Fact]
    public async Task A_full_watchlist_is_hydrated_from_the_cache_without_new_tmdb_calls()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();
        for (var id = 1; id <= 20; id++)
        {
            await browser.PostAsync($"/api/watchlist/{id}", null);
        }

        var requestsBefore = host.Tmdb.RequestCount;
        var ids = await ListIdsAsync(browser);

        Assert.Equal(20, ids.Length);
        Assert.Equal(requestsBefore, host.Tmdb.RequestCount);
    }

    [Fact]
    public async Task After_a_cold_start_a_forgotten_movie_is_left_out_and_a_tmdb_outage_is_a_502()
    {
        using var host = await ApiHost.StartAsync();
        using var browser = host.CreateBrowser();
        await browser.PostAsync("/api/watchlist/7", null);
        await browser.PostAsync("/api/watchlist/8", null);
        var cache = (MemoryCache)host.Services.GetRequiredService<IMemoryCache>();

        // Simulate a restart (empty cache) after TMDB dropped movie 7.
        cache.Clear();
        host.Tmdb.Override = request => request.RequestUri!.AbsolutePath.EndsWith("/movie/7", StringComparison.Ordinal)
            ? FakeTmdb.Status(HttpStatusCode.NotFound)
            : null;
        Assert.Equal(new[] { 8 }, await ListIdsAsync(browser));

        // Another cold start while TMDB is down.
        cache.Clear();
        host.Tmdb.Override = _ => FakeTmdb.Status(HttpStatusCode.InternalServerError);
        var outage = await browser.GetAsync("/api/watchlist");

        Assert.Equal(HttpStatusCode.BadGateway, outage.StatusCode);
        Assert.DoesNotContain("secret", await outage.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }
}
