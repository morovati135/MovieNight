using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbClient(HttpClient httpClient)
{
    private const string ConnectivityPath = "configuration/languages";
    private const string MovieGenresPath = "genre/movie/list";

    internal async Task<TmdbGenreListResponse> GetMovieGenresAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var response = await httpClient.GetAsync(MovieGenresPath, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<TmdbGenreListResponse>(cancellationToken: cancellationToken)
                    ?? throw new TmdbUpstreamException("TMDB returned an empty genre response.");
            }

            if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
            {
                throw new TmdbAuthenticationException();
            }

            throw new TmdbUpstreamException("TMDB rejected the genre request.");
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new TmdbUpstreamException("TMDB did not respond before the configured timeout.");
        }
        catch (HttpRequestException)
        {
            throw new TmdbUpstreamException("TMDB could not be reached.");
        }
        catch (JsonException)
        {
            throw new TmdbUpstreamException("TMDB returned an invalid genre response.");
        }
    }

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
