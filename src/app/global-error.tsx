"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "system-ui, sans-serif" }}>
          <div style={{ maxWidth: 480, width: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Terjadi kesalahan kritis
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
              {error.message || "Aplikasi mengalami error yang tidak terduga."}
            </p>
            <button
              onClick={reset}
              style={{ padding: "10px 20px", background: "#047857", color: "#fff", border: 0, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
            >
              Muat ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
