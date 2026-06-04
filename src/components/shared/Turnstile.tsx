"use client";

// Cloudflare Turnstile widget — invisible/managed challenge.
// Widget akan otomatis hide (return null) kalau NEXT_PUBLIC_TURNSTILE_SITE_KEY
// belum di-set, supaya UI tetap normal saat dev.
//
// Safety: fail-open after 8s jika Turnstile tidak merespon.
//
// Pemakaian:
//   const [token, setToken] = useState<string>("");
//   const [failed, setFailed] = useState(false);
//   <Turnstile onVerify={setToken} onError={() => setFailed(true)} />
//   ... lalu kirim turnstileToken: token di body request.

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
const SCRIPT_ID = "cf-turnstile-script";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (document.getElementById(SCRIPT_ID)) {
    return new Promise((resolve) => {
      const t = setInterval(() => {
        if (window.turnstile) { clearInterval(t); resolve(); }
      }, 50);
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC + "?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Gagal memuat Turnstile"));
    document.head.appendChild(s);
  });
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

export default function Turnstile({
  onVerify,
  onError,
  theme = "light",
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    // Safety timeout: jika Turnstile tidak merespon dalam 5 detik → fail-open.
    // Lebih pendek dari sebelumnya (8s) supaya user tidak melihat tombol Daftar
    // disabled tanpa alasan kalau script CDN Cloudflare lambat / di-block.
    timeoutRef.current = setTimeout(() => {
      if (!cancelled && onError) {
        console.warn("[Turnstile] Timeout setelah 5s — fail open");
        onError();
      }
    }, 5000);

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            onVerify(token);
          },
          "error-callback": () => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            onError?.();
          },
          "expired-callback": () => onVerify(""),
          theme,
        });
      })
      .catch(() => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        onError?.();
      });

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [siteKey, onVerify, onError, theme]);

  if (!siteKey) return null;

  return <div ref={containerRef} className={className} />;
}
