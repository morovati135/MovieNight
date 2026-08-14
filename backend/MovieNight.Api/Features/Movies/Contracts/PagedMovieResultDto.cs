namespace MovieNight.Api.Features.Movies.Contracts;

public sealed record PagedMovieResultDto(
    IReadOnlyList<MovieSummaryDto> Results,
    int Page,
    int TotalPages,
    int TotalResults);
