"use client";

import { useEffect } from "react";

/**
 * Calls `onEscape` when the Escape key is pressed while `isOpen` is true.
 * Use for modals, popovers, and dropdowns so keyboard users can dismiss
 * overlays without reaching for a mouse.
 */
export function useEscapeKey(isOpen: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onEscape]);
}
