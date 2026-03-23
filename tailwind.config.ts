import type { Config } from "tailwindcss";

const config: Config = {
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
        "kid-purple": "#7c3aed",
        "kid-pink": "#ec4899",
        "kid-mint": "#6ee7b7",
        "kid-teal": "#14b8a6",
        "kid-peach": "#fdba74",
        "kid-lavender": "#ede9fe",
        "kid-ink": "#1e1b4b",
      },
    },
  },
  plugins: [],
};
export default config;
