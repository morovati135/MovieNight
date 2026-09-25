using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using MovieNight.Api.Features.Watchlists;
using System.Globalization;
using System.Text.RegularExpressions;

namespace MovieNight.Api.Tests;

public sealed class AnonymousVisitorIdentityServiceTests
{
    [Fact]
    public void GetOrCreate_creates_a_protected_persistent_cookie_for_a_first_watchlist_interaction()
    {
        var provider = new EphemeralDataProtectionProvider();
        var service = new AnonymousVisitorIdentityService(provider);
        var context = new DefaultHttpContext();
        var beforeCreation = DateTimeOffset.UtcNow;

        var anonymousId = service.GetOrCreate(context);

        Assert.NotEqual(Guid.Empty, anonymousId);
        var setCookie = Assert.Single(context.Response.Headers.SetCookie)
            ?? throw new InvalidOperationException("The Set-Cookie header must have a value.");
        Assert.Contains("movienight.anonymous-id=", setCookie, StringComparison.Ordinal);
        Assert.DoesNotContain(anonymousId.ToString("D"), setCookie, StringComparison.Ordinal);
        Assert.Contains("expires=", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("httponly", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", setCookie, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("secure", setCookie, StringComparison.OrdinalIgnoreCase);
        var expirationValue = Regex.Match(setCookie, @"expires=([^;]+)", RegexOptions.IgnoreCase).Groups[1].Value;
        var expiration = DateTimeOffset.ParseExact(expirationValue, "r", CultureInfo.InvariantCulture);
        Assert.InRange(expiration, beforeCreation.AddDays(364), beforeCreation.AddDays(366));
    }

    [Fact]
    public void GetOrCreate_resolves_a_returning_visitor_without_reissuing_the_cookie()
    {
        var provider = new EphemeralDataProtectionProvider();
        var service = new AnonymousVisitorIdentityService(provider);
        var anonymousId = Guid.NewGuid();
        var protectedValue = provider.CreateProtector("MovieNight.Api.AnonymousVisitorIdentity.v1").Protect(anonymousId.ToString("D"));
        var context = new DefaultHttpContext();
        context.Request.Headers.Cookie = $"movienight.anonymous-id={protectedValue}";

        var resolvedId = service.GetOrCreate(context);

        Assert.Equal(anonymousId, resolvedId);
        Assert.Equal(0, context.Response.Headers.SetCookie.Count);
    }

    [Fact]
    public void GetOrCreate_replaces_an_invalid_or_tampered_cookie_safely()
    {
        var provider = new EphemeralDataProtectionProvider();
        var service = new AnonymousVisitorIdentityService(provider);
        var context = new DefaultHttpContext();
        context.Request.Headers.Cookie = "movienight.anonymous-id=not-a-valid-protected-value";

        var anonymousId = service.GetOrCreate(context);

        Assert.NotEqual(Guid.Empty, anonymousId);
        Assert.Single(context.Response.Headers.SetCookie);
    }

    [Fact]
    public void GetOrCreate_marks_the_cookie_secure_for_https_requests()
    {
        var service = new AnonymousVisitorIdentityService(new EphemeralDataProtectionProvider());
        var context = new DefaultHttpContext();
        context.Request.Scheme = "https";

        service.GetOrCreate(context);

        Assert.Contains("secure", Assert.Single(context.Response.Headers.SetCookie), StringComparison.OrdinalIgnoreCase);
    }
}
