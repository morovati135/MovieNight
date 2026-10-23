namespace MovieNight.Api.Features.Collections.Contracts;

/// <summary>A curated collection as shown on Home: its title and the posters of up to three of its movies.</summary>
public sealed record MovieCollectionDto(string Slug, string Title, IReadOnlyList<string> PosterUrls);
