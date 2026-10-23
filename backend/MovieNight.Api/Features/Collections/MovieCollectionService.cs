using Microsoft.Extensions.Caching.Memory;
using MovieNight.Api.Features.Collections.Contracts;
using MovieNight.Api.Features.Movies;
using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Features.Collections;

public sealed class MovieCollectionService(TmdbClient tmdbClient, IMemoryCache cache)
{
    private const string CollectionsCacheKey = "collections:all";
    private const int PostersPerCollection = 3;
    private static readonly TimeSpan CollectionsCacheDuration = TimeSpan.FromHours(6);

    /// <summary>
    /// The curated collections with their cover posters. A collection whose TMDB data cannot be loaded is
    /// left out rather than failing the whole list; if none can be loaded, the TMDB failure is raised.
    /// </summary>
    public async Task<IReadOnlyList<MovieCollectionDto>> GetCollectionsAsync(CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CollectionsCacheKey, out IReadOnlyList<MovieCollectionDto>? cached) && cached is not null)
        {
            return cached;
        }

        var attempts = await Task.WhenAll(MovieCollectionCatalog.All.Select(async definition =>
        {
            try
            {
                var movies = await GetFirstPageAsync(definition, cancellationToken);
                var posters = movies
                    .Select(movie => movie.PosterUrl)
                    .OfType<string>()
                    .Take(PostersPerCollection)
                    .ToArray();

                return (Collection: posters.Length > 0 ? new MovieCollectionDto(definition.Slug, definition.Title, posters) : null, Error: (Exception?)null);
            }
            catch (Exception exception) when (exception is TmdbUpstreamException or TmdbNotFoundException)
            {
                return (Collection: null, Error: exception);
            }
        }));

        var collections = attempts.Select(attempt => attempt.Collection).OfType<MovieCollectionDto>().ToArray();

        if (collections.Length == 0 && attempts.FirstOrDefault(attempt => attempt.Error is TmdbUpstreamException).Error is { } error)
        {
            throw error;
        }

        cache.Set(CollectionsCacheKey, (IReadOnlyList<MovieCollectionDto>)collections, CollectionsCacheDuration);
        return collections;
    }

    /// <summary>
    /// One page of a collection's movies, or null for an unknown slug. A franchise is a single page in
    /// release order; studio and genre collections page through TMDB Discover.
    /// </summary>
    public async Task<PagedMovieResultDto?> GetCollectionMoviesAsync(string slug, int page, CancellationToken cancellationToken)
    {
        var definition = MovieCollectionCatalog.Find(slug);
        if (definition is null)
        {
            return null;
        }

        return await cache.GetOrCreateAsync($"collections:{slug}:{page}", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CollectionsCacheDuration;
            return await GetPageAsync(definition, page, cancellationToken);
        });
    }

    private async Task<IReadOnlyList<MovieSummaryDto>> GetFirstPageAsync(MovieCollectionDefinition definition, CancellationToken cancellationToken) =>
        (await GetPageAsync(definition, 1, cancellationToken)).Results;

    private async Task<PagedMovieResultDto> GetPageAsync(MovieCollectionDefinition definition, int page, CancellationToken cancellationToken)
    {
        switch (definition.Source)
        {
            case MovieCollectionSource.Franchise:
                if (page > 1)
                {
                    return new PagedMovieResultDto([], page, 1, 0);
                }

                var collection = await tmdbClient.GetCollectionAsync(int.Parse(definition.TmdbId), cancellationToken);
                var movies = OrderFranchise(collection).Select(TmdbMovieMapper.ToMovieSummary).ToArray();
                return new PagedMovieResultDto(movies, 1, 1, movies.Length);
            case MovieCollectionSource.Studio:
                return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.DiscoverMoviesAsync(new TmdbDiscoverRequest(null, null, null, page, definition.TmdbId), cancellationToken));
            default:
                return TmdbMovieMapper.ToPagedMovieResult(await tmdbClient.DiscoverMoviesAsync(new TmdbDiscoverRequest(int.Parse(definition.TmdbId), null, null, page), cancellationToken));
        }
    }

    /// <summary>Franchise films in release order; unreleased entries (no date) go last.</summary>
    internal static IEnumerable<TmdbMovie> OrderFranchise(TmdbCollection collection) =>
        collection.Parts
            .Where(movie => movie.Id > 0 && !string.IsNullOrWhiteSpace(movie.Title))
            .OrderBy(movie => movie.ReleaseDate is null)
            .ThenBy(movie => movie.ReleaseDate);
}
