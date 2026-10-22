using System.Net;
using System.Net.Http.Json;
using System.Globalization;
using System.Text.Json;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbClient(HttpClient httpClient)
{
    private const string ConnectivityPath = "configuration/languages";
    private const string MovieGenresPath = "genre/movie/list";
    private const string TrendingMoviesPath = "trending/movie/week";
    private const string PopularMoviesPath = "movie/popular";
    private const string SearchMoviesPath = "search/movie";
    private const string DiscoverMoviesPath = "discover/movie";

    // D028: a minimum rating only counts for movies rated by enough people.
    private const int MinimumRatingVoteCount = 100;

    internal Task<TmdbMovie> GetMovieSummaryAsync(int movieId, CancellationToken cancellationToken) =>
        GetFromTmdbAsync<TmdbMovie>(
            $"movie/{movieId}",
            "movie summary",
            cancellationToken);

    internal Task<TmdbMovie> GetMovieDetailsAsync(int movieId, CancellationToken cancellationToken) =>
        GetFromTmdbAsync<TmdbMovie>(
            // One request: credits (cast + directors), recommendations, and text-free images for the scene gallery.
            $"movie/{movieId}?append_to_response=credits,recommendations,images&include_image_language=null",
            "movie details",
            cancellationToken);

    internal async Task<TmdbGenreListResponse> GetMovieGenresAsync(CancellationToken cancellationToken)
    {
        return await GetFromTmdbAsync<TmdbGenreListResponse>(MovieGenresPath, "genre", cancellationToken);
    }

    internal Task<TmdbMoviePage> GetTrendingMoviesAsync(CancellationToken cancellationToken) =>
        GetFromTmdbAsync<TmdbMoviePage>(TrendingMoviesPath, "trending movies", cancellationToken);

    internal Task<TmdbMoviePage> GetPopularMoviesAsync(CancellationToken cancellationToken) =>
        GetFromTmdbAsync<TmdbMoviePage>(PopularMoviesPath, "popular movies", cancellationToken);

    internal Task<TmdbMoviePage> SearchMoviesAsync(string query, int? year, int page, CancellationToken cancellationToken)
    {
        var yearParameter = year is null ? string.Empty : $"&primary_release_year={year}";

        return GetFromTmdbAsync<TmdbMoviePage>(
            $"{SearchMoviesPath}?query={Uri.EscapeDataString(query)}&page={page}{yearParameter}",
            "movie search",
            cancellationToken);
    }

    internal Task<TmdbMoviePage> DiscoverMoviesAsync(TmdbDiscoverRequest request, CancellationToken cancellationToken)
    {
        var parameters = new List<string>
        {
            "sort_by=popularity.desc",
            $"page={request.Page}"
        };

        if (request.GenreId is not null)
        {
            parameters.Add($"with_genres={request.GenreId}");
        }

        if (request.Year is not null)
        {
            parameters.Add($"primary_release_year={request.Year}");
        }

        if (request.MinRating is not null)
        {
            parameters.Add($"vote_average.gte={request.MinRating.Value.ToString(CultureInfo.InvariantCulture)}");
            parameters.Add($"vote_count.gte={MinimumRatingVoteCount}");
        }

        return GetFromTmdbAsync<TmdbMoviePage>(
            $"{DiscoverMoviesPath}?{string.Join('&', parameters)}",
            "movie discovery",
            cancellationToken);
    }

    private async Task<T> GetFromTmdbAsync<T>(string path, string operation, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await httpClient.GetAsync(path, cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<T>(cancellationToken: cancellationToken)
                    ?? throw new TmdbUpstreamException($"TMDB returned an empty {operation} response.");
            }

            if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
            {
                throw new TmdbAuthenticationException();
            }

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                throw new TmdbNotFoundException();
            }

            throw new TmdbUpstreamException($"TMDB rejected the {operation} request.");
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
            throw new TmdbUpstreamException($"TMDB returned an invalid {operation} response.");
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

internal sealed record TmdbDiscoverRequest(int? GenreId, int? Year, double? MinRating, int Page);

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

public sealed class TmdbNotFoundException : Exception
{
    public TmdbNotFoundException()
        : base("TMDB movie was not found.")
    {
    }
}
