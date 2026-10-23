namespace MovieNight.Api.Integrations.Tmdb;

internal sealed record TmdbDiscoverRequest(int? GenreId, int? Year, double? MinRating, int Page, string? CompanyIds = null);
