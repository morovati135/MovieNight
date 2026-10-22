/*
 * Vengeance UI animated-rays with its original gradients, filter and 60 s drift.
 * MovieNight is dark-only, so the original's dark rendering is used directly (its light-mode
 * invert and `.dark` class observer are not needed). The drift stops for reduced motion.
 */

import { cn } from "@/lib/utils";

const stripes = `repeating-linear-gradient(
    100deg,
    var(--stripe-color) 0%,
    var(--stripe-color) 7%,
    transparent 10%,
    transparent 12%,
    var(--stripe-color) 16%
)`;
const rainbow = `repeating-linear-gradient(
    100deg,
    #60a5fa 10%,
    #e879f9 15%,
    #60a5fa 20%,
    #5eead4 25%,
    #60a5fa 30%
)`;

export function AnimatedRays({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full overflow-hidden [--stripe-color:var(--background)]", className)}
    >
      {/* Aurora background — matches the original .hero */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `${stripes}, ${rainbow}`,
          backgroundSize: "300%, 200%",
          backgroundPosition: "50% 50%, 50% 50%",
          filter: "blur(10px) opacity(50%) saturate(200%)",
          maskImage: "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
        }}
      >
        {/* Animated overlay — matches the original .hero::after */}
        <div
          className="absolute inset-0 motion-safe:animate-[aurora-smooth-bg_60s_linear_infinite]"
          style={{
            backgroundImage: `${stripes}, ${rainbow}`,
            backgroundSize: "200%, 100%",
            backgroundAttachment: "fixed",
            mixBlendMode: "difference",
          }}
        />
      </div>
    </div>
  );
}
