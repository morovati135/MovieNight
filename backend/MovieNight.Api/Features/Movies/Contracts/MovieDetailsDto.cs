namespace MovieNight.Api.Features.Movies.Contracts;

public sealed record MovieDetailsDto(
    int Id,
    string Title,
    string? Overview,
    DateOnly? ReleaseDate,
    IReadOnlyList<GenreDto> Genres,
    int RuntimeMinutes,
    string? PosterUrl,
    string? BackdropUrl,
    double VoteAverage,
    IReadOnlyList<CastDto> Cast);
