namespace MovieNight.Api.Features.Movies.Contracts;

public sealed record CastDto(
    int Id,
    string Name,
    string? Character,
    int Order,
    string? ProfileUrl);
