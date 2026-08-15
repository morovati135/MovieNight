using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Features.Watchlists;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/watchlist")]
public sealed class WatchlistController(
    WatchlistService watchlistService,
    IAnonymousVisitorIdentityService anonymousVisitorIdentityService) : ControllerBase
{
    [HttpGet]
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
