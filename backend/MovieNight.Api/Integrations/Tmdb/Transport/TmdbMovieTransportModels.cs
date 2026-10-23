using System.Globalization;
using System.Text.Json;
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

internal sealed class TmdbCollection
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("parts")]
    public IReadOnlyList<TmdbMovie> Parts { get; init; } = [];
}

internal sealed class TmdbProductionCountry
{
    [JsonPropertyName("iso_3166_1")]
    public string Code { get; init; } = string.Empty;
}

internal sealed class TmdbMovieImages
{
    [JsonPropertyName("backdrops")]
    public IReadOnlyList<TmdbImage> Backdrops { get; init; } = [];
}

internal sealed class TmdbImage
{
    [JsonPropertyName("file_path")]
    public string FilePath { get; init; } = string.Empty;
}

internal sealed class TmdbNullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
{
    public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return null;
        }

        if (reader.TokenType != JsonTokenType.String)
        {
            throw new JsonException();
        }

        var value = reader.GetString();
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var releaseDate)
            ? releaseDate
            : null;
    }

    public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
    }
}

internal sealed class TmdbMovieCredits
{
    [JsonPropertyName("cast")]
    public IReadOnlyList<TmdbCastMember> Cast { get; init; } = [];

    [JsonPropertyName("crew")]
    public IReadOnlyList<TmdbCrewMember> Crew { get; init; } = [];
}

internal sealed class TmdbCrewMember
{
    [JsonPropertyName("id")]
    public int Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("job")]
    public string? Job { get; init; }

    [JsonPropertyName("profile_path")]
    public string? ProfilePath { get; init; }
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
