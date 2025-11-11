import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "#6B6B6B",
          foreground: "var(--muted-foreground)",
        },
        surface: "var(--surface)",
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--primary)",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        success: "#16A34A",
        warning: "#EAB308",
        info: "#3B82F6",
        popover: {
          DEFAULT: "var(--background)",
          foreground: "var(--foreground)",
        },
        accent: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        secondary: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        tools: {
          organize: "#E5322D",
          optimize: "#98D8C8",
          convert: "#F6BD60",
          edit: "#F7B801",
          security: "#AE7FA7",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        h1: "2.5rem",
        h2: "2rem",
        h3: "1.5rem",
        h4: "1.25rem",
      },
      spacing: {
        header: "60px",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in-bottom": "fade-in-bottom 0.6s ease-out forwards",
      },
      keyframes: {
        "fade-in-bottom": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
