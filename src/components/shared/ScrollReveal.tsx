"use client";

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

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
          } else if (!once && entry.intersectionRatio === 0) {
            // Reset only when fully out of view, so the entrance can replay on
            // the next entry. Resetting at the 0.15 boundary instead would let
            // the rise transform push the element back across the threshold,
            // re-toggling every frame (visible "vibration" near the page foot).
            el.classList.remove("is-visible");
          }
        }
      },
      { threshold: [0, 0.15], rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`reveal ${className}`}
      style={{ animationDelay: delay ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </Tag>
  );
}
