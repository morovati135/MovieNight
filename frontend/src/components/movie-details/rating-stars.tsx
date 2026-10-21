import { Star } from "lucide-react";

const stars = [0, 1, 2, 3, 4];

/** Five stars filled to the TMDB score (0–10), followed by the score itself. */
export function RatingStars({ voteAverage }: { voteAverage: number }) {
  const score = Math.min(Math.max(voteAverage, 0), 10);
  const fillPercent = `${score * 10}%`;

  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="relative inline-flex">
        <span className="flex gap-0.5 text-white/25">
          {stars.map((star) => (
            <Star className="size-4 fill-current sm:size-[1.15rem]" key={star} />
          ))}
        </span>
        <span className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-[#f1d737]" style={{ width: fillPercent }}>
          {stars.map((star) => (
            <Star className="size-4 shrink-0 fill-current sm:size-[1.15rem]" key={star} />
          ))}
        </span>
      </span>
      <span className="sr-only">Rated </span>
      {score.toFixed(1)}
      <span className="sr-only"> out of 10</span>
    </span>
  );
}
