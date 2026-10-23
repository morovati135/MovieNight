using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbMovie
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; init; }

    [JsonPropertyName("release_date")]
    [JsonConverter(typeof(TmdbNullableDateOnlyJsonConverter))]
    public DateOnly? ReleaseDate { get; init; }

    [JsonPropertyName("genre_ids")]
    public IReadOnlyList<int> GenreIds { get; init; } = [];

    [JsonPropertyName("genres")]
    public IReadOnlyList<TmdbGenre> Genres { get; init; } = [];

    [JsonPropertyName("runtime")]
    public int RuntimeMinutes { get; init; }

    [JsonPropertyName("poster_path")]
    public string? PosterPath { get; init; }

    [JsonPropertyName("backdrop_path")]
    public string? BackdropPath { get; init; }

    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; init; }

    [JsonPropertyName("credits")]
    public TmdbMovieCredits Credits { get; init; } = new();

    [JsonPropertyName("production_countries")]
    public IReadOnlyList<TmdbProductionCountry> ProductionCountries { get; init; } = [];

    [JsonPropertyName("recommendations")]
    public TmdbMoviePage Recommendations { get; init; } = new();

    [JsonPropertyName("images")]
    public TmdbMovieImages Images { get; init; } = new();
}
