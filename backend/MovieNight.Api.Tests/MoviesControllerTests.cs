using MovieNight.Api.Features.Caching;
using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Controllers;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class MoviesControllerTests
{
    [Fact]
    public async Task Pick_returns_a_movie_summary()
    {
        using var httpClient = new HttpClient(new JsonHandler("""{ "page": 1, "total_pages": 1, "total_results": 1, "results": [{ "id": 7, "title": "Movie" }] }"""))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var controller = new MoviesController(new MovieCatalogService(new TmdbClient(httpClient), new CatalogCache(cache)));

        var result = await controller.Pick(new PickMovieQuery(), CancellationToken.None);

        var movie = Assert.IsType<OkObjectResult>(result.Result).Value;
        Assert.IsType<MovieNight.Api.Features.Movies.Contracts.MovieSummaryDto>(movie);
    }

    [Fact]
    public async Task Movie_api_usage_does_not_create_an_anonymous_visitor_cookie()
    {
        using var httpClient = new HttpClient(new JsonHandler("""{ "page": 1, "total_pages": 1, "total_results": 0, "results": [] }"""))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var controller = new MoviesController(new MovieCatalogService(new TmdbClient(httpClient), new CatalogCache(cache)))
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        await controller.GetTrending(new PageQuery(), CancellationToken.None);

        Assert.Equal(0, controller.HttpContext.Response.Headers.SetCookie.Count);
    }

    [Fact]
    public async Task Pick_returns_not_found_problem_when_no_candidate_exists()
    {
        using var httpClient = new HttpClient(new JsonHandler("""{ "page": 1, "total_pages": 0, "total_results": 0, "results": [] }"""))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var controller = new MoviesController(new MovieCatalogService(new TmdbClient(httpClient), new CatalogCache(cache)));

        var result = await controller.Pick(new PickMovieQuery(), CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result.Result).Value as ProblemDetails;
        Assert.NotNull(problem);
        Assert.Equal(404, problem.Status);
        Assert.Equal("No movie available.", problem.Title);
    }

    [Theory]
    [InlineData(HttpStatusCode.NotFound, 404, "Movie not found.")]
    [InlineData(HttpStatusCode.BadGateway, 502, "TMDB is unavailable.")]
    public async Task GetDetails_returns_safe_problem_details_for_tmdb_failures(HttpStatusCode upstreamStatus, int expectedStatus, string expectedTitle)
    {
        using var httpClient = new HttpClient(new StatusCodeHandler(upstreamStatus))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        using var cache = new MemoryCache(new MemoryCacheOptions { SizeLimit = 1000 });
        var controller = new MoviesController(new MovieCatalogService(new TmdbClient(httpClient), new CatalogCache(cache)));

        var result = await controller.GetDetails(1, CancellationToken.None);

        var problem = Assert.IsType<ObjectResult>(result.Result).Value as ProblemDetails;
        Assert.NotNull(problem);
        Assert.Equal(expectedStatus, problem.Status);
        Assert.Equal(expectedTitle, problem.Title);
    }

    private sealed class StatusCodeHandler(HttpStatusCode statusCode) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(statusCode));
    }

    private sealed class JsonHandler(string json) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json)
            });
    }
}
