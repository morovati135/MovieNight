using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/movies")]
public sealed class MoviesController(MovieCatalogService movieCatalogService) : ControllerBase
{
    [HttpGet("genres")]
    public Task<ActionResult<IReadOnlyList<GenreDto>>> GetGenres(CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetGenresAsync(cancellationToken));

    [HttpGet("trending")]
    public Task<ActionResult<PagedMovieResultDto>> GetTrending(CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetTrendingAsync(cancellationToken));

    [HttpGet("popular")]
    public Task<ActionResult<PagedMovieResultDto>> GetPopular(CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetPopularAsync(cancellationToken));

    [HttpGet("search")]
    public Task<ActionResult<PagedMovieResultDto>> Search([FromQuery] SearchMoviesQuery search, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.SearchAsync(search.Query, search.Page, cancellationToken));

    [HttpGet("discover")]
    public Task<ActionResult<PagedMovieResultDto>> Discover([FromQuery] DiscoverMoviesQuery discover, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.DiscoverAsync(discover.GenreId, discover.Year, discover.MinRating, discover.Page, cancellationToken));

    private async Task<ActionResult<T>> ExecuteAsync<T>(Func<Task<T>> operation)
    {
        try
        {
            return Ok(await operation());
        }
        catch (TmdbAuthenticationException)
        {
            return Problem(statusCode: StatusCodes.Status502BadGateway, title: "TMDB authentication failed.", detail: "The MovieNight TMDB integration could not authenticate with its configured credentials.");
        }
        catch (TmdbUpstreamException)
        {
            return Problem(statusCode: StatusCodes.Status502BadGateway, title: "TMDB is unavailable.", detail: "The MovieNight TMDB integration could not complete the requested operation.");
        }
    }
}

public sealed class SearchMoviesQuery
{
    [Required]
    [RegularExpression(@".*\S.*", ErrorMessage = "Query must not be blank.")]
    public string Query { get; init; } = string.Empty;

    [Range(1, 500)]
    public int Page { get; init; } = 1;
}

public sealed class DiscoverMoviesQuery
{
    [Range(1, int.MaxValue)]
    public int? GenreId { get; init; }

    [Range(1888, 2100)]
    public int? Year { get; init; }

    [Range(typeof(double), "0", "10")]
    public double? MinRating { get; init; }

    [Range(1, 500)]
    public int Page { get; init; } = 1;
}
