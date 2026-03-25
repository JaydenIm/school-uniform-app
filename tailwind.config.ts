import type { Config } from "tailwindcss";

export default {
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
        // OnFit Brand Colors
        brand: {
          primary: "#4B0082",
          "primary-hover": "#3a0066",
          "primary-light": "#6A0DAD",
          secondary: "#EBE0FF",
          accent: "#ffffff",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
