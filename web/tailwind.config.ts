import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sky-light": "#87CEEB",
        "sky-dark": "#6A9ECF",
        "grass-light": "#9FD356",
        "grass-dark": "#7CB342",
        "sun-yellow": "#FFE5A0",
        "paper-white": "#FFF9E6",
        "ghibli-text-primary": "#4A4A4A",
        "ghibli-text-secondary": "#8B7355",
        "ghibli-border": "rgba(139, 115, 85, 0.3)",
      },
      fontFamily: {
        "ghibli-title": ["Mochiy Pop One", "cursive"],
        "ghibli-body": ["Hina Mincho", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

