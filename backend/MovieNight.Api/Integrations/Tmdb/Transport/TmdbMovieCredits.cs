using System.Text.Json.Serialization;

namespace MovieNight.Api.Integrations.Tmdb.Transport;

internal sealed class TmdbMovieCredits
{
    [JsonPropertyName("cast")]
    public IReadOnlyList<TmdbCastMember> Cast { get; init; } = [];

    [JsonPropertyName("crew")]
    public IReadOnlyList<TmdbCrewMember> Crew { get; init; } = [];
}
