import Image from "next/image";

type PersonPortraitProps = {
  name: string;
  profileUrl: string | null;
  /** Second caption line, e.g. the character for cast members. */
  detail?: string | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Circular portrait with name (and optional detail) underneath; initials when there is no photo. */
export function PersonPortrait({ detail, name, profileUrl }: PersonPortraitProps) {
  return (
    <figure>
      <div className="relative size-24 overflow-hidden rounded-full bg-surface-raised ring-1 ring-white/12 sm:size-28 lg:size-[7.5rem]">
        {profileUrl ? (
          <Image
            alt=""
            className="object-cover object-[center_20%]"
            fill
            sizes="(max-width: 639px) 96px, (max-width: 1023px) 112px, 120px"
            src={profileUrl}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-full items-center justify-center text-xl font-extrabold text-white/60 sm:text-2xl"
          >
            {initials(name)}
          </span>
        )}
      </div>
      <figcaption className="mt-3 space-y-0.5 text-center">
        <span className="line-clamp-2 text-sm font-semibold text-white">{name}</span>
        {detail ? <span className="line-clamp-2 text-xs text-white/55">{detail}</span> : null}
      </figcaption>
    </figure>
  );
}
