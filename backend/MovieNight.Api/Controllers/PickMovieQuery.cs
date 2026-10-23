using System.ComponentModel.DataAnnotations;

namespace MovieNight.Api.Controllers;

public sealed class PickMovieQuery
{
    [Range(1, int.MaxValue)]
    public int? GenreId { get; init; }

    [Range(1888, 2100)]
    public int? Year { get; init; }

    [Range(typeof(double), "0", "10")]
    public double? MinRating { get; init; }
}
