namespace MovieNight.Api.Features.Watchlists;

public interface IAnonymousVisitorIdentityService
{
    Guid GetOrCreate(HttpContext context);
}
