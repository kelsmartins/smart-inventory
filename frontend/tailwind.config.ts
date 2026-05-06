import type { Config } from "tailwindcss";

const config: Config = {
  // Ajustado para olhar dentro de src/ (onde estão seus códigos)
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
        primary: "#6b9dff", // Cor principal do Smart Inventory
      },
    },
  },
  plugins: [],
};
export default config;