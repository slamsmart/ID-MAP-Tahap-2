"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" pill that fades + slides + glows in once the user has
 * scrolled past the first viewport. Click does a smooth scroll to the top,
 * unless the user prefers reduced motion — then it jumps instantly.
 *
 * Listener is passive so it never blocks scroll, and is throttled with rAF so
 * fast scrolls don't cause re-render storms.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > 400);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const onClick = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Kembali ke atas"
      className={`back-to-top fixed bottom-6 right-6 z-[60] grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-[#06140f] shadow-[0_12px_30px_-8px_rgba(16,185,129,0.7)] ring-1 ring-emerald-300/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(16,185,129,0.9)] focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-transparent ${
        visible ? "is-visible" : "is-hidden"
      }`}
    >
      {/* glow halo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-emerald-400/40 blur-xl scale-110 opacity-70"
      />
      <ArrowUp className="relative h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
