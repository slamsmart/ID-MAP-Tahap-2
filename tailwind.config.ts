import type { Config } from "tailwindcss";

// ID-MAP design tokens.
// Use `brand-*` for brand surfaces & accents. Native Tailwind `emerald-*` is
// kept aliased for legacy code paths but new components should reach for
// `brand-*` so the palette stays in one place.
//
// Radius hierarchy:
//   rounded-input  (lg)  → form inputs, small chips
//   rounded-button (xl)  → buttons, pill CTAs
//   rounded-card   (2xl) → cards, list items
//   rounded-modal  (3xl) → modals, hero panels
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand palette — single source of truth for ID-MAP greens.
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7", // hero headline accent
          400: "#34D399",
          500: "#10B981",
          600: "#059669", // primary CTA / link
          700: "#047857", // hover
          800: "#0f3d2e", // dark surface (was [#0f3d2e])
          900: "#0a2a20",
          950: "#062118",
          mid: "#1f6f54", // mid-teal accent (was [#1f6f54])
          ink: "#0a1c15", // footer surface (was [#0a1c15])
        },
        emerald: {
          950: "#022c22",
          900: "#064E3B",
          800: "#065f46",
          700: "#047857",
          600: "#059669",
          500: "#10B981",
          400: "#34D399",
          300: "#6EE7B7",
          200: "#A7F3D0",
          100: "#D1FAE5",
          50: "#ECFDF5",
        },
      },
      borderRadius: {
        input: "0.5rem", // 8px — form inputs, small chips
        button: "0.75rem", // 12px — buttons, pill CTAs
        card: "1rem", // 16px — cards, list items
        modal: "1.5rem", // 24px — modals, hero panels
      },
      fontFamily: {
        display: ["var(--font-plus-jakarta)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        montserrat: ["var(--font-montserrat)", "sans-serif"],
        dashboard: ["var(--font-inter)", "sans-serif"],
        hero: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
