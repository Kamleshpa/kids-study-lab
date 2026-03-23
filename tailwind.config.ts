import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "media",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
        display: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
      colors: {
        "kid-purple": "rgb(var(--color-kid-purple) / <alpha-value>)",
        "kid-pink": "rgb(var(--color-kid-pink) / <alpha-value>)",
        "kid-mint": "rgb(var(--color-kid-mint) / <alpha-value>)",
        "kid-teal": "rgb(var(--color-kid-teal) / <alpha-value>)",
        "kid-peach": "rgb(var(--color-kid-peach) / <alpha-value>)",
        "kid-lavender": "rgb(var(--color-kid-lavender) / <alpha-value>)",
        "kid-ink": "rgb(var(--color-kid-ink) / <alpha-value>)",
        "kid-surface": "rgb(var(--color-kid-surface) / <alpha-value>)",
      },
    },
  },
  plugins: [typography],
};
export default config;
