import type { Config } from "tailwindcss";

/**
 * Tailwind configuration and design tokens.
 *
 * The palette is tuned for WCAG 2.1 AA contrast: `brand` greens pair with
 * white or near-black text so primary combinations exceed a 4.5:1 ratio.
 * Animations are subtle and are globally disabled for users who prefer reduced
 * motion (see `globals.css`).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1120px" },
    },
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(16 24 40 / 0.08)",
        "soft-lg":
          "0 2px 4px 0 rgb(0 0 0 / 0.04), 0 12px 32px -8px rgb(16 24 40 / 0.12)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
