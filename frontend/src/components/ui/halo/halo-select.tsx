"use client";

/*
 * Adapted from cult-ui halo-select: a Base UI Select with a gradient rim, frosted trigger,
 * staggered value label, a brief check after choosing, and a list that settles in item by item.
 */

import { useEffect, useRef, useState } from "react";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import { HaloGlow, haloSurfaceClassName, haloSurfaceStyle, StaggeredText } from "./halo-glow";

export type HaloSelectItem = { value: string; label: string };

type HaloSelectProps = {
  label: string;
  items: HaloSelectItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

const selectionFlashMs = 560;
const listStaggerStepSec = 0.045;
const listStaggerCap = 9;

export function HaloSelect({ className, disabled = false, items, label, onValueChange, value }: HaloSelectProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [animatedLabelKey, setAnimatedLabelKey] = useState(0);
  const flashTimer = useRef<number | null>(null);
  const selectedLabel = items.find((item) => item.value === value)?.label ?? "";

  useEffect(
    () => () => {
      if (flashTimer.current) {
        window.clearTimeout(flashTimer.current);
      }
    },
    [],
  );

  const handleValueChange = (next: string | null) => {
    if (next === null) {
      return;
    }

    onValueChange(next);
    setAnimatedLabelKey((key) => key + 1);

    if (!reduceMotion) {
      if (flashTimer.current) {
        window.clearTimeout(flashTimer.current);
      }

      setShowCheck(true);
      flashTimer.current = window.setTimeout(() => {
        setShowCheck(false);
        flashTimer.current = null;
      }, selectionFlashMs);
    }
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Select.Root
        disabled={disabled}
        items={items}
        modal={false}
        onOpenChange={setOpen}
        onValueChange={handleValueChange}
        open={open}
        value={value}
      >
        <Select.Label className="px-1 text-xs font-bold tracking-[0.14em] text-white/55 uppercase">{label}</Select.Label>
        <div
          className="relative w-full rounded-2xl p-px"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <HaloGlow className="rounded-2xl" emphasis={isFocused || open || (isHovered && !disabled)} />
          <Select.Trigger
            className={cn(
              "relative flex min-h-12 w-full min-w-0 items-center gap-2 rounded-[15px] py-2 pr-2 pl-4 text-left text-sm font-semibold text-white",
              haloSurfaceClassName,
              "outline-none transition-[border-color,box-shadow] duration-200 ease-out",
              "fine-hover:hover:border-white/28 focus-visible:border-ring/80 focus-visible:ring-2 focus-visible:ring-ring/60",
              "disabled:cursor-not-allowed",
              open && "border-white/24",
            )}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            style={haloSurfaceStyle}
          >
            <span className="relative min-w-0 flex-1 truncate">
              {animatedLabelKey > 0 && !reduceMotion ? (
                // A little slower than the shared default so a new choice reads as a smooth reveal.
                <StaggeredText charDurationSec={0.3} key={animatedLabelKey} staggerSec={0.032} text={selectedLabel} />
              ) : (
                <Select.Value />
              )}
            </span>
            <span
              aria-hidden="true"
              className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/7 ring-1 ring-white/12"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {showCheck ? (
                  <motion.span
                    animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
                    className="flex text-accent"
                    exit={{ filter: "blur(4px)", opacity: 0, scale: 0.25 }}
                    initial={{ filter: "blur(4px)", opacity: 0, scale: 0.25 }}
                    key="check"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{ opacity: 1, rotate: open && !reduceMotion ? 180 : 0, scale: 1 }}
                    className="flex text-white/70"
                    exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.25 }}
                    initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.25 }}
                    key="chevron"
                    transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
                  >
                    <ChevronDown className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </Select.Trigger>
        </div>
        <Select.Portal>
          <Select.Positioner align="start" alignItemWithTrigger={false} className="z-50" sideOffset={6}>
            <Select.Popup
              className={cn(
                "max-h-[min(18rem,var(--available-height))] w-(--anchor-width) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[#061126]/94 p-1 text-white",
                "shadow-[0_1px_0_rgb(255_255_255/6%)_inset,0_10px_40px_rgb(0_0_0/55%)] backdrop-blur-xl backdrop-saturate-150",
                "duration-150 ease-out data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 motion-reduce:animate-none",
              )}
            >
              <Select.List>
                {items.map((item, index) => (
                  <Select.Item
                    className={cn(
                      "relative flex min-h-11 w-full cursor-default items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/85 outline-none select-none",
                      "transition-[background-color,color] duration-150 ease-out data-highlighted:bg-white/10 data-highlighted:text-white data-selected:text-white",
                    )}
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  >
                    <motion.span
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      className="flex w-full min-w-0 items-center gap-2"
                      initial={reduceMotion ? false : { filter: "blur(4px)", opacity: 0, y: 4 }}
                      transition={{
                        delay: reduceMotion ? 0 : Math.min(index, listStaggerCap) * listStaggerStepSec,
                        duration: 0.22,
                        ease: [0.2, 0, 0, 1],
                      }}
                    >
                      <Select.ItemText className="min-w-0 flex-1 truncate">{item.label}</Select.ItemText>
                      <Select.ItemIndicator className="flex shrink-0 text-accent">
                        <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
                      </Select.ItemIndicator>
                    </motion.span>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
