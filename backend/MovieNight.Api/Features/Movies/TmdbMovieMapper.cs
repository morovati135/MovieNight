using MovieNight.Api.Features.Movies.Contracts;
using MovieNight.Api.Integrations.Tmdb;
using MovieNight.Api.Integrations.Tmdb.Transport;

namespace MovieNight.Api.Features.Movies;

internal static class TmdbMovieMapper
{
    // Details pages need a concise, above-the-fold cast and recommendation list.
    internal const int DetailsCastLimit = 12;
    internal const int SimilarMoviesLimit = 12;
    internal const int SceneImagesLimit = 10;

    public static GenreDto ToGenre(TmdbGenre genre) => new(genre.Id, genre.Name);

    public static MovieSummaryDto ToMovieSummary(TmdbMovie movie) => new(
        movie.Id,
        movie.Title,
        movie.Overview,
        movie.ReleaseDate,
        movie.GenreIds.Count > 0 ? movie.GenreIds : movie.Genres.Select(genre => genre.Id).ToArray(),
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
        // TMDB recommendations are more relevant than its keyword-based "similar" list (D027).
        movie.Recommendations.Results.Take(SimilarMoviesLimit).Select(ToMovieSummary).ToArray(),
        movie.Credits.Crew
            .Where(member => member.Job == "Director")
            .DistinctBy(member => member.Id)
            .Select(member => new PersonDto(member.Id, member.Name, TmdbImageUrlBuilder.BuildProfileUrl(member.ProfilePath)))
            .ToArray(),
        movie.ProductionCountries.Select(country => country.Code).Where(code => code.Length > 0).ToArray(),
        // Text-free backdrops serve as scene images; the hero backdrop is not repeated.
        movie.Images.Backdrops
            .Select(image => image.FilePath)
            .Where(path => path.Length > 0 && path != movie.BackdropPath)
            .Distinct()
            .Take(SceneImagesLimit)
            .Select(path => TmdbImageUrlBuilder.BuildSceneImageUrl(path)!)
            .ToArray());

    public static CastDto ToCast(TmdbCastMember castMember) => new(
        castMember.Id,
        castMember.Name,
        castMember.Character,
        castMember.Order,
        TmdbImageUrlBuilder.BuildProfileUrl(castMember.ProfilePath));
}
