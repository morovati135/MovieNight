namespace MovieNight.Api.Features.Movies.Contracts;

public sealed record MovieSummaryDto(
    int Id,
    string Title,
    string? Overview,
    DateOnly? ReleaseDate,
    IReadOnlyList<int> GenreIds,
    string? PosterUrl,
    double VoteAverage);
