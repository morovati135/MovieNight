using System.ComponentModel.DataAnnotations;
using MovieNight.Api.Controllers;

namespace MovieNight.Api.Tests;

public sealed class MoviesQueryValidationTests
{
    [Theory]
    [InlineData("", 1)]
    [InlineData("   ", 1)]
    [InlineData("arrival", 0)]
    [InlineData("arrival", 501)]
    public void Search_query_rejects_blank_query_and_invalid_page(string query, int page)
    {
        var result = Validate(new SearchMoviesQuery { Query = query, Page = page });

        Assert.NotEmpty(result);
    }

    [Theory]
    [InlineData(0, null, null, 1)]
    [InlineData(null, 1887, null, 1)]
    [InlineData(null, 2101, null, 1)]
    [InlineData(null, null, -0.1, 1)]
    [InlineData(null, null, 10.1, 1)]
    [InlineData(null, null, null, 0)]
    public void Discover_query_rejects_invalid_public_filters(int? genreId, int? year, double? minRating, int page)
    {
        var result = Validate(new DiscoverMoviesQuery { GenreId = genreId, Year = year, MinRating = minRating, Page = page });

        Assert.NotEmpty(result);
    }

    [Fact]
    public void Valid_queries_pass_validation_and_default_to_first_page()
    {
        Assert.Empty(Validate(new SearchMoviesQuery { Query = "arrival" }));
        Assert.Empty(Validate(new DiscoverMoviesQuery()));
        Assert.Equal(1, new SearchMoviesQuery { Query = "arrival" }.Page);
        Assert.Equal(1, new DiscoverMoviesQuery().Page);
    }

    private static List<ValidationResult> Validate(object value)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(value, new ValidationContext(value), results, validateAllProperties: true);
        return results;
    }
}
