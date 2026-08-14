using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbGenreListResponse
{
    [JsonPropertyName("genres")]
    public IReadOnlyList<TmdbGenre> Genres { get; init; } = [];
}

internal sealed class TmdbGenre
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;
}

internal sealed class TmdbMoviePage
{
    [JsonPropertyName("results")]
    public IReadOnlyList<TmdbMovie> Results { get; init; } = [];

    [JsonPropertyName("page")]
    public int Page { get; init; }

    [JsonPropertyName("total_pages")]
    public int TotalPages { get; init; }

    [JsonPropertyName("total_results")]
    public int TotalResults { get; init; }
}

internal sealed class TmdbMovie
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("overview")]
    public string? Overview { get; init; }

    [JsonPropertyName("release_date")]
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
}

internal sealed class TmdbMovieCredits
{
    [JsonPropertyName("cast")]
    public IReadOnlyList<TmdbCastMember> Cast { get; init; } = [];
}

internal sealed class TmdbCastMember
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("character")]
    public string? Character { get; init; }

    [JsonPropertyName("order")]
    public int Order { get; init; }

    [JsonPropertyName("profile_path")]
    public string? ProfilePath { get; init; }
}
