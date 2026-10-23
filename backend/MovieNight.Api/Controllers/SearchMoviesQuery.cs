using System.ComponentModel.DataAnnotations;

namespace MovieNight.Api.Controllers;

public sealed class SearchMoviesQuery
{
    [Required]
    [RegularExpression(@".*\S.*", ErrorMessage = "Query must not be blank.")]
    public string Query { get; init; } = string.Empty;

    [Range(1888, 2100)]
    public int? Year { get; init; }

    [Range(1, 500)]
    public int Page { get; init; } = 1;
}
