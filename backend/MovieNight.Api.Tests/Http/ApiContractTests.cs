using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MovieNight.Api.Tests.Http;

/// <summary>
/// The JSON the API really returns must have exactly the property names listed in
/// <c>contracts/api-shapes.json</c>, which the frontend's TypeScript types are checked against too.
/// </summary>
public sealed class ApiContractTests
{
    private const string DetailsJson = """
        {
          "id": 7, "title": "Movie 7", "overview": "O", "release_date": "2020-01-01", "runtime": 120,
          "genres": [{ "id": 28, "name": "Action" }], "poster_path": "/p.jpg", "backdrop_path": "/b.jpg", "vote_average": 7.5,
          "production_countries": [{ "iso_3166_1": "US" }],
          "credits": {
            "cast": [{ "id": 1, "name": "Actor", "character": "Hero", "order": 0, "profile_path": "/a.jpg" }],
            "crew": [{ "id": 2, "name": "Director", "job": "Director", "profile_path": "/d.jpg" }]
          },
          "recommendations": { "results": [{ "id": 9, "title": "Similar", "poster_path": "/s.jpg", "vote_average": 6.0 }] },
          "images": { "backdrops": [{ "file_path": "/s1.jpg" }, { "file_path": "/s2.jpg" }] }
        }
        """;

    private static Dictionary<string, string[]> LoadShapes()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "contracts", "api-shapes.json")))
        {
            directory = directory.Parent;
        }

        Assert.NotNull(directory);
        using var document = JsonDocument.Parse(File.ReadAllText(Path.Combine(directory.FullName, "contracts", "api-shapes.json")));

        return document.RootElement.EnumerateObject()
            .Where(property => property.Value.ValueKind == JsonValueKind.Array)
            .ToDictionary(property => property.Name, property => property.Value.EnumerateArray().Select(name => name.GetString()!).Order().ToArray());
    }

    private static void AssertShape(string name, JsonElement element)
    {
        Assert.Equal(LoadShapes()[name], element.EnumerateObject().Select(property => property.Name).Order().ToArray());
    }

    [Fact]
    public async Task Movie_details_and_everything_nested_in_it_match_the_contract()
    {
        using var host = await ApiHost.StartAsync();
        host.Tmdb.Override = request => request.RequestUri!.AbsolutePath.EndsWith("/movie/7", StringComparison.Ordinal)
            ? FakeTmdb.Json(DetailsJson)
            : null;
        using var client = host.CreateBrowser();

        var details = await client.GetFromJsonAsync<JsonElement>("/api/movies/7");

        AssertShape("MovieDetails", details);
        AssertShape("Genre", details.GetProperty("genres")[0]);
        AssertShape("Cast", details.GetProperty("cast")[0]);
        AssertShape("Person", details.GetProperty("directors")[0]);
        AssertShape("MovieSummary", details.GetProperty("similarMovies")[0]);
        Assert.Equal(2, details.GetProperty("sceneImageUrls").GetArrayLength());
    }

    [Theory]
    [InlineData("/api/movies/trending")]
    [InlineData("/api/movies/popular")]
    [InlineData("/api/movies/top-rated")]
    [InlineData("/api/movies/search?query=matrix")]
    [InlineData("/api/movies/discover?genreId=28")]
    [InlineData("/api/collections/marvel/movies")]
    public async Task Paged_results_and_their_movies_match_the_contract(string url)
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var page = await client.GetFromJsonAsync<JsonElement>(url);

        AssertShape("PagedMovieResult", page);
        AssertShape("MovieSummary", page.GetProperty("results")[0]);
    }

    [Fact]
    public async Task Genres_collections_pick_and_watchlist_match_the_contract()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();
        await client.PostAsync("/api/watchlist/7", null);

        AssertShape("Genre", (await client.GetFromJsonAsync<JsonElement>("/api/movies/genres"))[0]);
        AssertShape("MovieCollection", (await client.GetFromJsonAsync<JsonElement>("/api/collections"))[0]);
        AssertShape("MovieSummary", await client.GetFromJsonAsync<JsonElement>("/api/movies/pick"));
        AssertShape("MovieSummary", (await client.GetFromJsonAsync<JsonElement>("/api/watchlist"))[0]);
    }

    [Fact]
    public async Task Errors_use_the_standard_problem_details_fields()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync($"/api/movies/{FakeTmdb.NotFoundId}");
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(404, problem.GetProperty("status").GetInt32());
        Assert.True(problem.TryGetProperty("title", out _));
        Assert.True(problem.TryGetProperty("detail", out _));
    }
}
