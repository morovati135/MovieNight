using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Movies;

public sealed class MovieCatalogService(TmdbClient tmdbClient, IMemoryCache cache, Func<int, int, int>? nextRandom = null)
{
    private const int PickPageLimit = 15;
    private const string GenresCacheKey = "movies:genres";
    private const string TrendingCacheKey = "movies:trending";
    private const string PopularCacheKey = "movies:popular";
    private static readonly TimeSpan GenresCacheDuration = TimeSpan.FromHours(6);
    private static readonly TimeSpan ListCacheDuration = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan DetailsCacheDuration = TimeSpan.FromMinutes(10);

    public async Task<IReadOnlyList<GenreDto>> GetGenresAsync(CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync(GenresCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = GenresCacheDuration;
            var response = await tmdbClient.GetMovieGenresAsync(cancellationToken);
            return (IReadOnlyList<GenreDto>)response.Genres.Select(TmdbMovieMapper.ToGenre).ToArray();
        }) ?? [];
    }

    public async Task<PagedMovieResultDto> GetTrendingAsync(CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync(TrendingCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = ListCacheDuration;
            return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetTrendingMoviesAsync(cancellationToken));
        }) ?? EmptyPage();
    }

    public async Task<PagedMovieResultDto> GetPopularAsync(CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync(PopularCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = ListCacheDuration;
            return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetPopularMoviesAsync(cancellationToken));
        }) ?? EmptyPage();
    }

    public async Task<PagedMovieResultDto> SearchAsync(string query, int page, CancellationToken cancellationToken)
    {
        return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.SearchMoviesAsync(query, page, cancellationToken));
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
