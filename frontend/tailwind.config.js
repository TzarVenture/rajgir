/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        graduate: ["Graduate", "serif", "sans-serif"],
        montserrat: ["Montserrat", "-apple-system", "sans-serif"],
        inter: ["Inter", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
