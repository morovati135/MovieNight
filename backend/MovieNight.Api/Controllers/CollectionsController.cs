using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Features.Collections;
using MovieNight.Api.Features.Collections.Contracts;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/collections")]
[Tags("Collections")]
public sealed class CollectionsController(MovieCollectionService collectionService) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("List the curated movie collections.")]
    [ProducesResponseType(typeof(IReadOnlyList<MovieCollectionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<IReadOnlyList<MovieCollectionDto>>> GetCollections(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await collectionService.GetCollectionsAsync(cancellationToken));
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

    [HttpGet("{slug}/movies")]
    [EndpointSummary("Get one page of a collection's movies.")]
    [ProducesResponseType(typeof(PagedMovieResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<PagedMovieResultDto>> GetCollectionMovies(string slug, [FromQuery] PageQuery query, CancellationToken cancellationToken)
    {
        try
        {
            var movies = await collectionService.GetCollectionMoviesAsync(slug, query.Page, cancellationToken);
            return movies is null
                ? Problem(statusCode: StatusCodes.Status404NotFound, title: "Collection not found.", detail: "The requested collection does not exist.")
                : Ok(movies);
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
