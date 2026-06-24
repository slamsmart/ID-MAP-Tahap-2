"use client";

import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Stagger delay in ms before the entrance animation starts. */
  delay?: number;
  /** Render as a different element if the wrapper must stay layout-neutral. */
  as?: "div" | "li" | "article";
  /** Animate only the first time it enters. Default false → re-animates on every entry. */
  once?: boolean;
};

/**
 * Reveals its children with a "float up into place" depth animation when it
 * scrolls into view. Uses a single IntersectionObserver and toggles a CSS class
 * — the animation itself (and its reduced-motion fallback) lives in globals.css
 * under `.reveal`. By default the effect repeats: it resets when the element
 * leaves the viewport and replays when it re-enters, so scrolling up then back
 * down re-triggers it. Pass `once` to keep the old fire-once behaviour. Safe to
 * nest a TiltCard inside: this wrapper and the tilt target are different
 * elements, so their transforms never fight.
 */
export default function ScrollReveal({
  children,
  className = "",
  style,
  delay = 0,
  as: Tag = "div",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is unavailable, just show the content.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            if (once) io.unobserve(el);
          } else if (!once) {
            // Reset on every exit so the entrance replays consistently whether
            // you scroll down OR back up — nothing ends up statically visible.
            el.classList.remove("is-visible");
          }
        }
      },
      // Inset the trigger zone on BOTH edges (~12%). The element flips visible
      // once it is comfortably inside the viewport, so the 36px depth-rise can
      // never push it back across the boundary and re-toggle (the old
      // "vibration" bug). Insetting both edges also means the element resets as
      // soon as it leaves either side, giving symmetric up/down replay.
      { threshold: 0, rootMargin: "-12% 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return createElement(
    Tag,
    {
      ref,
      className: `reveal ${className}`,
      style: { animationDelay: delay ? `${delay}ms` : undefined, ...style },
    },
    children
  );
}
