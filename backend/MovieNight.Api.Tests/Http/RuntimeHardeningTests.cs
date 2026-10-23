using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace MovieNight.Api.Tests.Http;

public sealed class RuntimeHardeningTests
{
    [Fact]
    public async Task Responses_carry_basic_security_headers()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();

        var response = await client.GetAsync("/api/health");

        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("DENY", response.Headers.GetValues("X-Frame-Options").Single());
        Assert.Equal("no-referrer", response.Headers.GetValues("Referrer-Policy").Single());
    }

    [Fact]
    public async Task An_unexpected_failure_is_a_generic_500_problem_without_internal_detail()
    {
        using var host = await ApiHost.StartAsync();
        host.Tmdb.Override = _ => throw new InvalidOperationException("secret internal detail at Some.Namespace.Class");
        using var client = host.CreateBrowser();

        var response = await client.GetAsync("/api/movies/trending");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(500, JsonDocument.Parse(body).RootElement.GetProperty("status").GetInt32());
        Assert.DoesNotContain("secret", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Namespace", body, StringComparison.Ordinal);
        Assert.DoesNotContain("at ", body, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("this is not json")]
    [InlineData("""{ "page": "one", "results": 5 }""")]
    [InlineData("null")]
    public async Task A_malformed_tmdb_answer_is_a_safe_502(string upstreamBody)
    {
        using var host = await ApiHost.StartAsync();
        host.Tmdb.Override = _ => FakeTmdb.Json(upstreamBody);
        using var client = host.CreateBrowser();

        var response = await client.GetAsync("/api/movies/trending");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.DoesNotContain(upstreamBody.Length > 4 ? upstreamBody : "\u0000", await response.Content.ReadAsStringAsync(), StringComparison.Ordinal);
    }

    [Fact]
    public async Task The_tmdb_preflight_diagnostic_exists_only_in_development()
    {
        using var production = await ApiHost.StartAsync("Production");
        using var development = await ApiHost.StartAsync("Development");
        using var productionClient = production.CreateBrowser();
        using var developmentClient = development.CreateBrowser();

        Assert.Equal(HttpStatusCode.NotFound, (await productionClient.GetAsync("/api/tmdb/preflight")).StatusCode);
        Assert.Equal(0, production.Tmdb.RequestCount);
        Assert.Equal(HttpStatusCode.NoContent, (await developmentClient.GetAsync("/api/tmdb/preflight")).StatusCode);
    }

    [Fact]
    public async Task The_api_reference_and_openapi_document_exist_only_in_development()
    {
        using var production = await ApiHost.StartAsync("Production");
        using var development = await ApiHost.StartAsync("Development");
        using var productionClient = production.CreateBrowser();
        using var developmentClient = development.CreateBrowser();

        Assert.Equal(HttpStatusCode.NotFound, (await productionClient.GetAsync("/openapi/v1.json")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await productionClient.GetAsync("/scalar/v1")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await developmentClient.GetAsync("/openapi/v1.json")).StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Startup_fails_clearly_when_the_tmdb_token_is_missing(string token)
    {
        using var host = new ApiHost(settings: new Dictionary<string, string?> { ["Tmdb:ReadAccessToken"] = token });

        var failure = await Record.ExceptionAsync(() => Task.Run(() => host.CreateClient()));

        var validation = Assert.IsType<OptionsValidationException>(failure?.GetBaseException());
        Assert.Contains("TMDB configuration is missing", validation.Message);
        Assert.DoesNotContain(FakeTmdb.Token, validation.Message, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("http://api.themoviedb.org/3/")]
    [InlineData("not a url")]
    public async Task Startup_fails_when_the_tmdb_address_is_not_an_https_url(string baseUrl)
    {
        using var host = new ApiHost(settings: new Dictionary<string, string?> { ["Tmdb:BaseUrl"] = baseUrl });

        var failure = await Record.ExceptionAsync(() => Task.Run(() => host.CreateClient()));

        Assert.Contains("Tmdb:BaseUrl must be an absolute HTTPS URL", failure?.GetBaseException().Message);
    }

    [Fact]
    public async Task Cors_origins_come_from_configuration()
    {
        using var host = await ApiHost.StartAsync(settings: new Dictionary<string, string?> { ["Cors:AllowedOrigins:0"] = "https://movienight.example" });
        using var client = host.CreateBrowser();

        async Task<string?> AllowedOrigin(string origin)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/movies/genres");
            request.Headers.Add("Origin", origin);
            var response = await client.SendAsync(request);
            return response.Headers.TryGetValues("Access-Control-Allow-Origin", out var values) ? values.Single() : null;
        }

        Assert.Equal("https://movienight.example", await AllowedOrigin("https://movienight.example"));
        Assert.Null(await AllowedOrigin("http://localhost:3000"));
    }

    [Fact]
    public async Task Cors_never_allows_credentials_from_another_origin()
    {
        using var host = await ApiHost.StartAsync();
        using var client = host.CreateBrowser();
        using var request = new HttpRequestMessage(HttpMethod.Options, "/api/watchlist");
        request.Headers.Add("Origin", "https://evil.example");
        request.Headers.Add("Access-Control-Request-Method", "POST");

        var response = await client.SendAsync(request);

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
        Assert.False(response.Headers.Contains("Access-Control-Allow-Credentials"));
    }

    [Fact]
    public async Task The_anonymous_cookie_is_secure_over_https_and_not_over_http()
    {
        using var host = await ApiHost.StartAsync();
        using var http = host.CreateClient(new() { BaseAddress = new Uri("http://localhost"), HandleCookies = false });
        using var https = host.CreateClient(new() { BaseAddress = new Uri("https://localhost"), HandleCookies = false });

        var overHttp = (await http.GetAsync("/api/watchlist")).Headers.GetValues("Set-Cookie").Single();
        var overHttps = (await https.GetAsync("/api/watchlist")).Headers.GetValues("Set-Cookie").Single();

        Assert.DoesNotContain("secure", overHttp, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", overHttps, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("httponly", overHttps, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task The_tmdb_token_is_sent_to_tmdb_only_and_never_returned()
    {
        using var host = await ApiHost.StartAsync();
        string? authorization = null;
        host.Tmdb.Override = request =>
        {
            authorization = request.Headers.Authorization?.ToString();
            return null;
        };
        using var client = host.CreateBrowser();

        var response = await client.GetAsync("/api/movies/trending");

        Assert.Equal($"Bearer {FakeTmdb.Token}", authorization);
        Assert.DoesNotContain(FakeTmdb.Token, string.Join("\n", response.Headers.Select(header => string.Join(",", header.Value))), StringComparison.Ordinal);
        Assert.DoesNotContain(FakeTmdb.Token, await response.Content.ReadAsStringAsync(), StringComparison.Ordinal);
    }
}
