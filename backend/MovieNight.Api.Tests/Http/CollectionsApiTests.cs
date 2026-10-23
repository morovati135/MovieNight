using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MovieNight.Api.Tests.Http;

public sealed class CollectionsApiTests
{
    [Fact]
    public async Task The_collection_list_has_slugs_titles_and_cover_posters()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var collections = await client.GetFromJsonAsync<JsonElement>("/api/collections");

        Assert.True(collections.GetArrayLength() > 0);
        foreach (var collection in collections.EnumerateArray())
        {
            Assert.False(string.IsNullOrWhiteSpace(collection.GetProperty("slug").GetString()));
            Assert.False(string.IsNullOrWhiteSpace(collection.GetProperty("title").GetString()));
            Assert.True(collection.GetProperty("posterUrls").GetArrayLength() > 0);
        }
    }

    [Fact]
    public async Task The_collection_list_is_cached()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        await client.GetAsync("/api/collections");
        var requestsAfterFirst = host.Tmdb.RequestCount;
        await client.GetAsync("/api/collections");

        Assert.Equal(requestsAfterFirst, host.Tmdb.RequestCount);
    }

    [Theory]
    [InlineData("marvel")]
    [InlineData("harry-potter")]
    public async Task A_known_collection_returns_a_page_of_movies(string slug)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var page = await client.GetFromJsonAsync<JsonElement>($"/api/collections/{slug}/movies");

        Assert.True(page.GetProperty("results").GetArrayLength() > 0);
        Assert.Equal(1, page.GetProperty("page").GetInt32());
    }

    [Fact]
    public async Task A_studio_collection_pages_through_discover()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var second = await client.GetFromJsonAsync<JsonElement>("/api/collections/marvel/movies?page=2");

        Assert.Equal(2, second.GetProperty("page").GetInt32());
    }

    [Fact]
    public async Task A_franchise_is_a_single_page()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var second = await client.GetFromJsonAsync<JsonElement>("/api/collections/harry-potter/movies?page=2");

        Assert.Equal(0, second.GetProperty("results").GetArrayLength());
    }

    [Theory]
    [InlineData("nope")]
    [InlineData("MARVEL%20")]
    public async Task An_unknown_collection_is_a_404_problem_and_never_reaches_tmdb(string slug)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync($"/api/collections/{slug}/movies");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("Collection not found.", (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("title").GetString());
        Assert.Equal(0, host.Tmdb.RequestCount);
    }

    [Theory]
    [InlineData("/api/collections/marvel/movies?page=0")]
    [InlineData("/api/collections/marvel/movies?page=501")]
    public async Task An_invalid_page_is_a_400(string url)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync(url)).StatusCode);
    }

    [Fact]
    public async Task A_tmdb_outage_on_a_collection_page_is_a_safe_502()
    {
        using var host = await ApiHost.StartAsync();
        host.Tmdb.Override = _ => FakeTmdb.Status(HttpStatusCode.InternalServerError);
        using var client = host.CreateBrowser();

        var response = await client.GetAsync("/api/collections/marvel/movies");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.DoesNotContain("secret", await response.Content.ReadAsStringAsync(), StringComparison.OrdinalIgnoreCase);
    }
}
