using System.Net;

namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbClient(HttpClient httpClient)
{
    private const string ConnectivityPath = "configuration/languages";

    public async Task VerifyConnectivityAsync(CancellationToken cancellationToken)
    {
        HttpResponseMessage response;

        try
        {
            response = await httpClient.GetAsync(ConnectivityPath, cancellationToken);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new TmdbUpstreamException("TMDB did not respond before the configured timeout.");
        }
        catch (HttpRequestException)
        {
            throw new TmdbUpstreamException("TMDB could not be reached.");
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                return;
            }

            if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
            {
                throw new TmdbAuthenticationException();
            }

            throw new TmdbUpstreamException("TMDB rejected the connectivity request.");
        }
    }
}

public sealed class TmdbAuthenticationException : Exception
{
    public TmdbAuthenticationException()
        : base("TMDB authentication failed.")
    {
    }
}

public sealed class TmdbUpstreamException : Exception
{
    public TmdbUpstreamException(string message)
        : base(message)
    {
    }
}
