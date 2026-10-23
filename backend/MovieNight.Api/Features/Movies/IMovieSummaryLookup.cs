using MovieNight.Api.Features.Movies.Contracts;

namespace MovieNight.Api.Features.Movies;

public interface IMovieSummaryLookup
{
    Task<MovieSummaryDto> GetSummaryAsync(int movieId, CancellationToken cancellationToken);
}
