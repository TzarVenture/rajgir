/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          red: "#E31B23",
          "red-dark": "#B5121B",
          "red-light": "#FEE2E2",
          saffron: "#F5A623",
          "saffron-light": "#FEF3C7",
          gold: "#FFC928",
          "gold-deep": "#C78A12",
        },
        surface: {
          canvas: "#FFFFFF",
          soft: "#F8F8F6",
          warm: "#FFF9EF",
          card: "#FFFFFF",
          muted: "#F3F4F6",
        },
        charcoal: {
          900: "#111827",
          800: "#1F2937",
          700: "#374151",
          600: "#4B5563",
          500: "#6B7280",
          400: "#9CA3AF",
          300: "#D1D5DB",
          200: "#E5E7EB",
          100: "#F3F4F6",
          50: "#F9FAFB",
        },
      },
      fontFamily: {
        barlow: ["'Barlow Condensed'", "sans-serif"],
        manrope: ["Manrope", "-apple-system", "sans-serif"],
        devanagari: ["'Noto Sans Devanagari'", "sans-serif"],
        graduate: ["Graduate", "serif", "sans-serif"],
        montserrat: ["Montserrat", "-apple-system", "sans-serif"],
        inter: ["Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        btn: "8px",
        card: "12px",
        feature: "16px",
        hero: "20px",
      },
    },
  },
  plugins: [],
};
