"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "motion/react";

/** Top-loading bar that animates on Next.js route changes */
export default function TopLoadingBar() {
  const [visible, setVisible] = useState(false);
  const controls = useAnimation();
  // Guards controls.start(): framer-motion throws if start() runs before the
  // animated element is mounted. We only animate once the effect has run.
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let timer: NodeJS.Timeout;

    const show = () => {
      if (!mounted.current) return;
      setVisible(true);
      controls.set({ width: "0%", opacity: 1 });
      controls.start({ width: "30%" }, { duration: 0.3 });
    };

    const done = () => {
      if (!mounted.current) return;
      controls
        .start({ width: "100%" }, { duration: 0.3 })
        .then(() => {
          if (!mounted.current) return;
          controls.start({ opacity: 0 }, { duration: 0.2 });
          timer = setTimeout(() => {
            if (mounted.current) setVisible(false);
          }, 250);
        })
        .catch(() => {
          // animation interrupted (e.g. rapid navigation) — ignore
        });
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      show();
      originalPushState.apply(window.history, args);
      requestAnimationFrame(() => done());
    };
    window.history.replaceState = function (...args) {
      show();
      originalReplaceState.apply(window.history, args);
      requestAnimationFrame(() => done());
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.href.includes("#") &&
        !link.target &&
        link.getAttribute("download") === null
      ) {
        show();
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      mounted.current = false;
      document.removeEventListener("click", handleClick);
      clearTimeout(timer);
      // Restore the originals so HMR / remounts don't stack patches.
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [controls]);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <motion.div
        initial={{ width: "0%", opacity: 1 }}
        animate={controls}
        className="h-1 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] rounded-r-full"
      />
    </div>
  );
}
