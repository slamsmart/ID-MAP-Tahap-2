"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

/** Top-loading bar that animates on Next.js route changes. */
export default function TopLoadingBar() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<"idle" | "start" | "done">("idle");

  useEffect(() => {
    let finishTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const show = () => {
      clearTimeout(finishTimer);
      clearTimeout(hideTimer);
      setVisible(true);
      setPhase("start");
    };

    const done = () => {
      setPhase("done");
      hideTimer = setTimeout(() => {
        setVisible(false);
        setPhase("idle");
      }, 520);
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      show();
      originalPushState.apply(window.history, args);
      finishTimer = setTimeout(done, 120);
    };

    window.history.replaceState = function (...args) {
      show();
      originalReplaceState.apply(window.history, args);
      finishTimer = setTimeout(done, 120);
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
      document.removeEventListener("click", handleClick);
      clearTimeout(finishTimer);
      clearTimeout(hideTimer);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ visibility: visible ? "visible" : "hidden" }}
    >
      <motion.div
        initial={false}
        animate={
          phase === "idle"
            ? { width: "0%", opacity: 0 }
            : phase === "start"
            ? { width: "30%", opacity: 1 }
            : { width: "100%", opacity: 0 }
        }
        transition={
          phase === "done"
            ? {
                width: { duration: 0.3 },
                opacity: { duration: 0.2, delay: 0.3 },
              }
            : { duration: 0.3 }
        }
        className="h-1 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] rounded-r-full"
      />
    </div>
  );
}
