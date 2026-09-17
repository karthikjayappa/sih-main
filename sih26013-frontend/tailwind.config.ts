import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EF",
        "paper-dim": "#EFEBE0",
        ink: "#1E2430",
        "ink-soft": "#4A5262",
        ledger: {
          DEFAULT: "#2C4A63",
          50: "#EAF0F4",
          100: "#CBDAE3",
          300: "#7C9FB4",
          500: "#2C4A63",
          700: "#1E3548",
          900: "#132433",
        },
        moss: {
          DEFAULT: "#3C6E52",
          50: "#EAF2ED",
          100: "#C9DFD1",
          500: "#3C6E52",
          700: "#28503A",
        },
        rust: {
          DEFAULT: "#B5502D",
          50: "#F8EAE3",
          100: "#EFC9B6",
          500: "#B5502D",
          700: "#8A3B20",
        },
        gold: {
          DEFAULT: "#A9812E",
          50: "#F5EEDC",
          500: "#A9812E",
        },
        line: "#DCD6C7",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
        md: "4px",
      },
      backgroundImage: {
        "survey-grid":
          "linear-gradient(to right, rgba(30,36,48,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,36,48,0.045) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      boxShadow: {
        card: "0 1px 0 rgba(30,36,48,0.06), 0 1px 3px rgba(30,36,48,0.05)",
        lifted: "0 4px 16px rgba(30,36,48,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
