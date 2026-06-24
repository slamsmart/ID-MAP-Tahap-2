"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "idmap-install-dismissed";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    // Android / Chromium: capture the native prompt event.
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS Safari never fires beforeinstallprompt → show manual instructions.
    if (isIos()) {
      const t = setTimeout(() => {
        setShowIosHint(true);
        setVisible(true);
      }, 2500);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBIP);
        clearTimeout(t);
      };
    }

    const onInstalled = () => setVisible(false);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[900] mx-auto max-w-sm rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(15,61,46,0.5)] sm:left-auto sm:right-4 sm:mx-0">
      <button
        onClick={dismiss}
        aria-label="Tutup"
        className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#0f3d2e]">
          <Download className="h-5 w-5 text-lime-300" />
        </div>
        <div className="min-w-0 pr-4">
          <p className="text-sm font-bold text-[#0f3d2e]">Install ID-MAP</p>

          {showIosHint ? (
            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-600">
              Tap
              <Share className="inline h-3.5 w-3.5 text-sky-600" />
              lalu pilih <span className="font-semibold">Add to Home Screen</span>.
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-slate-600">
                Pasang di layar utama, buka seperti app — tanpa app store.
              </p>
              <button
                onClick={install}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-gray-100 border border-gray-200"
              >
                <Download className="h-4 w-4" />
                Install Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
