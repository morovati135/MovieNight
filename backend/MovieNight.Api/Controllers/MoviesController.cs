using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/movies")]
[Tags("Movies")]
public sealed class MoviesController(MovieCatalogService movieCatalogService) : ControllerBase
{
    [HttpGet("genres")]
    [EndpointSummary("List movie genres.")]
    [ProducesResponseType(typeof(IReadOnlyList<GenreDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<IReadOnlyList<GenreDto>>> GetGenres(CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetGenresAsync(cancellationToken));

    [HttpGet("trending")]
    [EndpointSummary("Get trending movies.")]
    [ProducesResponseType(typeof(PagedMovieResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<PagedMovieResultDto>> GetTrending([FromQuery] PageQuery query, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetTrendingAsync(query.Page, cancellationToken));

    [HttpGet("popular")]
    [EndpointSummary("Get popular movies.")]
    [ProducesResponseType(typeof(PagedMovieResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<PagedMovieResultDto>> GetPopular([FromQuery] PageQuery query, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetPopularAsync(query.Page, cancellationToken));

    [HttpGet("top-rated")]
    [EndpointSummary("Get the top rated movies of all time.")]
    [ProducesResponseType(typeof(PagedMovieResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<PagedMovieResultDto>> GetTopRated([FromQuery] PageQuery query, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetTopRatedAsync(query.Page, cancellationToken));

    [HttpGet("{id:int}")]
    [EndpointSummary("Get movie details.")]
    [ProducesResponseType(typeof(MovieDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<MovieDetailsDto>> GetDetails([Range(1, int.MaxValue)] int id, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.GetDetailsAsync(id, cancellationToken));

    [HttpGet("search")]
    [EndpointSummary("Search movies.")]
    [EndpointDescription("Searches TMDB by a non-blank query string, optionally limited to a primary release year.")]
    [ProducesResponseType(typeof(PagedMovieResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<PagedMovieResultDto>> Search([FromQuery] SearchMoviesQuery search, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.SearchAsync(search.Query, search.Year, search.Page, cancellationToken));

    [HttpGet("discover")]
    [EndpointSummary("Discover movies by optional filters.")]
    [ProducesResponseType(typeof(PagedMovieResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public Task<ActionResult<PagedMovieResultDto>> Discover([FromQuery] DiscoverMoviesQuery discover, CancellationToken cancellationToken) =>
        ExecuteAsync(() => movieCatalogService.DiscoverAsync(discover.GenreId, discover.Year, discover.MinRating, discover.Page, cancellationToken));

    [HttpGet("pick")]
    [EndpointSummary("Pick a movie matching optional filters.")]
    [ProducesResponseType(typeof(MovieSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<MovieSummaryDto>> Pick([FromQuery] PickMovieQuery pick, CancellationToken cancellationToken)
    {
        try
        {
            var movie = await movieCatalogService.PickAsync(pick.GenreId, pick.Year, pick.MinRating, cancellationToken);
            return movie is null
                ? Problem(statusCode: StatusCodes.Status404NotFound, title: "No movie available.", detail: "No movie matches the requested filters.")
                : Ok(movie);
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
        catch (TmdbNotFoundException)
        {
            return Problem(statusCode: StatusCodes.Status404NotFound, title: "Movie not found.", detail: "The requested movie does not exist.");
        }
        catch (TmdbUpstreamException)
        {
            return Problem(statusCode: StatusCodes.Status502BadGateway, title: "TMDB is unavailable.", detail: "The MovieNight TMDB integration could not complete the requested operation.");
        }
    }
}

public sealed class PageQuery
{
    [Range(1, 500)]
    public int Page { get; init; } = 1;
}

public sealed class SearchMoviesQuery
{
    [Required]
    [RegularExpression(@".*\S.*", ErrorMessage = "Query must not be blank.")]
    public string Query { get; init; } = string.Empty;

    [Range(1888, 2100)]
    public int? Year { get; init; }

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

public sealed class PickMovieQuery
{
    [Range(1, int.MaxValue)]
    public int? GenreId { get; init; }

    [Range(1888, 2100)]
    public int? Year { get; init; }

    [Range(typeof(double), "0", "10")]
    public double? MinRating { get; init; }
}
