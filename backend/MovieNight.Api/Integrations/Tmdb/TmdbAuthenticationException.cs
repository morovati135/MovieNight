namespace MovieNight.Api.Integrations.Tmdb;

public sealed class TmdbAuthenticationException : Exception
{
    public TmdbAuthenticationException()
        : base("TMDB authentication failed.")
    {
    }
}
