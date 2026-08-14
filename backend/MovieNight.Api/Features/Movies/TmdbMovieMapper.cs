using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Features.Movies;

internal static class TmdbMovieMapper
{
    // Details pages need a concise, above-the-fold cast and recommendation list.
    internal const int DetailsCastLimit = 12;
    internal const int SimilarMoviesLimit = 12;

    public static GenreDto ToGenre(TmdbGenre genre) => new(genre.Id, genre.Name);

    public static MovieSummaryDto ToMovieSummary(TmdbMovie movie) => new(
        movie.Id,
        movie.Title,
        movie.Overview,
        movie.ReleaseDate,
        movie.GenreIds,
        TmdbImageUrlBuilder.BuildPosterUrl(movie.PosterPath),
        movie.VoteAverage);

    public static PagedMovieResultDto ToPagedMovieResult(TmdbMoviePage page) => new(
        page.Results.Select(ToMovieSummary).ToArray(),
        page.Page,
        page.TotalPages,
        page.TotalResults);

    public static MovieDetailsDto ToMovieDetails(TmdbMovie movie) => new(
        movie.Id,
        movie.Title,
        movie.Overview,
        movie.ReleaseDate,
        movie.Genres.Select(ToGenre).ToArray(),
        movie.RuntimeMinutes,
        TmdbImageUrlBuilder.BuildPosterUrl(movie.PosterPath),
        TmdbImageUrlBuilder.BuildBackdropUrl(movie.BackdropPath),
        movie.VoteAverage,
        movie.Credits.Cast.OrderBy(member => member.Order).Take(DetailsCastLimit).Select(ToCast).ToArray(),
        movie.Similar.Results.Take(SimilarMoviesLimit).Select(ToMovieSummary).ToArray());

    public static CastDto ToCast(TmdbCastMember castMember) => new(
        castMember.Id,
        castMember.Name,
        castMember.Character,
        castMember.Order,
        TmdbImageUrlBuilder.BuildProfileUrl(castMember.ProfilePath));
}
