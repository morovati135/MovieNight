using Microsoft.AspNetCore.Mvc;

namespace MovieNight.Api.Controllers;

[ApiController]
[Route("api/health")]
[Tags("Health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Check API availability.")]
    [EndpointDescription("Returns a lightweight status response without checking TMDB connectivity.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }
}
