using System.Globalization;
using MovieNight.Api.Features.Caching;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Movies;

public sealed class MovieCatalogService(TmdbClient tmdbClient, CatalogCache cache, Func<int, int, int>? nextRandom = null)
    : IMovieSummaryLookup
{
    private const int PickPageLimit = 15;

    public Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            $"movies:summary:{movieId}",
            CacheTtl.Movie,
            async token => TmdbMovieMapper.ToMovieSummary(await tmdbClient.GetMovieSummaryAsync(movieId, token)),
            cancellationToken,
            rememberNotFound: true);

    public Task<IReadOnlyList<GenreDto>> GetGenresAsync(CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            "movies:genres",
            CacheTtl.Genres,
            async token => (IReadOnlyList<GenreDto>)(await tmdbClient.GetMovieGenresAsync(token)).Genres.Select(TmdbMovieMapper.ToGenre).ToArray(),
            cancellationToken);

    public Task<PagedMovieResultDto> GetTrendingAsync(int page, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            $"movies:trending:{page}",
            CacheTtl.Trending,
            async token => TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetTrendingMoviesAsync(page, token)),
            cancellationToken);

    public Task<PagedMovieResultDto> GetPopularAsync(int page, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            $"movies:popular:{page}",
            CacheTtl.Trending,
            async token => TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetPopularMoviesAsync(page, token)),
            cancellationToken);

    public Task<PagedMovieResultDto> GetTopRatedAsync(int page, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            $"movies:top-rated:{page}",
            CacheTtl.TopRated,
            async token => TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.GetTopRatedMoviesAsync(page, token)),
            cancellationToken);

    public async Task<PagedMovieResultDto> SearchAsync(string query, int? year, int page, CancellationToken cancellationToken)
    {
        return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.SearchMoviesAsync(query, year, page, cancellationToken));
    }

    public async Task<PagedMovieResultDto> DiscoverAsync(int? genreId, int? year, double? minRating, int page, CancellationToken cancellationToken)
    {
        return await DiscoverPageAsync(genreId, year, minRating, page, cancellationToken);
    }

    // Pick samples from the same cached pages, so a Pick after browsing a genre costs no extra TMDB call.
    private Task<PagedMovieResultDto> DiscoverPageAsync(int? genreId, int? year, double? minRating, int page, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            DiscoverKey(genreId, year, minRating, page),
            CacheTtl.Discover,
            async token => TmdbMovieMapper.ToPagedMovieResult(
                await tmdbClient.DiscoverMoviesAsync(new TmdbDiscoverRequest(genreId, year, minRating, page), token)),
            cancellationToken);

    private static string DiscoverKey(int? genreId, int? year, double? minRating, int page) =>
        string.Create(CultureInfo.InvariantCulture, $"movies:discover:g{genreId}:y{year}:r{minRating:0.0#}:p{page}");

    public async Task<MovieSummaryDto?> PickAsync(int? genreId, int? year, double? minRating, CancellationToken cancellationToken)
    {
        var firstPage = await DiscoverPageAsync(genreId, year, minRating, 1, cancellationToken);
        if (firstPage.TotalPages < 1)
        {
            return null;
        }

        var random = nextRandom ?? Random.Shared.Next;
        var page = random(1, Math.Min(firstPage.TotalPages, PickPageLimit) + 1);
        var candidates = page == 1
            ? firstPage
            : await DiscoverPageAsync(genreId, year, minRating, page, cancellationToken);
        var validMovies = candidates.Results.Where(candidate => candidate.Id > 0 && !string.IsNullOrWhiteSpace(candidate.Title)).ToArray();

        return validMovies.Length == 0 ? null : validMovies[random(0, validMovies.Length)];
    }

    public Task<MovieDetailsDto> GetDetailsAsync(int movieId, CancellationToken cancellationToken) =>
        cache.GetOrCreateAsync(
            $"movies:details:{movieId}",
            CacheTtl.Movie,
            async token => TmdbMovieMapper.ToMovieDetails(await tmdbClient.GetMovieDetailsAsync(movieId, token)),
            cancellationToken,
            rememberNotFound: true);
}
