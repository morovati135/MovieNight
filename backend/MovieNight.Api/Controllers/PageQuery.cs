using System.ComponentModel.DataAnnotations;

namespace MovieNight.Api.Controllers;

public sealed class PageQuery
{
    [Range(1, 500)]
    public int Page { get; init; } = 1;
}
