using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Controllers;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class MoviesControllerTests
{
    [Theory]
    [InlineData(HttpStatusCode.NotFound, 404, "Movie not found.")]
    [InlineData(HttpStatusCode.BadGateway, 502, "TMDB is unavailable.")]
    public async Task GetDetails_returns_safe_problem_details_for_tmdb_failures(HttpStatusCode upstreamStatus, int expectedStatus, string expectedTitle)
    {
        using var httpClient = new HttpClient(new StatusCodeHandler(upstreamStatus))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        using var cache = new MemoryCache(new MemoryCacheOptions());
        var controller = new MoviesController(new MovieCatalogService(new TmdbClient(httpClient), cache));

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
}
