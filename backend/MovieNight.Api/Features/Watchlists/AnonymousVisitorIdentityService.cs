using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;

namespace MovieNight.Api.Features.Watchlists;

public interface IAnonymousVisitorIdentityService
{
    Guid GetOrCreate(HttpContext context);
}

public sealed class AnonymousVisitorIdentityService(IDataProtectionProvider dataProtectionProvider) : IAnonymousVisitorIdentityService
{
    internal const string CookieName = "movienight.anonymous-id";
    private const string ProtectorPurpose = "MovieNight.Api.AnonymousVisitorIdentity.v1";
    private static readonly TimeSpan CookieLifetime = TimeSpan.FromDays(365);

    public Guid GetOrCreate(HttpContext context)
    {
        var protector = dataProtectionProvider.CreateProtector(ProtectorPurpose);
        var cookieValue = context.Request.Cookies[CookieName];

        if (cookieValue is not null)
        {
            try
            {
                var unprotectedValue = protector.Unprotect(cookieValue);
                if (Guid.TryParse(unprotectedValue, out var anonymousId))
                {
                    return anonymousId;
                }
            }
            catch (CryptographicException)
            {
                // Treat altered or expired protected values as a new anonymous visitor.
            }
        }

        var newAnonymousId = Guid.NewGuid();
        context.Response.Cookies.Append(
            CookieName,
            protector.Protect(newAnonymousId.ToString("D")),
            new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.Add(CookieLifetime),
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = context.Request.IsHttps
            });

        return newAnonymousId;
    }
}
