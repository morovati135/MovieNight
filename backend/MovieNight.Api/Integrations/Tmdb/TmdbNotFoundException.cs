namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbNotFoundException : Exception
{
    public TmdbNotFoundException()
        : base("TMDB movie was not found.")
    {
    }
}
