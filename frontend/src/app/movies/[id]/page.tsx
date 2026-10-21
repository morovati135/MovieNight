import { MovieDetailsExperience } from "@/components/movie-details/movie-details-experience";

export default async function MovieDetailsPage({ params }: PageProps<"/movies/[id]">) {
  const { id } = await params;
  // Only positive whole numbers are valid movie IDs; anything else is shown as not found without a request.
  const movieId = /^[1-9]\d{0,9}$/.test(id) && Number(id) <= 2147483647 ? Number(id) : null;

  return <MovieDetailsExperience movieId={movieId} />;
}
