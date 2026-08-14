using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;

namespace MovieNight.Api.Features.Movies;

public sealed class MovieCatalogService(TmdbClient tmdbClient, IMemoryCache cache)
{
    private const string GenresCacheKey = "tmdb:movie-genres";
    private static readonly TimeSpan GenresCacheDuration = TimeSpan.FromHours(12);

    public async Task<IReadOnlyList<GenreDto>> GetGenresAsync(CancellationToken cancellationToken)
    {
        var genres = await cache.GetOrCreateAsync(GenresCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = GenresCacheDuration;
            var response = await tmdbClient.GetMovieGenresAsync(cancellationToken);
            return response.Genres.Select(TmdbMovieMapper.ToGenre).ToArray();
        });

        return genres ?? [];
    }
}
