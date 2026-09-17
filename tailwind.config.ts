import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#faf8f5",
          100: "#f5f0e8",
          200: "#eae2d4",
          300: "#dccebc",
          400: "#c4ae93",
          500: "#ab9072",
          900: "#2d241e",
        },
        navy: {
          500: "#2a4365",
          600: "#1e3350",
          700: "#16283f",
          800: "#0f1c2d",
          900: "#09121d",
        },
        ivy: {
          50: "#f0fdf4",
          100: "#dcfce7",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        }
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -5px rgba(0,0,0,0.04)',
        'paper-lg': '0 10px 25px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)',
      }
    },
  },
  plugins: [],
};
export default config;
