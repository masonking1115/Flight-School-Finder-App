import type { Config } from "tailwindcss";

// Palette: #0d1321 (darkest), #1d2d44 (dark), #3e5c76 (mid), #748cab (light), #f0ebd8 (cream)
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          darkest: "#0d1321",
          dark: "#1d2d44",
          mid: "#3e5c76",
          light: "#748cab",
          cream: "#f0ebd8",
          100: "#f0ebd8",
          200: "#f0ebd8",
          300: "#748cab",
          400: "#748cab",
          500: "#3e5c76",
          600: "#3e5c76",
          700: "#3e5c76",
          800: "#1d2d44",
          900: "#0d1321",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
