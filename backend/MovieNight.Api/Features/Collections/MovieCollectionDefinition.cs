namespace MovieNight.Api.Features.Collections;

public sealed record MovieCollectionDefinition(string Slug, string Title, MovieCollectionSource Source, string TmdbId);
