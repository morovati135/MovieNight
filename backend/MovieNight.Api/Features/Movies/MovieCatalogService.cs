using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Movies;

public interface IMovieSummaryLookup
{
    Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken);
}

public sealed class MovieCatalogService(TmdbClient tmdbClient, IMemoryCache cache, Func<int, int, int>? nextRandom = null)
    : IMovieSummaryLookup
{
    private const int PickPageLimit = 15;
    private const string GenresCacheKey = "movies:genres";
        private static readonly TimeSpan GenresCacheDuration = TimeSpan.FromHours(6);
    private static readonly TimeSpan ListCacheDuration = TimeSpan.FromMinutes(5);
    // The all-time top rated list barely changes.
    private static readonly TimeSpan TopRatedCacheDuration = TimeSpan.FromHours(1);
    private static readonly TimeSpan SummaryCacheDuration = TimeSpan.FromMinutes(10);
    private static readonly TimeSpan DetailsCacheDuration = TimeSpan.FromMinutes(10);

    public async Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken)
    {
        var cacheKey = $"movies:summary:{movieId}";
        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = SummaryCacheDuration;
            return TmdbMovieMapper.ToMovieSummary(await tmdbClient.GetMovieSummaryAsync(movieId, cancellationToken));
        }) ?? throw new TmdbUpstreamException("TMDB returned an empty movie summary response.");
    }

    public async Task<IReadOnlyList<GenreDto>> GetGenresAsync(CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync(GenresCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = GenresCacheDuration;
            var response = await tmdbClient.GetMovieGenresAsync(cancellationToken);
            return (IReadOnlyList<GenreDto>)response.Genres.Select(TmdbMovieMapper.ToGenre).ToArray();
        }) ?? [];
    }

    public async Task<PagedMovieResultDto> GetTrendingAsync(int page, CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync($"movies:trending:{page}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = ListCacheDuration;
            return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetTrendingMoviesAsync(page, cancellationToken));
        }) ?? EmptyPage();
    }

    public async Task<PagedMovieResultDto> GetPopularAsync(int page, CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync($"movies:popular:{page}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = ListCacheDuration;
            return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetPopularMoviesAsync(page, cancellationToken));
        }) ?? EmptyPage();
    }

    public async Task<PagedMovieResultDto> GetTopRatedAsync(int page, CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync($"movies:top-rated:{page}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TopRatedCacheDuration;
            return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetTopRatedMoviesAsync(page, cancellationToken));
        }) ?? EmptyPage();
    }

    public async Task<PagedMovieResultDto> SearchAsync(string query, int? year, int page, CancellationToken cancellationToken)
    {
        return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.SearchMoviesAsync(query, year, page, cancellationToken));
    }

    public async Task<PagedMovieResultDto> DiscoverAsync(int? genreId, int? year, double? minRating, int page, CancellationToken cancellationToken)
    {
        var request = new TmdbDiscoverRequest(genreId, year, minRating, page);
        return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.DiscoverMoviesAsync(request, cancellationToken));
    }

    public async Task<MovieSummaryDto?> PickAsync(int? genreId, int? year, double? minRating, CancellationToken cancellationToken)
    {
        var firstPage = await tmdbClient.DiscoverMoviesAsync(new TmdbDiscoverRequest(genreId, year, minRating, 1), cancellationToken);
        if (firstPage.TotalPages < 1)
        {
            return null;
        }

        var random = nextRandom ?? Random.Shared.Next;
        var page = random(1, Math.Min(firstPage.TotalPages, PickPageLimit) + 1);
        var candidates = page == 1
            ? firstPage
            : await tmdbClient.DiscoverMoviesAsync(new TmdbDiscoverRequest(genreId, year, minRating, page), cancellationToken);
        var validMovies = candidates.Results.Where(candidate => candidate.Id > 0 && !string.IsNullOrWhiteSpace(candidate.Title)).ToArray();

        return validMovies.Length == 0 ? null : TmdbMovieMapper.ToMovieSummary(validMovies[random(0, validMovies.Length)]);
    }

    public async Task<MovieDetailsDto> GetDetailsAsync(int movieId, CancellationToken cancellationToken)
    {
        var cacheKey = $"movies:details:{movieId}";
        return await cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = DetailsCacheDuration;
            return TmdbMovieMapper.ToMovieDetails(await tmdbClient.GetMovieDetailsAsync(movieId, cancellationToken));
        }) ?? throw new TmdbUpstreamException("TMDB returned an empty movie details response.");
    }

    private static PagedMovieResultDto EmptyPage() => new([], 1, 0, 0);
}
