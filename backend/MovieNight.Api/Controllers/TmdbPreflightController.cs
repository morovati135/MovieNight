using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/tmdb/preflight")]
[Tags("Diagnostics")]
public sealed class TmdbPreflightController(TmdbClient tmdbClient) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Verify TMDB connectivity.")]
    [EndpointDescription("Performs a harmless TMDB read to verify the configured integration. This is intended for local diagnostics.")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status502BadGateway)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        try
        {
            await tmdbClient.VerifyConnectivityAsync(cancellationToken);
            return NoContent();
        }
        catch (TmdbAuthenticationException)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "TMDB authentication failed.",
                detail: "The MovieNight TMDB integration could not authenticate with its configured credentials.");
        }
        catch (TmdbUpstreamException)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "TMDB is unavailable.",
                detail: "The MovieNight TMDB integration could not complete its connectivity check.");
        }
    }
}
