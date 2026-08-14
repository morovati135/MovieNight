using Microsoft.AspNetCore.Mvc;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/tmdb/preflight")]
public sealed class TmdbPreflightController(TmdbClient tmdbClient) : ControllerBase
{
    [HttpGet]
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
