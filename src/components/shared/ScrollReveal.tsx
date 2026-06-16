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
};

/**
 * Reveals its children with a "float up into place" depth animation the first
 * time it scrolls into view. Uses a single IntersectionObserver and toggles a
 * CSS class — the animation itself (and its reduced-motion fallback) lives in
 * globals.css under `.reveal`. Once revealed it stops observing, so there is no
 * lingering work. Safe to nest a TiltCard inside: this wrapper and the tilt
 * target are different elements, so their transforms never fight.
 */
export default function ScrollReveal({
  children,
  className = "",
  style,
  delay = 0,
  as: Tag = "div",
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
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
