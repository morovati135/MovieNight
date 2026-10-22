"use client";

/*
 * Adapted from cult-ui halo-button: gradient rim, frosted fill, staggered label,
 * and a trailing spinner while busy.
 */

import { type ComponentProps, type ReactNode, useState } from "react";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { HaloGlow, haloLayoutSpring, HaloSpinner, haloSurfaceClassName, haloSurfaceStyle, StaggeredText } from "./halo-glow";

export type HaloButtonProps = Omit<ComponentProps<typeof ButtonPrimitive>, "children"> & {
  children: ReactNode;
  /** Shows a trailing spinner, sets `aria-busy` and replaces the label with `loadingText`. */
  isLoading?: boolean;
  loadingText?: string;
  /** Leading icon, kept outside the staggered label. */
  icon?: ReactNode;
};

export function HaloButton({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  loadingText = "Working…",
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  ...props
}: HaloButtonProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const isInteractive = !(disabled || isLoading);
  const label = isLoading ? loadingText : children;

  return (
    <motion.div
      className={cn("relative inline-flex max-w-full", className)}
      layout={!reduceMotion}
      transition={reduceMotion ? undefined : { layout: haloLayoutSpring }}
    >
      <div className="relative w-full rounded-full p-px">
        <HaloGlow live emphasis={isFocused || (isHovered && isInteractive)} intensity={isLoading ? 1.8 : 1} />
        <ButtonPrimitive
          aria-busy={isLoading || undefined}
          className={cn(
            "relative flex min-h-12 w-full min-w-0 items-center justify-center gap-2.5 rounded-full px-7 py-2.5 text-sm font-bold text-white select-none",
            haloSurfaceClassName,
            "outline-none transition-[transform,border-color,box-shadow] duration-200 ease-out",
            "focus-visible:border-ring/70 focus-visible:ring-2 focus-visible:ring-ring/60",
            "fine-hover:hover:border-white/28 fine-hover:hover:shadow-[0_1px_0_rgb(255_255_255/8%)_inset,0_4px_12px_rgb(0_0_0/45%),0_12px_32px_rgb(0_0_0/45%)]",
            "enabled:active:scale-[0.96] motion-reduce:enabled:active:scale-100",
            "disabled:pointer-events-none",
            disabled && !isLoading && "opacity-50",
          )}
          disabled={!isInteractive}
          focusableWhenDisabled={isLoading}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onMouseEnter={(event) => {
            setIsHovered(true);
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            setIsHovered(false);
            onMouseLeave?.(event);
          }}
          style={haloSurfaceStyle}
          {...props}
        >
          {icon && !isLoading ? <span className="flex shrink-0 [&_svg]:size-4">{icon}</span> : null}
          {typeof label === "string" ? <StaggeredText text={label} /> : label}
          <AnimatePresence initial={false}>
            {isLoading ? (
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/8 ring-1 ring-white/12"
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
                key="spinner"
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
              >
                <HaloSpinner />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </ButtonPrimitive>
      </div>
    </motion.div>
  );
}
