namespace MovieNight.Api.Features.Movies.Contracts;

public sealed record PersonDto(
    int Id,
    string Name,
    string? ProfileUrl);
