"use client";

import {
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max tilt in degrees on each axis. */
  maxTilt?: number;
  /** Lift toward the viewer on hover, in px. */
  liftZ?: number;
  /** Show a moving specular glare that follows the cursor. */
  glare?: boolean;
};

/**
 * Mouse-tracking 3D tilt wrapper. Writes transforms directly to the DOM
 * inside a single rAF frame — no React state, so it never re-renders while
 * the cursor moves. The whole effect is gated behind a fine-pointer +
 * motion-OK media query, so touch devices and reduced-motion users get a
 * completely static, cheap card (no listeners, no transforms, no glare).
 */
export default function TiltCard({
  children,
  className = "",
  style,
  maxTilt = 10,
  liftZ = 40,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only enable on devices with a precise pointer that don't prefer
    // reduced motion. Phones/tablets and motion-sensitive users skip it all.
    const canTilt = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );
    if (!canTilt.matches) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;
    let active = false;

    const apply = () => {
      frame = 0;
      if (active) {
        const rotateY = (nextX - 0.5) * 2 * maxTilt;
        const rotateX = -(nextY - 0.5) * 2 * maxTilt;
        el.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${liftZ}px)`;
        if (glareRef.current) {
          glareRef.current.style.opacity = "1";
          glareRef.current.style.background = `radial-gradient(circle at ${(
            nextX * 100
          ).toFixed(1)}% ${(nextY * 100).toFixed(
            1
          )}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`;
        }
      } else {
        el.style.transform = "";
        if (glareRef.current) glareRef.current.style.opacity = "0";
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      nextX = (e.clientX - rect.left) / rect.width;
      nextY = (e.clientY - rect.top) / rect.height;
      active = true;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      active = false;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [maxTilt, liftZ]);

  return (
    <div
      ref={ref}
      className={`relative transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ transformStyle: "preserve-3d", ...style }}
    >
      {children}
      {glare && (
        <span
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        />
      )}
    </div>
  );
}
