using System.Net;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Tests;

public sealed class TmdbClientTests
{
    [Fact]
    public async Task VerifyConnectivityAsync_returns_when_upstream_succeeds()
    {
        var handler = new StubHttpMessageHandler(HttpStatusCode.OK);
        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        var client = new TmdbClient(httpClient);

        await client.VerifyConnectivityAsync(CancellationToken.None);

        Assert.Equal("/3/configuration/languages", handler.RequestUri?.AbsolutePath);
    }

    [Fact]
    public async Task VerifyConnectivityAsync_translates_authentication_failure()
    {
        using var httpClient = new HttpClient(new StubHttpMessageHandler(HttpStatusCode.Unauthorized))
        {
            BaseAddress = new Uri("https://api.themoviedb.org/3/")
        };
        var client = new TmdbClient(httpClient);

        await Assert.ThrowsAsync<TmdbAuthenticationException>(() => client.VerifyConnectivityAsync(CancellationToken.None));
    }

    private sealed class StubHttpMessageHandler(HttpStatusCode statusCode) : HttpMessageHandler
    {
        public Uri? RequestUri { get; private set; }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            RequestUri = request.RequestUri;
            return Task.FromResult(new HttpResponseMessage(statusCode));
        }
    }
}
