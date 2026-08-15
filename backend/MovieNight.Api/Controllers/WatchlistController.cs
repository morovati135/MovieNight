using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Features.Watchlists;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/watchlist")]
[Tags("Watchlist")]
public sealed class WatchlistController(
    WatchlistService watchlistService,
    IAnonymousVisitorIdentityService anonymousVisitorIdentityService) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Get the current anonymous visitor's watchlist.")]
    [EndpointDescription("Watchlist endpoints identify a browser with the `movienight.anonymous-id` cookie. If it is absent, invalid, or expired, the API creates a protected replacement cookie that lasts one year, is HttpOnly and SameSite=Lax, and is Secure for HTTPS requests. Clearing or not returning this cookie starts a different anonymous watchlist.")]
    [ProducesResponseType(typeof(IReadOnlyList<MovieSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<ActionResult<IReadOnlyList<MovieSummaryDto>>> Get(CancellationToken cancellationToken)
    {
        try
        {
            var anonymousId = anonymousVisitorIdentityService.GetOrCreate(HttpContext);
            return Ok(await watchlistService.GetMoviesAsync(anonymousId, cancellationToken));
        }
        catch (TmdbAuthenticationException)
        {
            return TmdbAuthenticationProblem();
        }
        catch (TmdbUpstreamException)
        {
            return TmdbUnavailableProblem();
        }
    }

    [HttpPost("{movieId:int}")]
    [EndpointSummary("Add a movie to the current anonymous visitor's watchlist.")]
    [EndpointDescription("Uses the anonymous visitor cookie described on this API. Adding a movie already on the watchlist succeeds without creating a duplicate.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> Add(
        [Range(1, int.MaxValue)] int movieId,
        CancellationToken cancellationToken)
    {
        try
        {
            var anonymousId = anonymousVisitorIdentityService.GetOrCreate(HttpContext);
            var result = await watchlistService.AddAsync(anonymousId, movieId, cancellationToken);

            return result == WatchlistAddResult.CapacityReached
                ? Problem(
                    statusCode: StatusCodes.Status409Conflict,
                    title: "Watchlist capacity reached.",
                    detail: $"A watchlist can contain at most {WatchlistService.MaximumItems} movies.")
                : NoContent();
        }
        catch (TmdbNotFoundException)
        {
            return Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Movie not found.",
                detail: "The requested movie does not exist.");
        }
        catch (TmdbAuthenticationException)
        {
            return TmdbAuthenticationProblem();
        }
        catch (TmdbUpstreamException)
        {
            return TmdbUnavailableProblem();
        }
    }

    [HttpDelete("{movieId:int}")]
    [EndpointSummary("Remove a movie from the current anonymous visitor's watchlist.")]
    [EndpointDescription("Uses the anonymous visitor cookie described on this API. Removing a movie that is not present succeeds without changing the watchlist.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Remove(
        [Range(1, int.MaxValue)] int movieId,
        CancellationToken cancellationToken)
    {
        var anonymousId = anonymousVisitorIdentityService.GetOrCreate(HttpContext);
        await watchlistService.RemoveAsync(anonymousId, movieId, cancellationToken);
        return NoContent();
    }

    private ObjectResult TmdbAuthenticationProblem() => Problem(
        statusCode: StatusCodes.Status502BadGateway,
        title: "TMDB authentication failed.",
        detail: "The MovieNight TMDB integration could not authenticate with its configured credentials.");

    private ObjectResult TmdbUnavailableProblem() => Problem(
        statusCode: StatusCodes.Status502BadGateway,
        title: "TMDB is unavailable.",
        detail: "The MovieNight TMDB integration could not complete the requested operation.");
}
